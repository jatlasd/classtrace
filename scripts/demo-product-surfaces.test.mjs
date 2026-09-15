import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/db/prisma", () => ({ prisma: {} }));

import { resolveCaptureStudents } from "../lib/students/resolve-capture-students.ts";
import { evidenceRecordMatchesSearch } from "../lib/evidence/evidence-feed-filtering.ts";
import { getEvidenceFeedPageForWorkspace } from "../lib/evidence/evidence-feed-records.ts";
import { getStudentTimelineRecordsForWorkspace } from "../lib/evidence/student-timeline-records.ts";
import {
  getStudentReportRecordsForWorkspace,
  parseStudentReportDateRange,
} from "../lib/evidence/student-report-records.ts";
import { exportStudentEvidenceForWorkspace } from "../lib/evidence/export-student-evidence.ts";
import { DEMO_DATASET } from "./demo-data.mjs";

const workspaceId = "workspace_demo_fixture";
const students = DEMO_DATASET.students.map((student) => ({
  ...student,
  classGroup: { name: DEMO_DATASET.classes.find((group) => group.id === student.classId).name },
}));
const records = DEMO_DATASET.evidence.map((record) => ({
  ...record,
  rosterStudentId: record.studentId,
  rosterStudent: students.find((student) => student.id === record.studentId),
  classGroup: { name: DEMO_DATASET.classes.find((group) => group.id === record.classId).name },
  evidenceDate: new Date(record.evidenceDate),
  validatedAt: new Date(record.validatedAt),
  createdAt: new Date(record.createdAt),
  behavior: record.behavior.join(", ") || null,
  followUpNotes: record.followUpNotes.join("\n") || null,
  supportLevel: null,
  context: null,
  communication: null,
  photo: DEMO_DATASET.photos.find((photo) => photo.evidenceId === record.id) ?? null,
}));

// Exercise the real read models with the values inserted by the reset, without a live database.
const database = {
  rosterStudent: {
    async findFirst({ where }) {
      expect(where.workspaceId).toBe(workspaceId);
      expect(where.archivedAt).toBeNull();
      return students.find((student) => student.id === where.id) ?? null;
    },
  },
  evidenceRecord: {
    async findMany({ where, orderBy, skip = 0, take }) {
      expect(where.workspaceId).toBe(workspaceId);
      expect(where.archivedAt).toBeNull();
      const matching = records.filter((record) =>
        (!where.rosterStudentId || record.rosterStudentId === where.rosterStudentId) &&
        (!where.evidenceDate?.gte || record.evidenceDate >= where.evidenceDate.gte) &&
        (!where.evidenceDate?.lt || record.evidenceDate < where.evidenceDate.lt)
      );
      matching.sort((left, right) =>
        (left.evidenceDate - right.evidenceDate || left.createdAt - right.createdAt) *
        (orderBy[0].evidenceDate === "desc" ? -1 : 1)
      );
      return matching.slice(skip, take === undefined ? undefined : skip + take);
    },
  },
};

describe("canonical demo data in product read models", () => {
  it("resolves every Capture handle to exactly one student and class", () => {
    const roster = students.map((student) => ({
      id: student.id,
      displayName: student.displayName,
      mentionHandle: student.mentionHandle,
      classGroupName: student.classGroup.name,
    }));
    for (const student of roster) {
      expect(resolveCaptureStudents([`@${student.mentionHandle}`], roster)).toEqual({
        status: "resolved_one_student", student,
      });
    }
  });

  it("fills two feed pages with interleaved classes and useful search results", async () => {
    const first = await getEvidenceFeedPageForWorkspace(workspaceId, 1, database);
    const second = await getEvidenceFeedPageForWorkspace(workspaceId, 2, database);
    expect(first.records).toHaveLength(50);
    expect(first.hasOlder).toBe(true);
    expect(second.records).toHaveLength(31);
    expect(second.hasNewer).toBe(true);
    expect(second.hasOlder).toBe(false);
    const combined = [...first.records, ...second.records];
    expect(new Set(combined.map((record) => record.id)).size).toBe(81);
    expect(combined.filter((record) => record.hasPhoto)).toHaveLength(4);

    for (const page of [first, second]) {
      expect(new Set(page.records.map((record) => record.classGroupName)).size).toBe(3);
      expect(new Set(page.records.map((record) => record.studentMentionHandle)).size).toBeGreaterThan(4);
      for (const query of ["@jeremy", "@rowan", "#organization", "#support", "place-value", "regrouping"]) {
        expect(page.records.some((record) => evidenceRecordMatchesSearch(record, query))).toBe(true);
      }
    }
    expect(combined.filter((record) => evidenceRecordMatchesSearch(record, "@owen"))).toHaveLength(1);
    expect(combined.filter((record) => evidenceRecordMatchesSearch(record, "8th Grade Study Skills"))).toHaveLength(13);
    const support = combined.filter((record) => evidenceRecordMatchesSearch(record, "#support"));
    expect(new Set(support.map((record) => record.classGroupName)).size).toBe(3);
  });

  it.each(students)("preserves $displayName's own notes in timeline, report, and export", async (student) => {
    const expected = DEMO_DATASET.evidence.filter((record) => record.studentId === student.id);
    const timeline = await getStudentTimelineRecordsForWorkspace(workspaceId, student.id, database);
    const report = await getStudentReportRecordsForWorkspace(
      workspaceId,
      student.id,
      parseStudentReportDateRange({
        start: "2026-08-31", end: "2026-09-15", startOffset: "240", endOffset: "240",
      }),
      database
    );
    const exported = await exportStudentEvidenceForWorkspace({
      workspaceId, input: { studentId: student.id },
    }, database);

    expect(timeline.student.displayName).toBe(student.displayName);
    expect(timeline.evidenceRecords.map((record) => record.id)).toEqual(
      expected.map((record) => record.id).reverse()
    );
    expect(report.evidenceRecords.map((record) => record.id)).toEqual(
      expected.map((record) => record.id)
    );
    expect(exported).toMatchObject({ success: true, recordCount: expected.length });
    const csvRows = exported.content.split("\r\n").slice(1);
    expect(csvRows).toHaveLength(expected.length);
    expect(csvRows.map((row) => row.split(",")[4])).toEqual(
      expected.map((record) => record.evidenceDate)
    );
    expect(csvRows.every((row) => row.startsWith(`${student.displayName},'@${student.mentionHandle},`))).toBe(true);
    for (const record of expected) {
      expect(exported.content).toContain(record.evidenceNote.replaceAll('"', '""'));
    }
  });

  it("gives Jeremy a shorter September report, including September 15", async () => {
    const result = await getStudentReportRecordsForWorkspace(
      workspaceId,
      "demo_student_jeremy_2026",
      parseStudentReportDateRange({
        start: "2026-09-01", end: "2026-09-15", startOffset: "240", endOffset: "240",
      }),
      database
    );
    expect(result.evidenceRecords).toHaveLength(16);
    expect(result.evidenceRecords[0].id).toBe("demo_evidence_jeremy_02");
    expect(result.evidenceRecords.at(-1).id).toBe("demo_evidence_jeremy_17");
  });
});

import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/db/prisma", () => ({ prisma: {} }));

import { resolveCaptureStudents } from "../lib/students/resolve-capture-students.ts";
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

function matchesContains(value, filter) {
  return value?.toLowerCase().includes(filter.contains.toLowerCase()) ?? false;
}

function matchesWhere(record, where) {
  if (where.rosterStudentId && record.rosterStudentId !== where.rosterStudentId) return false;
  if (where.evidenceType && record.evidenceType !== where.evidenceType) return false;
  if (where.evidenceDate?.gte && record.evidenceDate < where.evidenceDate.gte) return false;
  if (where.evidenceDate?.lt && record.evidenceDate >= where.evidenceDate.lt) return false;
  if (where.tags?.has && !record.tags.includes(where.tags.has)) return false;
  if (where.tags?.hasSome && !where.tags.hasSome.some((tag) => record.tags.includes(tag))) return false;

  if (where.rosterStudent?.mentionHandle &&
      !matchesContains(record.rosterStudent.mentionHandle, where.rosterStudent.mentionHandle)) return false;
  if (where.rosterStudent?.OR && !where.rosterStudent.OR.some((clause) =>
    Object.entries(clause).every(([field, filter]) => matchesContains(record.rosterStudent[field], filter))
  )) return false;
  if (where.classGroup?.name && !matchesContains(record.classGroup.name, where.classGroup.name)) return false;
  if (where.OR && !where.OR.some((clause) => {
    if (clause.tags?.has) return record.tags.includes(clause.tags.has);
    if (clause.rosterStudent?.OR) {
      return clause.rosterStudent.OR.some((studentClause) =>
        Object.entries(studentClause).every(([field, filter]) =>
          matchesContains(record.rosterStudent[field], filter)
        )
      );
    }
    if (clause.classGroup?.name) return matchesContains(record.classGroup.name, clause.classGroup.name);
    return Object.entries(clause).every(([field, filter]) => matchesContains(record[field], filter));
  })) return false;

  return true;
}

function matchingRecords(where) {
  return records.filter((record) => matchesWhere(record, where));
}

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
  async aggregateEvidence(where) {
    const matching = matchingRecords(where);
    const dates = matching.map((record) => record.evidenceDate);
    return {
      _count: { _all: matching.length },
      _min: { evidenceDate: dates.length ? new Date(Math.min(...dates)) : null },
      _max: { evidenceDate: dates.length ? new Date(Math.max(...dates)) : null },
    };
  },
  async countEvidence(where) {
    return matchingRecords(where).length;
  },
  async listEvidence(where, skip, take) {
    return matchingRecords(where)
      .toSorted((left, right) =>
        right.evidenceDate - left.evidenceDate ||
        right.createdAt - left.createdAt ||
        right.id.localeCompare(left.id)
      )
      .slice(skip, skip + take);
  },
  async listStudentTags(_workspaceId, studentId, limit) {
    return [...new Set(
      records
        .filter((record) => record.rosterStudentId === studentId)
        .flatMap((record) => record.tags)
    )].toSorted().slice(0, limit);
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

  it("fills the paged feed with interleaved classes and useful search results", async () => {
    const pages = await Promise.all(
      [1, 2, 3, 4, 5].map((page) =>
        getEvidenceFeedPageForWorkspace(workspaceId, { page, query: "" }, database)
      )
    );
    expect(pages.map((page) => page.records.length)).toEqual([20, 20, 20, 20, 1]);
    expect(pages[0].hasNewer).toBe(false);
    expect(pages[0].hasOlder).toBe(true);
    expect(pages[4].hasNewer).toBe(true);
    expect(pages[4].hasOlder).toBe(false);
    const combined = pages.flatMap((page) => page.records);
    expect(new Set(combined.map((record) => record.id)).size).toBe(81);
    expect(combined.filter((record) => record.hasPhoto)).toHaveLength(12);

    for (const page of pages.slice(0, 4)) {
      expect(new Set(page.records.map((record) => record.classGroupName)).size).toBe(3);
      expect(new Set(page.records.map((record) => record.studentMentionHandle)).size).toBeGreaterThan(4);
    }

    for (const query of ["@jeremy", "@rowan", "#organization", "#support", "place-value", "regrouping"]) {
      const result = await getEvidenceFeedPageForWorkspace(
        workspaceId,
        { page: 1, query },
        database
      );
      expect(result.totalMatches).toBeGreaterThan(0);
    }
    const owen = await getEvidenceFeedPageForWorkspace(
      workspaceId,
      { page: 1, query: "@owen" },
      database
    );
    expect(owen.totalMatches).toBe(1);
    const studySkills = await getEvidenceFeedPageForWorkspace(
      workspaceId,
      { page: 1, query: "8th Grade Study Skills" },
      database
    );
    expect(studySkills.totalMatches).toBe(13);
    const support = await getEvidenceFeedPageForWorkspace(
      workspaceId,
      { page: 1, query: "#support" },
      database
    );
    expect(new Set(support.records.map((record) => record.classGroupName)).size).toBe(3);
  });

  it.each(students)("preserves $displayName's own notes in timeline, report, and export", async (student) => {
    const expected = DEMO_DATASET.evidence.filter((record) => record.studentId === student.id);
    const timeline = await getStudentTimelineRecordsForWorkspace(
      workspaceId,
      student.id,
      { page: 1, query: "", tags: [] },
      database
    );
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
    expect(timeline.results.records.map((record) => record.id)).toEqual(
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

import { describe, expect, it } from "vitest";
import type { ReportEvidenceRecord } from "./evidence-report-summary";
import {
  formatReportDateSpan,
  groupReportEvidence,
  summarizeReportEvidence,
} from "./evidence-report-summary";

function record(
  id: string,
  evidenceDate: string,
  fields: Partial<ReportEvidenceRecord> = {}
): ReportEvidenceRecord {
  return {
    id,
    evidenceDate,
    tags: [],
    followUpNeeded: false,
    ...fields,
  };
}

const records = [
  record("e1", "2026-05-04T15:00:00.000Z", {
    evidenceType: "Progress monitoring",
    topic: "Reading fluency",
    performance: "improving",
    behavior: "on task, focused",
    tags: ["reading", "#fluency"],
    hasPhoto: true,
  }),
  record("e2", "2026-05-20T15:00:00.000Z", {
    evidenceType: "Academic check-in",
    topic: "reading fluency",
    performance: "improving",
    behavior: "on task",
    tags: ["reading"],
    followUpNeeded: true,
    followUpNotes: "Retest with a new passage",
  }),
  record("e3", "2026-06-02T15:00:00.000Z", {
    evidenceType: "Legacy observation",
    topic: "Math facts",
    performance: "struggling",
    tags: ["math"],
  }),
  record("e4", "2026-06-03T15:00:00.000Z"),
];

describe("summarizeReportEvidence", () => {
  it("counts only the supplied records with stable ordering", () => {
    expect(summarizeReportEvidence(records)).toEqual({
      entryCount: 4,
      studentCount: 0,
      photoCount: 1,
      followUpCount: 1,
      firstEvidenceDate: "2026-05-04T15:00:00.000Z",
      lastEvidenceDate: "2026-06-03T15:00:00.000Z",
      evidenceTypes: [
        { label: "Academic check-in", count: 1 },
        { label: "Progress monitoring", count: 1 },
        { label: "Legacy observation", count: 1 },
      ],
      performance: [
        { label: "improving", count: 2 },
        { label: "struggling", count: 1 },
      ],
      behavior: [
        { label: "on task", count: 2 },
        { label: "focused", count: 1 },
      ],
      tags: [
        { label: "#reading", count: 2 },
        { label: "#fluency", count: 1 },
        { label: "#math", count: 1 },
      ],
    });
  });

  it("counts a flagged follow-up without a note and duplicate tags once per entry", () => {
    const summary = summarizeReportEvidence([
      record("e1", "2026-05-04T15:00:00.000Z", {
        followUpNeeded: true,
        tags: ["reading", "#reading"],
      }),
    ]);

    expect(summary.followUpCount).toBe(1);
    expect(summary.tags).toEqual([{ label: "#reading", count: 1 }]);
  });

  it("returns an empty summary for no records", () => {
    expect(summarizeReportEvidence([])).toEqual({
      entryCount: 0,
      studentCount: 0,
      photoCount: 0,
      followUpCount: 0,
      evidenceTypes: [],
      performance: [],
      behavior: [],
      tags: [],
    });
  });
});

describe("groupReportEvidence", () => {
  function groupIds(mode: "date" | "type" | "topic" | "student", timeZone = "UTC") {
    return groupReportEvidence(records, mode, timeZone).map((group) => [
      group.label,
      group.records.map(({ id }) => id),
    ]);
  }

  it("groups by teacher-local month in date order", () => {
    expect(groupIds("date")).toEqual([
      ["May 2026", ["e1", "e2"]],
      ["June 2026", ["e3", "e4"]],
    ]);
  });

  it("uses the teacher time zone for month boundaries", () => {
    const groups = groupReportEvidence(
      [record("e1", "2026-06-01T02:00:00.000Z")],
      "date",
      "America/Los_Angeles"
    );

    expect(groups.map(({ label }) => label)).toEqual(["May 2026"]);
  });

  it("groups by saved classification order with legacy and missing types last", () => {
    expect(groupIds("type")).toEqual([
      ["Academic check-in", ["e2"]],
      ["Progress monitoring", ["e1"]],
      ["Legacy observation", ["e3"]],
      ["No evidence type", ["e4"]],
    ]);
  });

  it("groups topics case-insensitively and alphabetically with missing topics last", () => {
    expect(groupIds("topic")).toEqual([
      ["Math facts", ["e3"]],
      ["Reading fluency", ["e1", "e2"]],
      ["No topic", ["e4"]],
    ]);
  });

  it("groups multi-student records alphabetically by student and counts students", () => {
    const multi = [
      record("m1", "2026-05-04T15:00:00.000Z", { rosterStudentId: "s_mary", studentDisplayName: "Mary" }),
      record("j1", "2026-05-05T15:00:00.000Z", { rosterStudentId: "s_jeremy", studentDisplayName: "Jeremy" }),
      record("m2", "2026-05-06T15:00:00.000Z", { rosterStudentId: "s_mary", studentDisplayName: "Mary" }),
    ];

    expect(
      groupReportEvidence(multi, "student", "UTC").map((group) => [
        group.label,
        group.records.map(({ id }) => id),
      ])
    ).toEqual([
      ["Jeremy", ["j1"]],
      ["Mary", ["m1", "m2"]],
    ]);
    expect(summarizeReportEvidence(multi).studentCount).toBe(2);
  });

  it("places every record in exactly one group for each mode", () => {
    for (const mode of ["date", "type", "topic", "student"] as const) {
      const ids = groupReportEvidence(records, mode, "UTC").flatMap((group) =>
        group.records.map(({ id }) => id)
      );

      expect(ids.sort()).toEqual(["e1", "e2", "e3", "e4"]);
    }
  });
});

describe("formatReportDateSpan", () => {
  const day = (value: string) => new Date(`${value}T12:00:00.000Z`);

  it("formats compact single-day, same-year, cross-year, and open spans", () => {
    expect(formatReportDateSpan(day("2026-09-02"), day("2026-09-02"), "UTC")).toBe(
      "Sep 2, 2026"
    );
    expect(formatReportDateSpan(day("2026-09-02"), day("2026-10-11"), "UTC")).toBe(
      "Sep 2 to Oct 11, 2026"
    );
    expect(formatReportDateSpan(day("2025-12-15"), day("2026-01-09"), "UTC")).toBe(
      "Dec 15, 2025 to Jan 9, 2026"
    );
    expect(formatReportDateSpan(day("2026-09-02"), undefined, "UTC")).toBe(
      "From Sep 2, 2026"
    );
    expect(formatReportDateSpan(undefined, day("2026-09-02"), "UTC")).toBe(
      "Through Sep 2, 2026"
    );
    expect(formatReportDateSpan(undefined, undefined, "UTC")).toBeNull();
  });
});

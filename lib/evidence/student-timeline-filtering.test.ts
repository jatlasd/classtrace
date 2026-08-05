import { describe, expect, it } from "vitest";
import {
  filterStudentTimelineRecords,
  normalizeStudentTimelineDateRange,
  normalizeStudentTimelineSort,
  type FilterableStudentTimelineRecord,
} from "@/lib/evidence/student-timeline-filtering";

function localDate(
  year: number,
  monthIndex: number,
  day: number,
  hour = 12
): string {
  return new Date(year, monthIndex, day, hour).toISOString();
}

function buildRecord(
  overrides: Partial<FilterableStudentTimelineRecord> = {}
): FilterableStudentTimelineRecord {
  return {
    id: "evidence_1",
    evidenceDate: localDate(2026, 7, 4),
    createdAt: localDate(2026, 7, 4, 13),
    evidenceNote: "Mary needed another model before solving independently.",
    summary: "Mary practiced fraction equivalence.",
    evidenceType: "Academic check-in",
    topic: "fractions",
    performance: "solved independently after a model",
    behavior: "persisted through correction",
    tags: ["Reteach"],
    followUpNotes: "Try a new representation next lesson.",
    ...overrides,
  };
}

describe("student timeline filtering", () => {
  it("matches an exact tag case-insensitively without tag-prefix false positives", () => {
    const records = [
      buildRecord({ id: "exact", tags: ["Reteach"] }),
      buildRecord({ id: "longer", tags: ["reteach-reading"] }),
      buildRecord({ id: "prefixed", tags: ["preteach"] }),
    ];

    expect(
      filterStudentTimelineRecords(records, {
        query: "#RETEACH",
        dateRange: "all",
        sort: "newest",
      }).map((record) => record.id)
    ).toEqual(["exact"]);
  });

  it("searches the Evidence note and reviewed structured fields", () => {
    const record = buildRecord();

    for (const query of ["another model", "FRACTIONS", "persisted", "representation"]) {
      expect(
        filterStudentTimelineRecords([record], {
          query,
          dateRange: "all",
          sort: "newest",
        })
      ).toHaveLength(1);
    }

    expect(
      filterStudentTimelineRecords([record], {
        query: "reading fluency",
        dateRange: "all",
        sort: "newest",
      })
    ).toEqual([]);
  });

  it("treats a local calendar-day preset as including today", () => {
    const now = new Date(2026, 7, 4, 16);
    const records = [
      buildRecord({ id: "today", evidenceDate: localDate(2026, 7, 4) }),
      buildRecord({ id: "first-day", evidenceDate: localDate(2026, 6, 22, 0) }),
      buildRecord({ id: "too-old", evidenceDate: localDate(2026, 6, 21, 23) }),
    ];

    expect(
      filterStudentTimelineRecords(records, {
        query: "",
        dateRange: "14",
        sort: "oldest",
        now,
      }).map((record) => record.id)
    ).toEqual(["first-day", "today"]);
  });

  it("does not include future calendar days in a recent preset", () => {
    const now = new Date(2026, 7, 4, 16);

    expect(
      filterStudentTimelineRecords(
        [buildRecord({ evidenceDate: localDate(2026, 7, 5) })],
        {
          query: "",
          dateRange: "14",
          sort: "newest",
          now,
        }
      )
    ).toEqual([]);
  });

  it("combines date and tag filters before applying the selected sort", () => {
    const now = new Date(2026, 7, 4, 16);
    const records = [
      buildRecord({ id: "newer", evidenceDate: localDate(2026, 7, 3) }),
      buildRecord({ id: "older", evidenceDate: localDate(2026, 6, 28) }),
      buildRecord({
        id: "wrong-tag",
        evidenceDate: localDate(2026, 7, 4),
        tags: ["independent"],
      }),
      buildRecord({ id: "too-old", evidenceDate: localDate(2026, 5, 1) }),
    ];

    expect(
      filterStudentTimelineRecords(records, {
        query: "#reteach",
        dateRange: "14",
        sort: "oldest",
        now,
      }).map((record) => record.id)
    ).toEqual(["older", "newer"]);
  });

  it("normalizes unsupported URL values to safe defaults", () => {
    expect(normalizeStudentTimelineDateRange("30")).toBe("30");
    expect(normalizeStudentTimelineDateRange("365")).toBe("all");
    expect(normalizeStudentTimelineSort("oldest")).toBe("oldest");
    expect(normalizeStudentTimelineSort("sideways")).toBe("newest");
  });
});

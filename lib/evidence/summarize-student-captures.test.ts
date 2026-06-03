import { describe, expect, it } from "vitest";
import type { Capture } from "@/lib/mock-data";
import { summarizeStudentCaptures } from "./summarize-student-captures";

function makeCapture(overrides: Partial<Capture> & Pick<Capture, "id">): Capture {
  return {
    note: "@Jeremy note",
    students: ["Jeremy"],
    tags: [],
    evidenceType: "Academic check-in",
    timestamp: "Mon, Jun 2",
    summary: "Summary",
    primaryStudent: "Jeremy",
    ...overrides,
  };
}

describe("summarizeStudentCaptures", () => {
  it("returns empty synthesis when there are no captures", () => {
    const result = summarizeStudentCaptures([]);

    expect(result.snapshot).toEqual({
      totalCaptures: 0,
      mostRecentTimestamp: null,
      followUpCount: 0,
      topTag: null,
    });
    expect(result.insights).toEqual([]);
    expect(result.patterns).toEqual({
      tags: [],
      evidenceTypes: [],
      followUpCount: 0,
    });
  });

  it("summarizes a single capture", () => {
    const result = summarizeStudentCaptures([
      makeCapture({
        id: "1",
        tags: ["fractions"],
        evidenceType: "Behavior observation",
        timestamp: "Tue, Jun 3",
        followUp: true,
      }),
    ]);

    expect(result.snapshot).toEqual({
      totalCaptures: 1,
      mostRecentTimestamp: "Tue, Jun 3",
      followUpCount: 1,
      topTag: { tag: "fractions", count: 1 },
    });
    expect(result.insights).toEqual([
      "Most recent evidence: Tue, Jun 3",
      "#fractions appears in 1 capture",
      "Behavior observation is the most common evidence type",
      "1 capture includes follow-up",
    ]);
    expect(result.patterns.tags).toEqual([{ tag: "fractions", count: 1 }]);
    expect(result.patterns.evidenceTypes).toEqual([
      { evidenceType: "Behavior observation", count: 1 },
    ]);
  });

  it("counts tags once per capture even when duplicated in a note", () => {
    const result = summarizeStudentCaptures([
      makeCapture({
        id: "1",
        tags: ["fractions", "fractions"],
      }),
      makeCapture({
        id: "2",
        tags: ["fractions"],
      }),
    ]);

    expect(result.snapshot.topTag).toEqual({ tag: "fractions", count: 2 });
    expect(result.patterns.tags[0]).toEqual({ tag: "fractions", count: 2 });
  });

  it("breaks top tag ties by tag name ascending", () => {
    const result = summarizeStudentCaptures([
      makeCapture({ id: "1", tags: ["zebra"] }),
      makeCapture({ id: "2", tags: ["alpha"] }),
    ]);

    expect(result.snapshot.topTag).toEqual({ tag: "alpha", count: 1 });
  });

  it("counts follow-ups and evidence types across captures", () => {
    const result = summarizeStudentCaptures([
      makeCapture({
        id: "1",
        evidenceType: "Academic check-in",
        followUp: true,
        timestamp: "Wed, Jun 4",
      }),
      makeCapture({
        id: "2",
        evidenceType: "Academic check-in",
        followUp: false,
        timestamp: "Tue, Jun 3",
      }),
      makeCapture({
        id: "3",
        evidenceType: "Behavior observation",
        followUp: true,
        timestamp: "Mon, Jun 2",
      }),
    ]);

    expect(result.snapshot.followUpCount).toBe(2);
    expect(result.patterns.evidenceTypes).toEqual([
      { evidenceType: "Academic check-in", count: 2 },
      { evidenceType: "Behavior observation", count: 1 },
    ]);
    expect(result.insights).toEqual([
      "Most recent evidence: Wed, Jun 4",
      "Academic check-in is the most common evidence type",
      "2 captures include follow-up",
    ]);
  });

  it("limits tag patterns to six entries", () => {
    const captures = Array.from({ length: 8 }, (_, index) =>
      makeCapture({
        id: String(index),
        tags: [`tag-${index}`],
      })
    );

    expect(summarizeStudentCaptures(captures).patterns.tags).toHaveLength(6);
  });
});

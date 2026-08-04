import { describe, expect, it } from "vitest";
import {
  DEMO_DATASET,
  DEMO_DATASET_VERSION,
  validateDemoDataset,
} from "./demo-data.mjs";

describe("canonical demo dataset", () => {
  it("contains the complete fixed demo workspace", () => {
    expect(validateDemoDataset()).toEqual({
      version: DEMO_DATASET_VERSION,
      classCount: 2,
      studentCount: 4,
      evidenceCount: 56,
      earliestEvidenceDate: "2026-03-09T13:05:00.000Z",
      latestEvidenceDate: "2026-05-01T18:20:00.000Z",
    });

    expect(DEMO_DATASET.students.map((student) => student.displayName)).toEqual([
      "Jeremy",
      "Stacy",
      "Jeff",
      "Mary",
    ]);
    expect(
      DEMO_DATASET.evidence.filter((record) => record.followUpNeeded)
    ).toHaveLength(12);
  });

  it("rejects structural drift and raw capture fields", () => {
    const missingRecord = {
      ...DEMO_DATASET,
      evidence: DEMO_DATASET.evidence.slice(1),
    };
    expect(() => validateDemoDataset(missingRecord)).toThrow(/exactly 56/);

    const evidenceWithRawCapture = DEMO_DATASET.evidence.map((record, index) =>
      index === 0 ? { ...record, rawNote: "not allowed" } : record
    );
    expect(() =>
      validateDemoDataset({ ...DEMO_DATASET, evidence: evidenceWithRawCapture })
    ).toThrow(/raw-capture/);
  });

  it("rejects cross-class evidence relations", () => {
    const evidenceWithWrongClass = DEMO_DATASET.evidence.map((record, index) =>
      index === 0
        ? { ...record, classId: "demo_class_ela_support_2026" }
        : record
    );

    expect(() =>
      validateDemoDataset({ ...DEMO_DATASET, evidence: evidenceWithWrongClass })
    ).toThrow(/ownership relation/);
  });
});


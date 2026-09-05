import { readFileSync } from "node:fs";
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
      photoCount: 4,
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
    expect(DEMO_DATASET.photos.map((photo) => photo.evidenceId)).toEqual([
      "demo_evidence_stacy_01",
      "demo_evidence_jeremy_10",
      "demo_evidence_jeff_10",
      "demo_evidence_mary_07",
    ]);
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

  it("rejects missing, duplicate, or unsafe photo relations", () => {
    expect(() =>
      validateDemoDataset({ ...DEMO_DATASET, photos: DEMO_DATASET.photos.slice(1) })
    ).toThrow(/exactly 4 evidence photos/);

    const duplicateEvidencePhoto = DEMO_DATASET.photos.map((photo, index) =>
      index === 1 ? { ...photo, evidenceId: DEMO_DATASET.photos[0].evidenceId } : photo
    );
    expect(() =>
      validateDemoDataset({ ...DEMO_DATASET, photos: duplicateEvidencePhoto })
    ).toThrow(/Photo evidence relations/);

    const unsafeAsset = DEMO_DATASET.photos.map((photo, index) =>
      index === 0 ? { ...photo, assetFilename: "../outside.webp" } : photo
    );
    expect(() =>
      validateDemoDataset({ ...DEMO_DATASET, photos: unsafeAsset })
    ).toThrow(/image metadata/);
  });

  it("ships each canonical photo as a bounded WebP asset with provenance", () => {
    for (const photo of DEMO_DATASET.photos) {
      const assetUrl = new URL(`./demo-assets/${photo.assetFilename}`, import.meta.url);
      const bytes = readFileSync(assetUrl);
      expect(bytes.length).toBeGreaterThan(0);
      expect(bytes.length).toBeLessThanOrEqual(1024 * 1024);
      expect(bytes.subarray(0, 4).toString("ascii")).toBe("RIFF");
      expect(bytes.subarray(8, 12).toString("ascii")).toBe("WEBP");
      expect(
        JSON.parse(
          readFileSync(
            new URL(`./demo-assets/${photo.assetFilename}.json`, import.meta.url),
            "utf8"
          )
        )
          .prompt
      ).toMatch(/synthetic ClassTrace demo evidence photo/);
    }
  });
});


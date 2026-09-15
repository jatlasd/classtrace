import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { INPUT_LIMITS } from "../lib/validation/input-limits.ts";
import {
  DEMO_DATASET,
  DEMO_DATASET_VERSION,
  validateDemoDataset,
} from "./demo-data.mjs";

describe("canonical demo dataset", () => {
  it("contains the complete fixed demo workspace", () => {
    expect(validateDemoDataset()).toEqual({
      version: DEMO_DATASET_VERSION,
      classCount: 3,
      studentCount: 14,
      evidenceCount: 81,
      photoCount: 4,
      earliestEvidenceDate: "2026-08-17T13:05:00.000Z",
      latestEvidenceDate: "2026-09-15T18:26:00.000Z",
    });

    expect(Object.fromEntries(DEMO_DATASET.students.map((student) => [
      student.displayName,
      DEMO_DATASET.evidence.filter((record) => record.studentId === student.id).length,
    ]))).toEqual({
      Jeremy: 17, Stacy: 13, Jeff: 12, Mary: 10,
      Nina: 5, Caleb: 2, Owen: 1, Tessa: 4, Jonah: 3, Iris: 1,
      Rowan: 7, Eli: 3, Lena: 2, Miles: 1,
    });
    expect(DEMO_DATASET.classes.map((group) => ({
      students: DEMO_DATASET.students.filter((student) => student.classId === group.id).length,
      evidence: DEMO_DATASET.evidence.filter((record) => record.classId === group.id).length,
    }))).toEqual([
      { students: 5, evidence: 38 },
      { students: 5, evidence: 30 },
      { students: 4, evidence: 13 },
    ]);
    expect(DEMO_DATASET.photos.map((photo) => photo.evidenceId)).toEqual([
      "demo_evidence_stacy_01",
      "demo_evidence_jeremy_10",
      "demo_evidence_jeff_10",
      "demo_evidence_mary_07",
    ]);
  });

  it("allows changes in history size, type mix, follow-ups, and photo count", () => {
    const revised = {
      ...DEMO_DATASET,
      evidence: DEMO_DATASET.evidence.slice(1),
      photos: DEMO_DATASET.photos.slice(1),
    };
    expect(validateDemoDataset(revised)).toMatchObject({
      evidenceCount: 80,
      photoCount: 3,
    });
  });

  it.each(["rawNote", "sourceNote", "captureText"])("rejects the raw-capture field %s", (field) => {
    const dataset = structuredClone(DEMO_DATASET);
    dataset.evidence[0][field] = "not allowed";
    expect(() => validateDemoDataset(dataset)).toThrow(/raw-capture/);
  });

  it.each([
    [{ evidenceNote: "@jeremy forgot homework" }, /raw-capture/],
    [{ evidenceNote: "" }, /note/],
    [{ evidenceNote: "x".repeat(INPUT_LIMITS.evidenceNote + 1) }, /note/],
    [{ studentId: "unknown_student" }, /ownership relation/],
    [{ classId: "demo_class_ela_support_2026" }, /ownership relation/],
    [{ evidenceType: "Unclear" }, /evidence type/],
    [{ evidenceType: "invented type" }, /evidence type/],
    [{ summary: "unrelated summary" }, /summary/],
    [{ topic: "x".repeat(INPUT_LIMITS.evidenceField + 1) }, /topic/],
    [{ performance: "x".repeat(INPUT_LIMITS.evidenceField + 1) }, /performance/],
    [{ behavior: null }, /behavior/],
    [{ behavior: [false] }, /behavior/],
    [{ tags: [] }, /tags/],
    [{ tags: [false] }, /tag/],
    [{ tags: ["Math"] }, /normalized/],
    [{ tags: ["math", "math"] }, /tags/],
    [{ followUpNotes: "not an array" }, /follow-up/],
    [{ followUpNeeded: false }, /follow-up/],
    [{ evidenceDate: "2026-03-09T13:05:00.000Z" }, /timestamps/],
    [{ evidenceDate: "2026-09-16T13:05:00.000Z" }, /timestamps/],
    [{ evidenceDate: "2026-08-17T10:00:00.000Z" }, /timestamps/],
    [{ evidenceDate: "2026-08-17" }, /fixed timestamp/],
    [{ validatedAt: "2026-08-17T12:00:00.000Z" }, /timestamps/],
    [{ validatedAt: "2026-09-16T13:25:00.000Z" }, /timestamps/],
    [{ createdAt: "2026-09-15T13:25:00.000Z" }, /timestamps/],
    [{ updatedAt: "2026-09-15T13:25:00.000Z" }, /timestamps/],
  ].map(([changes, error]) => ({ field: Object.keys(changes)[0], changes, error })))(
    "rejects invalid evidence $field",
    ({ changes, error }) => {
      const dataset = structuredClone(DEMO_DATASET);
      Object.assign(dataset.evidence[0], changes);
      expect(() => validateDemoDataset(dataset)).toThrow(error);
    }
  );

  it("rejects duplicate IDs and broken roster relations", () => {
    const duplicate = structuredClone(DEMO_DATASET);
    duplicate.evidence[1].id = duplicate.evidence[0].id;
    expect(() => validateDemoDataset(duplicate)).toThrow(/Evidence IDs/);

    const invalidClass = structuredClone(DEMO_DATASET);
    invalidClass.students[0].classId = "missing_class";
    expect(() => validateDemoDataset(invalidClass)).toThrow(/roster relation/);

    const invalidHandle = structuredClone(DEMO_DATASET);
    invalidHandle.students[0].mentionHandle = "@jeremy";
    expect(() => validateDemoDataset(invalidHandle)).toThrow(/handle/);

    const lateStudent = structuredClone(DEMO_DATASET);
    lateStudent.students[0].createdAt = "2026-09-01T12:00:00.000Z";
    expect(() => validateDemoDataset(lateStudent)).toThrow(/timestamps/);
  });

  it("retains broad demo coverage without exact category quotas", () => {
    expect(DEMO_DATASET.evidence.filter((record) => record.evidenceType === "Communication log")).toHaveLength(3);
    expect(DEMO_DATASET.evidence.filter((record) => !record.followUpNeeded).length).toBeGreaterThan(60);
    const photographedStudents = new Set(DEMO_DATASET.photos.map((photo) =>
      DEMO_DATASET.evidence.find((record) => record.id === photo.evidenceId).studentId
    ));
    expect(photographedStudents.size).toBe(4);
    expect(DEMO_DATASET.students.filter((student) => !photographedStudents.has(student.id))).toHaveLength(10);

    const noProgressMonitoring = DEMO_DATASET.evidence.filter((record) => record.evidenceType !== "Progress monitoring");
    expect(() =>
      validateDemoDataset({ ...DEMO_DATASET, evidence: noProgressMonitoring })
    ).toThrow(/evidence-type coverage/);
  });

  it("rejects undersized datasets and students whose only observation is missing", () => {
    expect(() =>
      validateDemoDataset({ ...DEMO_DATASET, evidence: DEMO_DATASET.evidence.slice(0, 56) })
    ).toThrow(/70–90 evidence/);
    expect(() =>
      validateDemoDataset({
        ...DEMO_DATASET,
        evidence: DEMO_DATASET.evidence.filter((record) => record.studentId !== "demo_student_owen_2026"),
      })
    ).toThrow(/at least one evidence/);
  });

  it("rejects missing, duplicate, or unsafe photo relations", () => {
    expect(() =>
      validateDemoDataset({ ...DEMO_DATASET, photos: [] })
    ).toThrow(/occasional evidence photos/);

    const orphanedPhoto = structuredClone(DEMO_DATASET);
    orphanedPhoto.photos[0].evidenceId = "missing_evidence";
    expect(() => validateDemoDataset(orphanedPhoto)).toThrow(/relation or image metadata/);

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

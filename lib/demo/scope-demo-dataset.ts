import { createHash } from "node:crypto";
import type { DemoDataset } from "./demo-data.ts";

export function scopeDemoDatasetForClerkUser(
  dataset: DemoDataset,
  clerkUserId: string
): DemoDataset {
  const scope = createHash("sha256")
    .update(clerkUserId)
    .digest("hex")
    .slice(0, 12);
  const scopedId = (id: string) => `${id}_local_${scope}`;
  const classIds = new Map(
    dataset.classes.map((classGroup) => [classGroup.id, scopedId(classGroup.id)])
  );
  const studentIds = new Map(
    dataset.students.map((student) => [student.id, scopedId(student.id)])
  );
  const evidenceIds = new Map(
    dataset.evidence.map((record) => [record.id, scopedId(record.id)])
  );
  const mappedId = (ids: Map<string, string>, id: string): string => {
    const mapped = ids.get(id);
    if (!mapped) {
      throw new Error("Demo dataset contains an invalid scoped relation.");
    }
    return mapped;
  };

  return {
    ...dataset,
    classes: dataset.classes.map((classGroup) => ({
      ...classGroup,
      id: mappedId(classIds, classGroup.id),
    })),
    students: dataset.students.map((student) => ({
      ...student,
      id: mappedId(studentIds, student.id),
      classId: mappedId(classIds, student.classId),
    })),
    evidence: dataset.evidence.map((record) => ({
      ...record,
      id: mappedId(evidenceIds, record.id),
      studentId: mappedId(studentIds, record.studentId),
      classId: mappedId(classIds, record.classId),
    })),
    photos: dataset.photos.map((photo) => ({
      ...photo,
      id: scopedId(photo.id),
      evidenceId: mappedId(evidenceIds, photo.evidenceId),
    })),
  };
}

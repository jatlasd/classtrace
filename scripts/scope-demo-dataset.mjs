import { createHash } from "node:crypto";

export function scopeDemoDatasetForClerkUser(dataset, clerkUserId) {
  const scope = createHash("sha256")
    .update(clerkUserId)
    .digest("hex")
    .slice(0, 12);
  const scopedId = (id) => `${id}_local_${scope}`;
  const classIds = new Map(
    dataset.classes.map((classGroup) => [classGroup.id, scopedId(classGroup.id)])
  );
  const studentIds = new Map(
    dataset.students.map((student) => [student.id, scopedId(student.id)])
  );
  const evidenceIds = new Map(
    dataset.evidence.map((record) => [record.id, scopedId(record.id)])
  );

  return {
    ...dataset,
    classes: dataset.classes.map((classGroup) => ({
      ...classGroup,
      id: classIds.get(classGroup.id),
    })),
    students: dataset.students.map((student) => ({
      ...student,
      id: studentIds.get(student.id),
      classId: classIds.get(student.classId),
    })),
    evidence: dataset.evidence.map((record) => ({
      ...record,
      id: evidenceIds.get(record.id),
      studentId: studentIds.get(record.studentId),
      classId: classIds.get(record.classId),
    })),
    photos: dataset.photos.map((photo) => ({
      ...photo,
      id: scopedId(photo.id),
      evidenceId: evidenceIds.get(photo.evidenceId),
    })),
  };
}

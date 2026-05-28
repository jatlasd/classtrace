import { resolveCaptureDisplay } from "@/lib/evidence/capture-validation";
import type { Capture } from "@/lib/mock-data";
import { buildNoteDraft } from "@/lib/note-processing/build-note-draft";
import {
  formatStoredCaptureTimestamp,
  hasStoredCaptureState,
  readStoredCaptures,
  type StoredCapture,
} from "@/lib/poc-storage";
import { getStudentById, mentionDisplayLabel } from "@/lib/students";

function storedCaptureMatchesStudent(
  capture: StoredCapture,
  studentId: string
): boolean {
  const student = getStudentById(studentId);
  if (!student) {
    return false;
  }

  const draft = buildNoteDraft(capture.rawNote);
  const display = resolveCaptureDisplay(draft, capture.validation);

  return display.studentMentions.some(
    (ref) => ref.status === "resolved" && ref.student.id === student.id
  );
}

function storedCaptureToCapture(capture: StoredCapture): Capture {
  const draft = buildNoteDraft(capture.rawNote);
  const display = resolveCaptureDisplay(draft, capture.validation);
  const resolvedStudents = display.studentMentions.filter(
    (ref) => ref.status === "resolved"
  );

  return {
    id: capture.id,
    note: capture.rawNote,
    students: display.studentMentions.map(mentionDisplayLabel),
    tags: display.tags,
    evidenceType: display.evidenceType,
    timestamp: formatStoredCaptureTimestamp(capture),
    summary: display.summaryLine,
    followUp: display.followUps.length > 0,
    primaryStudent:
      resolvedStudents.length > 0
        ? resolvedStudents[0].student.displayName
        : "",
  };
}

export function getCapturesForStudent(studentId: string): Capture[] {
  const student = getStudentById(studentId);
  if (!student || !hasStoredCaptureState()) {
    return [];
  }

  return readStoredCaptures()
    .filter((capture) => storedCaptureMatchesStudent(capture, studentId))
    .sort((a, b) => b.timestampMs - a.timestampMs)
    .map(storedCaptureToCapture);
}

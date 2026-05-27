import { buildNoteDraft } from "@/lib/note-processing/build-note-draft";
import { draftToDisplay } from "@/lib/note-processing/draft-to-display";
import type { Capture } from "@/lib/mock-data";
import { recentCaptures } from "@/lib/mock-data";
import { getStudentById } from "@/lib/students";

export function getCapturesForStudent(studentId: string): Capture[] {
  const student = getStudentById(studentId);
  if (!student) {
    return [];
  }

  return recentCaptures.filter((capture) => {
    const draft = buildNoteDraft(capture.note);
    const display = draftToDisplay(draft);
    return display.studentMentions.some(
      (ref) =>
        ref.status === "resolved" && ref.student.id === student.id
    );
  });
}

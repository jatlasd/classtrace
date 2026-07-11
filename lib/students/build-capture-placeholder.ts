import type { CaptureRosterStudent } from "./resolve-capture-students";

const GENERIC_CAPTURE_HANDLE = "student";

export function buildCapturePlaceholder(
  rosterStudents: CaptureRosterStudent[]
): string {
  const mentionHandle =
    rosterStudents[0]?.mentionHandle.trim() || GENERIC_CAPTURE_HANDLE;

  return `@${mentionHandle} used a new reading strategy during small group #reading...`;
}

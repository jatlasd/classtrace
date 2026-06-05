import type { CaptureValidation } from "@/lib/evidence/capture-validation";
import {
  hasStoredCaptureState,
  hasStoredRosterState,
  writeStoredCaptures,
  type StoredCapture,
} from "@/lib/poc-storage";
import { replaceTeacherRosterForPoc, type Student } from "@/lib/students";
import wideDemoClassroom from "./wide-demo-classroom.json";

function isStudent(value: unknown): value is Student {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const record = value as Record<string, unknown>;
  return (
    typeof record.id === "string" &&
    typeof record.displayName === "string" &&
    typeof record.handle === "string" &&
    typeof record.initials === "string" &&
    typeof record.colorClass === "string"
  );
}

function normalizeSeedCapture(capture: unknown): StoredCapture | null {
  if (typeof capture !== "object" || capture === null) {
    return null;
  }
  const record = capture as Record<string, unknown>;
  if (
    typeof record.id !== "string" ||
    typeof record.rawNote !== "string" ||
    typeof record.timestampMs !== "number"
  ) {
    return null;
  }
  return {
    id: record.id,
    rawNote: record.rawNote,
    timestampMs: record.timestampMs,
    validation: record.validation as CaptureValidation | undefined,
  };
}

export function getWideDemoClassroomData(): {
  roster: Student[];
  captures: StoredCapture[];
} {
  const roster = wideDemoClassroom.roster.filter(isStudent);
  const captures = wideDemoClassroom.captures
    .map(normalizeSeedCapture)
    .filter((capture): capture is StoredCapture => capture !== null);

  return { roster, captures };
}

export function loadWideDemoClassroom(): StoredCapture[] {
  const { roster, captures } = getWideDemoClassroomData();
  replaceTeacherRosterForPoc(roster);
  writeStoredCaptures(captures);
  return captures.slice().sort((a, b) => b.timestampMs - a.timestampMs);
}

export function hasExistingPocData(): boolean {
  return hasStoredCaptureState() || hasStoredRosterState();
}

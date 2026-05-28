import type { CaptureValidation } from "@/lib/evidence/capture-validation";
import type { Student } from "@/lib/students";

export type StoredCapture = {
  id: string;
  rawNote: string;
  timestampMs: number;
  validation?: CaptureValidation;
};

const CAPTURES_KEY = "classtrace.poc.captures.v1";
const ROSTER_KEY = "classtrace.poc.roster.v1";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function isStoredCapture(value: unknown): value is StoredCapture {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const record = value as Record<string, unknown>;
  return (
    typeof record.id === "string" &&
    typeof record.rawNote === "string" &&
    typeof record.timestampMs === "number"
  );
}

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

export function readStoredCaptures(): StoredCapture[] {
  if (!isBrowser()) {
    return [];
  }

  try {
    const raw = localStorage.getItem(CAPTURES_KEY);
    if (!raw) {
      return [];
    }
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter(isStoredCapture);
  } catch {
    return [];
  }
}

export function writeStoredCaptures(captures: StoredCapture[]): void {
  if (!isBrowser()) {
    return;
  }

  try {
    localStorage.setItem(CAPTURES_KEY, JSON.stringify(captures));
  } catch {
    return;
  }
}

export function clearStoredCaptures(): void {
  if (!isBrowser()) {
    return;
  }

  localStorage.removeItem(CAPTURES_KEY);
}

export function hasStoredCaptureState(): boolean {
  if (!isBrowser()) {
    return false;
  }

  return localStorage.getItem(CAPTURES_KEY) !== null;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

function isSameCalendarDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function formatStoredCaptureTimestamp(capture: StoredCapture): string {
  const capturedAt = new Date(capture.timestampMs);
  const now = new Date();
  const ageMs = now.getTime() - capture.timestampMs;

  if (ageMs < 60_000) {
    return "Just now";
  }

  if (isSameCalendarDay(capturedAt, now)) {
    return `Today at ${formatTime(capturedAt)}`;
  }

  return capturedAt.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function readStoredRoster(): Student[] | null {
  if (!isBrowser()) {
    return null;
  }

  try {
    const raw = localStorage.getItem(ROSTER_KEY);
    if (!raw) {
      return null;
    }
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return null;
    }
    const students = parsed.filter(isStudent);
    return students.length > 0 ? students : null;
  } catch {
    return null;
  }
}

export function writeStoredRoster(students: Student[]): void {
  if (!isBrowser()) {
    return;
  }

  try {
    localStorage.setItem(ROSTER_KEY, JSON.stringify(students));
  } catch {
    return;
  }
}

export function clearStoredRoster(): void {
  if (!isBrowser()) {
    return;
  }

  localStorage.removeItem(ROSTER_KEY);
}

export function hasStoredRosterState(): boolean {
  if (!isBrowser()) {
    return false;
  }

  return localStorage.getItem(ROSTER_KEY) !== null;
}

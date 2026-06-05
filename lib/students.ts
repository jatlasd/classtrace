import {
  clearStoredRoster,
  readStoredRoster,
  writeStoredRoster,
} from "@/lib/poc-storage";

export type Student = {
  id: string;
  displayName: string;
  handle: string;
  grade?: string;
  group?: string;
  initials: string;
  colorClass: string;
};

export type StudentMentionRef =
  | { status: "resolved"; student: Student }
  | { status: "unresolved"; mention: string };

export type AddStudentInput = {
  displayName: string;
  handle: string;
  grade?: string;
  group?: string;
};

export type AddStudentResult =
  | { ok: true; student: Student }
  | { ok: false; error: string };

export type UpdateStudentInput = AddStudentInput;

export type UpdateStudentResult = AddStudentResult;

export type DeleteStudentResult =
  | { ok: true }
  | { ok: false; error: string };

const DEFAULT_ROSTER: Student[] = [];

const LEGACY_DEMO_ROSTER_IDS = new Set(["jeremy", "stacy", "jeff", "mary"]);

function stripLegacyDemoRoster(students: Student[]): Student[] {
  return students.filter((student) => !LEGACY_DEMO_ROSTER_IDS.has(student.id));
}

const COLOR_PALETTE = [
  "bg-sky-500",
  "bg-rose-400",
  "bg-teal-500",
  "bg-violet-500",
  "bg-amber-500",
  "bg-emerald-500",
  "bg-indigo-500",
  "bg-orange-500",
];

let teacherRoster: Student[] = [...DEFAULT_ROSTER];
let rosterHydrated = false;

function ensureRosterHydrated(): void {
  if (rosterHydrated || typeof window === "undefined") {
    return;
  }

  rosterHydrated = true;
  const stored = readStoredRoster();
  if (stored) {
    const cleaned = stripLegacyDemoRoster(stored);
    if (cleaned.length !== stored.length) {
      if (cleaned.length === 0) {
        clearStoredRoster();
      } else {
        writeStoredRoster(cleaned);
      }
    }
    teacherRoster = cleaned.length > 0 ? cleaned : [...DEFAULT_ROSTER];
  }
}

function normalizeMention(mention: string): string {
  return mention.replace(/^@/, "").trim().toLowerCase();
}

function deriveInitials(displayName: string): string {
  const parts = displayName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return "??";
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function deriveIdFromHandle(handle: string): string {
  return handle
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function persistTeacherRoster(): void {
  if (teacherRoster.length === 0) {
    clearStoredRoster();
    return;
  }

  writeStoredRoster(teacherRoster);
}

function normalizeStudentInput(input: AddStudentInput): {
  displayName: string;
  handle: string;
  grade?: string;
  group?: string;
} {
  return {
    displayName: input.displayName.trim(),
    handle: input.handle.trim().replace(/^@/, ""),
    grade: input.grade?.trim() || undefined,
    group: input.group?.trim() || undefined,
  };
}

type NewStudentValidation =
  | { ok: false; error: string }
  | { ok: true; id: string; normalizedHandle: string };

type UpdatedStudentValidation =
  | { ok: false; error: string }
  | { ok: true; normalizedHandle: string };

function validateNewStudent(
  displayName: string,
  handle: string
): NewStudentValidation {
  if (!displayName) {
    return { ok: false, error: "Display name is required." };
  }

  if (!handle) {
    return { ok: false, error: "Handle is required." };
  }

  const id = deriveIdFromHandle(handle);

  if (!id) {
    return { ok: false, error: "Handle must include at least one letter or number." };
  }

  const normalizedHandle = normalizeMention(handle);

  if (teacherRoster.some((student) => student.id === id)) {
    return { ok: false, error: "A student with this handle already exists on your roster." };
  }

  if (
    teacherRoster.some(
      (student) => student.handle.toLowerCase() === normalizedHandle
    )
  ) {
    return { ok: false, error: "A student with this handle already exists on your roster." };
  }

  return { ok: true, id, normalizedHandle };
}

function validateUpdatedStudent(
  studentId: string,
  displayName: string,
  handle: string
): UpdatedStudentValidation {
  if (!displayName) {
    return { ok: false, error: "Display name is required." };
  }

  if (!handle) {
    return { ok: false, error: "Handle is required." };
  }

  if (!deriveIdFromHandle(handle)) {
    return { ok: false, error: "Handle must include at least one letter or number." };
  }

  const normalizedHandle = normalizeMention(handle);
  const normalizedId = studentId.toLowerCase();

  if (
    teacherRoster.some(
      (student) =>
        student.id !== normalizedId &&
        student.handle.toLowerCase() === normalizedHandle
    )
  ) {
    return { ok: false, error: "A student with this handle already exists on your roster." };
  }

  return { ok: true, normalizedHandle };
}

export function resetTeacherRosterForTests(): void {
  rosterHydrated = false;
  teacherRoster = [...DEFAULT_ROSTER];
}

export function replaceTeacherRosterForPoc(students: Student[]): void {
  teacherRoster = [...students];
  rosterHydrated = true;
  writeStoredRoster(students);
}

export function addStudent(input: AddStudentInput): AddStudentResult {
  ensureRosterHydrated();

  const { displayName, handle, grade, group } = normalizeStudentInput(input);
  const validation = validateNewStudent(displayName, handle);

  if (!validation.ok) {
    return validation;
  }

  const student: Student = {
    id: validation.id,
    displayName,
    handle,
    grade,
    group,
    initials: deriveInitials(displayName),
    colorClass: COLOR_PALETTE[teacherRoster.length % COLOR_PALETTE.length],
  };

  teacherRoster = [...teacherRoster, student];
  persistTeacherRoster();

  return { ok: true, student };
}

export function updateStudent(
  studentId: string,
  input: UpdateStudentInput
): UpdateStudentResult {
  ensureRosterHydrated();

  const normalizedId = studentId.toLowerCase();
  const existing = teacherRoster.find((student) => student.id === normalizedId);

  if (!existing) {
    return { ok: false, error: "Student not found on your roster." };
  }

  const { displayName, handle, grade, group } = normalizeStudentInput(input);
  const validation = validateUpdatedStudent(normalizedId, displayName, handle);

  if (!validation.ok) {
    return validation;
  }

  const updated: Student = {
    ...existing,
    displayName,
    handle,
    grade,
    group,
    initials: deriveInitials(displayName),
  };

  teacherRoster = teacherRoster.map((student) =>
    student.id === normalizedId ? updated : student
  );
  persistTeacherRoster();

  return { ok: true, student: updated };
}

export function deleteStudent(studentId: string): DeleteStudentResult {
  ensureRosterHydrated();

  const normalizedId = studentId.toLowerCase();
  const existing = teacherRoster.find((student) => student.id === normalizedId);

  if (!existing) {
    return { ok: false, error: "Student not found on your roster." };
  }

  teacherRoster = teacherRoster.filter((student) => student.id !== normalizedId);
  persistTeacherRoster();

  return { ok: true };
}

export function getStudentById(id: string): Student | undefined {
  ensureRosterHydrated();
  return teacherRoster.find((student) => student.id === id.toLowerCase());
}

export function getStudentByHandle(handle: string): Student | undefined {
  ensureRosterHydrated();
  const normalized = normalizeMention(handle);
  return teacherRoster.find(
    (student) => student.handle.toLowerCase() === normalized
  );
}

export function resolveStudentMention(mention: string): Student | undefined {
  ensureRosterHydrated();
  const normalized = normalizeMention(mention);
  return (
    getStudentById(normalized) ??
    teacherRoster.find((student) => student.handle.toLowerCase() === normalized) ??
    teacherRoster.find(
      (student) => student.displayName.toLowerCase() === normalized
    )
  );
}

export function resolveStudentMentions(mentions: string[]): StudentMentionRef[] {
  return mentions.map((mention) => {
    const student = resolveStudentMention(mention);
    if (student) {
      return { status: "resolved", student };
    }
    return { status: "unresolved", mention };
  });
}

export function mentionDisplayLabel(ref: StudentMentionRef): string {
  if (ref.status === "resolved") {
    return ref.student.displayName;
  }
  return "Unmatched student";
}

export function studentMentionsToNames(refs: StudentMentionRef[]): string[] {
  return refs.map((ref) =>
    ref.status === "resolved" ? ref.student.displayName : ref.mention
  );
}

export function getAllStudents(): Student[] {
  ensureRosterHydrated();
  return [...teacherRoster];
}

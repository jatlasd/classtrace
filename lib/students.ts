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

const DEFAULT_ROSTER: Student[] = [
  {
    id: "jeremy",
    displayName: "Jeremy",
    handle: "Jeremy",
    grade: "5th Grade",
    group: "Period 2",
    initials: "JE",
    colorClass: "bg-sky-500",
  },
  {
    id: "stacy",
    displayName: "Stacy",
    handle: "Stacy",
    grade: "5th Grade",
    group: "Period 2",
    initials: "ST",
    colorClass: "bg-rose-400",
  },
  {
    id: "jeff",
    displayName: "Jeff",
    handle: "Jeff",
    grade: "5th Grade",
    group: "Period 3",
    initials: "JF",
    colorClass: "bg-teal-500",
  },
  {
    id: "mary",
    displayName: "Mary",
    handle: "Mary",
    grade: "5th Grade",
    group: "Period 2",
    initials: "MA",
    colorClass: "bg-violet-500",
  },
];

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

export function resetTeacherRosterForTests(): void {
  teacherRoster = [...DEFAULT_ROSTER];
}

export function addStudent(input: AddStudentInput): AddStudentResult {
  const displayName = input.displayName.trim();
  const handle = input.handle.trim();

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

  const student: Student = {
    id,
    displayName,
    handle,
    grade: input.grade?.trim() || undefined,
    group: input.group?.trim() || undefined,
    initials: deriveInitials(displayName),
    colorClass: COLOR_PALETTE[teacherRoster.length % COLOR_PALETTE.length],
  };

  teacherRoster = [...teacherRoster, student];

  return { ok: true, student };
}

export function getStudentById(id: string): Student | undefined {
  return teacherRoster.find((student) => student.id === id.toLowerCase());
}

export function getStudentByHandle(handle: string): Student | undefined {
  const normalized = normalizeMention(handle);
  return teacherRoster.find(
    (student) => student.handle.toLowerCase() === normalized
  );
}

export function resolveStudentMention(mention: string): Student | undefined {
  const normalized = normalizeMention(mention);
  return (
    getStudentById(normalized) ??
    teacherRoster.find((student) => student.handle.toLowerCase() === normalized)
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
  return [...teacherRoster];
}

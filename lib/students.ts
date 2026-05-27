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

const ROSTER: Student[] = [
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

function normalizeMention(mention: string): string {
  return mention.replace(/^@/, "").trim().toLowerCase();
}

export function getStudentById(id: string): Student | undefined {
  return ROSTER.find((student) => student.id === id.toLowerCase());
}

export function getStudentByHandle(handle: string): Student | undefined {
  const normalized = normalizeMention(handle);
  return ROSTER.find(
    (student) => student.handle.toLowerCase() === normalized
  );
}

export function resolveStudentMention(mention: string): Student | undefined {
  const normalized = normalizeMention(mention);
  return (
    getStudentById(normalized) ??
    ROSTER.find((student) => student.handle.toLowerCase() === normalized)
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
  return [...ROSTER];
}

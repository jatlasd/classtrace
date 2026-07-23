export type CaptureRosterStudent = {
  id: string;
  displayName: string;
  mentionHandle: string;
  classGroupName: string | null;
};

export type CaptureStudentResolution =
  | { status: "no_student_mentioned" }
  | { status: "unresolved_student"; unresolvedMentions: string[] }
  | { status: "multiple_students"; students: CaptureRosterStudent[] }
  | { status: "resolved_one_student"; student: CaptureRosterStudent };

function normalizeMention(value: string): string {
  return value.replace(/^@/, "").trim().toLowerCase();
}

export function resolveCaptureStudents(
  mentions: string[],
  roster: CaptureRosterStudent[]
): CaptureStudentResolution {
  if (mentions.length === 0) {
    return { status: "no_student_mentioned" };
  }

  const studentsByHandle = new Map(
    roster.map((student) => [
      normalizeMention(student.mentionHandle),
      student,
    ])
  );
  const distinctMentions = new Map<string, string>();
  const resolvedStudents = new Map<string, CaptureRosterStudent>();

  for (const mention of mentions) {
    const normalizedMention = normalizeMention(mention);
    if (!distinctMentions.has(normalizedMention)) {
      distinctMentions.set(normalizedMention, mention);
    }
    const student = studentsByHandle.get(normalizedMention);
    if (!student) {
      continue;
    }
    resolvedStudents.set(student.id, student);
  }

  const students = [...resolvedStudents.values()];

  if (distinctMentions.size > 1) {
    return { status: "multiple_students", students };
  }

  if (students.length === 0) {
    return {
      status: "unresolved_student",
      unresolvedMentions: [...distinctMentions.values()],
    };
  }

  return { status: "resolved_one_student", student: students[0] };
}

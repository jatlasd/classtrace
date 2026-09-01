import type { CaptureRosterStudent } from "@/lib/students/resolve-capture-students";
import type {
  StudentMentionDisplay,
  StudentMentionRef,
} from "@/lib/students/student-mention-display";

const STUDENT_AVATAR_COLOR = "bg-accent-soft";

function normalizeMention(value: string): string {
  return value.replace(/^@/, "").trim().toLowerCase();
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

function captureRosterStudentToDisplayStudent(
  student: CaptureRosterStudent
): StudentMentionDisplay {
  return {
    id: student.id,
    displayName: student.displayName,
    handle: student.mentionHandle,
    group: student.classGroupName ?? undefined,
    initials: deriveInitials(student.displayName),
    colorClass: STUDENT_AVATAR_COLOR,
  };
}

function buildRosterLookups(roster: CaptureRosterStudent[]) {
  const byHandle = new Map<string, StudentMentionDisplay>();
  const byDisplayName = new Map<string, StudentMentionDisplay>();

  roster.forEach((student) => {
    const displayStudent = captureRosterStudentToDisplayStudent(student);
    byHandle.set(normalizeMention(student.mentionHandle), displayStudent);
    byDisplayName.set(student.displayName.toLowerCase(), displayStudent);
  });

  return { byHandle, byDisplayName };
}

export function resolveStudentMentionsFromRoster(
  mentions: string[],
  roster: CaptureRosterStudent[]
): StudentMentionRef[] {
  const { byHandle } = buildRosterLookups(roster);
  const resolvedStudentIds = new Set<string>();
  const refs: StudentMentionRef[] = [];

  for (const mention of mentions) {
    const student = byHandle.get(normalizeMention(mention));
    if (student) {
      if (!resolvedStudentIds.has(student.id)) {
        resolvedStudentIds.add(student.id);
        refs.push({ status: "resolved", student });
      }
      continue;
    }
    refs.push({ status: "unresolved", mention });
  }

  return refs;
}

export function resolveStudentNamesFromRoster(
  names: string[],
  roster: CaptureRosterStudent[]
): StudentMentionRef[] {
  const { byHandle, byDisplayName } = buildRosterLookups(roster);

  return names.map((name) => {
    const normalized = normalizeMention(name);
    const byHandleMatch = byHandle.get(normalized);
    if (byHandleMatch) {
      return { status: "resolved", student: byHandleMatch };
    }

    const byNameMatch = byDisplayName.get(normalized);
    if (byNameMatch) {
      return { status: "resolved", student: byNameMatch };
    }

    return { status: "unresolved", mention: name };
  });
}

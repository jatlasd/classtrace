export type StudentMentionDisplay = {
  id: string;
  displayName: string;
  handle: string;
  grade?: string;
  group?: string;
  initials: string;
  colorClass: string;
};

export type StudentMentionRef =
  | { status: "resolved"; student: StudentMentionDisplay }
  | { status: "unresolved"; mention: string };

export function mentionDisplayLabel(ref: StudentMentionRef): string {
  return ref.status === "resolved" ? ref.student.displayName : "Unmatched student";
}

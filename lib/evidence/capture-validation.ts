import { normalizeTag } from "@/lib/format-tag";
import {
  draftToDisplay,
  NOTE_TYPE_LABELS,
  type DraftDisplay,
} from "@/lib/note-processing/draft-to-display";
import type { NoteDraft } from "@/lib/note-processing/types";
import {
  mentionDisplayLabel,
  resolveStudentMentions,
  type StudentMentionRef,
} from "@/lib/students";
import {
  resolveStudentNamesFromRoster,
} from "@/lib/students/roster-display-bridge";
import type { CaptureRosterStudent } from "@/lib/students/resolve-capture-students";

export type InterpretationFields = {
  students: string[];
  evidenceType: string;
  topic?: string;
  performance?: string;
  behavior?: string[];
  tags: string[];
  followUpNotes: string[];
};

export type CaptureValidation =
  | { status: "pending" }
  | { status: "validated"; fields: InterpretationFields; validatedAt?: number };

export type ResolvedCaptureDisplay = DraftDisplay & {
  validationStatus: "pending" | "validated";
};

export type InterpretationStudentValidation =
  | { status: "valid_one_student"; studentName: string }
  | { status: "no_student" }
  | { status: "unresolved_student"; studentNames: string[] }
  | { status: "multiple_students"; studentNames: string[] };

function buildSummaryLine(
  display: Omit<DraftDisplay, "summaryLine">
): string {
  const parts: string[] = [];

  if (display.studentMentions.length > 0) {
    parts.push(display.studentMentions.map(mentionDisplayLabel).join(", "));
  }

  if (display.topic) {
    parts.push(display.topic);
  }

  if (display.performance) {
    parts.push(display.performance);
  }

  if (display.behavior && display.behavior.length > 0) {
    parts.push(display.behavior.join(", "));
  }

  parts.push(display.evidenceType);

  return parts.join(" · ");
}

function studentMentionsFromNames(
  names: string[],
  roster?: CaptureRosterStudent[]
): StudentMentionRef[] {
  if (roster) {
    return resolveStudentNamesFromRoster(names, roster);
  }
  return resolveStudentMentions(names);
}

export function displayToInterpretationFields(
  display: DraftDisplay
): InterpretationFields {
  return {
    students: display.studentMentions.map((ref) =>
      ref.status === "resolved" ? ref.student.displayName : ref.mention
    ),
    evidenceType: display.evidenceType,
    topic: display.topic,
    performance: display.performance,
    behavior: display.behavior ? [...display.behavior] : undefined,
    tags: [...display.tags],
    followUpNotes: [...display.followUps],
  };
}

export function validateSingleStudentForInterpretation(
  display: DraftDisplay
): InterpretationStudentValidation {
  if (display.studentMentions.length === 0) {
    return { status: "no_student" };
  }

  const unresolved = display.studentMentions
    .filter((ref) => ref.status === "unresolved")
    .map((ref) => ref.mention);

  if (unresolved.length > 0) {
    return { status: "unresolved_student", studentNames: unresolved };
  }

  const resolvedNames = display.studentMentions.map((ref) =>
    ref.status === "resolved" ? ref.student.displayName : ref.mention
  );

  if (resolvedNames.length !== 1) {
    return { status: "multiple_students", studentNames: resolvedNames };
  }

  return {
    status: "valid_one_student",
    studentName: resolvedNames[0],
  };
}

export function parseCommaSeparated(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function parseStudentNames(value: string): string[] {
  return parseCommaSeparated(value).map((name) => name.replace(/^@/, ""));
}

export function parseTags(value: string): string[] {
  return parseCommaSeparated(value).map((tag) => normalizeTag(tag));
}

export function parseFollowUpNotes(value: string): string[] {
  return value
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function joinOptionalList(values?: string[]): string {
  return values?.join(", ") ?? "";
}

export function joinFollowUpNotes(notes: string[]): string {
  return notes.join("\n");
}

export function resolveCaptureDisplay(
  draft: NoteDraft,
  validation?: CaptureValidation,
  roster?: CaptureRosterStudent[]
): ResolvedCaptureDisplay {
  const base = draftToDisplay(draft, roster);

  if (validation?.status !== "validated") {
    return {
      ...base,
      validationStatus: "pending",
    };
  }

  const { fields } = validation;
  const studentMentions = studentMentionsFromNames(fields.students, roster);
  const hasUnresolved = studentMentions.some(
    (mention) => mention.status === "unresolved"
  );

  const display: Omit<DraftDisplay, "summaryLine"> = {
    studentMentions,
    tags: fields.tags,
    evidenceType: fields.evidenceType,
    topic: fields.topic,
    performance: fields.performance,
    behavior: fields.behavior,
    followUps: fields.followUpNotes,
    needsReview: hasUnresolved,
  };

  return {
    ...display,
    summaryLine: buildSummaryLine(display),
    validationStatus: "validated",
  };
}

export const NOTE_TYPE_OPTIONS = Object.values(NOTE_TYPE_LABELS);

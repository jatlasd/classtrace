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

function studentMentionsFromNames(names: string[]): StudentMentionRef[] {
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
  validation?: CaptureValidation
): ResolvedCaptureDisplay {
  const base = draftToDisplay(draft);

  if (validation?.status !== "validated") {
    return {
      ...base,
      validationStatus: "pending",
    };
  }

  const { fields } = validation;
  const studentMentions = studentMentionsFromNames(fields.students);
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

import { isFieldApplicable } from "./field-applicability";
import type { MatchResult, NoteDraft } from "./types";

export type DraftDisplay = {
  students: string[];
  tags: string[];
  evidenceType: string;
  topic?: string;
  behavior?: string[];
  performance?: string;
  followUps: string[];
  needsReview: boolean;
  summaryLine: string;
};

export const NOTE_TYPE_LABELS: Record<string, string> = {
  academic_check_in: "Academic check-in",
  behavior_observation: "Behavior observation",
  communication_log: "Communication log",
  accommodation_log: "Accommodation log",
  assessment_observation: "Assessment observation",
  progress_monitoring: "Progress monitoring",
  general_observation: "General observation",
  unclear: "Unclear",
};

function formatValue(value: string): string {
  if (value === "unclear" || value === "not_applicable") return "";
  return value.replace(/_/g, " ");
}

function isVisibleMatch(match: MatchResult): boolean {
  return (
    match.value !== "unclear" &&
    match.value !== "not_applicable" &&
    formatValue(match.value).length > 0
  );
}

function evidenceTypeLabel(draft: NoteDraft): string {
  return (
    NOTE_TYPE_LABELS[draft.noteType.value] ??
    formatValue(draft.noteType.value)
  );
}

function resolveTopic(draft: NoteDraft): string | undefined {
  const applicable = new Set(draft.applicableFields);

  if (isFieldApplicable("skill", applicable) && isVisibleMatch(draft.skill)) {
    return formatValue(draft.skill.value);
  }

  if (isVisibleMatch(draft.domain)) {
    return formatValue(draft.domain.value);
  }

  return undefined;
}

function buildSummaryLine(display: Omit<DraftDisplay, "summaryLine">): string {
  const parts: string[] = [];

  if (display.students.length > 0) {
    parts.push(display.students.join(", "));
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

export function draftToDisplay(draft: NoteDraft): DraftDisplay {
  const applicable = new Set(draft.applicableFields);
  const students = draft.parsed.mentions;
  const tags = draft.parsed.tags;
  const evidenceType = evidenceTypeLabel(draft);
  const topic = resolveTopic(draft);

  let performance: string | undefined;
  if (
    isFieldApplicable("performance", applicable) &&
    isVisibleMatch(draft.performance)
  ) {
    performance = formatValue(draft.performance.value);
  }

  let behavior: string[] | undefined;
  if (isFieldApplicable("behavior", applicable)) {
    const values = draft.behavior
      .filter(isVisibleMatch)
      .map((match) => formatValue(match.value));
    if (values.length > 0) {
      behavior = values;
    }
  }

  const display: Omit<DraftDisplay, "summaryLine"> = {
    students,
    tags,
    evidenceType,
    topic,
    behavior,
    performance,
    followUps: draft.suggestedFollowUps,
    needsReview: draft.needsTeacherValidation,
  };

  return {
    ...display,
    summaryLine: buildSummaryLine(display),
  };
}

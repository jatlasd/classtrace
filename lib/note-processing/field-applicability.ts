import type { MatchResult, NoteFieldKey } from "./types";

const UNIVERSAL_FIELDS: NoteFieldKey[] = ["context", "evidenceQuality"];

const NOTE_TYPE_FIELDS: Record<string, NoteFieldKey[]> = {
  academic_check_in: ["skill", "performance", "supports"],
  behavior_observation: ["behavior", "severity", "supports"],
  communication_log: ["communication", "severity"],
  accommodation_log: ["supports"],
  assessment_observation: ["skill", "performance"],
  progress_monitoring: ["skill", "performance"],
};

const DOMAIN_FIELDS: Record<string, NoteFieldKey[]> = {
  math: ["skill", "performance", "supports"],
  reading: ["skill", "performance", "supports"],
  writing: ["skill", "performance", "supports"],
  behavior_social_emotional: ["behavior", "severity", "supports"],
  executive_functioning: ["behavior", "supports"],
  communication: ["communication", "severity"],
};

const ACADEMIC_NOTE_TYPES = new Set([
  "academic_check_in",
  "assessment_observation",
  "progress_monitoring",
]);

const ACADEMIC_DOMAINS = new Set(["math", "reading", "writing"]);

function usesDomainRefinement(noteTypeValue: string): boolean {
  return noteTypeValue === "general_observation" || noteTypeValue === "unclear";
}

export function getApplicableFields(
  noteType: MatchResult,
  domain: MatchResult
): Set<NoteFieldKey> {
  const applicable = new Set<NoteFieldKey>(UNIVERSAL_FIELDS);
  const noteTypeValue = noteType.value;
  const domainValue = domain.value;

  if (
    noteTypeValue !== "unclear" &&
    NOTE_TYPE_FIELDS[noteTypeValue] &&
    !usesDomainRefinement(noteTypeValue)
  ) {
    for (const field of NOTE_TYPE_FIELDS[noteTypeValue]) {
      applicable.add(field);
    }
  } else if (usesDomainRefinement(noteTypeValue)) {
    if (domainValue !== "unclear" && DOMAIN_FIELDS[domainValue]) {
      for (const field of DOMAIN_FIELDS[domainValue]) {
        applicable.add(field);
      }
    }
  }

  const isBehaviorContext =
    noteTypeValue === "behavior_observation" ||
    domainValue === "behavior_social_emotional";
  const isCommunicationContext =
    noteTypeValue === "communication_log" || domainValue === "communication";
  const isAcademicContext =
    ACADEMIC_NOTE_TYPES.has(noteTypeValue) ||
    ACADEMIC_DOMAINS.has(domainValue);

  if (isBehaviorContext) {
    applicable.delete("skill");
    applicable.delete("performance");
    applicable.delete("communication");
  }

  if (isCommunicationContext) {
    applicable.delete("skill");
    applicable.delete("performance");
    applicable.delete("behavior");
  }

  if (isAcademicContext && !isBehaviorContext) {
    applicable.delete("behavior");
  }

  return applicable;
}

export function isFieldApplicable(
  key: NoteFieldKey,
  applicable: Set<NoteFieldKey>
): boolean {
  return applicable.has(key);
}

export function applicableFieldsArray(
  applicable: Set<NoteFieldKey>
): NoteFieldKey[] {
  return [...applicable];
}

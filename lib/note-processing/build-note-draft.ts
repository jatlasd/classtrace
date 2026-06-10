import { matchBehavior } from "./match-behavior";
import { matchCommunication } from "./match-communication";
import { matchContext } from "./match-context";
import { matchDomain } from "./match-domain";
import { matchEvidenceQuality } from "./match-evidence-quality";
import { matchNoteType } from "./match-note-type";
import { matchPerformance } from "./match-performance";
import { matchSeverity } from "./match-severity";
import { matchSkill } from "./match-skill";
import { matchSupports } from "./match-supports";
import { notApplicableResult } from "./matcher-utils";
import { parseRawNote } from "./parse-raw-note";
import {
  applicableFieldsArray,
  getApplicableFields,
  isFieldApplicable,
} from "./field-applicability";
import type { MatchResult, NoteDraft, NoteFieldKey } from "./types";

function buildSuggestedFollowUps(
  applicable: Set<NoteFieldKey>,
  performance: MatchResult,
  skill: MatchResult,
  context: MatchResult,
  evidenceQuality: MatchResult
): string[] {
  const followUps: string[] = [];

  if (evidenceQuality.value === "low_detail") {
    followUps.push(
      "Add a specific observation (what happened, when, outcome)"
    );
  }

  if (
    isFieldApplicable("performance", applicable) &&
    performance.value === "struggling"
  ) {
    followUps.push("Consider reteach or small-group support");
  }

  if (
    isFieldApplicable("skill", applicable) &&
    isFieldApplicable("context", applicable) &&
    skill.value !== "unclear" &&
    context.value === "unclear"
  ) {
    followUps.push(
      "Note where this occurred (warmup, quiz, homework, etc.)"
    );
  }

  return followUps;
}

function computeNeedsTeacherValidation(
  applicable: Set<NoteFieldKey>,
  fields: { key: NoteFieldKey; match: MatchResult }[]
): boolean {
  return fields
    .filter(({ key }) => isFieldApplicable(key, applicable))
    .filter(({ match }) => match.value !== "not_applicable")
    .some(
      (field) =>
        field.match.value === "unclear" || field.match.confidence !== "high"
    );
}

export function buildNoteDraft(rawNote: string): NoteDraft {
  const parsed = parseRawNote(rawNote);

  const noteType = matchNoteType(parsed);
  const domain = matchDomain(parsed);
  const applicable = getApplicableFields(noteType, domain);

  const skill = isFieldApplicable("skill", applicable)
    ? matchSkill(parsed)
    : notApplicableResult();
  const performance = isFieldApplicable("performance", applicable)
    ? matchPerformance(parsed)
    : notApplicableResult();
  const context = matchContext(parsed);
  const supports = isFieldApplicable("supports", applicable)
    ? matchSupports(parsed)
    : [];
  const behavior = isFieldApplicable("behavior", applicable)
    ? matchBehavior(parsed)
    : [];
  const communication = isFieldApplicable("communication", applicable)
    ? matchCommunication(parsed)
    : notApplicableResult();
  const severity = isFieldApplicable("severity", applicable)
    ? matchSeverity(parsed)
    : notApplicableResult();
  const evidenceQuality = matchEvidenceQuality(parsed);

  const suggestedFollowUps = buildSuggestedFollowUps(
    applicable,
    performance,
    skill,
    context,
    evidenceQuality
  );

  const needsTeacherValidation =
    noteType.value === "unclear" ||
    noteType.confidence !== "high" ||
    domain.value === "unclear" ||
    domain.confidence !== "high" ||
    computeNeedsTeacherValidation(applicable, [
      { key: "skill", match: skill },
      { key: "performance", match: performance },
      { key: "context", match: context },
      { key: "communication", match: communication },
      { key: "severity", match: severity },
      { key: "evidenceQuality", match: evidenceQuality },
    ]);

  return {
    parsed,
    applicableFields: applicableFieldsArray(applicable),
    noteType,
    domain,
    skill,
    performance,
    context,
    supports,
    behavior,
    communication,
    severity,
    evidenceQuality,
    suggestedFollowUps,
    needsTeacherValidation,
  };
}

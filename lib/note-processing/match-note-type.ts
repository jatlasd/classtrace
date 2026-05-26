import { matchFromDictionary } from "./matcher-utils";
import type { MatchResult, ParsedNote } from "./types";

const NOTE_TYPE_PHRASES: Record<string, string[]> = {
  academic_check_in: [
    "checkin",
    "check-in",
    "struggling",
    "review",
    "practice",
    "skill",
    "still working on",
  ],
  behavior_observation: [
    "refused",
    "arguing",
    "disruptive",
    "off task",
    "shut down",
    "left seat",
    "redirected",
  ],
  communication_log: [
    "called home",
    "emailed mom",
    "emailed dad",
    "parent",
    "guardian",
    "spoke with",
  ],
  accommodation_log: [
    "read aloud",
    "extended time",
    "break",
    "chunked",
    "modified",
    "prompt",
    "small group",
  ],
  assessment_observation: [
    "quiz",
    "test",
    "assessment",
    "exit ticket",
    "score",
    "got",
  ],
  progress_monitoring: [
    "progress",
    "data",
    "goal",
    "trial",
    "accuracy",
    "correct",
    "baseline",
  ],
  general_observation: [],
};

export function matchNoteType(parsed: ParsedNote): MatchResult {
  return matchFromDictionary(parsed, NOTE_TYPE_PHRASES, "general_observation");
}

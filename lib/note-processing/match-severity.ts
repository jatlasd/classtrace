import { matchFromDictionary } from "./matcher-utils";
import type { MatchResult, ParsedNote } from "./types";

const SEVERITY_PHRASES: Record<string, string[]> = {
  minor: ["reminder", "brief", "minor"],
  moderate: ["repeated", "multiple reminders", "continued", "ongoing"],
  significant: [
    "major",
    "significant",
    "unable to complete",
    "escalated",
  ],
  urgent: ["urgent", "immediate", "crisis"],
  safety_related: [
    "unsafe",
    "threat",
    "hit",
    "ran",
    "eloped",
    "self harm",
    "harm",
  ],
  follow_up_needed: ["follow up", "need to check", "monitor", "revisit"],
};

export function matchSeverity(parsed: ParsedNote): MatchResult {
  return matchFromDictionary(parsed, SEVERITY_PHRASES);
}

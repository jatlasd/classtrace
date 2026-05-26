import { matchFromDictionary } from "./matcher-utils";
import type { MatchResult, ParsedNote } from "./types";

const PERFORMANCE_PHRASES: Record<string, string[]> = {
  struggling: [
    "struggling",
    "difficulty",
    "hard time",
    "confused",
    "not getting it",
    "still stuck",
  ],
  improving: [
    "improving",
    "getting better",
    "more accurate",
    "needed less help",
  ],
  independent: [
    "independent",
    "independently",
    "on their own",
    "without help",
    "no prompting",
  ],
  needed_support: [
    "needed help",
    "with support",
    "with prompting",
    "after modeling",
    "teacher support",
  ],
  incorrect: ["incorrect", "wrong", "missed", "error", "mistake"],
  correct: ["correct", "accurate", "got it right", "mastered"],
  incomplete: [
    "incomplete",
    "did not finish",
    "unfinished",
    "only completed",
  ],
  refused_or_avoided: [
    "refused",
    "wouldn't start",
    "avoided",
    "put head down",
    "shut down",
  ],
};

export function matchPerformance(parsed: ParsedNote): MatchResult {
  return matchFromDictionary(parsed, PERFORMANCE_PHRASES);
}

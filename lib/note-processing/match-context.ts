import { matchFromDictionary } from "./matcher-utils";
import type { MatchResult, ParsedNote } from "./types";

const CONTEXT_PHRASES: Record<string, string[]> = {
  review: ["review", "spiral review", "mixed review"],
  warmup: ["warmup", "warm-up", "do now", "bell ringer"],
  independent_practice: [
    "independent practice",
    "on their own",
    "practice problems",
  ],
  small_group: ["small group", "teacher table", "guided group"],
  whole_group: ["whole group", "lesson", "direct instruction"],
  quiz: ["quiz"],
  test: ["test"],
  exit_ticket: ["exit ticket"],
  classwork: ["classwork", "assignment"],
  homework: ["homework"],
};

export function matchContext(parsed: ParsedNote): MatchResult {
  return matchFromDictionary(parsed, CONTEXT_PHRASES);
}

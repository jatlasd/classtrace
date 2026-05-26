import { matchFromDictionary } from "./matcher-utils";
import type { MatchResult, ParsedNote } from "./types";

const SKILL_PHRASES: Record<string, string[]> = {
  multiplying_fractions: [
    "multiplying fractions",
    "multiply fractions",
    "fraction multiplication",
  ],
  dividing_fractions: [
    "dividing fractions",
    "divide fractions",
    "keep change flip",
  ],
  adding_fractions: [
    "adding fractions",
    "add fractions",
    "common denominator",
  ],
  subtracting_fractions: [
    "subtracting fractions",
    "subtract fractions",
    "common denominator",
  ],
  simplifying_fractions: [
    "simplify fractions",
    "simplifying",
    "reduce fractions",
  ],
  order_of_operations: ["order of operations", "pemdas", "gemdas"],
  combining_like_terms: ["combining like terms", "like terms"],
  coordinate_plane: [
    "coordinate plane",
    "ordered pairs",
    "x-axis",
    "y-axis",
    "graphing",
  ],
  integer_operations: [
    "integers",
    "positive and negative",
    "integer operations",
  ],
  equations: [
    "equations",
    "solve for x",
    "one step equation",
    "two step equation",
  ],
  word_problems: [
    "word problems",
    "real world problem",
    "application problem",
  ],
};

export function matchSkill(parsed: ParsedNote): MatchResult {
  return matchFromDictionary(parsed, SKILL_PHRASES);
}

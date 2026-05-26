import { matchFromDictionary } from "./matcher-utils";
import type { MatchResult, ParsedNote } from "./types";

const DOMAIN_PHRASES: Record<string, string[]> = {
  math: [
    "math",
    "fractions",
    "multiplication",
    "division",
    "equations",
    "integers",
    "coordinate",
    "order of operations",
  ],
  reading: [
    "reading",
    "fluency",
    "comprehension",
    "decode",
    "main idea",
    "text evidence",
  ],
  writing: [
    "writing",
    "sentence",
    "paragraph",
    "essay",
    "grammar",
    "claim",
    "evidence",
  ],
  behavior_social_emotional: [
    "behavior",
    "frustrated",
    "anxious",
    "upset",
    "peer",
    "conflict",
    "shutdown",
  ],
  executive_functioning: [
    "attention",
    "organization",
    "directions",
    "task initiation",
    "materials",
    "forgot",
  ],
  communication: ["parent", "guardian", "email", "called", "meeting"],
};

export function matchDomain(parsed: ParsedNote): MatchResult {
  return matchFromDictionary(parsed, DOMAIN_PHRASES);
}

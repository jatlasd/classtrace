import { matchFromDictionary } from "./matcher-utils";
import type { MatchResult, ParsedNote } from "./types";

const EVIDENCE_QUALITY_PHRASES: Record<string, string[]> = {
  low_detail: ["struggling", "bad day", "did well", "difficulty"],
  specific_observation: ["because", "when", "after", "during"],
  contains_support: [
    "prompt",
    "modeled",
    "support",
    "reteach",
    "break",
    "read aloud",
  ],
  contains_outcome: [
    "finished",
    "completed",
    "returned",
    "improved",
    "correct",
  ],
  contains_data_point: ["%", "/", "out of", "correct", "score", "accuracy"],
  needs_more_detail: [],
};

export function matchEvidenceQuality(parsed: ParsedNote): MatchResult {
  return matchFromDictionary(
    parsed,
    EVIDENCE_QUALITY_PHRASES,
    "needs_more_detail"
  );
}

import { matchAllFromDictionary } from "./matcher-utils";
import type { MatchResult, ParsedNote } from "./types";

const SUPPORTS_PHRASES: Record<string, string[]> = {
  prompting: ["prompt", "prompted", "with prompting"],
  modeling: ["modeled", "modeling", "I showed", "worked example"],
  reteach: ["reteach", "retaught", "reviewed again"],
  visual_support: [
    "visual",
    "number line",
    "anchor chart",
    "diagram",
    "drawing",
  ],
  read_aloud: ["read aloud", "read directions"],
  chunking: ["chunked", "one at a time", "broke down"],
  break_given: ["break", "hallway break", "reset"],
  small_group_support: ["small group", "teacher table"],
  one_on_one_support: ["1:1", "one on one", "sat with"],
  extended_time: ["extended time", "extra time"],
  calculator: ["calculator"],
};

export function matchSupports(parsed: ParsedNote): MatchResult[] {
  return matchAllFromDictionary(parsed, SUPPORTS_PHRASES);
}

import { matchAllFromDictionary } from "./matcher-utils";
import type { MatchResult, ParsedNote } from "./types";

const BEHAVIOR_PHRASES: Record<string, string[]> = {
  off_task: ["off task", "not focused", "distracted", "talking"],
  refusal: ["refused", "would not", "wouldn't", "declined to work"],
  shutdown: ["shut down", "head down", "wouldn't respond", "silent"],
  peer_conflict: [
    "arguing",
    "peer conflict",
    "with another student",
    "conflict",
  ],
  disruption: ["disruptive", "calling out", "interrupting", "loud"],
  redirection: ["redirected", "reminder", "needed reminders"],
  work_initiation: [
    "wouldn't start",
    "started after",
    "task initiation",
    "getting started",
  ],
  attention: ["attention", "focus", "distracted"],
  participation: ["participated", "shared", "answered", "engaged"],
  avoidance: ["avoided", "asked to leave", "bathroom", "nurse"],
};

export function matchBehavior(parsed: ParsedNote): MatchResult[] {
  return matchAllFromDictionary(parsed, BEHAVIOR_PHRASES);
}

import { matchFromDictionary } from "./matcher-utils";
import type { MatchResult, ParsedNote } from "./types";

const COMMUNICATION_PHRASES: Record<string, string[]> = {
  parent_contact: [
    "called home",
    "emailed parent",
    "emailed mom",
    "emailed dad",
    "spoke with parent",
    "guardian",
  ],
  admin_contact: ["admin", "principal", "office", "sent to office"],
  case_manager_contact: [
    "case manager",
    "sped",
    "special ed",
    "IEP team",
  ],
  team_discussion: [
    "team discussed",
    "talked with team",
    "grade level team",
  ],
  meeting_note: ["meeting", "conference", "IEP meeting", "parent meeting"],
};

export function matchCommunication(parsed: ParsedNote): MatchResult {
  return matchFromDictionary(parsed, COMMUNICATION_PHRASES);
}

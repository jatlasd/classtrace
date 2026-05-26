export type {
  Confidence,
  MatchResult,
  NoteDraft,
  NoteFieldKey,
  ParsedNote,
} from "./types";

export {
  applicableFieldsArray,
  getApplicableFields,
  isFieldApplicable,
} from "./field-applicability";
export { notApplicableResult } from "./matcher-utils";

export { buildNoteDraft } from "./build-note-draft";
export { parseRawNote } from "./parse-raw-note";

export { matchNoteType } from "./match-note-type";
export { matchDomain } from "./match-domain";
export { matchSkill } from "./match-skill";
export { matchPerformance } from "./match-performance";
export { matchContext } from "./match-context";
export { matchSupports } from "./match-supports";
export { matchBehavior } from "./match-behavior";
export { matchCommunication } from "./match-communication";
export { matchSeverity } from "./match-severity";
export { matchEvidenceQuality } from "./match-evidence-quality";

export type Confidence = "low" | "medium" | "high";

export type NoteFieldKey =
  | "skill"
  | "performance"
  | "supports"
  | "behavior"
  | "communication"
  | "severity"
  | "context"
  | "evidenceQuality";

export type MatchResult = {
  value: string;
  confidence: Confidence;
  sources: string[];
};

export type ParsedNote = {
  rawNote: string;
  mentions: string[];
  tags: string[];
  cleanText: string;
};

export type NoteDraft = {
  parsed: ParsedNote;
  applicableFields: NoteFieldKey[];
  noteType: MatchResult;
  domain: MatchResult;
  skill: MatchResult;
  performance: MatchResult;
  context: MatchResult;
  supports: MatchResult[];
  behavior: MatchResult[];
  communication: MatchResult;
  severity: MatchResult;
  evidenceQuality: MatchResult;
  suggestedFollowUps: string[];
  needsTeacherValidation: boolean;
};

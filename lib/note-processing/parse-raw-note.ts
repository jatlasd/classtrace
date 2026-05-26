import type { ParsedNote } from "./types";

export function parseRawNote(rawNote: string): ParsedNote {
  const mentionMatches = rawNote.match(/@[a-zA-Z0-9_-]+/g) || [];
  const tagMatches = rawNote.match(/#[a-zA-Z0-9_-]+/g) || [];

  const mentions = mentionMatches.map((m) => m.slice(1));
  const tags = tagMatches.map((t) => t.slice(1));

  const cleanText = rawNote
    .replace(/@[a-zA-Z0-9_-]+/g, "")
    .replace(/#[a-zA-Z0-9_-]+/g, "")
    .replace(/\s+/g, " ")
    .trim();

  return {
    rawNote,
    mentions,
    tags,
    cleanText,
  };
}

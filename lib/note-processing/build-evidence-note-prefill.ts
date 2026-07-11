const SAFE_TAG_BRIDGES = new Set([
  "about",
  "during",
  "for",
  "in",
  "on",
  "through",
  "using",
  "with",
]);

function previousWord(value: string, offset: number): string {
  const prefix = value.slice(0, offset).trimEnd();
  return prefix.match(/([a-zA-Z]+)$/)?.[1]?.toLowerCase() ?? "";
}

/**
 * Builds the teacher-visible Evidence-note starting point without changing the
 * separately parsed tag metadata. Hashtags are de-marked only after a narrow
 * bridge word; otherwise the teacher's authored hashtag stays visible.
 */
export function buildEvidenceNotePrefill(rawNote: string): string {
  const withoutMentions = rawNote.replace(/@[a-zA-Z0-9_-]+/g, "");
  const withSafeTagWording = withoutMentions.replace(
    /#([a-zA-Z0-9_-]+)/g,
    (match, _tag: string, offset: number) =>
      SAFE_TAG_BRIDGES.has(previousWord(withoutMentions, offset))
        ? match.slice(1)
        : match
  );

  return withSafeTagWording
    .replace(/^\s*[,;:]\s*/, "")
    .replace(/\s+([,.;!?])/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

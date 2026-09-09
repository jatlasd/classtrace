import type { Confidence, MatchResult, ParsedNote } from "./types";

export type PhraseHit = {
  phrase: string;
  fromTag: boolean;
  tag?: string;
};

export type KeyScore = {
  key: string;
  score: number;
  hits: PhraseHit[];
  sources: string[];
  longestPhrase: number;
  hasTagHit: boolean;
};

const TAG_BONUS = 10;
const WORD_CHARACTER_PATTERN = /[a-z0-9]/;

export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/-/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function buildSearchableText(parsed: ParsedNote): string {
  const parts = [parsed.cleanText, ...parsed.tags].filter(Boolean);
  return normalizeText(parts.join(" "));
}

function containsBoundedPhrase(text: string, phrase: string): boolean {
  let startIndex = text.indexOf(phrase);

  while (startIndex !== -1) {
    const before = text[startIndex - 1];
    const after = text[startIndex + phrase.length];
    const startsAtBoundary = before === undefined || !WORD_CHARACTER_PATTERN.test(before);
    const endsAtBoundary = after === undefined || !WORD_CHARACTER_PATTERN.test(after);

    if (startsAtBoundary && endsAtBoundary) {
      return true;
    }

    startIndex = text.indexOf(phrase, startIndex + 1);
  }

  return false;
}

function isNegatedOccurrence(text: string, startIndex: number): boolean {
  const nearbyPrefix = text.slice(Math.max(0, startIndex - 72), startIndex);
  const clausePrefix =
    nearbyPrefix.split(/[.!?;:]|\b(?:but|however|although|yet)\b/).at(-1) ?? "";
  const normalizedPrefix = clausePrefix
    .replace(/[^a-z0-9'’\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!normalizedPrefix || /\bnot only\s*$/.test(normalizedPrefix)) {
    return false;
  }

  return (
    /\b(?:not|never|hardly)(?:\s+[a-z0-9'’]+){0,2}\s*$/.test(
      normalizedPrefix
    ) ||
    /\bno longer(?:\s+[a-z0-9'’]+){0,3}\s*$/.test(normalizedPrefix) ||
    /\bwithout(?:\s+[a-z0-9'’]+){0,2}\s*$/.test(normalizedPrefix) ||
    /\b(?:isn't|isn’t|wasn't|wasn’t|weren't|weren’t|aren't|aren’t|cannot|can't|can’t|won't|won’t)(?:\s+[a-z0-9'’]+){0,2}\s*$/.test(
      normalizedPrefix
    )
  );
}

function containsUnnegatedBoundedPhrase(text: string, phrase: string): boolean {
  let startIndex = text.indexOf(phrase);

  while (startIndex !== -1) {
    const before = text[startIndex - 1];
    const after = text[startIndex + phrase.length];
    const startsAtBoundary =
      before === undefined || !WORD_CHARACTER_PATTERN.test(before);
    const endsAtBoundary =
      after === undefined || !WORD_CHARACTER_PATTERN.test(after);

    if (
      startsAtBoundary &&
      endsAtBoundary &&
      !isNegatedOccurrence(text, startIndex)
    ) {
      return true;
    }

    startIndex = text.indexOf(phrase, startIndex + 1);
  }

  return false;
}

export function findPhraseHits(
  searchable: string,
  tags: string[],
  phrases: string[]
): PhraseHit[] {
  const normalizedTags = tags.map((t) => normalizeText(t));
  const hits: PhraseHit[] = [];

  for (const phrase of phrases) {
    const normalizedPhrase = normalizeText(phrase);
    if (!normalizedPhrase) continue;

    const matchingTag = normalizedTags.find(
      (tag) => tag === normalizedPhrase || containsBoundedPhrase(tag, normalizedPhrase)
    );

    if (
      matchingTag === undefined &&
      !containsUnnegatedBoundedPhrase(searchable, normalizedPhrase)
    ) {
      continue;
    }

    hits.push({
      phrase,
      fromTag: matchingTag !== undefined,
      tag: matchingTag,
    });
  }

  return hits;
}

export function scoreDictionary(
  searchable: string,
  tags: string[],
  dictionary: Record<string, string[]>
): KeyScore[] {
  return Object.entries(dictionary).map(([key, phrases]) => {
    const hits = findPhraseHits(searchable, tags, phrases);
    let score = 0;
    const sources: string[] = [];
    let longestPhrase = 0;
    let hasTagHit = false;

    for (const hit of hits) {
      const phraseScore = normalizeText(hit.phrase).length;
      score += phraseScore;
      longestPhrase = Math.max(longestPhrase, phraseScore);

      if (hit.fromTag && hit.tag) {
        score += TAG_BONUS;
        hasTagHit = true;
        const source = `tag:${hit.tag}`;
        if (!sources.includes(source)) sources.push(source);
      } else {
        const source = `phrase:${hit.phrase}`;
        if (!sources.includes(source)) sources.push(source);
      }
    }

    return { key, score, hits, sources, longestPhrase, hasTagHit };
  });
}

function deriveConfidence(
  score: KeyScore,
  isFallback: boolean
): Confidence {
  if (isFallback) return "low";
  if (score.score === 0) return "low";
  if (
    score.hasTagHit ||
    score.hits.length >= 2 ||
    score.longestPhrase >= 15
  ) {
    return "high";
  }
  if (score.hits.length === 1) return "medium";
  return "low";
}

function compareScores(a: KeyScore, b: KeyScore): number {
  if (b.score !== a.score) return b.score - a.score;
  if (b.longestPhrase !== a.longestPhrase) {
    return b.longestPhrase - a.longestPhrase;
  }
  return a.key.localeCompare(b.key);
}

export function unclearResult(): MatchResult {
  return { value: "unclear", confidence: "low", sources: [] };
}

export function notApplicableResult(): MatchResult {
  return { value: "not_applicable", confidence: "high", sources: [] };
}

export function scoreToMatchResult(score: KeyScore, isFallback = false): MatchResult {
  return {
    value: score.key,
    confidence: deriveConfidence(score, isFallback),
    sources: score.sources,
  };
}

export function bestMatch(
  scores: KeyScore[],
  fallbackKey?: string
): MatchResult {
  const withHits = scores.filter((s) => s.score > 0);
  if (withHits.length > 0) {
    const winner = [...withHits].sort(compareScores)[0];
    return scoreToMatchResult(winner, false);
  }

  if (fallbackKey) {
    const fallback = scores.find((s) => s.key === fallbackKey);
    if (fallback) return scoreToMatchResult(fallback, true);
  }

  return unclearResult();
}

export function allMatches(scores: KeyScore[], minScore = 1): MatchResult[] {
  return scores
    .filter((s) => s.score >= minScore)
    .sort(compareScores)
    .map((s) => scoreToMatchResult(s, false));
}

export function matchFromDictionary(
  parsed: ParsedNote,
  dictionary: Record<string, string[]>,
  fallbackKey?: string
): MatchResult {
  const searchable = buildSearchableText(parsed);
  const scores = scoreDictionary(searchable, parsed.tags, dictionary);
  return bestMatch(scores, fallbackKey);
}

export function matchAllFromDictionary(
  parsed: ParsedNote,
  dictionary: Record<string, string[]>
): MatchResult[] {
  const searchable = buildSearchableText(parsed);
  const scores = scoreDictionary(searchable, parsed.tags, dictionary);
  return allMatches(scores);
}

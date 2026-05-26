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

    if (!searchable.includes(normalizedPhrase)) continue;

    const matchingTag = normalizedTags.find(
      (tag) => tag === normalizedPhrase || tag.includes(normalizedPhrase)
    );

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

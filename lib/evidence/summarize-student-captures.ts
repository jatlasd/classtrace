import { formatTagLabel } from "@/lib/format-tag";
import type { Capture } from "@/lib/mock-data";

export type StudentCaptureSnapshot = {
  totalCaptures: number;
  mostRecentTimestamp: string | null;
  followUpCount: number;
  topTag: { tag: string; count: number } | null;
};

export type StudentCapturePatterns = {
  tags: { tag: string; count: number }[];
  evidenceTypes: { evidenceType: string; count: number }[];
  followUpCount: number;
};

export type StudentCaptureSynthesis = {
  snapshot: StudentCaptureSnapshot;
  insights: string[];
  patterns: StudentCapturePatterns;
};

function countTagsByCapture(captures: Capture[]): Map<string, number> {
  const counts = new Map<string, number>();

  for (const capture of captures) {
    const uniqueTags = new Set(capture.tags);
    for (const tag of uniqueTags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }

  return counts;
}

function countEvidenceTypes(captures: Capture[]): Map<string, number> {
  const counts = new Map<string, number>();

  for (const capture of captures) {
    counts.set(
      capture.evidenceType,
      (counts.get(capture.evidenceType) ?? 0) + 1
    );
  }

  return counts;
}

function topTagEntries(
  counts: Map<string, number>,
  limit: number
): { tag: string; count: number }[] {
  return [...counts.entries()]
    .sort((a, b) => {
      if (b[1] !== a[1]) {
        return b[1] - a[1];
      }
      return a[0].localeCompare(b[0]);
    })
    .slice(0, limit)
    .map(([tag, count]) => ({ tag, count }));
}

function topEvidenceTypeEntries(
  counts: Map<string, number>
): { evidenceType: string; count: number }[] {
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([evidenceType, count]) => ({ evidenceType, count }));
}

function buildInsights(
  captures: Capture[],
  tagCounts: Map<string, number>,
  evidenceTypeCounts: Map<string, number>,
  followUpCount: number
): string[] {
  const insights: string[] = [];

  if (captures.length === 0) {
    return insights;
  }

  insights.push(`Most recent evidence: ${captures[0].timestamp}`);

  const topTag = topTagEntries(tagCounts, 1)[0];
  if (topTag) {
    insights.push(
      `${formatTagLabel(topTag.tag)} appears in ${topTag.count} ${
        topTag.count === 1 ? "capture" : "captures"
      }`
    );
  }

  const topEvidenceType = topEvidenceTypeEntries(evidenceTypeCounts)[0];
  if (topEvidenceType) {
    insights.push(
      `${topEvidenceType.evidenceType} is the most common evidence type`
    );
  }

  if (followUpCount > 0) {
    insights.push(
      `${followUpCount} ${followUpCount === 1 ? "capture includes" : "captures include"} follow-up`
    );
  }

  return insights.slice(0, 4);
}

export function summarizeStudentCaptures(
  captures: Capture[]
): StudentCaptureSynthesis {
  const followUpCount = captures.filter((capture) => capture.followUp === true)
    .length;
  const tagCounts = countTagsByCapture(captures);
  const evidenceTypeCounts = countEvidenceTypes(captures);
  const topTags = topTagEntries(tagCounts, 6);
  const topTag = topTags[0] ?? null;

  const snapshot: StudentCaptureSnapshot = {
    totalCaptures: captures.length,
    mostRecentTimestamp: captures[0]?.timestamp ?? null,
    followUpCount,
    topTag,
  };

  const patterns: StudentCapturePatterns = {
    tags: topTags,
    evidenceTypes: topEvidenceTypeEntries(evidenceTypeCounts),
    followUpCount,
  };

  const insights = buildInsights(
    captures,
    tagCounts,
    evidenceTypeCounts,
    followUpCount
  );

  return { snapshot, insights, patterns };
}

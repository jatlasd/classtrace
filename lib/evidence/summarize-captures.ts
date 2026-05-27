import { draftToDisplay } from "@/lib/note-processing/draft-to-display";
import type { NoteDraft } from "@/lib/note-processing/types";

export type CaptureInsight = {
  text: string;
};

export type CaptureSummary = {
  insights: CaptureInsight[];
  topStudents: { name: string; count: number }[];
  topTags: { tag: string; count: number }[];
};

function countBy<T>(
  items: T[],
  keyFn: (item: T) => string | undefined
): Map<string, number> {
  const counts = new Map<string, number>();
  for (const item of items) {
    const key = keyFn(item);
    if (!key) continue;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return counts;
}

function topEntries(
  counts: Map<string, number>,
  limit: number
): { name: string; count: number }[] {
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([name, count]) => ({ name, count }));
}

export function summarizeCaptures(drafts: NoteDraft[]): CaptureSummary {
  if (drafts.length === 0) {
    return { insights: [], topStudents: [], topTags: [] };
  }

  const displays = drafts.map(draftToDisplay);
  const insights: CaptureInsight[] = [];

  const studentCounts = countBy(displays, (d) =>
    d.students.length === 1 ? d.students[0] : undefined
  );
  const topStudent = topEntries(studentCounts, 1)[0];
  if (topStudent && topStudent.count >= 2) {
    insights.push({
      text: `${topStudent.name} appears in ${topStudent.count} of your last ${drafts.length} captures`,
    });
  }

  const tagCounts = countBy(
    displays.flatMap((d) => d.tags.map((tag) => ({ tag }))),
    (item) => item.tag
  );
  const topTag = topEntries(tagCounts, 1)[0];
  if (topTag && topTag.count >= 2) {
    insights.push({
      text: `${topTag.name} showed up ${topTag.count} times recently`,
    });
  }

  const needsReviewCount = displays.filter((d) => d.needsReview).length;
  if (needsReviewCount > 0) {
    insights.push({
      text: `${needsReviewCount} ${needsReviewCount === 1 ? "note may" : "notes may"} need your review`,
    });
  }

  const reteachCount = displays.filter((d) =>
    d.followUps.some((f) => f.toLowerCase().includes("reteach"))
  ).length;
  if (reteachCount >= 2) {
    insights.push({
      text: "Several captures suggest reteach or small-group support",
    });
  }

  return {
    insights: insights.slice(0, 4),
    topStudents: topEntries(studentCounts, 3),
    topTags: topEntries(tagCounts, 4).map(({ name, count }) => ({
      tag: name,
      count,
    })),
  };
}

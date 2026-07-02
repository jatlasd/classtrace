"use client";

import {
  resolveCaptureDisplay,
  type CaptureValidation,
} from "@/lib/evidence/capture-validation";
import type { EvidenceFeedRecord } from "@/lib/evidence/evidence-feed-records";
import { summarizeCaptures } from "@/lib/evidence/summarize-captures";
import { formatTagLabel } from "@/lib/format-tag";
import type { NoteDraft } from "@/lib/note-processing/types";
import type { CaptureRosterStudent } from "@/lib/students/resolve-capture-students";
import {
  ArrowUpRight,
  BookOpen,
  CheckCircle2,
  MessageCircle,
  Users,
} from "lucide-react";

type FeedSummaryItem = {
  draft: NoteDraft;
  validation?: CaptureValidation;
};

type ClassTraceNoticedPanelProps = {
  items: FeedSummaryItem[];
  rosterStudents: CaptureRosterStudent[];
  evidenceRecords: EvidenceFeedRecord[];
};

type CountSummary = {
  name: string;
  count: number;
};

function getFollowUps(
  items: FeedSummaryItem[],
  rosterStudents: CaptureRosterStudent[],
  evidenceRecords: EvidenceFeedRecord[]
): { title: string; detail: string }[] {
  const draftFollowUps = items.flatMap((item) => {
    const display = resolveCaptureDisplay(
      item.draft,
      item.validation,
      rosterStudents
    );
    const student = display.studentMentions[0];
    const studentLabel =
      student?.status === "resolved" ? student.student.displayName : "student";

    return display.followUps.map((followUp) => ({
      title: followUp,
      detail: `Check in with ${studentLabel}`,
    }));
  });

  const savedFollowUps = evidenceRecords
    .filter((record) => record.followUpNotes)
    .map((record) => ({
      title: record.followUpNotes ?? "",
      detail: `Check in with ${record.studentDisplayName}`,
    }));

  return [...draftFollowUps, ...savedFollowUps].slice(0, 3);
}

function incrementCount(counts: Map<string, number>, key: string): void {
  const trimmed = key.trim();

  if (!trimmed) {
    return;
  }

  counts.set(trimmed, (counts.get(trimmed) ?? 0) + 1);
}

function sortCounts(counts: Map<string, number>): CountSummary[] {
  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

function recordCountLabel(count: number, hasSavedRecords: boolean): string {
  if (hasSavedRecords) {
    return count === 1
      ? "1 recent evidence record"
      : `${count} recent evidence records`;
  }

  return count === 1 ? "1 recent capture" : `${count} recent captures`;
}

function noteCountLabel(count: number, hasSavedRecords: boolean): string {
  if (hasSavedRecords) {
    return count === 1
      ? "1 recent evidence record"
      : `${count} recent evidence records`;
  }

  return count === 1 ? "1 recent note" : `${count} recent notes`;
}

export function ClassTraceNoticedPanel({
  items,
  rosterStudents,
  evidenceRecords,
}: ClassTraceNoticedPanelProps) {
  const summary = summarizeCaptures(items, rosterStudents);
  const followUps = getFollowUps(items, rosterStudents, evidenceRecords);
  const needsReviewCount = items.filter(
    (item) =>
      resolveCaptureDisplay(item.draft, item.validation, rosterStudents)
        .needsReview
  ).length;
  const studentCounts = new Map<string, number>();
  const tagCounts = new Map<string, number>();

  for (const student of summary.topStudents) {
    studentCounts.set(student.name, student.count);
  }
  for (const tag of summary.topTags) {
    tagCounts.set(tag.tag, tag.count);
  }
  for (const record of evidenceRecords) {
    incrementCount(studentCounts, record.studentDisplayName);
    for (const tag of record.tags) {
      incrementCount(tagCounts, tag);
    }
  }

  const topStudents = sortCounts(studentCounts);
  const topTags = sortCounts(tagCounts);
  const savedRecordCount = evidenceRecords.length;
  const primaryPatterns = [
    topStudents[0]
      ? {
          title: `${topStudents[0].name} has the most recent evidence`,
          detail: recordCountLabel(topStudents[0].count, savedRecordCount > 0),
          icon: Users,
        }
      : {
          title: "Capture patterns will build here",
          detail: "Add a few student-specific notes",
          icon: Users,
        },
    topTags[0]
      ? {
          title: `${formatTagLabel(topTags[0].name)} appears most often`,
          detail: noteCountLabel(topTags[0].count, savedRecordCount > 0),
          icon: BookOpen,
        }
      : {
          title: "Tags help organize evidence",
          detail: "Use #tag in capture notes",
          icon: BookOpen,
        },
    {
      title:
        needsReviewCount > 0
          ? `${needsReviewCount} ${
              needsReviewCount === 1 ? "capture needs" : "captures need"
            } review`
          : "Review queue is clear",
      detail: "Teacher validation stays required",
      icon: CheckCircle2,
    },
  ];

  return (
    <aside className="w-full shrink-0 lg:w-[340px] xl:w-[360px]">
      <div className="rounded-card border border-border bg-card p-5 shadow-paper lg:sticky lg:top-24">
        <section>
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-foreground">Evidence cues</h2>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Based on saved evidence and current drafts.
            </p>
          </div>

          <ul className="space-y-5">
            {primaryPatterns.map((pattern, index) => (
              <li key={pattern.title} className="flex gap-4">
                <div
                  className={`flex size-12 shrink-0 items-center justify-center rounded-lg border ${
                    index === 0
                      ? "border-link/20 bg-secondary text-link"
                      : index === 1
                        ? "border-validated/50 bg-validated/25 text-validated-foreground"
                        : "border-primary/20 bg-primary/10 text-primary"
                  }`}
                >
                  <pattern.icon className="size-5" strokeWidth={1.75} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">
                    {pattern.title}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {pattern.detail}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-8 border-t border-border pt-6">
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-foreground">Follow-ups</h2>
          </div>

          {followUps.length > 0 ? (
            <ul className="space-y-5">
              {followUps.map((followUp, index) => (
                <li key={`${followUp.title}-${index}`} className="flex gap-4">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-foreground">
                    {index + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium leading-snug text-foreground">
                      {followUp.title}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {followUp.detail}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex gap-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary text-link">
                <MessageCircle className="size-4" strokeWidth={1.75} />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  No follow-ups yet
                </p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  Follow-up suggestions appear only when deterministic capture
                  rules find one worth reviewing.
                </p>
              </div>
            </div>
          )}

          <p className="mt-6 text-xs leading-relaxed text-muted-foreground">
            These are review prompts, not saved tasks.
          </p>
        </section>

        {summary.insights.length > 0 && (
          <section className="mt-6 rounded-lg border border-border bg-muted/25 p-3">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Recent cues
            </p>
            <ul className="space-y-2">
              {summary.insights.slice(0, 2).map((insight) => (
                <li
                  key={insight.text}
                  className="flex gap-2 text-xs leading-relaxed text-muted-foreground"
                >
                  <ArrowUpRight className="mt-0.5 size-3.5 shrink-0 text-primary" />
                  <span>{insight.text}</span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </aside>
  );
}

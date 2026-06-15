"use client";

import {
  resolveCaptureDisplay,
  type CaptureValidation,
} from "@/lib/evidence/capture-validation";
import { summarizeCaptures } from "@/lib/evidence/summarize-captures";
import { formatTagLabel } from "@/lib/format-tag";
import type { NoteDraft } from "@/lib/note-processing/types";
import {
  ArrowUpRight,
  BookOpen,
  CheckCircle2,
  MessageCircle,
  TrendingUp,
  Users,
} from "lucide-react";

type FeedSummaryItem = {
  draft: NoteDraft;
  validation?: CaptureValidation;
};

type ClassTraceNoticedPanelProps = {
  items: FeedSummaryItem[];
};

function getFollowUps(items: FeedSummaryItem[]): { title: string; detail: string }[] {
  return items
    .flatMap((item) => {
      const display = resolveCaptureDisplay(item.draft, item.validation);
      const student = display.studentMentions[0];
      const studentLabel =
        student?.status === "resolved" ? student.student.displayName : "student";

      return display.followUps.map((followUp) => ({
        title: followUp,
        detail: `Check in with ${studentLabel}`,
      }));
    })
    .slice(0, 3);
}

export function ClassTraceNoticedPanel({ items }: ClassTraceNoticedPanelProps) {
  const summary = summarizeCaptures(items);
  const followUps = getFollowUps(items);
  const needsReviewCount = items.filter(
    (item) => resolveCaptureDisplay(item.draft, item.validation).needsReview
  ).length;
  const primaryPatterns = [
    summary.topStudents[0]
      ? {
          title: `${summary.topStudents[0].name} is appearing often`,
          detail: `${summary.topStudents[0].count} recent captures`,
          icon: Users,
        }
      : {
          title: "Capture patterns will build here",
          detail: "Add a few student-specific notes",
          icon: Users,
        },
    summary.topTags[0]
      ? {
          title: `${formatTagLabel(summary.topTags[0].tag)} is active`,
          detail: `${summary.topTags[0].count} recent notes`,
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
      icon: needsReviewCount > 0 ? TrendingUp : CheckCircle2,
    },
  ];

  return (
    <aside className="w-full shrink-0 lg:w-[340px] xl:w-[360px]">
      <div className="rounded-card border border-border bg-card p-5 shadow-paper lg:sticky lg:top-24">
        <section>
          <div className="mb-5 flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-foreground">Patterns</h2>
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
          <div className="mb-5 flex items-center justify-between gap-3">
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
                  Follow-up suggestions appear when deterministic capture rules
                  find one worth reviewing.
                </p>
              </div>
            </div>
          )}

          <p className="mt-6 text-xs leading-relaxed text-muted-foreground">
            Follow-ups are suggestions only until a later unit adds saved
            follow-up tasks.
          </p>
        </section>

        {summary.insights.length > 0 && (
          <section className="mt-6 rounded-lg border border-border bg-muted/25 p-3">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Recent notes
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

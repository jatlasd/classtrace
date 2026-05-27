"use client";

import { summarizeCaptures } from "@/lib/evidence/summarize-captures";
import type { CaptureValidation } from "@/lib/evidence/capture-validation";
import { popularTags } from "@/lib/mock-data";
import type { NoteDraft } from "@/lib/note-processing/types";
import { Sparkles } from "lucide-react";

type FeedSummaryItem = {
  draft: NoteDraft;
  validation?: CaptureValidation;
};

type ClassTraceNoticedPanelProps = {
  items: FeedSummaryItem[];
};

export function ClassTraceNoticedPanel({ items }: ClassTraceNoticedPanelProps) {
  const summary = summarizeCaptures(items);
  const hasInsights = summary.insights.length > 0;
  const fallbackTags = popularTags.slice(0, 4);

  return (
    <aside className="w-full shrink-0 border-t border-border bg-card/50 lg:w-[300px] lg:border-t-0 lg:border-l xl:w-[320px]">
      <div className="p-5 lg:sticky lg:top-0 lg:max-h-screen lg:overflow-y-auto">
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Sparkles className="size-3.5" strokeWidth={2} />
            </div>
            <h2 className="text-sm font-semibold text-foreground">
              ClassTrace noticed…
            </h2>
          </div>

          {hasInsights ? (
            <ul className="space-y-2">
              {summary.insights.map((insight) => (
                <li
                  key={insight.text}
                  className="text-xs leading-relaxed text-muted-foreground"
                >
                  <span className="mr-1.5 text-primary">•</span>
                  {insight.text}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs leading-relaxed text-muted-foreground">
              Patterns from your recent captures will appear here as you post
              notes.
            </p>
          )}

          {(summary.topStudents.length > 0 || summary.topTags.length > 0) && (
            <div className="mt-4 space-y-3 border-t border-border/60 pt-3">
              {summary.topStudents.length > 0 && (
                <div>
                  <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Frequent students
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {summary.topStudents.map(({ name, count }) => (
                      <span
                        key={name}
                        className="rounded-full border border-border bg-muted/40 px-2 py-0.5 text-[11px] font-medium text-foreground"
                      >
                        {name} · {count}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {summary.topTags.length > 0 && (
                <div>
                  <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Active tags
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {summary.topTags.map(({ tag, count }) => (
                      <span
                        key={tag}
                        className="rounded-full border border-border bg-muted/40 px-2 py-0.5 text-[11px] font-medium text-link"
                      >
                        {tag} · {count}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {!hasInsights && items.length === 0 && (
            <div className="mt-4 border-t border-border/60 pt-3">
              <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Common tags
              </p>
              <div className="flex flex-wrap gap-1.5">
                {fallbackTags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-border bg-muted/40 px-2 py-0.5 text-[11px] font-medium text-link"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

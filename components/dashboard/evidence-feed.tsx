"use client";

import { useMemo, useState } from "react";
import { ClassTraceNoticedPanel } from "@/components/dashboard/classtrace-noticed-panel";
import { EvidenceCaptureCard } from "@/components/dashboard/evidence-capture-card";
import {
  EvidenceFeedHeader,
  RecentCapturesLabel,
} from "@/components/dashboard/evidence-feed-header";
import { QuickCaptureCard } from "@/components/dashboard/quick-capture-card";
import type {
  CaptureValidation,
  InterpretationFields,
} from "@/lib/evidence/capture-validation";
import { resolveCaptureDisplay } from "@/lib/evidence/capture-validation";
import { buildNoteDraft } from "@/lib/note-processing";
import type { NoteDraft } from "@/lib/note-processing/types";
import { recentCaptures } from "@/lib/mock-data";

type FeedItem = {
  id: string;
  draft: NoteDraft;
  timestamp: string;
  validation?: CaptureValidation;
};

type InboxFilter = "all" | "needs_review" | "validated";

const filterOptions: { value: InboxFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "needs_review", label: "Needs review" },
  { value: "validated", label: "Validated" },
];

function isValidated(item: FeedItem): boolean {
  return item.validation?.status === "validated";
}

function needsReview(item: FeedItem): boolean {
  if (item.validation?.status === "validated") return false;
  return resolveCaptureDisplay(item.draft, item.validation).needsReview;
}

function seedFeedItems(): FeedItem[] {
  return recentCaptures.map((capture) => ({
    id: capture.id,
    draft: buildNoteDraft(capture.note),
    timestamp: capture.timestamp,
  }));
}

function InboxFilterControl({
  filter,
  onFilterChange,
}: {
  filter: InboxFilter;
  onFilterChange: (filter: InboxFilter) => void;
}) {
  return (
    <div
      role="group"
      aria-label="Filter evidence inbox"
      className="flex flex-wrap gap-1.5 px-1 pb-2"
    >
      {filterOptions.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={filter === option.value ? "true" : "false"}
          onClick={() => onFilterChange(option.value)}
          className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
            filter === option.value
              ? "border border-border bg-muted text-foreground"
              : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function FilterEmptyMessage({ filter }: { filter: InboxFilter }) {
  if (filter === "needs_review") {
    return (
      <p className="px-1 py-8 text-center text-sm text-muted-foreground">
        Nothing needs review right now.
      </p>
    );
  }

  if (filter === "validated") {
    return (
      <p className="px-1 py-8 text-center text-sm text-muted-foreground">
        No validated evidence yet. Review a capture to turn it into a record.
      </p>
    );
  }

  return null;
}

export function EvidenceFeed() {
  const [items, setItems] = useState<FeedItem[]>(() => seedFeedItems());
  const [filter, setFilter] = useState<InboxFilter>("all");

  const summaryItems = useMemo(
    () =>
      items.map((item) => ({
        draft: item.draft,
        validation: item.validation,
      })),
    [items]
  );

  const visibleItems = useMemo(() => {
    if (filter === "all") return items;
    if (filter === "validated") return items.filter(isValidated);
    return items.filter(needsReview);
  }, [items, filter]);

  function handleDraft(draft: NoteDraft) {
    setItems((current) => [
      {
        id: crypto.randomUUID(),
        draft,
        timestamp: "Just now",
      },
      ...current,
    ]);
  }

  function handleValidate(id: string, fields: InterpretationFields) {
    setItems((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              validation: {
                status: "validated",
                fields,
                validatedAt: Date.now(),
              },
            }
          : item
      )
    );
  }

  return (
    <div className="flex flex-col lg:flex-row">
      <div className="mx-auto w-full max-w-[640px] flex-1 px-4 py-6 sm:px-6 lg:py-8">
        <EvidenceFeedHeader />
        <div className="space-y-4">
          <QuickCaptureCard onDraft={handleDraft} />
          <RecentCapturesLabel />
          <InboxFilterControl filter={filter} onFilterChange={setFilter} />
          {items.length === 0 ? (
            <p className="px-1 py-8 text-center text-sm text-muted-foreground">
              Your evidence inbox is empty — capture what you noticed in class.
            </p>
          ) : visibleItems.length === 0 ? (
            <FilterEmptyMessage filter={filter} />
          ) : (
            visibleItems.map((item) => (
              <EvidenceCaptureCard
                key={item.id}
                draft={item.draft}
                timestamp={item.timestamp}
                validation={item.validation}
                onValidate={(fields) => handleValidate(item.id, fields)}
              />
            ))
          )}
        </div>
      </div>

      <ClassTraceNoticedPanel items={summaryItems} />
    </div>
  );
}

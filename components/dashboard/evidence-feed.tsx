"use client";

import { useEffect, useMemo, useState } from "react";
import { ClassTraceNoticedPanel } from "@/components/dashboard/classtrace-noticed-panel";
import { EvidenceCaptureCard } from "@/components/dashboard/evidence-capture-card";
import {
  EvidenceFeedHeader,
  RecentCapturesLabel,
} from "@/components/dashboard/evidence-feed-header";
import { QuickCaptureCard } from "@/components/dashboard/quick-capture-card";
import { Button } from "@/components/ui/button";
import type {
  CaptureValidation,
  InterpretationFields,
} from "@/lib/evidence/capture-validation";
import {
  resolveCaptureDisplay,
} from "@/lib/evidence/capture-validation";
import { buildNoteDraft } from "@/lib/note-processing";
import type { NoteDraft } from "@/lib/note-processing/types";
import {
  mentionDisplayLabel,
} from "@/lib/students";
import {
  clearStoredCaptures,
  formatStoredCaptureTimestamp,
  hasStoredCaptureState,
  readStoredCaptures,
  writeStoredCaptures,
  type StoredCapture,
} from "@/lib/poc-storage";

type FeedItem = {
  id: string;
  draft: NoteDraft;
  timestamp: string;
  timestampMs: number;
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
  return [];
}

function storedCaptureToFeedItem(capture: StoredCapture): FeedItem {
  return {
    id: capture.id,
    draft: buildNoteDraft(capture.rawNote),
    timestamp: formatStoredCaptureTimestamp(capture),
    timestampMs: capture.timestampMs,
    validation: capture.validation,
  };
}

function feedItemsToStoredCaptures(items: FeedItem[]): StoredCapture[] {
  return items.map((item) => ({
    id: item.id,
    rawNote: item.draft.parsed.rawNote,
    timestampMs: item.timestampMs,
    validation: item.validation,
  }));
}

function persistFeedItems(items: FeedItem[]): void {
  writeStoredCaptures(feedItemsToStoredCaptures(items));
}

function loadInitialFeedItems(): FeedItem[] {
  if (hasStoredCaptureState()) {
    return readStoredCaptures()
      .slice()
      .sort((a, b) => b.timestampMs - a.timestampMs)
      .map(storedCaptureToFeedItem);
  }

  return seedFeedItems();
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

function PocModeCard({
  onExport,
  onClear,
}: {
  onExport: () => void;
  onClear: () => void;
}) {
  return (
    <section className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <h2 className="text-sm font-semibold text-foreground">Usable POC mode</h2>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
        Captures and your roster save in this browser only. Refreshing the page
        keeps them here, but they are not shared across devices or browsers.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button type="button" variant="outline" size="sm" onClick={onExport}>
          Export JSON
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={onClear}>
          Clear captures
        </Button>
      </div>
    </section>
  );
}

export function EvidenceFeed() {
  const [items, setItems] = useState<FeedItem[]>(() => seedFeedItems());
  const [filter, setFilter] = useState<InboxFilter>("all");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate captures from localStorage after mount
    setItems(loadInitialFeedItems());
    setHydrated(true);
  }, []);

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
    const newItem: FeedItem = {
      id: crypto.randomUUID(),
      draft,
      timestamp: "Just now",
      timestampMs: Date.now(),
    };

    setItems((current) => {
      const next = hasStoredCaptureState() ? [newItem, ...current] : [newItem];
      persistFeedItems(next);
      return next;
    });
  }

  function handleValidate(id: string, fields: InterpretationFields) {
    setItems((current) => {
      const next = current.map((item) =>
        item.id === id
          ? {
              ...item,
              validation: {
                status: "validated" as const,
                fields,
                validatedAt: Date.now(),
              },
            }
          : item
      );
      persistFeedItems(next);
      return next;
    });
  }

  function handleEditCapture(id: string, rawNote: string) {
    const trimmed = rawNote.trim();
    if (!trimmed) {
      return;
    }

    setItems((current) => {
      const next = current.map((item) => {
        if (item.id !== id) {
          return item;
        }

        const rawChanged = trimmed !== item.draft.parsed.rawNote;

        return {
          ...item,
          draft: buildNoteDraft(trimmed),
          validation: rawChanged ? undefined : item.validation,
        };
      });
      persistFeedItems(next);
      return next;
    });
  }

  function handleDeleteCapture(id: string) {
    setItems((current) => {
      const next = current.filter((item) => item.id !== id);
      persistFeedItems(next);
      return next;
    });
  }

  function handleExport() {
    const payload = items.map((item) => {
      const display = resolveCaptureDisplay(item.draft, item.validation);
      return {
        id: item.id,
        capturedAt: new Date(item.timestampMs).toISOString(),
        rawNote: item.draft.parsed.rawNote,
        students: display.studentMentions.map(mentionDisplayLabel),
        tags: display.tags,
        evidenceType: display.evidenceType,
        topic: display.topic,
        performance: display.performance,
        behavior: display.behavior,
        followUps: display.followUps,
        validationStatus: display.validationStatus,
      };
    });

    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "classtrace-poc-export.json";
    link.click();
    URL.revokeObjectURL(url);
  }

  function handleClear() {
    clearStoredCaptures();
    setItems(seedFeedItems());
    setFilter("all");
  }

  return (
    <div className="flex flex-col lg:flex-row">
      <div className="mx-auto w-full max-w-[640px] flex-1 px-4 py-6 sm:px-6 lg:py-8">
        <EvidenceFeedHeader />
        <div className="space-y-4">
          <QuickCaptureCard onDraft={handleDraft} />
          <PocModeCard onExport={handleExport} onClear={handleClear} />
          <RecentCapturesLabel />
          <InboxFilterControl filter={filter} onFilterChange={setFilter} />
          {!hydrated ? (
            <p className="px-1 py-8 text-center text-sm text-muted-foreground">
              Loading your evidence inbox…
            </p>
          ) : items.length === 0 ? (
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
                onEdit={(rawNote) => handleEditCapture(item.id, rawNote)}
                onDelete={() => handleDeleteCapture(item.id)}
              />
            ))
          )}
        </div>
      </div>

      <ClassTraceNoticedPanel items={summaryItems} />
    </div>
  );
}

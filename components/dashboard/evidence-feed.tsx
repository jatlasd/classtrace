"use client";

import Link from "next/link";
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
import { normalizeTag } from "@/lib/format-tag";
import { buildNoteDraft } from "@/lib/note-processing";
import type { NoteDraft } from "@/lib/note-processing/types";
import {
  mentionDisplayLabel,
  getAllStudents,
  type Student,
} from "@/lib/students";
import { routes } from "@/lib/routes";
import { ArrowDownUp, X } from "lucide-react";
import {
  hasExistingPocData,
  loadWideDemoClassroom,
} from "@/lib/demo-data/load-wide-demo-classroom";
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

function stripMentionPrefix(mention: string): string {
  return mention.replace(/^@/, "");
}

function buildCaptureSearchHaystacks(item: FeedItem) {
  const display = resolveCaptureDisplay(item.draft, item.validation);
  const rawNote = item.draft.parsed.rawNote;

  const studentParts: string[] = [];
  for (const ref of display.studentMentions) {
    studentParts.push(mentionDisplayLabel(ref));
    if (ref.status === "resolved") {
      studentParts.push(
        ref.student.displayName,
        ref.student.handle,
        ref.student.id
      );
    } else {
      studentParts.push(ref.mention);
    }
  }
  for (const mention of item.draft.parsed.mentions) {
    studentParts.push(stripMentionPrefix(mention));
  }
  const studentHaystack = studentParts.join(" ").toLowerCase();

  const tagSet = new Set<string>();
  for (const tag of display.tags) {
    tagSet.add(normalizeTag(tag).toLowerCase());
  }
  for (const tag of item.draft.parsed.tags) {
    tagSet.add(normalizeTag(tag).toLowerCase());
  }
  const tagHaystack = [...tagSet].join(" ");

  const generalParts: string[] = [
    rawNote,
    studentHaystack,
    tagHaystack,
    display.evidenceType,
    display.summaryLine,
  ];
  if (display.topic) {
    generalParts.push(display.topic);
  }
  if (display.performance) {
    generalParts.push(display.performance);
  }
  if (display.behavior) {
    generalParts.push(...display.behavior);
  }
  if (display.followUps.length > 0) {
    generalParts.push(...display.followUps);
  }

  const generalHaystack = generalParts.join(" ").toLowerCase();

  return { rawNote, studentHaystack, tagHaystack, generalHaystack };
}

function captureMatchesSearch(item: FeedItem, rawQuery: string): boolean {
  const trimmed = rawQuery.trim();
  if (!trimmed) {
    return true;
  }

  const { rawNote, studentHaystack, tagHaystack, generalHaystack } =
    buildCaptureSearchHaystacks(item);

  if (trimmed.startsWith("@")) {
    const needle = stripMentionPrefix(trimmed).toLowerCase();
    if (!needle) {
      return true;
    }
    if (studentHaystack.includes(needle)) {
      return true;
    }
    return generalHaystack.includes(needle);
  }

  if (trimmed.startsWith("#")) {
    const needle = normalizeTag(trimmed).toLowerCase();
    if (!needle) {
      return true;
    }
    if (tagHaystack.includes(needle)) {
      return true;
    }
    if (rawNote.toLowerCase().includes(`#${needle}`)) {
      return true;
    }
    return generalHaystack.includes(needle);
  }

  const needle = trimmed.toLowerCase();
  return generalHaystack.includes(needle);
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

function EvidenceSearchControl({
  query,
  onQueryChange,
}: {
  query: string;
  onQueryChange: (query: string) => void;
}) {
  return (
    <div className="relative min-w-0 flex-1 sm:max-w-[280px]">
      <input
        type="search"
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        placeholder="Search"
        aria-label="Search evidence inbox"
        className="h-10 w-full rounded-lg border border-border bg-card py-2 pl-3 pr-9 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20"
      />
      {query ? (
        <button
          type="button"
          onClick={() => onQueryChange("")}
          aria-label="Clear search"
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted-foreground hover:text-foreground"
        >
          <X className="size-4" />
        </button>
      ) : null}
    </div>
  );
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
      className="flex flex-wrap gap-1.5"
    >
      {filterOptions.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onFilterChange(option.value)}
          className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
            filter === option.value
              ? "border-border bg-muted text-foreground"
              : "border-transparent text-muted-foreground hover:bg-muted/60 hover:text-foreground"
          }`}
        >
          {option.label}
          {filter === option.value ? <span className="sr-only"> selected</span> : null}
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
  onLoadDemo,
  onExport,
  onClear,
}: {
  onLoadDemo: () => void;
  onExport: () => void;
  onClear: () => void;
}) {
  return (
    <section className="rounded-card border border-border bg-card/70 p-4">
      <h2 className="text-sm font-semibold text-foreground">Browser-local utilities</h2>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
        Captures and your roster save in this browser only. Refreshing the page
        keeps them here, but they are not shared across devices or browsers.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button type="button" variant="outline" size="sm" onClick={onLoadDemo}>
          Load demo classroom
        </Button>
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

function RosterRequiredState() {
  return (
    <section className="rounded-card border border-border bg-card p-6 shadow-paper">
      <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        Roster needed
      </p>
      <h2 className="font-display text-lg font-semibold text-foreground">
        Add one student before capturing evidence.
      </h2>
      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
        Captures need one student from your roster. Start with a name and handle,
        then come back here for your first student-specific capture.
      </p>
      <Button asChild className="mt-4 h-9 rounded-lg px-5 text-sm font-semibold">
        <Link href={routes.roster}>Set up roster</Link>
      </Button>
    </section>
  );
}

export function EvidenceFeed() {
  const [items, setItems] = useState<FeedItem[]>(() => seedFeedItems());
  const [rosterStudents, setRosterStudents] = useState<Student[]>(() =>
    getAllStudents()
  );
  const [filter, setFilter] = useState<InboxFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [hydrated, setHydrated] = useState(false);
  const rosterSetupNeeded = hydrated && rosterStudents.length === 0;

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate captures from localStorage after mount
    setItems(loadInitialFeedItems());
    setRosterStudents(getAllStudents());
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
    let result = items;
    if (filter === "validated") {
      result = items.filter(isValidated);
    } else if (filter === "needs_review") {
      result = items.filter(needsReview);
    }

    if (searchQuery.trim()) {
      result = result.filter((item) => captureMatchesSearch(item, searchQuery));
    }

    return result;
  }, [items, filter, searchQuery]);

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
    setSearchQuery("");
  }

  function handleLoadDemo() {
    if (
      hasExistingPocData() &&
      !window.confirm(
        "Load demo classroom? This will replace the roster and captures stored in this browser."
      )
    ) {
      return;
    }

    const captures = loadWideDemoClassroom();
    setItems(captures.map(storedCaptureToFeedItem));
    setRosterStudents(getAllStudents());
    setFilter("all");
    setSearchQuery("");
  }

  return (
    <div className="mx-auto flex w-full max-w-[1560px] flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row lg:items-start lg:px-8">
      <div className="min-w-0 flex-1 space-y-6">
        <EvidenceFeedHeader />
        {rosterSetupNeeded ? (
          <RosterRequiredState />
        ) : (
          <QuickCaptureCard onDraft={handleDraft} />
        )}

        <section className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-5">
              <RecentCapturesLabel />
              <button
                type="button"
                className="inline-flex items-center gap-2 text-sm font-medium text-foreground"
              >
                <ArrowDownUp className="size-4 text-muted-foreground" />
                Newest
              </button>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <EvidenceSearchControl
                query={searchQuery}
                onQueryChange={setSearchQuery}
              />
            </div>
          </div>

          <InboxFilterControl filter={filter} onFilterChange={setFilter} />

          <div className="overflow-hidden rounded-card border border-border bg-card shadow-paper">
            {!hydrated ? (
              <p className="px-6 py-10 text-center text-sm text-muted-foreground">
                Loading your evidence feed...
              </p>
            ) : items.length === 0 && rosterSetupNeeded ? (
              <p className="px-6 py-10 text-center text-sm text-muted-foreground">
                Your evidence feed will start here after roster setup.
              </p>
            ) : items.length === 0 ? (
              <p className="px-6 py-10 text-center text-sm text-muted-foreground">
                Your evidence feed is empty. Capture one student-specific note
                when something worth remembering happens.
              </p>
            ) : visibleItems.length === 0 ? (
              searchQuery.trim() ? (
                <p className="px-6 py-10 text-center text-sm text-muted-foreground">
                  No captures match your search.
                </p>
              ) : (
                <FilterEmptyMessage filter={filter} />
              )
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
        </section>

        <PocModeCard
          onLoadDemo={handleLoadDemo}
          onExport={handleExport}
          onClear={handleClear}
        />
      </div>

      <ClassTraceNoticedPanel items={summaryItems} />
    </div>
  );
}

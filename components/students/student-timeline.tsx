"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { Circle, Clock3, Search, X } from "lucide-react";
import { EvidenceRecordContent } from "@/components/evidence/evidence-record-content";
import { Button } from "@/components/ui/button";
import {
  filterStudentTimelineRecords,
  normalizeStudentTimelineDateRange,
  normalizeStudentTimelineSort,
  type StudentTimelineDateRange,
  type StudentTimelineSort,
} from "@/lib/evidence/student-timeline-filtering";
import { routes } from "@/lib/routes";
import { INPUT_LIMITS } from "@/lib/validation/input-limits";

export type StudentTimelineEvidenceRecord = {
  id: string;
  evidenceDate: string;
  evidenceNote?: string;
  summary: string;
  evidenceType: string;
  topic?: string;
  performance?: string;
  behavior?: string;
  tags: string[];
  followUpNeeded: boolean;
  followUpNotes?: string;
  validatedAt: string;
  createdAt: string;
};

type StudentTimelineProps = {
  studentDisplayName: string;
  records: StudentTimelineEvidenceRecord[];
  initialQuery: string;
  initialDateRange: StudentTimelineDateRange;
  initialSort: StudentTimelineSort;
};

type TimelineUrlState = {
  query: string;
  dateRange: StudentTimelineDateRange;
  sort: StudentTimelineSort;
};

const DATE_RANGE_OPTIONS: Array<{
  value: StudentTimelineDateRange;
  label: string;
}> = [
  { value: "all", label: "All time" },
  { value: "7", label: "Last 7 days" },
  { value: "14", label: "Last 14 days" },
  { value: "30", label: "Last 30 days" },
];

function subscribeToHydration(): () => void {
  return () => {};
}

function formatTimelineDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Recently";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function urlStateFromLocation(): TimelineUrlState {
  const params = new URLSearchParams(window.location.search);
  return {
    query: (params.get("q") ?? "").slice(0, INPUT_LIMITS.evidenceSearchQuery),
    dateRange: normalizeStudentTimelineDateRange(params.get("range") ?? ""),
    sort: normalizeStudentTimelineSort(params.get("sort") ?? ""),
  };
}

function updateTimelineUrl(
  state: TimelineUrlState,
  mode: "push" | "replace"
): void {
  const params = new URLSearchParams(window.location.search);

  if (state.query.trim()) {
    params.set("q", state.query);
  } else {
    params.delete("q");
  }

  if (state.dateRange === "all") {
    params.delete("range");
  } else {
    params.set("range", state.dateRange);
  }

  if (state.sort === "newest") {
    params.delete("sort");
  } else {
    params.set("sort", state.sort);
  }

  const href =
    window.location.pathname + (params.size ? `?${params.toString()}` : "");
  window.history[mode === "push" ? "pushState" : "replaceState"](
    null,
    "",
    href
  );
}

function StudentTimelineEvidenceItem({
  record,
}: {
  record: StudentTimelineEvidenceRecord;
}) {
  return (
    <li className="relative pl-8">
      <span
        className="absolute left-0 top-5 flex size-4 items-center justify-center rounded-full border border-validated/60 bg-validated"
        aria-hidden="true"
      >
        <span className="size-1.5 rounded-full bg-validated-foreground" />
      </span>
      <article className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">
              {formatTimelineDate(record.evidenceDate)}
            </p>
            <EvidenceRecordContent
              record={record}
              showStructuredSummary={false}
            />
          </div>
          <span className="inline-flex w-fit items-center gap-2 rounded-lg border border-validated/60 bg-validated/35 px-2.5 py-1 text-xs font-semibold text-validated-foreground">
            <Circle className="size-2 fill-current" />
            Validated
          </span>
        </div>
      </article>
    </li>
  );
}

function StudentTimelineEmptyState({
  studentDisplayName,
}: {
  studentDisplayName: string;
}) {
  return (
    <div className="border border-border bg-card/60 p-5 text-sm leading-relaxed text-muted-foreground">
      <div className="mb-3 flex size-10 items-center justify-center rounded-md border border-border bg-muted/50 text-primary">
        <Clock3 className="size-5" strokeWidth={1.75} />
      </div>
      <p className="font-medium text-foreground">No validated evidence yet.</p>
      <p className="mt-1">
        Capture a student-specific note for {studentDisplayName}, review it, and
        this timeline will start here.
      </p>
      <Button asChild variant="outline" size="sm" className="mt-4">
        <Link href={routes.feed}>Open evidence feed</Link>
      </Button>
    </div>
  );
}

function TimelineFilterEmptyState({ onClear }: { onClear: () => void }) {
  return (
    <div className="border border-border bg-card/60 p-5 text-sm leading-relaxed text-muted-foreground">
      <p className="font-medium text-foreground">
        No evidence matches these filters.
      </p>
      <p className="mt-1">
        Try another search, expand the date range, or clear the filters.
      </p>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="mt-4 min-h-11 sm:min-h-9"
        onClick={onClear}
      >
        Clear filters
      </Button>
    </div>
  );
}

export function StudentTimeline({
  studentDisplayName,
  records,
  initialQuery,
  initialDateRange,
  initialSort,
}: StudentTimelineProps) {
  const [query, setQuery] = useState(initialQuery);
  const [dateRange, setDateRange] = useState(initialDateRange);
  const [sort, setSort] = useState(initialSort);
  const browserCalendarReady = useSyncExternalStore(
    subscribeToHydration,
    () => true,
    () => false
  );

  useEffect(() => {
    function syncStateFromUrl(): void {
      const state = urlStateFromLocation();
      setQuery(state.query);
      setDateRange(state.dateRange);
      setSort(state.sort);
    }

    window.addEventListener("popstate", syncStateFromUrl);
    return () => window.removeEventListener("popstate", syncStateFromUrl);
  }, []);

  const visibleRecords = useMemo(
    () =>
      filterStudentTimelineRecords(records, {
        query,
        dateRange: browserCalendarReady ? dateRange : "all",
        sort,
      }),
    [browserCalendarReady, dateRange, query, records, sort]
  );

  const hasActiveFilters = query.trim().length > 0 || dateRange !== "all";

  function handleQueryChange(nextQuery: string): void {
    const boundedQuery = nextQuery.slice(0, INPUT_LIMITS.evidenceSearchQuery);
    setQuery(boundedQuery);
    updateTimelineUrl(
      { query: boundedQuery, dateRange, sort },
      "replace"
    );
  }

  function handleDateRangeChange(nextDateRange: StudentTimelineDateRange): void {
    setDateRange(nextDateRange);
    updateTimelineUrl({ query, dateRange: nextDateRange, sort }, "push");
  }

  function handleSortChange(nextSort: StudentTimelineSort): void {
    setSort(nextSort);
    updateTimelineUrl({ query, dateRange, sort: nextSort }, "push");
  }

  function handleClearFilters(): void {
    setQuery("");
    setDateRange("all");
    updateTimelineUrl({ query: "", dateRange: "all", sort }, "push");
  }

  return (
    <section aria-labelledby="student-evidence-heading">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2
            id="student-evidence-heading"
            className="font-display text-xl font-semibold text-foreground"
          >
            Evidence
          </h2>
          <p
            className="mt-1 text-sm leading-relaxed text-muted-foreground"
            aria-live="polite"
          >
            {visibleRecords.length} of {records.length} validated{" "}
            {records.length === 1 ? "record" : "records"}
          </p>
        </div>
      </div>

      {records.length > 0 ? (
        <div className="mb-5 rounded-lg border border-border bg-card/60 p-4">
          <div className="grid gap-4 lg:grid-cols-[minmax(240px,1fr)_auto_auto] lg:items-end">
            <div className="min-w-0">
              <label
                htmlFor="student-timeline-search"
                className="text-sm font-medium text-foreground"
              >
                Search evidence
              </label>
              <div className="relative mt-1.5">
                <input
                  id="student-timeline-search"
                  type="search"
                  autoComplete="off"
                  maxLength={INPUT_LIMITS.evidenceSearchQuery}
                  value={query}
                  onChange={(event) => handleQueryChange(event.target.value)}
                  placeholder="Try #reteach or a phrase…"
                  className="min-h-11 w-full rounded-lg border border-border bg-background/50 py-2 pl-9 pr-9 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:bg-card focus-visible:ring-3 focus-visible:ring-ring/20 sm:min-h-10"
                />
                <Search
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                />
                {query ? (
                  <button
                    type="button"
                    onClick={() => handleQueryChange("")}
                    aria-label="Clear evidence search"
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/30"
                  >
                    <X aria-hidden="true" className="size-4" />
                  </button>
                ) : null}
              </div>
              <p className="mt-1.5 text-xs text-muted-foreground">
                Start with # to match one exact tag.
              </p>
            </div>

            <fieldset>
              <legend className="text-sm font-medium text-foreground">
                Date range
              </legend>
              <div
                className="mt-1.5 flex flex-wrap gap-1.5"
                aria-label="Filter timeline by date range"
              >
                {DATE_RANGE_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={dateRange === option.value}
                    onClick={() => handleDateRangeChange(option.value)}
                    className={`min-h-11 rounded-lg border px-3 py-2 text-sm font-medium transition-colors sm:min-h-10 ${
                      dateRange === option.value
                        ? "border-border bg-muted text-foreground shadow-sm"
                        : "border-transparent text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </fieldset>

            <div>
              <label
                htmlFor="student-timeline-sort"
                className="text-sm font-medium text-foreground"
              >
                Sort
              </label>
              <select
                id="student-timeline-sort"
                value={sort}
                onChange={(event) =>
                  handleSortChange(
                    normalizeStudentTimelineSort(event.target.value)
                  )
                }
                className="mt-1.5 min-h-11 w-full rounded-lg border border-border bg-background/50 px-3 text-sm text-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20 sm:min-h-10 lg:w-auto"
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
              </select>
            </div>
          </div>

          {hasActiveFilters ? (
            <div className="mt-3 border-t border-border pt-3">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="min-h-11 sm:min-h-9"
                onClick={handleClearFilters}
              >
                Clear search and date
              </Button>
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="min-w-0">
        {records.length === 0 ? (
          <StudentTimelineEmptyState studentDisplayName={studentDisplayName} />
        ) : visibleRecords.length === 0 ? (
          <TimelineFilterEmptyState onClear={handleClearFilters} />
        ) : (
          <ol className="space-y-4 border-l border-border">
            {visibleRecords.map((record) => (
              <StudentTimelineEvidenceItem key={record.id} record={record} />
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}

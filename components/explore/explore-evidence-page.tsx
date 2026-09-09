"use client";

import { ChevronDown, ChevronUp, SlidersHorizontal, X } from "lucide-react";
import Link from "next/link";
import {
  useId,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import {
  runExploreEvidenceQuery,
  runExploreSupportingEvidenceQuery,
} from "@/actions/explore-evidence";
import {
  ExploreMultiSelect,
  type ExploreSelectOption,
} from "@/components/explore/explore-multi-select";
import { EvidenceRecordContent } from "@/components/evidence/evidence-record-content";
import { Button } from "@/components/ui/button";
import type {
  ExploreDateCondition,
  ExploreDateExecutionContext,
  ExploreEvidenceOptions,
  ExploreEvidenceQuery,
  ExploreEvidenceRecord,
  ExploreQueryResults,
  ExploreStudentGroup,
} from "@/lib/evidence/explore-evidence-contract";
import { DEFAULT_EXPLORE_QUERY } from "@/lib/evidence/explore-evidence-contract";
import { routes } from "@/lib/routes";

type TagMatchMode = "all" | "any";
type TagListKey = "includeAny" | "includeAll";
type QueryIntent = "filters" | "view" | "page";

type SupportingState = {
  records: ExploreEvidenceRecord[];
  page: number;
  hasNewer: boolean;
  hasOlder: boolean;
  error?: string;
};

type ExploreEvidencePageProps = {
  initialQuery: ExploreEvidenceQuery;
  initialResults: ExploreQueryResults;
  options: ExploreEvidenceOptions;
};

const DATE_RULE_LABELS: Record<ExploreDateCondition["rule"], string> = {
  all: "All time",
  exact: "Exact date",
  range: "Custom date range",
  last7: "Last 7 days",
  last30: "Last 30 days",
  thisMonth: "This month",
};

const FIELD_CONTROL_CLASS = "field";

const FIELD_LABEL_CLASS = "label mb-1.5 block text-fg-2";

const REVEAL_ACTION_CLASS =
  "min-h-11 rounded-full px-1 text-[13px] font-semibold text-fg underline decoration-line-2 underline-offset-4 outline-none hover:decoration-fg focus-visible:ring-2 focus-visible:ring-live-bright focus-visible:ring-offset-2 lg:min-h-8";

const SECTION_HEADING_CLASS = "label text-fg-3";

type FilterTarget = "student" | "class" | "tags" | "exclude" | "date" | "photo";

function listNames(ids: string[], choices: { id: string; label: string; }[], joiner = "and"): string {
  const names = ids.map((id) => choices.find((choice) => choice.id === id)?.label ?? id);
  if (names.length <= 2) return names.join(` ${joiner} `);
  return `${names.slice(0, 2).join(", ")} ${joiner} ${names.length - 2} more`;
}

function describeDateSlot(date: ExploreDateCondition): string {
  if (date.rule === "exact") return dateFromKey(date.date) ? formatEvidenceDate(`${date.date}T00:00:00`) : "a date";
  if (date.rule === "range") {
    return dateFromKey(date.startDate) && dateFromKey(date.endDate)
      ? `${formatEvidenceDate(`${date.startDate}T00:00:00`)} to ${formatEvidenceDate(`${date.endDate}T00:00:00`)}`
      : "a date range";
  }
  if (date.rule === "last7") return "the last 7 days";
  if (date.rule === "last30") return "the last 30 days";
  if (date.rule === "thisMonth") return "this month";
  return "all time";
}

function querySignature(query: ExploreEvidenceQuery): string {
  return JSON.stringify(query);
}

function describeFilters(query: ExploreEvidenceQuery, options: ExploreEvidenceOptions): string[] {
  const labels: string[] = [];
  const names = (ids: string[], choices: { id: string; label: string; }[]) =>
    ids.map((id) => choices.find((choice) => choice.id === id)?.label ?? id).join(", ");
  if (query.studentIds.length) labels.push(`Student: ${names(query.studentIds, options.students)}`);
  if (query.classIds.length) labels.push(`Class at capture: ${names(query.classIds, options.classes)}`);
  if (query.tags.includeAll.length) labels.push(`Tags${query.tags.includeAll.length > 1 ? " (all)" : ""}: ${names(query.tags.includeAll, options.tags)}`);
  if (query.tags.includeAny.length) labels.push(`Tags (any): ${names(query.tags.includeAny, options.tags)}`);
  if (query.tags.exclude.length) labels.push(`Without tags: ${names(query.tags.exclude, options.tags)}`);
  if (query.date.rule === "exact") labels.push(formatEvidenceDate(`${query.date.date}T00:00:00`));
  else if (query.date.rule === "range") labels.push(`${formatEvidenceDate(`${query.date.startDate}T00:00:00`)} – ${formatEvidenceDate(`${query.date.endDate}T00:00:00`)}`);
  else if (query.date.rule !== "all") labels.push(DATE_RULE_LABELS[query.date.rule]);
  if (query.photo !== "either") labels.push(query.photo === "with" ? "With a photo" : "Without a photo");
  return labels;
}

function dateFromKey(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function shiftLocalDate(value: Date, days: number): Date {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate() + days);
}

function dateContextForQuery(query: ExploreEvidenceQuery): ExploreDateExecutionContext {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let start = today;
  let end = today;

  if (query.date.rule === "exact") {
    start = dateFromKey(query.date.date) ?? today;
    end = start;
  } else if (query.date.rule === "range") {
    start = dateFromKey(query.date.startDate) ?? today;
    end = dateFromKey(query.date.endDate) ?? today;
  } else if (query.date.rule === "last7") {
    start = shiftLocalDate(today, -6);
  } else if (query.date.rule === "last30") {
    start = shiftLocalDate(today, -29);
  } else if (query.date.rule === "thisMonth") {
    start = new Date(today.getFullYear(), today.getMonth(), 1);
  }

  return {
    currentOffsetMinutes: now.getTimezoneOffset(),
    startOffsetMinutes: start.getTimezoneOffset(),
    endOffsetMinutes: shiftLocalDate(end, 1).getTimezoneOffset(),
  };
}

function formatEvidenceDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function plural(value: number, singular: string, pluralForm = `${singular}s`): string {
  return value === 1 ? singular : pluralForm;
}

function dateValidationError(date: ExploreDateCondition): string | null {
  if (date.rule === "exact" && !dateFromKey(date.date)) {
    return "Choose the exact date before showing results.";
  }
  if (date.rule === "range") {
    if (!dateFromKey(date.startDate) || !dateFromKey(date.endDate)) {
      return "Choose both dates before showing results.";
    }
    if (date.startDate > date.endDate) {
      return "The start date must be on or before the end date.";
    }
  }
  return null;
}

function initialTagMatchMode(query: ExploreEvidenceQuery): TagMatchMode {
  if (query.tags.includeAny.length > 0 && query.tags.includeAll.length === 0) {
    return "any";
  }
  return "all";
}

function primaryTagKey(mode: TagMatchMode): TagListKey {
  return mode === "all" ? "includeAll" : "includeAny";
}

function secondaryTagKey(mode: TagMatchMode): TagListKey {
  return mode === "all" ? "includeAny" : "includeAll";
}

function Slot({
  target,
  set,
  onOpen,
  children,
}: {
  target: FilterTarget;
  set: boolean;
  onOpen: (target: FilterTarget) => void;
  children: string;
}) {
  const names: Record<FilterTarget, string> = {
    student: "Filter by student",
    class: "Filter by class",
    tags: "Filter by tags",
    exclude: "Filter by excluded tags",
    date: "Filter by date",
    photo: "Filter by photo",
  };
  return (
    <button
      type="button"
      aria-controls="explore-filters"
      data-set={set}
      onClick={() => onOpen(target)}
      className="slot"
    >
      <span className="sr-only">{names[target]}: </span>
      {children}
    </button>
  );
}

function EvidenceResultRow({ record, showStudent = true }: { record: ExploreEvidenceRecord; showStudent?: boolean; }) {
  return (
    <li className="trace-node pl-7 py-4">
      <article aria-label={`Saved evidence for ${record.studentDisplayName}`} className="min-w-0">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          {showStudent ? (
            <Link
              href={routes.student(record.rosterStudentId)}
              className="break-words rounded-sm font-display text-[1.05rem] font-semibold leading-tight text-fg underline-offset-4 outline-none [overflow-wrap:anywhere] hover:underline focus-visible:ring-2 focus-visible:ring-live-bright focus-visible:ring-offset-2"
            >
              {record.studentDisplayName}
            </Link>
          ) : null}
          <time dateTime={record.evidenceDate} className="text-[13px] font-medium text-fg-3">
            {formatEvidenceDate(record.evidenceDate)}
          </time>
          {showStudent && record.classGroupName ? (
            <span className="break-words text-[13px] text-fg-3 [overflow-wrap:anywhere]">{record.classGroupName}</span>
          ) : null}
        </div>
        <EvidenceRecordContent
          record={record}
          compact
          showStructuredSummary={false}
          textClassName="mt-1.5 max-w-[70ch]"
        />
      </article>
    </li>
  );
}

function ResultPagination({
  page,
  hasNewer,
  hasOlder,
  pending,
  onPage,
  label,
  chronological = true,
}: {
  page: number;
  hasNewer: boolean;
  hasOlder: boolean;
  pending: boolean;
  onPage: (page: number) => void;
  label: string;
  chronological?: boolean;
}) {
  if (!hasNewer && !hasOlder) return null;

  return (
    <nav aria-label={label} className="flex flex-wrap items-center justify-between gap-3 border-t border-line py-3">
      <Button type="button" variant="outline" size="sm" disabled={!hasNewer || pending} onClick={() => onPage(page - 1)}>
        {chronological ? "Newer" : "Previous"}
      </Button>
      <span className="label text-fg-3">Page {page}</span>
      <Button type="button" variant="outline" size="sm" disabled={!hasOlder || pending} onClick={() => onPage(page + 1)}>
        {chronological ? "Older" : "Next"}
      </Button>
    </nav>
  );
}

function EmptyResults({
  noEvidence,
  onRevise,
}: {
  noEvidence: boolean;
  onRevise: () => void;
}) {
  return (
    <div className="plate px-6 py-12 text-center text-[15px] leading-relaxed text-fg-2">
      <h2 className="font-display text-2xl font-semibold text-fg">
        {noEvidence ? "No saved evidence yet." : "No evidence matches these filters."}
      </h2>
      <p className="mx-auto mt-2 max-w-[48ch]">
        {noEvidence
          ? "Validated evidence will appear here after you review and save a student-specific capture."
          : "Try a wider date range or remove a filter to include more evidence."}
      </p>
      {noEvidence ? (
        <Button asChild variant="outline" className="mt-5">
          <Link href={routes.feed}>Capture evidence</Link>
        </Button>
      ) : (
        <Button type="button" variant="outline" className="mt-5" onClick={onRevise}>
          Edit filters
        </Button>
      )}
    </div>
  );
}

function ModifierRemoveButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex min-h-11 items-center justify-center gap-1.5 self-end rounded-full px-2.5 text-[13px] font-semibold text-fg-2 outline-none transition-colors hover:bg-well hover:text-fg focus-visible:ring-2 focus-visible:ring-live-bright focus-visible:ring-offset-2 lg:min-h-9"
    >
      <X aria-hidden="true" className="size-3.5" />
      Remove
    </button>
  );
}

export function ExploreEvidencePage({
  initialQuery,
  initialResults,
  options,
}: ExploreEvidencePageProps) {
  const [draftQuery, setDraftQuery] = useState(initialQuery);
  const [appliedQuery, setAppliedQuery] = useState(initialQuery);
  const [results, setResults] = useState(initialResults);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [tagMatchMode, setTagMatchMode] = useState(() => initialTagMatchMode(initialQuery));
  const [withoutOpen, setWithoutOpen] = useState(initialQuery.tags.exclude.length > 0);
  const [secondaryOpen, setSecondaryOpen] = useState(() => {
    const mode = initialTagMatchMode(initialQuery);
    return initialQuery.tags[secondaryTagKey(mode)].length > 0;
  });
  const [queryError, setQueryError] = useState<string | null>(null);
  const retryRequest = useRef<{ query: ExploreEvidenceQuery; page: number; intent: QueryIntent; } | null>(null);
  const [supporting, setSupporting] = useState<Record<string, SupportingState>>({});
  const [expandedStudents, setExpandedStudents] = useState<string[]>([]);
  const [supportingPendingStudentId, setSupportingPendingStudentId] = useState<string | null>(null);
  const [isPending, startQueryTransition] = useTransition();
  const [isSupportingPending, startSupportingTransition] = useTransition();
  const filterButtonRef = useRef<HTMLButtonElement>(null);
  const studentInputRef = useRef<HTMLInputElement>(null);
  const classInputRef = useRef<HTMLInputElement>(null);
  const excludeInputRef = useRef<HTMLInputElement>(null);
  const photoRef = useRef<HTMLSelectElement>(null);
  const resultsHeadingRef = useRef<HTMLHeadingElement>(null);
  const queryGeneration = useRef(0);
  const tagsInputRef = useRef<HTMLInputElement>(null);
  const dateRuleRef = useRef<HTMLSelectElement>(null);
  const exactDateRef = useRef<HTMLInputElement>(null);
  const rangeStartRef = useRef<HTMLInputElement>(null);
  const tagMatchName = useId();

  const hasUnappliedChanges =
    querySignature(draftQuery) !== querySignature(appliedQuery);
  const appliedFilters = describeFilters(appliedQuery, options);
  const hasDraftFilters = describeFilters(draftQuery, options).length > 0;
  const currentDateError = dateValidationError(draftQuery.date);
  const primaryTags = draftQuery.tags[primaryTagKey(tagMatchMode)];
  const secondaryTags = draftQuery.tags[secondaryTagKey(tagMatchMode)];
  const showWithout = withoutOpen || draftQuery.tags.exclude.length > 0;
  const showSecondary = secondaryOpen || secondaryTags.length > 0;
  const matchLocked = secondaryTags.length > 0;
  const secondaryLabel =
    tagMatchMode === "all" ? "Also any of these tags" : "Also all of these tags";
  const runLabel = isPending
    ? "Updating results…"
    : hasUnappliedChanges
      ? "Update results"
      : "Show results";

  const tagOptions: ExploreSelectOption[] = useMemo(
    () => options.tags.map((tag) => ({ id: tag.id, label: tag.label })),
    [options.tags]
  );

  const studentSlot = draftQuery.studentIds.length ? listNames(draftQuery.studentIds, options.students, "or") : "any student";
  const classSlot = draftQuery.classIds.length ? listNames(draftQuery.classIds, options.classes, "or") : null;
  const tagSlotParts = [
    primaryTags.length ? listNames(primaryTags, options.tags, tagMatchMode === "all" ? "and" : "or") : null,
    secondaryTags.length ? `plus ${listNames(secondaryTags, options.tags, tagMatchMode === "all" ? "or" : "and")}` : null,
  ].filter(Boolean);
  const tagSlot = tagSlotParts.length ? tagSlotParts.join(" ") : "any tags";
  const excludeSlot = draftQuery.tags.exclude.length ? listNames(draftQuery.tags.exclude, options.tags, "or") : null;
  const photoSlot = draftQuery.photo === "with" ? "with a photo" : draftQuery.photo === "without" ? "without a photo" : null;

  function updateQuery(
    updater: (query: ExploreEvidenceQuery) => ExploreEvidenceQuery
  ): void {
    setDraftQuery((query) => updater(query));
    setQueryError(null);
  }

  function updateTags(patch: Partial<ExploreEvidenceQuery["tags"]>): void {
    updateQuery((query) => ({
      ...query,
      tags: { ...query.tags, ...patch },
    }));
  }

  function changeTagMatchMode(next: TagMatchMode): void {
    if (matchLocked || next === tagMatchMode) return;
    const currentPrimary = primaryTags;
    setTagMatchMode(next);
    updateTags({
      includeAll: next === "all" ? currentPrimary : [],
      includeAny: next === "any" ? currentPrimary : [],
    });
  }

  function dismissWithout(): void {
    tagsInputRef.current?.focus();
    setWithoutOpen(false);
    updateTags({ exclude: [] });
  }

  function dismissSecondary(): void {
    tagsInputRef.current?.focus();
    setSecondaryOpen(false);
    updateTags({ [secondaryTagKey(tagMatchMode)]: [] });
  }

  function openFilters(target: FilterTarget = "student"): void {
    setFiltersOpen(true);
    window.setTimeout(() => {
      const control =
        target === "tags" ? tagsInputRef.current
        : target === "exclude" ? excludeInputRef.current
        : target === "date" ? dateRuleRef.current
        : target === "class" ? classInputRef.current
        : target === "photo" ? photoRef.current
        : studentInputRef.current;
      control?.focus();
    }, 0);
  }

  function resetFilters(): void {
    setDraftQuery({ ...DEFAULT_EXPLORE_QUERY, resultView: appliedQuery.resultView });
    setTagMatchMode("all");
    setWithoutOpen(false);
    setSecondaryOpen(false);
    setQueryError(null);
    studentInputRef.current?.focus();
  }

  function runQuery(query: ExploreEvidenceQuery, page = 1, intent: QueryIntent = "page"): void {
    const validationError = dateValidationError(query.date);
    if (validationError) {
      setQueryError(validationError);
      window.setTimeout(() => {
        if (query.date.rule === "exact") exactDateRef.current?.focus();
        if (query.date.rule === "range") rangeStartRef.current?.focus();
      }, 0);
      return;
    }

    setQueryError(null);
    retryRequest.current = { query, page, intent };
    startQueryTransition(async () => {
      const response = await runExploreEvidenceQuery({
        query,
        page,
        dateContext: dateContextForQuery(query),
      });
      if (!response.success) {
        setQueryError(response.error);
        return;
      }

      queryGeneration.current += 1;
      setResults(response.results);
      setAppliedQuery(query);
      if (intent === "filters") {
        setDraftQuery(query);
        setFiltersOpen(false);
        window.setTimeout(() => resultsHeadingRef.current?.focus(), 0);
      } else if (intent === "view") {
        setDraftQuery((draft) => ({ ...draft, resultView: query.resultView }));
      }
      setExpandedStudents([]);
      setSupporting({});
    });
  }

  function loadSupportingEvidence(studentId: string, page = 1): void {
    const generation = queryGeneration.current;
    setSupportingPendingStudentId(studentId);
    startSupportingTransition(async () => {
      const response = await runExploreSupportingEvidenceQuery({
        query: appliedQuery,
        studentId,
        page,
        dateContext: dateContextForQuery(appliedQuery),
      });
      if (generation !== queryGeneration.current) return;
      if (!response.success) {
        setSupporting((state) => ({
          ...state,
          [studentId]: {
            records: state[studentId]?.records ?? [],
            page: state[studentId]?.page ?? 1,
            hasNewer: state[studentId]?.hasNewer ?? false,
            hasOlder: state[studentId]?.hasOlder ?? false,
            error: response.error,
          },
        }));
      } else {
        setSupporting((state) => ({
          ...state,
          [studentId]: {
            records: response.records,
            page: response.page,
            hasNewer: response.hasNewer,
            hasOlder: response.hasOlder,
          },
        }));
      }
      setSupportingPendingStudentId(null);
    });
  }

  function toggleStudent(student: ExploreStudentGroup): void {
    const isExpanded = expandedStudents.includes(student.id);
    if (isExpanded) {
      setExpandedStudents((ids) => ids.filter((id) => id !== student.id));
      return;
    }
    setExpandedStudents((ids) => [...ids, student.id]);
    if (!supporting[student.id]) loadSupportingEvidence(student.id);
  }

  return (
    <div className="mx-auto w-full max-w-[1100px] px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <header>
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h1 className="label text-fg">Explore</h1>
          <p className="label text-fg-3">Ask questions of the evidence you reviewed and saved.</p>
        </div>
        <p
          role="group"
          aria-label="Your question"
          className="mt-5 max-w-[22ch] font-display text-[clamp(1.85rem,4.6vw,3.25rem)] font-semibold leading-[1.15] text-fg"
        >
          Show me evidence for{" "}
          <Slot target="student" set={draftQuery.studentIds.length > 0} onOpen={openFilters}>{studentSlot}</Slot>
          {classSlot ? <>{" "}in{" "}<Slot target="class" set onOpen={openFilters}>{classSlot}</Slot></> : null}
          {" "}tagged{" "}
          <Slot target="tags" set={tagSlotParts.length > 0} onOpen={openFilters}>{tagSlot}</Slot>
          {excludeSlot ? <>{" "}but not{" "}<Slot target="exclude" set onOpen={openFilters}>{excludeSlot}</Slot></> : null}
          {" "}from{" "}
          <Slot target="date" set={draftQuery.date.rule !== "all"} onOpen={openFilters}>{describeDateSlot(draftQuery.date)}</Slot>
          {photoSlot ? <>{" "}<Slot target="photo" set onOpen={openFilters}>{photoSlot}</Slot></> : null}
          .
        </p>
      </header>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <Button
          ref={filterButtonRef}
          type="button"
          variant={filtersOpen ? "secondary" : "outline"}
          aria-expanded={filtersOpen}
          aria-controls="explore-filters"
          onClick={() => setFiltersOpen((open) => !open)}
          className="gap-2"
        >
          <SlidersHorizontal aria-hidden="true" className="size-4" />
          Filters{appliedFilters.length > 0 ? (
            <span className="tabular-nums"> ({appliedFilters.length})</span>
          ) : null}
          <ChevronDown aria-hidden="true" className={"size-3.5 transition-transform " + (filtersOpen ? "rotate-180" : "")} />
        </Button>
        <div role="group" aria-label="View evidence" className="inline-flex gap-1 rounded-full bg-well p-1">
          {(["evidence", "students"] as const).map((view) => (
            <button
              key={view}
              type="button"
              aria-pressed={results.view === view}
              disabled={isPending}
              onClick={() => {
                if (view !== results.view) runQuery({ ...appliedQuery, resultView: view }, 1, "view");
              }}
              className={
                results.view === view
                  ? "inline-flex min-h-9 items-center rounded-full bg-fg px-4 text-sm font-semibold text-base outline-none focus-visible:ring-2 focus-visible:ring-live-bright focus-visible:ring-offset-2 focus-visible:ring-offset-well disabled:opacity-60"
                  : "inline-flex min-h-9 items-center rounded-full px-4 text-sm font-medium text-fg-2 outline-none transition-colors hover:text-fg focus-visible:ring-2 focus-visible:ring-live-bright focus-visible:ring-offset-2 focus-visible:ring-offset-well disabled:opacity-60"
              }
            >
              {view === "evidence" ? "Evidence" : "Group by student"}
            </button>
          ))}
        </div>
      </div>

      {filtersOpen ? <section id="explore-filters" aria-label="Filter evidence" className="plate mt-4 overflow-hidden">
        <form onSubmit={(event) => { event.preventDefault(); runQuery(draftQuery, 1, "filters"); }}>
          <fieldset disabled={isPending}>
            <legend className="sr-only">Narrow saved evidence</legend>
            <div className="grid items-start gap-8 p-5 sm:p-6 md:grid-cols-3 md:gap-0">
              <div className="min-w-0 space-y-4 md:pr-6">
                <h3 className={SECTION_HEADING_CLASS}>Who</h3>
                <ExploreMultiSelect
                  label="Student"
                  inputRef={studentInputRef}
                  options={options.students}
                  selectedIds={draftQuery.studentIds}
                  onChange={(studentIds) => updateQuery((query) => ({ ...query, studentIds }))}
                  placeholder="Any student"
                  emptyMessage="No available students match."
                />

                <ExploreMultiSelect
                  label="Class at capture"
                  inputRef={classInputRef}
                  options={options.classes}
                  selectedIds={draftQuery.classIds}
                  onChange={(classIds) => updateQuery((query) => ({ ...query, classIds }))}
                  placeholder="Any class"
                  emptyMessage="No referenced classes match."
                />

                <p className="text-xs leading-relaxed text-fg-3">Class recorded when the evidence was saved.</p>
              </div>
              <div className="min-w-0 border-t border-line pt-6 md:border-l md:border-t-0 md:px-6 md:pt-0">
                <h3 className={`${SECTION_HEADING_CLASS} mb-4`}>What</h3>
                <div className="min-w-0">
                  <ExploreMultiSelect
                    label="Tags"
                    options={tagOptions}
                    selectedIds={primaryTags}
                    onChange={(tags) => updateTags({ [primaryTagKey(tagMatchMode)]: tags })}
                    placeholder="Any tags"
                    emptyMessage="No available tags match."
                    inputRef={tagsInputRef}
                  />

                  {primaryTags.length >= 2 ? (
                    <fieldset className="mt-2" disabled={matchLocked}>
                      <legend className="label mb-1 text-fg-2">Match</legend>
                      <div className="flex flex-wrap gap-x-4 gap-y-1">
                        <label className="inline-flex min-h-11 items-center gap-2 text-sm text-fg lg:min-h-8">
                          <input
                            type="radio"
                            name={tagMatchName}
                            value="all"
                            checked={tagMatchMode === "all"}
                            disabled={matchLocked}
                            onChange={() => changeTagMatchMode("all")}
                            className="size-4 accent-[var(--fg)]"
                          />
                          All of these tags
                        </label>
                        <label className="inline-flex min-h-11 items-center gap-2 text-sm text-fg lg:min-h-8">
                          <input
                            type="radio"
                            name={tagMatchName}
                            value="any"
                            checked={tagMatchMode === "any"}
                            disabled={matchLocked}
                            onChange={() => changeTagMatchMode("any")}
                            className="size-4 accent-[var(--fg)]"
                          />
                          Any of these tags
                        </label>
                      </div>
                    </fieldset>
                  ) : null}
                </div>
                {showSecondary ? (
                  <div className="mt-3 grid gap-1">
                    <ExploreMultiSelect
                      label={secondaryLabel}
                      options={tagOptions}
                      selectedIds={secondaryTags}
                      onChange={(tags) => updateTags({ [secondaryTagKey(tagMatchMode)]: tags })}
                      placeholder="Any tags"
                      emptyMessage="No available tags match."
                    />
                    <ModifierRemoveButton label="Remove extra tag group" onClick={dismissSecondary} />
                  </div>
                ) : null}

                {showWithout ? (
                  <div className="mt-3 grid gap-1">
                    <ExploreMultiSelect
                      label="Without tags"
                      inputRef={excludeInputRef}
                      options={tagOptions}
                      selectedIds={draftQuery.tags.exclude}
                      onChange={(tags) => updateTags({ exclude: tags })}
                      placeholder="Any tags"
                      emptyMessage="No available tags match."
                    />
                    <ModifierRemoveButton label="Remove without tags" onClick={dismissWithout} />
                  </div>
                ) : null}

                {!showSecondary || !showWithout ? (
                  <div className="mt-2 flex flex-wrap items-center gap-x-4">
                    {!showSecondary && primaryTags.length > 0 ? (
                      <button type="button" onClick={() => setSecondaryOpen(true)} className={REVEAL_ACTION_CLASS}>
                        {secondaryLabel}…
                      </button>
                    ) : null}
                    {!showWithout ? (
                      <button type="button" onClick={() => setWithoutOpen(true)} className={REVEAL_ACTION_CLASS}>
                        Exclude tags…
                      </button>
                    ) : null}
                  </div>
                ) : null}
                <div className="mt-5">
                  <label htmlFor="explore-photo" className={FIELD_LABEL_CLASS}>Photo</label>
                  <select
                    ref={photoRef}
                    id="explore-photo"
                    value={draftQuery.photo}
                    onChange={(event) =>
                      updateQuery((query) => ({
                        ...query,
                        photo: event.target.value as ExploreEvidenceQuery["photo"],
                      }))
                    }
                    className={FIELD_CONTROL_CLASS}
                  >
                    <option value="either">Any</option>
                    <option value="with">With a photo</option>
                    <option value="without">Without a photo</option>
                  </select>
                </div>
              </div>
              <div className="min-w-0 space-y-4 border-t border-line pt-6 md:border-l md:border-t-0 md:pl-6 md:pt-0">
                <h3 className={SECTION_HEADING_CLASS}>When</h3>
                <div>
                  <label htmlFor="explore-date-rule" className={FIELD_LABEL_CLASS}>Date</label>
                  <select
                    ref={dateRuleRef}
                    id="explore-date-rule"
                    value={draftQuery.date.rule}
                    onChange={(event) => {
                      const rule = event.target.value as ExploreDateCondition["rule"];
                      const nextDate: ExploreDateCondition =
                        rule === "exact"
                          ? { rule, date: "" }
                          : rule === "range"
                            ? { rule, startDate: "", endDate: "" }
                            : { rule };
                      updateQuery((query) => ({ ...query, date: nextDate }));
                    }}
                    className={FIELD_CONTROL_CLASS}
                  >
                    {Object.entries(DATE_RULE_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>

                  {draftQuery.date.rule === "exact" ? (
                    <div className="mt-3 max-w-sm">
                      <label htmlFor="explore-exact-date" className={FIELD_LABEL_CLASS}>Exact date</label>
                      <input
                        ref={exactDateRef}
                        id="explore-exact-date"
                        type="date"
                        value={draftQuery.date.date}
                        aria-invalid={Boolean(currentDateError)}
                        aria-describedby={currentDateError ? "explore-date-error" : undefined}
                        onChange={(event) =>
                          updateQuery((query) => ({
                            ...query,
                            date: { rule: "exact", date: event.target.value },
                          }))
                        }
                        className={FIELD_CONTROL_CLASS}
                      />
                    </div>
                  ) : draftQuery.date.rule === "range" ? (
                    <div className="mt-3 grid gap-3">
                      <div>
                        <label htmlFor="explore-start-date" className={FIELD_LABEL_CLASS}>Start date</label>
                        <input
                          ref={rangeStartRef}
                          id="explore-start-date"
                          type="date"
                          value={draftQuery.date.startDate}
                          aria-invalid={Boolean(currentDateError)}
                          aria-describedby={currentDateError ? "explore-date-error" : undefined}
                          onChange={(event) =>
                            updateQuery((query) => ({
                              ...query,
                              date: {
                                rule: "range",
                                startDate: event.target.value,
                                endDate: query.date.rule === "range" ? query.date.endDate : "",
                              },
                            }))
                          }
                          className={FIELD_CONTROL_CLASS}
                        />
                      </div>
                      <div>
                        <label htmlFor="explore-end-date" className={FIELD_LABEL_CLASS}>End date</label>
                        <input
                          id="explore-end-date"
                          type="date"
                          value={draftQuery.date.endDate}
                          aria-invalid={Boolean(currentDateError)}
                          aria-describedby={currentDateError ? "explore-date-error" : undefined}
                          onChange={(event) =>
                            updateQuery((query) => ({
                              ...query,
                              date: {
                                rule: "range",
                                startDate: query.date.rule === "range" ? query.date.startDate : "",
                                endDate: event.target.value,
                              },
                            }))
                          }
                          className={FIELD_CONTROL_CLASS}
                        />
                      </div>
                    </div>
                  ) : null}
                  {currentDateError ? (
                    <p id="explore-date-error" role="status" className="mt-2 text-[13px] font-medium text-danger">
                      {currentDateError}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
            <details className="mx-5 mb-4 text-[13px] leading-relaxed text-fg-2 sm:mx-6">
              <summary className="min-h-11 w-fit cursor-pointer rounded-full py-3 font-semibold text-fg underline decoration-line-2 underline-offset-4 outline-none focus-visible:ring-2 focus-visible:ring-live-bright">How filters work</summary>
              <p className="mt-1">Evidence must match every filter you set. If you choose multiple students or classes, it can match any one of them.</p>
              <p className="mt-2 text-sm text-fg"><span className="label mr-2 text-fg-3">Try</span>{" "}
                What evidence did I save for Mary recently? Which records have both #fractions and #independent? Which students have #reteach evidence?
              </p>
            </details>
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line bg-well/60 px-5 py-3 sm:px-6">
              <button type="button" onClick={resetFilters} disabled={!hasDraftFilters} className={REVEAL_ACTION_CLASS + " disabled:cursor-default disabled:opacity-50"}>Clear filters</button>
              <div className="flex items-center gap-2">
                <Button type="button" variant="ghost" onClick={() => { setFiltersOpen(false); filterButtonRef.current?.focus(); }}>Close</Button>
                <Button type="submit" disabled={isPending || Boolean(currentDateError)}>{runLabel}</Button>
              </div>
            </div>
          </fieldset>
        </form>
      </section> : null}

      {hasUnappliedChanges ? (
        <p role="status" className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border border-live-bright/60 bg-live-soft px-4 py-3 text-sm text-fg">
          <span aria-hidden="true" className="size-2 rounded-full bg-live-bright" />
          Filters changed. {filtersOpen ? "Update results to apply them." : (
            <button type="button" onClick={() => openFilters()} className="min-h-11 rounded-full font-semibold text-fg underline underline-offset-4 outline-none focus-visible:ring-2 focus-visible:ring-live-bright sm:min-h-9">Review changes</button>
          )}
        </p>
      ) : null}

      {queryError ? (
        <div role="alert" className="mt-4 rounded-lg border border-danger/40 bg-danger-soft px-4 py-3 text-sm text-danger">
          <p className="font-medium">{queryError}</p>
          <button type="button" disabled={isPending} onClick={() => { const request = retryRequest.current; if (request) runQuery(request.query, request.page, request.intent); }} className="mt-2 min-h-11 rounded-full px-1 text-[13px] font-semibold underline underline-offset-4 outline-none focus-visible:ring-2 focus-visible:ring-live-bright focus-visible:ring-offset-2">Retry</button>
        </div>
      ) : null}

      <section aria-labelledby="explore-results-heading" aria-busy={isPending} className="mt-10">
        <div className="mb-4 border-b border-line pb-4">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <h2 ref={resultsHeadingRef} tabIndex={-1} id="explore-results-heading" className="rounded-sm font-display text-2xl font-semibold text-fg outline-none focus-visible:ring-2 focus-visible:ring-live-bright">
              {results.view === "students" ? "Students with evidence" : appliedFilters.length ? "Matching evidence" : "All evidence"}
            </h2>
            <p aria-live="polite" className="label text-fg-2">
              {isPending ? "Updating results…" : <><span className="tabular-nums text-fg">{results.counts.evidence}</span>{" "}{plural(results.counts.evidence, "record")}<span aria-hidden="true" className="px-2 text-fg-3">·</span><span className="tabular-nums text-fg">{results.counts.students}</span>{" "}{plural(results.counts.students, "student")}</>}
            </p>
          </div>
          <p className="mt-1 text-[13px] text-fg-3">
            {results.view === "evidence" ? "Newest first" : "Alphabetical · open a student to see their matching evidence"}
            {appliedQuery.studentIds.length === 0 && appliedQuery.classIds.length === 0 ? " · all students" : null}
            {appliedQuery.date.rule === "all" ? " · all time" : null}
          </p>
          {appliedFilters.length > 0 ? (
            <ul aria-label="Applied filters" className="mt-3 flex flex-wrap gap-1.5">
              {appliedFilters.map((label) => <li key={label} className="max-w-full break-words rounded-full bg-live-soft px-2.5 py-1 text-[13px] font-medium text-fg [overflow-wrap:anywhere]">{label}</li>)}
            </ul>
          ) : null}
        </div>

        {results.counts.evidence === 0 ? (
          <EmptyResults noEvidence={appliedFilters.length === 0} onRevise={() => openFilters()} />
        ) : results.view === "evidence" ? (
          <div>
            <ol className="trace">
              {results.records.map((record) => (
                <EvidenceResultRow key={record.id} record={record} />
              ))}
            </ol>
            <ResultPagination
              page={results.page}
              hasNewer={results.hasNewer}
              hasOlder={results.hasOlder}
              pending={isPending}
              onPage={(page) => runQuery(appliedQuery, page)}
              label="Evidence result pages"
            />
          </div>
        ) : (
          <div>
            <ol className="divide-y divide-line">
              {results.students.map((student) => {
                const isExpanded = expandedStudents.includes(student.id);
                const supportingState = supporting[student.id];
                const loading =
                  isSupportingPending && supportingPendingStudentId === student.id;
                return (
                  <li key={student.id}>
                    <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                          <Link
                            href={routes.student(student.id)}
                            className="break-words rounded-sm font-display text-xl font-semibold leading-tight text-fg underline-offset-4 outline-none [overflow-wrap:anywhere] hover:underline focus-visible:ring-2 focus-visible:ring-live-bright focus-visible:ring-offset-2"
                          >
                            {student.displayName}
                          </Link>
                          {student.classGroupName ? (
                            <span className="break-words text-[13px] text-fg-3 [overflow-wrap:anywhere]">{student.classGroupName}</span>
                          ) : null}
                        </div>
                        <p className="mt-1 text-[13px] text-fg-2">
                          <span className="font-semibold tabular-nums text-fg">{student.matchingEvidenceCount}</span>{" "}
                          matching {plural(student.matchingEvidenceCount, "record")}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        aria-expanded={isExpanded}
                        aria-controls={`supporting-evidence-${student.id}`}
                        disabled={isPending || isSupportingPending}
                        onClick={() => toggleStudent(student)}
                      >
                        {isExpanded ? <ChevronUp aria-hidden="true" className="size-4" /> : <ChevronDown aria-hidden="true" className="size-4" />}
                        {isExpanded ? "Hide evidence" : "Show evidence"}
                      </Button>
                    </div>

                    {isExpanded ? (
                      <div id={`supporting-evidence-${student.id}`} className="mb-4 rounded-xl bg-well/70 px-4 pb-2 pt-1">
                        {loading && !supportingState ? (
                          <p role="status" className="py-4 text-sm text-fg-2">Loading supporting evidence…</p>
                        ) : supportingState?.error ? (
                          <div role="alert" className="py-3 text-sm text-danger">
                            <p>{supportingState.error}</p>
                            <Button type="button" variant="outline" size="sm" className="mt-3" disabled={loading} onClick={() => loadSupportingEvidence(student.id, supportingState.page)}>
                              Retry
                            </Button>
                          </div>
                        ) : supportingState ? (
                          <div>
                            <ol className="trace">
                              {supportingState.records.map((record) => (
                                <EvidenceResultRow key={record.id} record={record} showStudent={false} />
                              ))}
                            </ol>
                            <ResultPagination
                              page={supportingState.page}
                              hasNewer={supportingState.hasNewer}
                              hasOlder={supportingState.hasOlder}
                              pending={loading}
                              onPage={(page) => loadSupportingEvidence(student.id, page)}
                              label={`Supporting evidence pages for ${student.displayName}`}
                            />
                          </div>
                        ) : null}
                      </div>
                    ) : null}
                  </li>
                );
              })}
            </ol>
            <ResultPagination
              page={results.page}
              hasNewer={results.hasNewer}
              hasOlder={results.hasOlder}
              pending={isPending}
              onPage={(page) => runQuery(appliedQuery, page)}
              label="Student result pages"
              chronological={false}
            />
          </div>
        )}
      </section>
    </div>
  );
}

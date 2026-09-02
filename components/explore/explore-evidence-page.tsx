"use client";

import { ChevronDown, ChevronUp, FileSearch, X } from "lucide-react";
import Link from "next/link";
import {
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
import { routes } from "@/lib/routes";

type ConditionKey =
  | "students"
  | "tagsAny"
  | "tagsAll"
  | "tagsExclude"
  | "classes"
  | "photo";

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

const CONDITIONS: ReadonlyArray<{
  id: ConditionKey;
  label: string;
}> = [
  { id: "students", label: "Student" },
  { id: "tagsAny", label: "Tags include any" },
  { id: "tagsAll", label: "Tags include all" },
  { id: "tagsExclude", label: "Tags exclude" },
  { id: "classes", label: "Class" },
  { id: "photo", label: "Photo" },
];

const DATE_RULE_LABELS: Record<ExploreDateCondition["rule"], string> = {
  all: "All time",
  exact: "Exact date",
  range: "Custom date range",
  last7: "Last 7 days",
  last30: "Last 30 days",
  thisMonth: "This month",
};

function querySignature(query: ExploreEvidenceQuery): string {
  return JSON.stringify(query);
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

function EvidenceResultRow({ record }: { record: ExploreEvidenceRecord }) {
  return (
    <li className="border-b border-border last:border-b-0">
      <article
        aria-label={`Saved evidence for ${record.studentDisplayName}`}
        className="grid gap-3 px-4 py-4 sm:grid-cols-[8.5rem_minmax(0,1fr)] sm:px-5"
      >
        <p className="text-xs font-medium tabular-nums text-muted-foreground">
          {formatEvidenceDate(record.evidenceDate)}
        </p>
        <div className="min-w-0">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <Link
              href={routes.student(record.rosterStudentId)}
              className="rounded-sm text-sm font-semibold text-link underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {record.studentDisplayName}
            </Link>
            <span className="text-xs text-muted-foreground">
              @{record.studentMentionHandle}
            </span>
            {record.classGroupName ? (
              <span className="border-l border-border pl-2 text-xs text-muted-foreground">
                Class {record.classGroupName}
              </span>
            ) : null}
          </div>
          <EvidenceRecordContent
            record={record}
            compact
            showStructuredSummary={false}
            textClassName="mt-2"
          />
        </div>
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
}: {
  page: number;
  hasNewer: boolean;
  hasOlder: boolean;
  pending: boolean;
  onPage: (page: number) => void;
  label: string;
}) {
  if (!hasNewer && !hasOlder) return null;

  return (
    <nav
      aria-label={label}
      className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3"
    >
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={!hasNewer || pending}
        onClick={() => onPage(page - 1)}
      >
        Newer
      </Button>
      <span className="text-xs font-medium tabular-nums text-muted-foreground">
        Page {page}
      </span>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={!hasOlder || pending}
        onClick={() => onPage(page + 1)}
      >
        Older
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
    <div className="border border-border bg-card/60 px-5 py-7 text-sm leading-relaxed text-muted-foreground">
      <div className="mb-3 flex size-10 items-center justify-center rounded-md border border-border bg-muted/50 text-link">
        <FileSearch aria-hidden="true" className="size-5" strokeWidth={1.75} />
      </div>
      <h2 className="font-sans text-base font-semibold text-foreground">
        {noEvidence ? "No saved evidence yet." : "No evidence matches this question."}
      </h2>
      <p className="mt-1 max-w-[68ch]">
        {noEvidence
          ? "Validated evidence will appear here after you review and save a student-specific capture."
          : "The current conditions did not match any saved records. Revise the question or remove a condition and show the results again."}
      </p>
      {noEvidence ? (
        <Button asChild variant="outline" size="sm" className="mt-4">
          <Link href={routes.feed}>Capture evidence</Link>
        </Button>
      ) : (
        <Button type="button" variant="outline" size="sm" className="mt-4" onClick={onRevise}>
          Revise question
        </Button>
      )}
    </div>
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
  const [activeConditions, setActiveConditions] = useState<ConditionKey[]>([]);
  const [conditionToAdd, setConditionToAdd] = useState<ConditionKey | "">("");
  const [queryError, setQueryError] = useState<string | null>(null);
  const [supporting, setSupporting] = useState<Record<string, SupportingState>>({});
  const [expandedStudents, setExpandedStudents] = useState<string[]>([]);
  const [supportingPendingStudentId, setSupportingPendingStudentId] = useState<string | null>(null);
  const [isPending, startQueryTransition] = useTransition();
  const [isSupportingPending, startSupportingTransition] = useTransition();
  const builderRef = useRef<HTMLElement>(null);
  const addConditionRef = useRef<HTMLSelectElement>(null);
  const exactDateRef = useRef<HTMLInputElement>(null);
  const rangeStartRef = useRef<HTMLInputElement>(null);

  const availableConditions = CONDITIONS.filter(
    (condition) => !activeConditions.includes(condition.id)
  );
  const hasUnappliedChanges =
    querySignature(draftQuery) !== querySignature(appliedQuery);
  const currentDateError = dateValidationError(draftQuery.date);

  const tagOptions: ExploreSelectOption[] = useMemo(
    () => options.tags.map((tag) => ({ id: tag.id, label: tag.label })),
    [options.tags]
  );

  function updateQuery(
    updater: (query: ExploreEvidenceQuery) => ExploreEvidenceQuery
  ): void {
    setDraftQuery((query) => updater(query));
    setQueryError(null);
  }

  function addCondition(): void {
    if (!conditionToAdd) return;
    setActiveConditions((conditions) => [...conditions, conditionToAdd]);
    setConditionToAdd("");
  }

  function removeCondition(condition: ConditionKey): void {
    setActiveConditions((conditions) => conditions.filter((item) => item !== condition));
    updateQuery((query) => {
      if (condition === "students") return { ...query, studentIds: [] };
      if (condition === "classes") return { ...query, classIds: [] };
      if (condition === "photo") return { ...query, photo: "either" };
      const tagKey =
        condition === "tagsAny"
          ? "includeAny"
          : condition === "tagsAll"
            ? "includeAll"
            : "exclude";
      return {
        ...query,
        tags: { ...query.tags, [tagKey]: [] },
      };
    });
    window.setTimeout(() => addConditionRef.current?.focus(), 0);
  }

  function runQuery(query: ExploreEvidenceQuery, page = 1): void {
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

      setResults(response.results);
      setAppliedQuery(query);
      setExpandedStudents([]);
      setSupporting({});
    });
  }

  function loadSupportingEvidence(studentId: string, page = 1): void {
    setSupportingPendingStudentId(studentId);
    startSupportingTransition(async () => {
      const response = await runExploreSupportingEvidenceQuery({
        query: appliedQuery,
        studentId,
        page,
        dateContext: dateContextForQuery(appliedQuery),
      });
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

  function renderCondition(condition: ConditionKey) {
    const conditionLabel = CONDITIONS.find((item) => item.id === condition)?.label ?? "Condition";
    let content;

    if (condition === "students") {
      content = (
        <ExploreMultiSelect
          label="Student is any of"
          options={options.students}
          selectedIds={draftQuery.studentIds}
          onChange={(studentIds) => updateQuery((query) => ({ ...query, studentIds }))}
          placeholder="Search students"
          emptyMessage="No available students match."
        />
      );
    } else if (condition === "classes") {
      content = (
        <ExploreMultiSelect
          label="Class is any of"
          options={options.classes}
          selectedIds={draftQuery.classIds}
          onChange={(classIds) => updateQuery((query) => ({ ...query, classIds }))}
          placeholder="Search classes"
          emptyMessage="No referenced classes match."
        />
      );
    } else if (condition === "photo") {
      content = (
        <div>
          <label htmlFor="explore-photo-rule" className="mb-1.5 block text-xs font-semibold text-foreground">
            Photo is
          </label>
          <select
            id="explore-photo-rule"
            value={draftQuery.photo}
            onChange={(event) =>
              updateQuery((query) => ({
                ...query,
                photo: event.target.value as ExploreEvidenceQuery["photo"],
              }))
            }
            className="min-h-11 w-full rounded-md border border-input bg-card px-3 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="either">With or without a photo</option>
            <option value="with">With a photo</option>
            <option value="without">Without a photo</option>
          </select>
        </div>
      );
    } else {
      const tagKey =
        condition === "tagsAny"
          ? "includeAny"
          : condition === "tagsAll"
            ? "includeAll"
            : "exclude";
      content = (
        <ExploreMultiSelect
          label={
            condition === "tagsAny"
              ? "Tags include any of"
              : condition === "tagsAll"
                ? "Tags include all of"
                : "Tags exclude"
          }
          options={tagOptions}
          selectedIds={draftQuery.tags[tagKey]}
          onChange={(tags) =>
            updateQuery((query) => ({
              ...query,
              tags: { ...query.tags, [tagKey]: tags },
            }))
          }
          placeholder="Search saved tags"
          emptyMessage="No available tags match."
        />
      );
    }

    return (
      <div key={condition} className="grid gap-3 border-t border-border px-4 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:px-5">
        <div className="min-w-0">{content}</div>
        <button
          type="button"
          aria-label={`Remove ${conditionLabel} condition`}
          onClick={() => removeCondition(condition)}
          className="flex min-h-11 items-center justify-center gap-2 self-end rounded-md px-3 text-xs font-semibold text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <X aria-hidden="true" className="size-4" />
          Remove
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1180px] px-3 py-5 sm:px-5 sm:py-7">
      <header className="mb-5 border-b border-border pb-4">
        <h1 className="font-sans text-2xl font-semibold tracking-[-0.025em] text-foreground sm:text-3xl">
          Explore evidence
        </h1>
        <p className="mt-1.5 text-[15px] leading-relaxed text-muted-foreground">
          Ask a question of your saved evidence.
        </p>
      </header>

      <section
        ref={builderRef}
        aria-labelledby="explore-question-heading"
        className="overflow-visible rounded-card bg-card shadow-paper"
      >
        <h2 id="explore-question-heading" className="sr-only">
          Current question
        </h2>
        <div className="px-4 py-5 sm:px-5">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-3 text-lg font-semibold leading-tight text-foreground sm:text-xl">
            <span>Show me</span>
            <label className="sr-only" htmlFor="explore-result-view">
              Result view
            </label>
            <select
              id="explore-result-view"
              value={draftQuery.resultView}
              onChange={(event) =>
                updateQuery((query) => ({
                  ...query,
                  resultView: event.target.value as ExploreEvidenceQuery["resultView"],
                }))
              }
              className="min-h-11 rounded-md border border-input bg-muted/30 px-3 text-base font-semibold text-foreground outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:text-lg"
            >
              <option value="evidence">Evidence</option>
              <option value="students">Students</option>
            </select>
            <span>from</span>
            <label className="sr-only" htmlFor="explore-date-rule">
              Date
            </label>
            <select
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
              className="min-h-11 rounded-md border border-input bg-muted/30 px-3 text-base font-semibold text-foreground outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:text-lg"
            >
              {Object.entries(DATE_RULE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {draftQuery.date.rule === "exact" ? (
            <div className="mt-4 max-w-sm">
              <label htmlFor="explore-exact-date" className="mb-1.5 block text-xs font-semibold text-foreground">
                Exact date
              </label>
              <input
                ref={exactDateRef}
                id="explore-exact-date"
                type="date"
                value={draftQuery.date.date}
                aria-invalid={Boolean(currentDateError)}
                onChange={(event) =>
                  updateQuery((query) => ({
                    ...query,
                    date: { rule: "exact", date: event.target.value },
                  }))
                }
                className="min-h-11 w-full rounded-md border border-input bg-card px-3 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 aria-invalid:border-destructive"
              />
            </div>
          ) : draftQuery.date.rule === "range" ? (
            <div className="mt-4 grid gap-3 sm:max-w-2xl sm:grid-cols-2">
              <div>
                <label htmlFor="explore-start-date" className="mb-1.5 block text-xs font-semibold text-foreground">
                  Start date
                </label>
                <input
                  ref={rangeStartRef}
                  id="explore-start-date"
                  type="date"
                  value={draftQuery.date.startDate}
                  aria-invalid={Boolean(currentDateError)}
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
                  className="min-h-11 w-full rounded-md border border-input bg-card px-3 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 aria-invalid:border-destructive"
                />
              </div>
              <div>
                <label htmlFor="explore-end-date" className="mb-1.5 block text-xs font-semibold text-foreground">
                  End date
                </label>
                <input
                  id="explore-end-date"
                  type="date"
                  value={draftQuery.date.endDate}
                  aria-invalid={Boolean(currentDateError)}
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
                  className="min-h-11 w-full rounded-md border border-input bg-card px-3 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 aria-invalid:border-destructive"
                />
              </div>
            </div>
          ) : null}
          {currentDateError ? (
            <p className="mt-2 text-xs font-medium text-destructive">
              {currentDateError}
            </p>
          ) : null}
        </div>

        {activeConditions.map(renderCondition)}

        <div className="grid gap-4 border-t border-border bg-muted/20 px-4 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end sm:px-5">
          <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-end">
            <div className="min-w-0 flex-1 sm:max-w-xs">
              <label htmlFor="explore-add-condition" className="mb-1.5 block text-xs font-semibold text-foreground">
                Add a condition
              </label>
              <select
                ref={addConditionRef}
                id="explore-add-condition"
                value={conditionToAdd}
                disabled={availableConditions.length === 0}
                onChange={(event) => setConditionToAdd(event.target.value as ConditionKey | "")}
                className="min-h-11 w-full rounded-md border border-input bg-card px-3 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-60"
              >
                <option value="">Choose a condition</option>
                {availableConditions.map((condition) => (
                  <option key={condition.id} value={condition.id}>
                    {condition.label}
                  </option>
                ))}
              </select>
            </div>
            <Button
              type="button"
              variant="outline"
              disabled={!conditionToAdd}
              onClick={addCondition}
            >
              Add condition
            </Button>
          </div>
          <div className="sm:text-right">
            <p
              role="status"
              className={`mb-2 text-xs font-medium ${
                hasUnappliedChanges ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              {isPending
                ? "Updating results…"
                : hasUnappliedChanges
                  ? "Question changed. Show results to apply it."
                  : "Results match this question."}
            </p>
            <Button
              type="button"
              disabled={isPending || Boolean(currentDateError)}
              onClick={() => runQuery(draftQuery)}
              className="w-full sm:w-auto"
            >
              {isPending ? "Showing results…" : "Show results"}
            </Button>
          </div>
        </div>

        {queryError ? (
          <div role="alert" className="border-t border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive sm:px-5">
            <p className="font-medium">{queryError}</p>
            {!currentDateError ? (
              <button
                type="button"
                disabled={isPending}
                onClick={() => runQuery(draftQuery)}
                className="mt-2 min-h-11 rounded-md px-1 text-xs font-semibold underline underline-offset-4 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                Retry this question
              </button>
            ) : null}
          </div>
        ) : null}
      </section>

      <section aria-labelledby="explore-results-heading" className="mt-7">
        <div className="mb-3 flex flex-col gap-3 border-y border-border px-1 py-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 id="explore-results-heading" className="font-sans text-base font-semibold text-foreground">
              {results.view === "evidence" ? "Evidence results" : "Students represented"}
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {results.view === "evidence"
                ? "Newest matching evidence appears first."
                : "Students are listed alphabetically. Expand one to inspect matching evidence."}
            </p>
          </div>
          <p aria-live="polite" className="text-sm text-muted-foreground">
            <span className="font-semibold tabular-nums text-foreground">{results.counts.evidence}</span>{" "}
            matching {plural(results.counts.evidence, "record")}
            <span aria-hidden="true" className="px-2">·</span>
            <span className="font-semibold tabular-nums text-foreground">{results.counts.students}</span>{" "}
            {plural(results.counts.students, "student")}
          </p>
        </div>

        {results.counts.evidence === 0 ? (
          <EmptyResults
            noEvidence={
              appliedQuery.studentIds.length === 0 &&
              appliedQuery.classIds.length === 0 &&
              appliedQuery.tags.includeAny.length === 0 &&
              appliedQuery.tags.includeAll.length === 0 &&
              appliedQuery.tags.exclude.length === 0 &&
              appliedQuery.date.rule === "all" &&
              appliedQuery.photo === "either"
            }
            onRevise={() => builderRef.current?.scrollIntoView({ block: "start" })}
          />
        ) : results.view === "evidence" ? (
          <div className="overflow-hidden rounded-lg border border-border bg-card">
            <ol>
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
          <div className="overflow-hidden rounded-lg border border-border bg-card">
            <ol>
              {results.students.map((student) => {
                const isExpanded = expandedStudents.includes(student.id);
                const supportingState = supporting[student.id];
                const loading =
                  isSupportingPending && supportingPendingStudentId === student.id;
                return (
                  <li key={student.id} className="border-b border-border last:border-b-0">
                    <div className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                          <Link
                            href={routes.student(student.id)}
                            className="rounded-sm text-sm font-semibold text-link underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          >
                            {student.displayName}
                          </Link>
                          <span className="text-xs text-muted-foreground">@{student.mentionHandle}</span>
                          {student.classGroupName ? (
                            <span className="border-l border-border pl-2 text-xs text-muted-foreground">
                              Class {student.classGroupName}
                            </span>
                          ) : null}
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          <span className="font-semibold tabular-nums text-foreground">
                            {student.matchingEvidenceCount}
                          </span>{" "}
                          matching {plural(student.matchingEvidenceCount, "record")}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        aria-expanded={isExpanded}
                        aria-controls={`supporting-evidence-${student.id}`}
                        onClick={() => toggleStudent(student)}
                      >
                        {isExpanded ? (
                          <ChevronUp aria-hidden="true" className="size-4" />
                        ) : (
                          <ChevronDown aria-hidden="true" className="size-4" />
                        )}
                        {isExpanded ? "Hide evidence" : "Show evidence"}
                      </Button>
                    </div>

                    {isExpanded ? (
                      <div id={`supporting-evidence-${student.id}`} className="border-t border-border bg-muted/20 px-3 py-3 sm:px-5">
                        {loading && !supportingState ? (
                          <p role="status" className="py-4 text-sm text-muted-foreground">
                            Loading supporting evidence…
                          </p>
                        ) : supportingState?.error ? (
                          <div role="alert" className="py-3 text-sm text-destructive">
                            <p>{supportingState.error}</p>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="mt-3"
                              disabled={loading}
                              onClick={() => loadSupportingEvidence(student.id, supportingState.page)}
                            >
                              Retry
                            </Button>
                          </div>
                        ) : supportingState ? (
                          <div className="overflow-hidden rounded-md border border-border bg-card">
                            <ol>
                              {supportingState.records.map((record) => (
                                <EvidenceResultRow key={record.id} record={record} />
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
            />
          </div>
        )}
      </section>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useId,
  useRef,
  useState,
  useTransition,
  type FormEvent,
  type ReactElement,
} from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { EvidenceRecordContent } from "@/components/evidence/evidence-record-content";
import { ValidatedStamp } from "@/components/evidence/validated-stamp";
import { ExploreMultiSelect } from "@/components/explore/explore-multi-select";
import { StudentEvidenceExportAction } from "@/components/students/student-evidence-export-action";
import { StudentQuickJump } from "@/components/students/student-quick-jump";
import { Button } from "@/components/ui/button";
import { SAVED_EVIDENCE_CLASSIFICATION_LABELS } from "@/lib/evidence/evidence-classifications";
import type {
  StudentTimelineEvidenceRecord,
  StudentTimelineResult,
  StudentTimelineStudentRecord,
} from "@/lib/evidence/student-timeline-records";
import {
  hasStudentTimelineFilters,
  isValidStudentTimelineDate,
  serializeStudentTimelineSearchParams,
  type StudentTimelineInput,
} from "@/lib/evidence/student-timeline-query";
import { routes } from "@/lib/routes";
import { INPUT_LIMITS } from "@/lib/validation/input-limits";

type StudentTimelinePageProps = {
  timeline: StudentTimelineResult;
  appliedFilters: StudentTimelineInput;
  dateError?: string;
};

type StudentTimelineEvidenceItemProps = {
  record: StudentTimelineEvidenceRecord;
};

const EVIDENCE_HEADING_ID = "student-evidence-heading";

function formatTimelineDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(date);
}

function formatMonth(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently";
  return new Intl.DateTimeFormat("en", {
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatLongDate(value: string): string | null {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function describeSpan(summary: StudentTimelineResult["summary"]): string | null {
  if (!summary.firstEvidenceDate || !summary.lastEvidenceDate) return null;
  const first = formatLongDate(summary.firstEvidenceDate);
  const last = formatLongDate(summary.lastEvidenceDate);
  if (!first || !last) return null;
  return first === last ? first : `${first} – ${last}`;
}

function groupByMonth(records: StudentTimelineEvidenceRecord[]) {
  const groups: {
    key: string;
    label: string;
    records: StudentTimelineEvidenceRecord[];
  }[] = [];

  for (const record of records) {
    const date = new Date(record.evidenceDate);
    const key = Number.isNaN(date.getTime())
      ? "recent"
      : `${date.getFullYear()}-${date.getMonth()}`;
    const group = groups.at(-1);
    if (group?.key === key) {
      group.records.push(record);
    } else {
      groups.push({
        key,
        label: formatMonth(record.evidenceDate),
        records: [record],
      });
    }
  }

  return groups;
}

function resultCountLabel(count: number, filtered: boolean): string {
  if (filtered) return `${count} matching ${count === 1 ? "record" : "records"}`;
  return `${count} ${count === 1 ? "record" : "records"}`;
}

function timelineHref(studentId: string, input: StudentTimelineInput): string {
  const params = serializeStudentTimelineSearchParams(input);
  return `${routes.student(studentId)}${params.size ? `?${params}` : ""}#${EVIDENCE_HEADING_ID}`;
}

export function dateBoundaryOffset(
  value: string,
  endExclusive: boolean
): number | undefined {
  if (!value || !isValidStudentTimelineDate(value)) return undefined;
  const [year, month, day] = value.split("-").map(Number);
  const boundary = new Date(year, month - 1, day);
  if (endExclusive) boundary.setDate(boundary.getDate() + 1);
  return boundary.getTimezoneOffset();
}

function draftDateError(from: string, to: string): string | null {
  if (
    (from && !isValidStudentTimelineDate(from)) ||
    (to && !isValidStudentTimelineDate(to))
  ) {
    return "Choose valid From and To dates.";
  }
  if (from && to && from > to) {
    return "From must be on or before To.";
  }
  return null;
}

function StudentProfileHeader({
  student,
  summary,
}: {
  student: StudentTimelineStudentRecord;
  summary: StudentTimelineResult["summary"];
}) {
  const evidenceCount = summary.totalEvidenceCount;
  const span = describeSpan(summary);

  return (
    <header className="mb-10">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <Link
          href={routes.roster}
          className="label rounded-full text-fg-2 underline decoration-line-2 underline-offset-4 outline-none transition-colors hover:text-fg hover:decoration-fg focus-visible:ring-2 focus-visible:ring-live-bright focus-visible:ring-offset-2 focus-visible:ring-offset-base"
        >
          Students
        </Link>
        {student.classGroupName ? (
          <>
            <span aria-hidden="true" className="label text-fg-3">/</span>
            <span className="label text-fg-2">{student.classGroupName}</span>
          </>
        ) : null}
      </div>
      <h1 className="mt-3 break-words font-display text-[clamp(2.5rem,6vw,4.5rem)] font-semibold leading-[0.95] text-fg [overflow-wrap:anywhere]">
        {student.displayName}
      </h1>
      <p className="mt-4 max-w-[52ch] text-[17px] leading-relaxed text-fg-2">
        {evidenceCount === 0 ? (
          <>Nothing saved yet for @{student.mentionHandle}.</>
        ) : (
          <>
            <span className="font-semibold text-fg">{evidenceCount}</span>{" "}
            {evidenceCount === 1 ? "piece" : "pieces"} of validated evidence
            {span ? <>, <span className="text-fg">{span}</span></> : null}.
            {student.schoolLocalId ? (
              <span className="text-fg-3"> Local ID {student.schoolLocalId}.</span>
            ) : null}
          </>
        )}
      </p>
      <div className="mt-6 flex flex-wrap items-center gap-2">
        <Button asChild variant="solid">
          <Link href={routes.studentReport(student.id)}>Print report</Link>
        </Button>
        <StudentEvidenceExportAction
          studentId={student.id}
          studentName={student.displayName}
          evidenceCount={evidenceCount}
        />
        <Button asChild variant="ghost">
          <Link href={routes.captureForStudent(student.id)}>Capture something</Link>
        </Button>
        <StudentQuickJump
          currentStudentId={student.id}
          label="Switch to another student"
          mode="trigger"
        />
      </div>
    </header>
  );
}

function StudentTimelineEvidenceItem({
  record,
}: StudentTimelineEvidenceItemProps) {
  return (
    <li className="trace-node py-4 pl-7">
      <article className="min-w-0">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <time
            dateTime={record.evidenceDate}
            className="text-[13px] font-semibold text-fg-2"
          >
            {formatTimelineDate(record.evidenceDate)}
          </time>
          <ValidatedStamp className="text-fg-3" />
        </div>
        <EvidenceRecordContent
          record={record}
          showStructuredSummary={false}
          compact
          textClassName="mt-1.5 max-w-[70ch]"
        />
      </article>
    </li>
  );
}

function StudentTimelineEmptyState({
  student,
}: {
  student: StudentTimelineStudentRecord;
}) {
  return (
    <div className="plate px-6 py-12 text-center text-[15px] leading-relaxed text-fg-2">
      <p className="font-display text-2xl font-semibold text-fg">
        No validated evidence yet.
      </p>
      <p className="mx-auto mt-2 max-w-[44ch]">
        Write one sentence about {student.displayName}, review it, and the trace
        starts here.
      </p>
      <Button asChild className="mt-5">
        <Link href={routes.captureForStudent(student.id)}>Capture something</Link>
      </Button>
    </div>
  );
}

function StudentTimelineNoMatches({ onClear }: { onClear: () => void }) {
  return (
    <div className="rounded-lg border border-dashed border-line-2 px-6 py-12 text-center text-[15px] leading-relaxed text-fg-2">
      <p className="font-display text-2xl font-semibold text-fg">
        No evidence matches these filters.
      </p>
      <p className="mx-auto mt-2 max-w-[44ch]">
        Try different words, remove a filter, or clear the question to see the
        complete trace again.
      </p>
      <Button type="button" variant="outline" className="mt-5" onClick={onClear}>
        Clear search and filters
      </Button>
    </div>
  );
}

function StudentTimelineRetrieval({
  timeline,
  appliedFilters,
  dateError,
}: StudentTimelinePageProps) {
  const router = useRouter();
  const searchId = useId();
  const typeId = useId();
  const fromId = useId();
  const toId = useId();
  const localDateErrorId = useId();
  const navigationRequestedRef = useRef(false);
  const [isPending, startTransition] = useTransition();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [draftQuery, setDraftQuery] = useState(appliedFilters.query);
  const [draftType, setDraftType] = useState(appliedFilters.evidenceType ?? "");
  const [draftTags, setDraftTags] = useState(appliedFilters.tags);
  const [draftFrom, setDraftFrom] = useState(appliedFilters.from ?? "");
  const [draftTo, setDraftTo] = useState(appliedFilters.to ?? "");
  const [localDateError, setLocalDateError] = useState<string | null>(null);
  const [resultsAnnouncement, setResultsAnnouncement] = useState("");
  const appliedSignature = serializeStudentTimelineSearchParams(
    appliedFilters
  ).toString();
  const [previousAppliedSignature, setPreviousAppliedSignature] =
    useState(appliedSignature);
  const filtered = hasStudentTimelineFilters(appliedFilters);
  const { results } = timeline;
  const groups = groupByMonth(results.records);
  const tagOptions = [...new Set([...timeline.options.tags, ...appliedFilters.tags])]
    .sort((left, right) => left.localeCompare(right))
    .map((tag) => ({ id: tag, label: `#${tag}` }));

  if (previousAppliedSignature !== appliedSignature) {
    setPreviousAppliedSignature(appliedSignature);
    setDraftQuery(appliedFilters.query);
    setDraftType(appliedFilters.evidenceType ?? "");
    setDraftTags(appliedFilters.tags);
    setDraftFrom(appliedFilters.from ?? "");
    setDraftTo(appliedFilters.to ?? "");
    setLocalDateError(null);
  }

  useEffect(() => {
    if (!navigationRequestedRef.current) return;
    navigationRequestedRef.current = false;
    document.getElementById(EVIDENCE_HEADING_ID)?.focus();
    setResultsAnnouncement(
      `${resultCountLabel(results.totalMatches, filtered)}. Page ${results.page}.`
    );
  }, [appliedSignature, filtered, results.page, results.totalMatches]);

  function focusAndAnnounceCurrentResults(): void {
    document.getElementById(EVIDENCE_HEADING_ID)?.focus();
    setResultsAnnouncement(
      `${resultCountLabel(results.totalMatches, filtered)}. Page ${results.page}.`
    );
  }

  function navigate(input: StudentTimelineInput): void {
    const nextSignature = serializeStudentTimelineSearchParams(input).toString();
    if (nextSignature === appliedSignature) {
      focusAndAnnounceCurrentResults();
      return;
    }

    navigationRequestedRef.current = true;
    startTransition(() => {
      router.push(timelineHref(timeline.student.id, input));
    });
  }

  function handleSearch(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    navigate({
      ...appliedFilters,
      page: 1,
      query: draftQuery.trim().slice(0, INPUT_LIMITS.evidenceSearch),
    });
  }

  function handleApplyFilters(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    const error = draftDateError(draftFrom, draftTo);
    setLocalDateError(error);
    if (error) return;

    setFiltersOpen(false);
    navigate({
      page: 1,
      query: appliedFilters.query,
      evidenceType: draftType || undefined,
      tags: draftTags,
      from: draftFrom || undefined,
      to: draftTo || undefined,
      fromOffsetMinutes: dateBoundaryOffset(draftFrom, false),
      toOffsetMinutes: dateBoundaryOffset(draftTo, true),
    });
  }

  function handleClear(): void {
    setDraftQuery("");
    setDraftType("");
    setDraftTags([]);
    setDraftFrom("");
    setDraftTo("");
    setLocalDateError(null);
    setFiltersOpen(false);
    navigate({ page: 1, query: "", tags: [] });
  }

  function renderPager(placement: "heading" | "footer") {
    if (!results.hasNewer && !results.hasOlder) return null;
    const compact = placement === "heading";

    return (
      <nav
        aria-label={
          compact
            ? "Timeline pages by Evidence heading"
            : "Timeline pages after evidence"
        }
        className={`flex flex-wrap items-center gap-2 ${compact ? "justify-end" : "mt-6 justify-between border-t border-line pt-4"}`}
      >
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!results.hasNewer || isPending}
          aria-label={compact ? "Newer timeline evidence" : undefined}
          onClick={() => navigate({ ...appliedFilters, page: results.page - 1 })}
        >
          {compact ? "Newer" : "Newer evidence"}
        </Button>
        <span className="label text-fg-3">Page {results.page}</span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!results.hasOlder || isPending}
          aria-label={compact ? "Older timeline evidence" : undefined}
          onClick={() => navigate({ ...appliedFilters, page: results.page + 1 })}
        >
          {compact ? "Older" : "Older evidence"}
        </Button>
      </nav>
    );
  }

  return (
    <>
      <section
        aria-labelledby="timeline-find-heading"
        className="mb-8 border-y border-line py-5"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2
              id="timeline-find-heading"
              className="font-display text-xl font-semibold text-fg"
            >
              Find in this timeline
            </h2>
            <p className="mt-1 text-[13px] leading-relaxed text-fg-3">
              Search the evidence note and saved details for this student.
            </p>
          </div>
          {filtered ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
              disabled={isPending}
            >
              Clear
            </Button>
          ) : null}
        </div>

        <form onSubmit={handleSearch} className="mt-4">
          <label htmlFor={searchId} className="label text-fg-2">
            Search this timeline
          </label>
          <div className="mt-1.5 flex min-w-0 flex-col gap-2 sm:flex-row">
            <div className="relative min-w-0 flex-1">
              <input
                id={searchId}
                type="search"
                autoComplete="off"
                maxLength={INPUT_LIMITS.evidenceSearch}
                value={draftQuery}
                onChange={(event) => setDraftQuery(event.target.value)}
                placeholder="Note, type, topic, behavior, or tag"
                className="field w-full rounded-full pl-9! text-sm"
              />
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-fg-3"
              />
            </div>
            <Button
              type="submit"
              variant="solid"
              size="sm"
              className="rounded-full"
              disabled={isPending}
            >
              {isPending ? "Searching…" : "Search"}
            </Button>
          </div>
        </form>

        <button
          type="button"
          aria-expanded={filtersOpen}
          aria-controls="student-timeline-filters"
          onClick={() => setFiltersOpen((open) => !open)}
          className="mt-3 flex min-h-11 items-center gap-2 rounded-full px-1 text-sm font-semibold text-fg-2 outline-none hover:text-fg focus-visible:ring-2 focus-visible:ring-live-bright focus-visible:ring-offset-2 lg:min-h-9"
        >
          <SlidersHorizontal aria-hidden="true" className="size-4" />
          Filters
          {appliedFilters.evidenceType ||
          appliedFilters.tags.length > 0 ||
          appliedFilters.from ||
          appliedFilters.to ? (
            <span className="rounded-full bg-well px-2 py-0.5 text-xs text-fg">
              Applied
            </span>
          ) : null}
        </button>

        {filtersOpen ? (
          <form
            id="student-timeline-filters"
            aria-label="Filter this timeline"
            onSubmit={handleApplyFilters}
            className="well mt-3 p-4"
          >
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label htmlFor={typeId} className="label mb-1.5 block text-fg-2">
                  Type
                </label>
                <select
                  id={typeId}
                  value={draftType}
                  onChange={(event) => setDraftType(event.target.value)}
                  className="field w-full text-sm"
                >
                  <option value="">All types</option>
                  {SAVED_EVIDENCE_CLASSIFICATION_LABELS.map((label) => (
                    <option key={label} value={label}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <ExploreMultiSelect
                label="Tags"
                options={tagOptions}
                selectedIds={draftTags}
                onChange={setDraftTags}
                placeholder="Choose tags"
                emptyMessage="No other tags are available for this student."
              />
              <div>
                <label htmlFor={fromId} className="label mb-1.5 block text-fg-2">
                  From
                </label>
                <input
                  id={fromId}
                  type="date"
                  value={draftFrom}
                  onChange={(event) => {
                    setDraftFrom(event.target.value);
                    setLocalDateError(null);
                  }}
                  aria-invalid={localDateError ? true : undefined}
                  aria-describedby={localDateError ? localDateErrorId : undefined}
                  className="field w-full text-sm"
                />
              </div>
              <div>
                <label htmlFor={toId} className="label mb-1.5 block text-fg-2">
                  To
                </label>
                <input
                  id={toId}
                  type="date"
                  value={draftTo}
                  onChange={(event) => {
                    setDraftTo(event.target.value);
                    setLocalDateError(null);
                  }}
                  aria-invalid={localDateError ? true : undefined}
                  aria-describedby={localDateError ? localDateErrorId : undefined}
                  className="field w-full text-sm"
                />
              </div>
            </div>
            {localDateError ? (
              <p
                id={localDateErrorId}
                role="status"
                className="mt-3 text-[13px] font-medium text-danger"
              >
                {localDateError}
              </p>
            ) : null}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3">
              <p className="text-xs leading-relaxed text-fg-3">
                Selected tags match any one tag. Dates use this device&apos;s
                timezone.
              </p>
              <Button type="submit" size="sm" disabled={isPending}>
                {isPending ? "Applying…" : "Apply filters"}
              </Button>
            </div>
          </form>
        ) : null}

        {dateError ? (
          <p
            role="status"
            className="mt-3 rounded-md border-l-2 border-live-bright bg-live-soft px-3 py-2 text-[13px] leading-relaxed text-fg-2"
          >
            {dateError}
          </p>
        ) : null}
      </section>

      <section aria-labelledby={EVIDENCE_HEADING_ID}>
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line pb-3">
          <div>
            <h2
              id={EVIDENCE_HEADING_ID}
              tabIndex={-1}
              className="font-display text-2xl font-semibold text-fg outline-none focus-visible:ring-2 focus-visible:ring-live-bright focus-visible:ring-offset-2 focus-visible:ring-offset-base"
            >
              Evidence
            </h2>
            <p className="label mt-1 text-fg-3">
              {resultCountLabel(results.totalMatches, filtered)}
              <span aria-hidden="true"> · </span>
              Newest first
            </p>
          </div>
          {renderPager("heading")}
        </div>

        <p className="sr-only" role="status" aria-live="polite">
          {resultsAnnouncement}
        </p>

        <div className="min-w-0">
          {results.totalMatches === 0 ? (
            <div className="mt-4">
              <StudentTimelineNoMatches onClear={handleClear} />
            </div>
          ) : (
            <ol>
              {groups.map((group) => (
                <li key={group.key} className="pt-6">
                  <h3 className="label sticky top-16 z-10 -mx-1 w-fit rounded-full bg-base/95 px-1 py-1 text-fg-2 backdrop-blur">
                    {group.label}
                  </h3>
                  <ol className="trace mt-1">
                    {group.records.map((record) => (
                      <StudentTimelineEvidenceItem
                        key={record.id}
                        record={record}
                      />
                    ))}
                  </ol>
                </li>
              ))}
            </ol>
          )}
          {renderPager("footer")}
        </div>
      </section>
    </>
  );
}

export function StudentTimelinePage({
  timeline,
  appliedFilters,
  dateError,
}: StudentTimelinePageProps): ReactElement {
  return (
    <div className="mx-auto w-full max-w-[880px] px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <StudentProfileHeader
        student={timeline.student}
        summary={timeline.summary}
      />
      {timeline.summary.totalEvidenceCount === 0 ? (
        <section aria-labelledby={EVIDENCE_HEADING_ID}>
          <div className="mb-2 border-b border-line pb-3">
            <h2
              id={EVIDENCE_HEADING_ID}
              className="font-display text-2xl font-semibold text-fg"
            >
              Evidence
            </h2>
          </div>
          <div className="mt-4">
            <StudentTimelineEmptyState student={timeline.student} />
          </div>
        </section>
      ) : (
        <StudentTimelineRetrieval
          timeline={timeline}
          appliedFilters={appliedFilters}
          dateError={dateError}
        />
      )}
    </div>
  );
}

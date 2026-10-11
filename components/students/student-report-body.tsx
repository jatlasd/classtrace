"use client";

import { useId, useMemo, useState, useSyncExternalStore } from "react";
import type { ReactElement } from "react";
import { EvidenceRecordContent } from "@/components/evidence/evidence-record-content";
import { ValidatedStamp } from "@/components/evidence/validated-stamp";
import { Button } from "@/components/ui/button";
import { formatEvidenceCalendarDate } from "@/lib/evidence/evidence-calendar-date";
import type { StudentReportEvidenceRecord } from "@/lib/evidence/student-report-records";
import {
  formatReportDateSpan,
  groupReportEvidence,
  hasReportFollowUp,
  summarizeReportEvidence,
  type StudentReportCount,
  type StudentReportGroupMode,
} from "@/lib/evidence/student-report-summary";
import { cn } from "@/lib/utils";

type StudentReportBodyProps = {
  records: StudentReportEvidenceRecord[];
};

const GROUP_MODE_OPTIONS: { value: StudentReportGroupMode; label: string }[] = [
  { value: "date", label: "Date" },
  { value: "type", label: "Evidence type" },
  { value: "topic", label: "Topic" },
];

const GROUP_MODE_DESCRIPTIONS: Record<StudentReportGroupMode, string> = {
  date: "By month, oldest to newest",
  type: "By evidence type, oldest to newest",
  topic: "By topic, oldest to newest",
};

const subscribe = () => () => {};

function useBrowserTimeZone(): string {
  return useSyncExternalStore(
    subscribe,
    () => Intl.DateTimeFormat().resolvedOptions().timeZone,
    () => "UTC"
  );
}

function useToday(): string | null {
  return useSyncExternalStore(
    subscribe,
    () => new Date().toDateString(),
    () => null
  );
}

export function StudentReportPreparedDate({
  className,
}: {
  className?: string;
}): ReactElement | null {
  const today = useToday();

  if (!today) {
    return null;
  }

  return (
    <p className={className}>
      Prepared{" "}
      {new Intl.DateTimeFormat("en", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(new Date(today))}
    </p>
  );
}

function entryCountLabel(count: number): string {
  return `${count} ${count === 1 ? "entry" : "entries"}`;
}

function SummaryFact({ term, value }: { term: string; value: string }) {
  return (
    <div className="py-3 pr-4">
      <dt className="label text-fg-3">{term}</dt>
      <dd className="mt-1 font-display text-xl font-semibold leading-tight text-fg">
        {value}
      </dd>
    </div>
  );
}

function SummaryCountList({
  title,
  counts,
}: {
  title: string;
  counts: StudentReportCount[];
}) {
  return (
    <div className="student-report-keep-together min-w-0">
      <h3 className="label pb-1 text-fg-2">{title}</h3>
      <ul>
        {counts.map(({ label, count }) => (
          <li key={label} className="flex items-baseline gap-2 py-0.5 text-[13px]">
            <span className="min-w-0 break-words text-fg [overflow-wrap:anywhere]">
              {label}
            </span>
            <span
              aria-hidden="true"
              className="min-w-4 flex-1 translate-y-[-3px] border-b border-dotted border-line-2"
            />
            <span className="shrink-0 font-mono text-fg-2">{count}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ReportSummary({
  records,
  totalCount,
  timeZone,
}: {
  records: StudentReportEvidenceRecord[];
  totalCount: number;
  timeZone: string;
}) {
  const summary = summarizeReportEvidence(records);
  const followUps = records.filter(hasReportFollowUp);
  const dateSpan =
    formatReportDateSpan(
      summary.firstEvidenceDate ? new Date(summary.firstEvidenceDate) : undefined,
      summary.lastEvidenceDate ? new Date(summary.lastEvidenceDate) : undefined,
      timeZone
    ) ?? "None";
  const countLists = [
    { title: "Evidence type", counts: summary.evidenceTypes },
    { title: "Performance", counts: summary.performance },
    { title: "Behavior", counts: summary.behavior },
    { title: "Tags", counts: summary.tags },
  ].filter(({ counts }) => counts.length > 0);

  return (
    <section
      className="student-report-summary mb-10"
      aria-labelledby="report-summary-heading"
    >
      <div className="student-report-section-heading flex flex-wrap items-baseline justify-between gap-3 border-b border-line pb-3">
        <h2
          id="report-summary-heading"
          className="font-display text-2xl font-semibold text-fg"
        >
          Summary
        </h2>
        <p className="label text-fg-3">
          {records.length === totalCount
            ? `Covers ${totalCount === 1 ? "" : "all "}${entryCountLabel(totalCount)}`
            : `Covers ${records.length} of ${entryCountLabel(totalCount)}`}
        </p>
      </div>

      <dl className="student-report-keep-together grid grid-cols-2 border-b border-line sm:grid-cols-[1fr_1.75fr_1fr_1fr]">
        <SummaryFact term="Entries" value={String(summary.entryCount)} />
        <SummaryFact term="Date span" value={dateSpan} />
        <SummaryFact term="With photo" value={String(summary.photoCount)} />
        <SummaryFact term="Follow-ups" value={String(summary.followUpCount)} />
      </dl>

      {countLists.length > 0 ? (
        <div className="mt-5 grid gap-x-10 gap-y-5 sm:grid-cols-2">
          {countLists.map(({ title, counts }) => (
            <SummaryCountList key={title} title={title} counts={counts} />
          ))}
        </div>
      ) : null}

      {followUps.length > 0 ? (
        <div className="mt-6">
          <h3 className="label border-b border-line pb-1.5 text-fg-2">
            Follow-ups
          </h3>
          <ol>
            {followUps.map((record) => (
              <li
                key={record.id}
                className="student-report-keep-together grid gap-1 border-b border-line py-2.5 text-[13px] last:border-b-0 sm:grid-cols-[10rem_minmax(0,1fr)] sm:gap-6"
              >
                <time dateTime={record.evidenceDate} className="font-semibold text-fg-2">
                  {formatEvidenceCalendarDate(record.evidenceDate, timeZone)}
                </time>
                <span className="min-w-0 break-words text-fg [overflow-wrap:anywhere]">
                  {record.followUpNotes ?? "Follow-up flagged without a note."}
                </span>
              </li>
            ))}
          </ol>
        </div>
      ) : null}
    </section>
  );
}

function ReportEvidenceItem({
  record,
  included,
  timeZone,
  onIncludedChange,
}: {
  record: StudentReportEvidenceRecord;
  included: boolean;
  timeZone: string;
  onIncludedChange: (included: boolean) => void;
}) {
  const date = formatEvidenceCalendarDate(record.evidenceDate, timeZone);

  return (
    <li
      className={cn(
        "border-b border-line last:border-b-0",
        !included && "student-report-excluded"
      )}
    >
      <article className="student-report-entry grid gap-3 py-5 sm:grid-cols-[10rem_minmax(0,1fr)_auto] sm:gap-6">
        <div className="flex items-center justify-between gap-3 sm:block">
          <time
            dateTime={record.evidenceDate}
            className="block text-[13px] font-semibold text-fg-2 sm:pt-0.5"
          >
            {date}
          </time>
          <label className="student-report-screen-only inline-flex min-h-11 items-center gap-2 text-[13px] text-fg-2 sm:mt-1 lg:min-h-8">
            <input
              type="checkbox"
              checked={included}
              onChange={(event) => onIncludedChange(event.target.checked)}
              className="size-4 accent-[var(--fg)]"
            />
            Include{" "}
            <span className="sr-only">entry from {date}</span>
          </label>
        </div>
        <div className={cn("min-w-0", !included && "opacity-45")}>
          <EvidenceRecordContent
            record={record}
            includeClassGroup
            showStructuredSummary={false}
            photoLoading="eager"
            compact
          />
        </div>
        <ValidatedStamp className="self-start text-fg-3" />
      </article>
    </li>
  );
}

export function StudentReportBody({
  records,
}: StudentReportBodyProps): ReactElement {
  const groupModeName = useId();
  const timeZone = useBrowserTimeZone();
  const [groupMode, setGroupMode] = useState<StudentReportGroupMode>("date");
  const [excludedIds, setExcludedIds] = useState<Set<string>>(() => new Set());
  const includedRecords = useMemo(
    () => records.filter((record) => !excludedIds.has(record.id)),
    [records, excludedIds]
  );
  const groups = useMemo(
    () => groupReportEvidence(records, groupMode, timeZone),
    [records, groupMode, timeZone]
  );
  const includedCount = includedRecords.length;

  function setIncluded(id: string, included: boolean): void {
    setExcludedIds((current) => {
      const next = new Set(current);
      if (included) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  return (
    <>
      <div className="student-report-screen-only mb-8 flex flex-col gap-4 border-y border-line py-4 sm:flex-row sm:items-end sm:justify-between">
        <fieldset>
          <legend className="label mb-1 text-fg-2">Organize by</legend>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {GROUP_MODE_OPTIONS.map((option) => (
              <label
                key={option.value}
                className="inline-flex min-h-11 items-center gap-2 text-sm text-fg lg:min-h-8"
              >
                <input
                  type="radio"
                  name={groupModeName}
                  value={option.value}
                  checked={groupMode === option.value}
                  onChange={() => setGroupMode(option.value)}
                  className="size-4 accent-[var(--fg)]"
                />
                {option.label}
              </label>
            ))}
          </div>
        </fieldset>
        <div className="flex flex-wrap items-center gap-2">
          <p className="mr-2 text-[13px] text-fg-2" aria-live="polite">
            {includedCount} of {records.length} entries included
          </p>
          <Button
            type="button"
            variant="outline"
            size="xs"
            disabled={excludedIds.size === 0}
            onClick={() => setExcludedIds(new Set())}
          >
            Include all
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="xs"
            disabled={includedCount === 0}
            onClick={() => setExcludedIds(new Set(records.map(({ id }) => id)))}
          >
            Include none
          </Button>
        </div>
      </div>

      <ReportSummary
        records={includedRecords}
        totalCount={records.length}
        timeZone={timeZone}
      />

      <section
        className="student-report-print-root"
        aria-labelledby="report-evidence-heading"
      >
        <div className="student-report-print-context student-report-section-heading flex flex-wrap items-baseline justify-between gap-3 border-b border-line pb-3">
          <h2
            id="report-evidence-heading"
            className="font-display text-2xl font-semibold text-fg"
          >
            Evidence
          </h2>
          <p className="label text-fg-3">{GROUP_MODE_DESCRIPTIONS[groupMode]}</p>
        </div>

        {includedCount === 0 ? (
          <div className="plate my-4 px-6 py-8 text-center text-[15px] leading-relaxed text-fg-2">
            <p className="font-display text-2xl font-semibold text-fg">
              No entries are included.
            </p>
            <p className="mx-auto mt-2 max-w-[48ch]">
              Select the entries this report should contain before printing.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="student-report-screen-only mt-4"
              onClick={() => setExcludedIds(new Set())}
            >
              Include all
            </Button>
          </div>
        ) : null}

        {groups.map((group, index) => {
          const groupIncludedCount = group.records.filter(
            (record) => !excludedIds.has(record.id)
          ).length;
          const headingId = `${groupModeName}-group-${index}`;

          return (
            <section
              key={`${groupMode}-${group.key}`}
              aria-labelledby={headingId}
              className={cn(
                "mt-7",
                groupIncludedCount === 0 && "student-report-excluded"
              )}
            >
              <div className="student-report-group-heading flex flex-wrap items-baseline justify-between gap-3 border-b border-line-2 pb-1.5">
                <h3
                  id={headingId}
                  className="font-display text-lg font-semibold text-fg"
                >
                  {group.label}
                </h3>
                <p className="label text-fg-3">
                  {entryCountLabel(groupIncludedCount)}
                </p>
              </div>
              <ol>
                {group.records.map((record) => (
                  <ReportEvidenceItem
                    key={record.id}
                    record={record}
                    included={!excludedIds.has(record.id)}
                    timeZone={timeZone}
                    onIncludedChange={(included) =>
                      setIncluded(record.id, included)
                    }
                  />
                ))}
              </ol>
            </section>
          );
        })}
      </section>

      <p className="student-report-print-only mt-8 border-t border-line pt-3 text-xs text-fg-2">
        Prepared by the teacher in ClassTrace from validated evidence.{" "}
        Includes {includedCount} of {entryCountLabel(records.length)} available
        for this report.
      </p>
    </>
  );
}

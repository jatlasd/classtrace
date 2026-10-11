import Link from "next/link";
import type { ReactElement } from "react";
import { Button } from "@/components/ui/button";
import {
  StudentReportBody,
  StudentReportPreparedDate,
} from "@/components/students/student-report-body";
import { StudentReportFilters } from "@/components/students/student-report-filters";
import { StudentReportPrintAction } from "@/components/students/student-report-print-action";
import type { StudentEvidenceFilterOptions } from "@/lib/evidence/student-timeline-records";
import {
  hasStudentTimelineFilters,
  type StudentTimelineFilters,
} from "@/lib/evidence/student-timeline-query";
import { formatReportDateSpan } from "@/lib/evidence/student-report-summary";
import { routes } from "@/lib/routes";
import type {
  StudentReportEvidenceRecord,
  StudentReportStudent,
} from "@/lib/evidence/student-report-records";

type StudentReportPageProps = {
  student: StudentReportStudent;
  evidenceRecords: StudentReportEvidenceRecord[];
  totalEvidenceCount: number;
  options: StudentEvidenceFilterOptions;
  filters: StudentTimelineFilters;
  dateError?: string;
};

type ReportHeaderProps = {
  student: StudentReportStudent;
  filters: StudentTimelineFilters;
  matchingCount: number;
  totalEvidenceCount: number;
};

function calendarDate(value: string | undefined): Date | undefined {
  if (!value) {
    return undefined;
  }

  const [year, month, day] = value.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function getRangeLabel(filters: StudentTimelineFilters): string {
  return (
    formatReportDateSpan(
      calendarDate(filters.from),
      calendarDate(filters.to),
      "UTC"
    ) ?? "All evidence"
  );
}

export function describeReportFilters(filters: StudentTimelineFilters): string[] {
  return [
    filters.evidenceType,
    filters.topic ? `Topic: ${filters.topic}` : undefined,
    filters.tags.length > 0
      ? filters.tags.map((tag) => `#${tag}`).join(" or ")
      : undefined,
    filters.query ? `Matching \u201c${filters.query}\u201d` : undefined,
  ].filter((item): item is string => Boolean(item));
}

function ReportHeader({
  student,
  filters,
  matchingCount,
  totalEvidenceCount,
}: ReportHeaderProps) {
  const filterDescriptions = describeReportFilters(filters);
  const metadata = [
    student.classGroupName ? `Class ${student.classGroupName}` : null,
    student.schoolLocalId ? `Local ID ${student.schoolLocalId}` : null,
  ].filter(Boolean);

  return (
    <header className="mb-6 border-b-2 border-fg pb-6">
      <div className="student-report-screen-only mb-3 flex flex-wrap items-center justify-between gap-3">
        <Button asChild variant="ghost" size="sm" className="-ml-2">
          <Link href={routes.student(student.id)}>Back to {student.displayName}</Link>
        </Button>
        <div className="flex flex-wrap items-center gap-2">
          <StudentReportPrintAction />
          <Button asChild variant="ghost" size="sm">
            <Link href={routes.captureForStudent(student.id)}>Capture something</Link>
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="break-words font-display text-4xl font-semibold leading-none text-fg [overflow-wrap:anywhere] sm:text-5xl">
            {student.displayName}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-fg-2">
            <span className="font-semibold text-fg">Evidence report</span>
            <span>@{student.mentionHandle}</span>
            {metadata.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
          {filterDescriptions.length > 0 ? (
            <p className="mt-3 max-w-[60ch] break-words text-[13px] leading-relaxed text-fg-2 [overflow-wrap:anywhere]">
              <span className="label mr-2 text-fg-3">Filtered to</span>
              <span className="font-semibold text-fg">
                {filterDescriptions.join(" \u00b7 ")}
              </span>
              <span className="text-fg-3">
                {" "}
                ({matchingCount} of {totalEvidenceCount}{" "}
                {totalEvidenceCount === 1 ? "entry" : "entries"} match)
              </span>
            </p>
          ) : null}
        </div>

        <div className="sm:text-right">
          <p className="label text-fg-3">Period</p>
          <p className="mt-1 font-display text-2xl font-semibold leading-tight text-fg">
            {getRangeLabel(filters)}
          </p>
          <StudentReportPreparedDate className="label mt-1 text-fg-3" />
        </div>
      </div>
    </header>
  );
}

function ReportEmptyEvidence({ filtered }: { filtered: boolean }) {
  return (
    <section
      className="student-report-print-root"
      aria-labelledby="report-evidence-heading"
    >
      <div className="student-report-print-context mb-1 flex flex-wrap items-baseline justify-between gap-3 border-b border-line pb-3">
        <h2
          id="report-evidence-heading"
          className="font-display text-2xl font-semibold text-fg"
        >
          Evidence
        </h2>
      </div>
      <div className="plate px-6 py-12 text-center text-[15px] leading-relaxed text-fg-2">
        {filtered ? (
          <>
            <p className="font-display text-2xl font-semibold text-fg">
              No evidence matches these filters.
            </p>
            <p className="mx-auto mt-2 max-w-[48ch]">
              Try fewer filters or clear them to view all evidence for this
              student.
            </p>
          </>
        ) : (
          <>
            <p className="font-display text-2xl font-semibold text-fg">
              No validated evidence yet.
            </p>
            <p className="mx-auto mt-2 max-w-[48ch]">
              Capture a student-specific note, review it, and this report will
              have evidence to show.
            </p>
          </>
        )}
      </div>
    </section>
  );
}

export function StudentReportPage({
  student,
  evidenceRecords,
  totalEvidenceCount,
  options,
  filters,
  dateError,
}: StudentReportPageProps): ReactElement {
  return (
    <div className="student-report-page mx-auto w-full max-w-[880px] px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <ReportHeader
        student={student}
        filters={filters}
        matchingCount={evidenceRecords.length}
        totalEvidenceCount={totalEvidenceCount}
      />
      <StudentReportFilters
        studentId={student.id}
        filters={filters}
        options={options}
        dateError={dateError}
      />
      {evidenceRecords.length === 0 ? (
        <ReportEmptyEvidence filtered={hasStudentTimelineFilters(filters)} />
      ) : (
        <StudentReportBody records={evidenceRecords} />
      )}
    </div>
  );
}

import Link from "next/link";
import type { ReactElement } from "react";
import { EvidenceRecordContent } from "@/components/evidence/evidence-record-content";
import { ValidatedStamp } from "@/components/evidence/validated-stamp";
import { Button } from "@/components/ui/button";
import { StudentReportDateRangeForm } from "@/components/students/student-report-date-range-form";
import { StudentReportPrintAction } from "@/components/students/student-report-print-action";
import { routes } from "@/lib/routes";
import type {
  StudentReportDateRange,
  StudentReportEvidenceRecord,
  StudentReportStudent,
} from "@/lib/evidence/student-report-records";

type StudentReportPageProps = {
  student: StudentReportStudent;
  evidenceRecords: StudentReportEvidenceRecord[];
  dateRange: StudentReportDateRange;
};

type ReportHeaderProps = {
  student: StudentReportStudent;
  evidenceCount: number;
  dateRange: StudentReportDateRange;
};

type ReportEvidenceListProps = {
  records: StudentReportEvidenceRecord[];
  dateRange: StudentReportDateRange;
};

type ReportEvidenceItemProps = {
  record: StudentReportEvidenceRecord;
};

function formatReportDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Recently";
  }

  return new Intl.DateTimeFormat("en", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function getRangeLabel(dateRange: StudentReportDateRange): string {
  if (dateRange.status === "invalid") {
    return "Date range needs review";
  }

  if (dateRange.start && dateRange.end) {
    return `${dateRange.start} to ${dateRange.end}`;
  }

  if (dateRange.start) {
    return `From ${dateRange.start}`;
  }

  if (dateRange.end) {
    return `Through ${dateRange.end}`;
  }

  return "All evidence";
}

function ReportHeader({
  student,
  evidenceCount,
  dateRange,
}: ReportHeaderProps) {
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
            <Link href={routes.feed}>Capture something</Link>
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="label text-fg-3">Evidence report</p>
          <h1 className="mt-1 break-words font-display text-4xl font-semibold leading-none text-fg [overflow-wrap:anywhere] sm:text-5xl">
            {student.displayName}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-fg-2">
            <span>@{student.mentionHandle}</span>
            {metadata.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </div>

        <div className="sm:text-right">
          <p className="text-[15px] text-fg-2">
            <span className="font-display text-3xl font-semibold leading-none text-fg">
              {evidenceCount}
            </span>{" "}
            {evidenceCount === 1 ? "record" : "records"} shown
          </p>
          <p className="label mt-1 text-fg-3">
            {getRangeLabel(dateRange)}
          </p>
        </div>
      </div>
    </header>
  );
}

function ReportEvidenceItem({ record }: ReportEvidenceItemProps) {
  return (
    <li className="border-b border-line last:border-b-0">
      <article className="student-report-entry grid gap-3 py-5 sm:grid-cols-[10rem_minmax(0,1fr)_auto] sm:gap-6">
        <div className="flex items-start justify-between gap-3 sm:block">
          <time dateTime={record.evidenceDate} className="pt-0.5 text-[13px] font-semibold text-fg-2">
            {formatReportDate(record.evidenceDate)}
          </time>
          <ValidatedStamp className="text-fg-3 sm:hidden" />
        </div>
        <div className="min-w-0">
            <EvidenceRecordContent
              record={record}
              includeClassGroup
              showStructuredSummary={false}
              photoLoading="eager"
              compact
            />
        </div>
        <ValidatedStamp className="hidden self-start text-fg-3 sm:inline-flex" />
      </article>
    </li>
  );
}

function ReportEmptyState({
  dateRange,
}: {
  dateRange: StudentReportDateRange;
}) {
  const isFiltered =
    dateRange.status === "valid" && Boolean(dateRange.start || dateRange.end);

  return (
    <div className="plate px-6 py-12 text-center text-[15px] leading-relaxed text-fg-2">
      {isFiltered || dateRange.status === "invalid" ? (
        <>
          <p className="font-display text-2xl font-semibold text-fg">No evidence in this range.</p>
          <p className="mx-auto mt-2 max-w-[48ch]">
            Try a wider date range or clear the dates to view all evidence for
            this student.
          </p>
        </>
      ) : (
        <>
          <p className="font-display text-2xl font-semibold text-fg">No validated evidence yet.</p>
          <p className="mx-auto mt-2 max-w-[48ch]">
            Capture a student-specific note, review it, and this report will
            have evidence to show.
          </p>
        </>
      )}
    </div>
  );
}

function ReportEvidenceList({
  records,
  dateRange,
}: ReportEvidenceListProps) {
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
        <p className="label text-fg-3">
          Oldest to newest
        </p>
      </div>
      <div className="min-w-0">
        {records.length === 0 ? (
          <ReportEmptyState
            dateRange={dateRange}
          />
        ) : (
          <ol>
            {records.map((record) => (
              <ReportEvidenceItem key={record.id} record={record} />
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}

export function StudentReportPage({
  student,
  evidenceRecords,
  dateRange,
}: StudentReportPageProps): ReactElement {
  return (
    <div className="student-report-page mx-auto w-full max-w-[880px] px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <ReportHeader
        student={student}
        evidenceCount={evidenceRecords.length}
        dateRange={dateRange}
      />
      <StudentReportDateRangeForm
        studentId={student.id}
        start={dateRange.start}
        end={dateRange.end}
        error={dateRange.status === "invalid" ? dateRange.error : undefined}
      />
      <ReportEvidenceList
        records={evidenceRecords}
        dateRange={dateRange}
      />
    </div>
  );
}

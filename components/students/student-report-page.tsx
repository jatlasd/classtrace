import Link from "next/link";
import type { ReactElement } from "react";
import { Check, FileText } from "lucide-react";
import { EvidenceRecordContent } from "@/components/evidence/evidence-record-content";
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
    <header className="mb-4 border-b border-border pb-4">
      <div className="student-report-screen-only mb-3 flex flex-wrap items-center justify-between gap-3">
        <Button asChild variant="ghost" size="sm" className="-ml-2">
          <Link href={routes.student(student.id)}>Back to timeline</Link>
        </Button>
        <div className="flex flex-wrap items-center gap-2">
          <StudentReportPrintAction />
          <Button asChild variant="outline" size="sm">
            <Link href={routes.feed}>Capture evidence</Link>
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="font-sans text-lg font-semibold tracking-tight text-foreground">
            Evidence report for {student.displayName}
          </h1>
          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
            <span>@{student.mentionHandle}</span>
            {metadata.map((item) => (
              <span key={item} className="border-l border-border pl-2">
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="text-xs sm:text-right">
          <p className="text-muted-foreground">
            <span className="font-semibold tabular-nums text-foreground">
              {evidenceCount}
            </span>{" "}
            {evidenceCount === 1 ? "record" : "records"} shown
          </p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            {getRangeLabel(dateRange)}
          </p>
        </div>
      </div>
    </header>
  );
}

function ReportEvidenceItem({ record }: ReportEvidenceItemProps) {
  return (
    <li className="border-b border-border last:border-b-0">
      <article className="student-report-entry grid gap-3 px-4 py-3 sm:grid-cols-[9.5rem_minmax(0,1fr)_auto] sm:px-5">
        <div className="flex items-start justify-between gap-3 sm:block">
          <p className="text-xs font-medium tabular-nums text-muted-foreground">
            {formatReportDate(record.evidenceDate)}
          </p>
          <span className="inline-flex w-fit items-center gap-1.5 rounded-md border border-border px-2 py-0.5 text-[11px] font-semibold text-muted-foreground sm:hidden">
            <Check className="size-3" aria-hidden="true" />
            Validated
          </span>
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
        <span className="hidden w-fit items-center gap-1.5 self-start rounded-md border border-border px-2 py-0.5 text-[11px] font-semibold text-muted-foreground sm:inline-flex">
          <Check className="size-3" aria-hidden="true" />
          Validated
        </span>
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
    <div className="border border-border bg-card/60 p-5 text-sm leading-relaxed text-muted-foreground">
      <div className="mb-3 flex size-10 items-center justify-center rounded-md border border-border bg-muted/50 text-link">
        <FileText className="size-5" strokeWidth={1.75} />
      </div>
      {isFiltered || dateRange.status === "invalid" ? (
        <>
          <p className="font-medium text-foreground">No evidence in this range.</p>
          <p className="mt-1">
            Try a wider date range or clear the dates to view all evidence for
            this student.
          </p>
        </>
      ) : (
        <>
          <p className="font-medium text-foreground">No validated evidence yet.</p>
          <p className="mt-1">
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
      <div className="student-report-print-context mb-2 px-1">
        <h2
          id="report-evidence-heading"
          className="font-sans text-sm font-semibold text-foreground"
        >
          Evidence
        </h2>
        <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
          Ordered from oldest to newest for reporting.
        </p>
      </div>
      <div className="min-w-0">
        {records.length === 0 ? (
          <ReportEmptyState
            dateRange={dateRange}
          />
        ) : (
          <ol className="overflow-hidden rounded-lg border border-border bg-card">
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
    <div className="student-report-page mx-auto w-full max-w-[1180px] px-3 py-4 sm:px-5 sm:py-5">
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

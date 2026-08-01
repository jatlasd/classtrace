import Link from "next/link";
import type { ReactElement } from "react";
import { BookOpenText, Circle, FileText } from "lucide-react";
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

export function shouldShowEarlyReportGuidance(evidenceCount: number): boolean {
  return evidenceCount >= 1 && evidenceCount <= 4;
}

function ReportHeader({
  student,
  evidenceCount,
  dateRange,
}: ReportHeaderProps) {
  const metadata = [
    student.classGroupName ?? null,
    student.schoolLocalId ? `Local ID ${student.schoolLocalId}` : null,
  ].filter(Boolean);

  return (
    <header className="mb-4 border-b border-border pb-4 sm:mb-6 sm:pb-6">
      <div className="student-report-screen-only mb-4 flex flex-wrap items-center justify-between gap-3">
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

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-end">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Student report
          </p>
          <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight text-foreground">
            Evidence report for {student.displayName}
          </h1>
          <div className="mt-2 flex flex-wrap gap-2 text-sm text-muted-foreground">
            <span>@{student.mentionHandle}</span>
            {metadata.map((item) => (
              <span key={item} className="before:mr-2 before:content-['/']">
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-md border border-validated/60 bg-card/60 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Evidence included
          </p>
          <p className="mt-1 text-sm text-foreground">
            {evidenceCount} {evidenceCount === 1 ? "record" : "records"} shown.
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
    <li>
      <article className="student-report-entry border border-border bg-card p-4 shadow-paper">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground">
              {formatReportDate(record.evidenceDate)}
            </p>
            <EvidenceRecordContent
              record={record}
              includeClassGroup
              textClassName="mt-2"
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

function ReportEmptyState({
  dateRange,
}: {
  dateRange: StudentReportDateRange;
}) {
  const isFiltered =
    dateRange.status === "valid" && Boolean(dateRange.start || dateRange.end);

  return (
    <div className="border border-border bg-card/60 p-5 text-sm leading-relaxed text-muted-foreground">
      <div className="mb-3 flex size-10 items-center justify-center rounded-md border border-border bg-muted/50 text-primary">
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
    <section className="student-report-print-root grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
      <div className="student-report-print-context border border-border bg-card/60 p-4">
        <div className="flex size-10 items-center justify-center rounded-md border border-border bg-muted/50 text-primary">
          <BookOpenText className="size-5" strokeWidth={1.75} />
        </div>
        <h2 className="mt-4 font-display text-lg font-semibold text-foreground">
          Evidence included
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Stored evidence for one roster student, ordered from oldest to newest.
        </p>
      </div>

      <div className="min-w-0">
        {records.length === 0 ? (
          <ReportEmptyState
            dateRange={dateRange}
          />
        ) : (
          <ol className="space-y-4">
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
    <div className="student-report-page mx-auto w-full max-w-[1180px] px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
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
      {shouldShowEarlyReportGuidance(evidenceRecords.length) ? (
        <p className="student-report-screen-only mb-5 border-l-4 border-validated bg-card/60 px-4 py-3 text-sm leading-relaxed text-foreground">
          This report gets more useful as you capture more evidence. Each
          validated observation adds another moment you can return to later.
        </p>
      ) : null}
      <ReportEvidenceList
        records={evidenceRecords}
        dateRange={dateRange}
      />
    </div>
  );
}

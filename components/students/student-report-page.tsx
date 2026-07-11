import Link from "next/link";
import type { ReactElement, ReactNode } from "react";
import { BookOpenText, CalendarDays, Circle, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StudentReportPrintAction } from "@/components/students/student-report-print-action";
import { formatTagLabel } from "@/lib/format-tag";
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

type ReportDateRangeFormProps = {
  studentId: string;
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

function Chip({
  children,
  variant = "default",
}: {
  children: ReactNode;
  variant?: "default" | "tag" | "evidence";
}) {
  const className =
    variant === "tag"
      ? "border-border bg-muted/60 text-link"
      : variant === "evidence"
        ? "border-primary/25 bg-primary/10 text-primary"
        : "border-border bg-card text-foreground";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${className}`}
    >
      {children}
    </span>
  );
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
    <header className="mb-6 border-b border-border pb-6">
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

        <div className="border-l-4 border-validated bg-card/60 px-4 py-3">
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

function ReportDateRangeForm({
  studentId,
  dateRange,
}: ReportDateRangeFormProps) {
  const start = dateRange.status === "valid" ? dateRange.start : dateRange.start;
  const end = dateRange.status === "valid" ? dateRange.end : dateRange.end;

  return (
    <section className="student-report-screen-only mb-5 border border-border bg-card/60 p-4 sm:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex min-w-0 gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-md border border-border bg-muted/50 text-primary">
            <CalendarDays className="size-5" strokeWidth={1.75} />
          </div>
          <div className="min-w-0">
            <h2 className="font-display text-lg font-semibold text-foreground">
              Date range
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              Leave dates blank to include all stored evidence for this student.
            </p>
          </div>
        </div>

        <form className="grid gap-3 sm:grid-cols-[1fr_1fr_auto_auto] sm:items-end">
          <div className="space-y-1.5">
            <label
              htmlFor="student-report-start"
              className="text-sm font-medium text-foreground"
            >
              Start date
            </label>
            <input
              id="student-report-start"
              name="start"
              type="date"
              defaultValue={start}
              className="h-10 w-full rounded-md border border-border bg-background/50 px-3 text-sm text-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20"
            />
          </div>
          <div className="space-y-1.5">
            <label
              htmlFor="student-report-end"
              className="text-sm font-medium text-foreground"
            >
              End date
            </label>
            <input
              id="student-report-end"
              name="end"
              type="date"
              defaultValue={end}
              className="h-10 w-full rounded-md border border-border bg-background/50 px-3 text-sm text-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20"
            />
          </div>
          <Button type="submit" size="sm" className="h-10 rounded-lg px-5">
            Apply range
          </Button>
          <Button asChild variant="ghost" size="sm" className="h-10 rounded-lg px-5">
            <Link href={routes.studentReport(studentId)}>Clear range</Link>
          </Button>
        </form>
      </div>

      {dateRange.status === "invalid" ? (
        <p className="mt-3 text-sm text-destructive" role="status">
          {dateRange.error}
        </p>
      ) : null}
    </section>
  );
}

function ReportEvidenceItem({ record }: ReportEvidenceItemProps) {
  const primaryEvidenceText = record.evidenceNote ?? record.summary;

  return (
    <li>
      <article className="student-report-entry border border-border bg-card p-4 shadow-paper">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground">
              {formatReportDate(record.evidenceDate)}
            </p>
            <p className="mt-2 text-[15px] leading-relaxed text-foreground">
              {primaryEvidenceText}
            </p>
            {record.evidenceNote ? (
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                <span className="font-medium text-foreground">
                  Structured details:
                </span>{" "}
                {record.summary}
              </p>
            ) : (
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                Legacy structured entry. This record was saved before Evidence
                notes were added.
              </p>
            )}
          </div>
          <span className="inline-flex w-fit items-center gap-2 rounded-lg border border-validated/60 bg-validated/35 px-2.5 py-1 text-xs font-semibold text-validated-foreground">
            <Circle className="size-2 fill-current" />
            Validated
          </span>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {record.classGroupName ? <Chip>{record.classGroupName}</Chip> : null}
          {record.topic ? <Chip>{record.topic}</Chip> : null}
          {record.performance ? <Chip>{record.performance}</Chip> : null}
          {record.behavior ? <Chip>{record.behavior}</Chip> : null}
          <Chip variant="evidence">{record.evidenceType}</Chip>
          {record.tags.map((tag) => (
            <Chip key={tag} variant="tag">
              {formatTagLabel(tag)}
            </Chip>
          ))}
        </div>

        {record.followUpNotes ? (
          <p className="mt-3 border-t border-border/50 pt-2.5 text-xs leading-relaxed text-muted-foreground">
            <span className="font-medium text-foreground">Follow-up:</span>{" "}
            {record.followUpNotes}
          </p>
        ) : null}
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
    <div className="student-report-page mx-auto w-full max-w-[1180px] px-4 py-7 sm:px-6 lg:px-8">
      <ReportHeader
        student={student}
        evidenceCount={evidenceRecords.length}
        dateRange={dateRange}
      />
      <ReportDateRangeForm studentId={student.id} dateRange={dateRange} />
      {shouldShowEarlyReportGuidance(evidenceRecords.length) ? (
        <p className="student-report-screen-only mb-5 border-l-4 border-validated bg-card/60 px-4 py-3 text-sm leading-relaxed text-foreground">
          This report gets more useful as you capture more evidence. Each validated observation adds another moment you can return to later.
        </p>
      ) : null}
      <ReportEvidenceList
        records={evidenceRecords}
        dateRange={dateRange}
      />
    </div>
  );
}

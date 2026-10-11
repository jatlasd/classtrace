import Link from "next/link";
import type { ReactElement } from "react";
import { Button } from "@/components/ui/button";
import {
  StudentReportBody,
  StudentReportPreparedDate,
} from "@/components/students/student-report-body";
import { StudentReportDateRangeForm } from "@/components/students/student-report-date-range-form";
import { StudentReportPrintAction } from "@/components/students/student-report-print-action";
import { formatReportDateSpan } from "@/lib/evidence/student-report-summary";
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
  dateRange: StudentReportDateRange;
};

function calendarDate(value: string | undefined): Date | undefined {
  if (!value) {
    return undefined;
  }

  const [year, month, day] = value.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function getRangeLabel(dateRange: StudentReportDateRange): string {
  if (dateRange.status === "invalid") {
    return "Date range needs review";
  }

  return (
    formatReportDateSpan(
      calendarDate(dateRange.start),
      calendarDate(dateRange.end),
      "UTC"
    ) ?? "All evidence"
  );
}

function ReportHeader({ student, dateRange }: ReportHeaderProps) {
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
        </div>

        <div className="sm:text-right">
          <p className="label text-fg-3">Period</p>
          <p className="mt-1 font-display text-2xl font-semibold leading-tight text-fg">
            {getRangeLabel(dateRange)}
          </p>
          <StudentReportPreparedDate className="label mt-1 text-fg-3" />
        </div>
      </div>
    </header>
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

function ReportEmptyEvidence({
  dateRange,
}: {
  dateRange: StudentReportDateRange;
}) {
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
      <ReportEmptyState dateRange={dateRange} />
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
      <ReportHeader student={student} dateRange={dateRange} />
      <StudentReportDateRangeForm
        studentId={student.id}
        start={dateRange.start}
        end={dateRange.end}
        error={dateRange.status === "invalid" ? dateRange.error : undefined}
      />
      {evidenceRecords.length === 0 ? (
        <ReportEmptyEvidence dateRange={dateRange} />
      ) : (
        <StudentReportBody records={evidenceRecords} />
      )}
    </div>
  );
}

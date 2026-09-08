"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { FormEvent, ReactElement } from "react";
import { FIELD_LABEL_CLASS_NAME, ROSTER_INPUT_CLASS_NAME } from "@/components/roster/form-styles";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/routes";

type StudentReportDateRangeFormProps = {
  studentId: string;
  start?: string;
  end?: string;
  error?: string;
};

type DateParts = {
  year: number;
  monthIndex: number;
  day: number;
};

type OffsetForBoundary = (value: string, endExclusive: boolean) => number;

const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function parseDateParts(value: string): DateParts | null {
  if (!DATE_ONLY_PATTERN.test(value)) {
    return null;
  }

  const [yearText, monthText, dayText] = value.split("-");
  const year = Number(yearText);
  const monthIndex = Number(monthText) - 1;
  const day = Number(dayText);
  const date = new Date(year, monthIndex, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== monthIndex ||
    date.getDate() !== day
  ) {
    return null;
  }

  return { year, monthIndex, day };
}

function browserOffsetForBoundary(value: string, endExclusive: boolean): number {
  const parts = parseDateParts(value);
  if (!parts) {
    return 0;
  }

  const boundary = new Date(parts.year, parts.monthIndex, parts.day);
  if (endExclusive) {
    boundary.setDate(boundary.getDate() + 1);
  }

  return boundary.getTimezoneOffset();
}

export function buildStudentReportDateRangeHref(
  studentId: string,
  start: string,
  end: string,
  offsetForBoundary: OffsetForBoundary = browserOffsetForBoundary
): string {
  const params = new URLSearchParams();

  if (start) {
    params.set("start", start);
    params.set("startOffset", String(offsetForBoundary(start, false)));
  }

  if (end) {
    params.set("end", end);
    params.set("endOffset", String(offsetForBoundary(end, true)));
  }

  const reportPath = routes.studentReport(studentId);
  const query = params.toString();
  return query ? `${reportPath}?${query}` : reportPath;
}

export function StudentReportDateRangeForm({
  studentId,
  start,
  end,
  error,
}: StudentReportDateRangeFormProps): ReactElement {
  const router = useRouter();

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const selectedStart = String(formData.get("start") ?? "");
    const selectedEnd = String(formData.get("end") ?? "");

    router.push(
      buildStudentReportDateRangeHref(studentId, selectedStart, selectedEnd)
    );
  }

  return (
    <section className="student-report-screen-only mb-8 rounded-xl bg-well px-4 py-4 sm:px-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <h2 className="label text-fg">
            Date range
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-fg-2">
            Leave dates blank to include all stored evidence for this student.
          </p>
        </div>

        <form
          className="grid gap-3 sm:grid-cols-[1fr_1fr_auto_auto] sm:items-end"
          onSubmit={handleSubmit}
        >
          <div className="space-y-1.5">
            <label
              htmlFor="student-report-start"
              className={FIELD_LABEL_CLASS_NAME}
            >
              Start date
            </label>
            <input
              id="student-report-start"
              key={`start-${start ?? ""}`}
              name="start"
              type="date"
              defaultValue={start}
              className={ROSTER_INPUT_CLASS_NAME}
            />
          </div>
          <div className="space-y-1.5">
            <label
              htmlFor="student-report-end"
              className={FIELD_LABEL_CLASS_NAME}
            >
              End date
            </label>
            <input
              id="student-report-end"
              key={`end-${end ?? ""}`}
              name="end"
              type="date"
              defaultValue={end}
              className={ROSTER_INPUT_CLASS_NAME}
            />
          </div>
          <Button type="submit" size="sm" className="min-h-11 sm:min-h-10">
            Apply range
          </Button>
          <Button asChild variant="ghost" size="sm" className="min-h-11 sm:min-h-10">
            <Link href={routes.studentReport(studentId)}>Clear range</Link>
          </Button>
        </form>
      </div>

      {error ? (
        <p className="mt-3 text-sm font-medium text-danger" role="status">
          {error}
        </p>
      ) : null}
    </section>
  );
}

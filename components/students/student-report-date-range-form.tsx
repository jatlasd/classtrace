"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { FormEvent, ReactElement } from "react";
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
    <section className="student-report-screen-only mb-5 rounded-lg border border-border bg-card/60 p-4 sm:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <h2 className="font-display text-lg font-semibold text-foreground">
            Date range
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
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
          <Button
            type="submit"
            size="sm"
            className="min-h-11 rounded-lg px-5 sm:min-h-10"
          >
            Apply range
          </Button>
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="min-h-11 rounded-lg px-5 sm:min-h-10"
          >
            <Link href={routes.studentReport(studentId)}>Clear range</Link>
          </Button>
        </form>
      </div>

      {error ? (
        <p className="mt-3 text-sm text-destructive" role="status">
          {error}
        </p>
      ) : null}
    </section>
  );
}

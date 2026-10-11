"use client";

import { useEffect, useRef, type ReactElement } from "react";
import {
  EvidenceReportBody,
  EvidenceReportPreparedDate,
} from "@/components/reports/evidence-report-body";
import { StudentReportPrintAction } from "@/components/students/student-report-print-action";
import { Button } from "@/components/ui/button";
import type { ExploreEvidenceRecord } from "@/lib/evidence/explore-evidence-contract";

export function ExploreReportView({
  question,
  records,
  totalCount,
  onBack,
}: {
  question: string;
  records: ExploreEvidenceRecord[];
  totalCount: number;
  onBack: () => void;
}): ReactElement {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const studentCount = new Set(records.map((record) => record.rosterStudentId))
    .size;
  const truncated = records.length < totalCount;

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <div className="evidence-report-page mx-auto w-full max-w-[880px] px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <header className="mb-6 border-b-2 border-fg pb-6">
        <div className="evidence-report-screen-only mb-3 flex flex-wrap items-center justify-between gap-3">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="-ml-2"
            onClick={onBack}
          >
            Back to results
          </Button>
          <StudentReportPrintAction />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <h1
              ref={headingRef}
              tabIndex={-1}
              className="font-display text-4xl font-semibold leading-none text-fg outline-none sm:text-5xl"
            >
              Evidence report
            </h1>
            <p className="mt-3 max-w-[60ch] break-words text-[15px] leading-relaxed text-fg-2 [overflow-wrap:anywhere]">
              {question}
            </p>
          </div>

          <div className="sm:text-right">
            <p className="label text-fg-3">Matching entries</p>
            <p className="mt-1 font-display text-2xl font-semibold leading-tight text-fg">
              {totalCount}
            </p>
            <EvidenceReportPreparedDate className="label mt-1 text-fg-3" />
          </div>
        </div>
      </header>

      {truncated ? (
        <p
          role="status"
          className="mb-6 rounded-md border-l-2 border-live-bright bg-live-soft px-3 py-2 text-[13px] leading-relaxed text-fg-2"
        >
          Showing the first {records.length} of {totalCount} matching entries,
          oldest first. Narrow the question to include the rest.
        </p>
      ) : null}

      {records.length === 0 ? (
        <div className="plate px-6 py-12 text-center text-[15px] leading-relaxed text-fg-2">
          <p className="font-display text-2xl font-semibold text-fg">
            No evidence matches this question.
          </p>
          <p className="mx-auto mt-2 max-w-[48ch]">
            Go back to the results and widen the question.
          </p>
        </div>
      ) : (
        <EvidenceReportBody records={records} multiStudent={studentCount > 1} />
      )}
    </div>
  );
}

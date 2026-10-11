"use client";

import { useRouter } from "next/navigation";
import { useId, useState, useTransition, type FormEvent, type ReactElement } from "react";
import {
  draftDateError,
  filterDraftFrom,
  filtersFromDraft,
  StudentEvidenceFilterFields,
  type StudentEvidenceFilterOptionLists,
} from "@/components/students/student-evidence-filter-fields";
import { Button } from "@/components/ui/button";
import {
  hasStudentTimelineFilters,
  serializeStudentTimelineSearchParams,
  type StudentTimelineFilters,
} from "@/lib/evidence/student-timeline-query";
import { routes } from "@/lib/routes";
import { INPUT_LIMITS } from "@/lib/validation/input-limits";

export function studentReportHref(
  studentId: string,
  filters: StudentTimelineFilters
): string {
  const params = serializeStudentTimelineSearchParams({ ...filters, page: 1 });
  return `${routes.studentReport(studentId)}${params.size ? `?${params}` : ""}`;
}

export function StudentReportFilters({
  studentId,
  filters,
  options,
  dateError,
}: {
  studentId: string;
  filters: StudentTimelineFilters;
  options: StudentEvidenceFilterOptionLists;
  dateError?: string;
}): ReactElement {
  const router = useRouter();
  const searchId = useId();
  const [isPending, startTransition] = useTransition();
  const [query, setQuery] = useState(filters.query);
  const [draft, setDraft] = useState(() => filterDraftFrom(filters));
  const [localDateError, setLocalDateError] = useState<string | null>(null);

  function navigate(next: StudentTimelineFilters): void {
    startTransition(() => {
      router.push(studentReportHref(studentId, next));
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    const error = draftDateError(draft.from, draft.to);
    setLocalDateError(error);
    if (error) return;

    navigate(
      filtersFromDraft(draft, query.trim().slice(0, INPUT_LIMITS.evidenceSearch))
    );
  }

  function handleClear(): void {
    setQuery("");
    setDraft(filterDraftFrom({ query: "", tags: [] }));
    setLocalDateError(null);
    navigate({ query: "", tags: [] });
  }

  return (
    <form
      aria-label="Filter this report"
      onSubmit={handleSubmit}
      className="student-report-screen-only well mb-8 p-4"
    >
      <div className="mb-4">
        <label htmlFor={searchId} className="label mb-1.5 block text-fg-2">
          Search text
        </label>
        <input
          id={searchId}
          type="search"
          autoComplete="off"
          maxLength={INPUT_LIMITS.evidenceSearch}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Words in the note, topic, or follow-up"
          className="field w-full text-sm"
        />
      </div>
      <StudentEvidenceFilterFields
        draft={draft}
        onChange={(next) => {
          setDraft(next);
          setLocalDateError(null);
        }}
        options={options}
        dateError={localDateError}
      />
      {dateError ? (
        <p
          role="status"
          className="mt-3 rounded-md border-l-2 border-live-bright bg-live-soft px-3 py-2 text-[13px] leading-relaxed text-fg-2"
        >
          {dateError}
        </p>
      ) : null}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3">
        <p className="text-xs leading-relaxed text-fg-3">
          Selected tags match any one tag. Dates use this device&apos;s
          timezone.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {hasStudentTimelineFilters(filters) ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
              disabled={isPending}
            >
              Clear filters
            </Button>
          ) : null}
          <Button type="submit" size="sm" disabled={isPending}>
            {isPending ? "Applying…" : "Apply filters"}
          </Button>
        </div>
      </div>
    </form>
  );
}

"use client";

import { useId } from "react";
import type { ReactElement } from "react";
import { ExploreMultiSelect } from "@/components/explore/explore-multi-select";
import { SAVED_EVIDENCE_CLASSIFICATION_LABELS } from "@/lib/evidence/evidence-classifications";
import {
  isValidStudentTimelineDate,
  type StudentTimelineFilters,
} from "@/lib/evidence/student-timeline-query";

export type StudentEvidenceFilterDraft = {
  evidenceType: string;
  topic: string;
  tags: string[];
  from: string;
  to: string;
};

export type StudentEvidenceFilterOptionLists = {
  tags: string[];
  topics: string[];
};

export function dateBoundaryOffset(
  value: string,
  endExclusive: boolean
): number | undefined {
  if (!value || !isValidStudentTimelineDate(value)) return undefined;
  const [year, month, day] = value.split("-").map(Number);
  const boundary = new Date(year, month - 1, day);
  if (endExclusive) boundary.setDate(boundary.getDate() + 1);
  return boundary.getTimezoneOffset();
}

export function draftDateError(from: string, to: string): string | null {
  if (
    (from && !isValidStudentTimelineDate(from)) ||
    (to && !isValidStudentTimelineDate(to))
  ) {
    return "Choose valid From and To dates.";
  }
  if (from && to && from > to) {
    return "From must be on or before To.";
  }
  return null;
}

export function filterDraftFrom(
  filters: StudentTimelineFilters
): StudentEvidenceFilterDraft {
  return {
    evidenceType: filters.evidenceType ?? "",
    topic: filters.topic ?? "",
    tags: filters.tags,
    from: filters.from ?? "",
    to: filters.to ?? "",
  };
}

export function filtersFromDraft(
  draft: StudentEvidenceFilterDraft,
  query: string
): StudentTimelineFilters {
  return {
    query,
    evidenceType: draft.evidenceType || undefined,
    topic: draft.topic || undefined,
    tags: draft.tags,
    from: draft.from || undefined,
    to: draft.to || undefined,
    fromOffsetMinutes: dateBoundaryOffset(draft.from, false),
    toOffsetMinutes: dateBoundaryOffset(draft.to, true),
  };
}

export function StudentEvidenceFilterFields({
  draft,
  onChange,
  options,
  dateError,
}: {
  draft: StudentEvidenceFilterDraft;
  onChange: (draft: StudentEvidenceFilterDraft) => void;
  options: StudentEvidenceFilterOptionLists;
  dateError: string | null;
}): ReactElement {
  const typeId = useId();
  const topicId = useId();
  const fromId = useId();
  const toId = useId();
  const dateErrorId = useId();
  const tagOptions = [...new Set([...options.tags, ...draft.tags])]
    .sort((left, right) => left.localeCompare(right))
    .map((tag) => ({ id: tag, label: `#${tag}` }));
  const topicOptions =
    draft.topic &&
    !options.topics.some(
      (topic) => topic.toLowerCase() === draft.topic.toLowerCase()
    )
      ? [draft.topic, ...options.topics]
      : options.topics;
  const update = (patch: Partial<StudentEvidenceFilterDraft>) =>
    onChange({ ...draft, ...patch });

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label htmlFor={typeId} className="label mb-1.5 block text-fg-2">
            Type
          </label>
          <select
            id={typeId}
            value={draft.evidenceType}
            onChange={(event) => update({ evidenceType: event.target.value })}
            className="field w-full text-sm"
          >
            <option value="">All types</option>
            {SAVED_EVIDENCE_CLASSIFICATION_LABELS.map((label) => (
              <option key={label} value={label}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor={topicId} className="label mb-1.5 block text-fg-2">
            Topic
          </label>
          <select
            id={topicId}
            value={draft.topic}
            onChange={(event) => update({ topic: event.target.value })}
            className="field w-full text-sm"
          >
            <option value="">All topics</option>
            {topicOptions.map((topic) => (
              <option key={topic} value={topic}>
                {topic}
              </option>
            ))}
          </select>
        </div>
        <div className="md:col-span-2">
          <ExploreMultiSelect
            label="Tags"
            options={tagOptions}
            selectedIds={draft.tags}
            onChange={(tags) => update({ tags })}
            placeholder="Choose tags"
            emptyMessage="No other tags are available for this student."
          />
        </div>
        <div>
          <label htmlFor={fromId} className="label mb-1.5 block text-fg-2">
            From
          </label>
          <input
            id={fromId}
            type="date"
            value={draft.from}
            onChange={(event) => update({ from: event.target.value })}
            aria-invalid={dateError ? true : undefined}
            aria-describedby={dateError ? dateErrorId : undefined}
            className="field w-full text-sm"
          />
        </div>
        <div>
          <label htmlFor={toId} className="label mb-1.5 block text-fg-2">
            To
          </label>
          <input
            id={toId}
            type="date"
            value={draft.to}
            onChange={(event) => update({ to: event.target.value })}
            aria-invalid={dateError ? true : undefined}
            aria-describedby={dateError ? dateErrorId : undefined}
            className="field w-full text-sm"
          />
        </div>
      </div>
      {dateError ? (
        <p
          id={dateErrorId}
          role="status"
          className="mt-3 text-[13px] font-medium text-danger"
        >
          {dateError}
        </p>
      ) : null}
    </>
  );
}

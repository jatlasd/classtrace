"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  saveValidatedEvidence,
  type SaveValidatedEvidenceActionInput,
  type SaveValidatedEvidenceActionResult,
} from "@/actions/evidence";
import { ClassTraceNoticedPanel } from "@/components/dashboard/classtrace-noticed-panel";
import { EvidenceCaptureCard } from "@/components/dashboard/evidence-capture-card";
import {
  EvidenceFeedHeader,
  RecentCapturesLabel,
} from "@/components/dashboard/evidence-feed-header";
import { QuickCaptureCard } from "@/components/dashboard/quick-capture-card";
import { SavedEvidenceRow } from "@/components/dashboard/saved-evidence-row";
import { Button } from "@/components/ui/button";
import type {
  CaptureValidation,
  InterpretationFields,
} from "@/lib/evidence/capture-validation";
import {
  resolveCaptureDisplay,
} from "@/lib/evidence/capture-validation";
import type { EvidenceFeedRecord } from "@/lib/evidence/evidence-feed-records";
import { normalizeTag } from "@/lib/format-tag";
import { buildNoteDraft } from "@/lib/note-processing";
import type { NoteDraft } from "@/lib/note-processing/types";
import { mentionDisplayLabel } from "@/lib/students";
import {
  resolveCaptureStudents,
  type CaptureRosterStudent,
  type CaptureStudentResolution,
} from "@/lib/students/resolve-capture-students";
import { routes } from "@/lib/routes";
import { ArrowDownUp, X } from "lucide-react";

type FeedItem = {
  id: string;
  draft: NoteDraft;
  timestamp: string;
  timestampMs: number;
  validation?: CaptureValidation;
};

type InboxFilter = "all" | "needs_review" | "validated";

type EvidenceFeedProps = {
  rosterStudents: CaptureRosterStudent[];
  initialEvidenceRecords: EvidenceFeedRecord[];
};

const filterOptions: { value: InboxFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "needs_review", label: "Needs review" },
  { value: "validated", label: "Validated" },
];

function isValidated(item: FeedItem): boolean {
  return item.validation?.status === "validated";
}

function needsReview(
  item: FeedItem,
  rosterStudents: CaptureRosterStudent[]
): boolean {
  if (item.validation?.status === "validated") return false;
  return resolveCaptureDisplay(item.draft, item.validation, rosterStudents)
    .needsReview;
}

function stripMentionPrefix(mention: string): string {
  return mention.replace(/^@/, "");
}

function buildCaptureSearchHaystacks(
  item: FeedItem,
  rosterStudents: CaptureRosterStudent[]
) {
  const display = resolveCaptureDisplay(
    item.draft,
    item.validation,
    rosterStudents
  );
  const rawNote = item.draft.parsed.rawNote;

  const studentParts: string[] = [];
  for (const ref of display.studentMentions) {
    studentParts.push(mentionDisplayLabel(ref));
    if (ref.status === "resolved") {
      studentParts.push(
        ref.student.displayName,
        ref.student.handle,
        ref.student.id
      );
    } else {
      studentParts.push(ref.mention);
    }
  }
  for (const mention of item.draft.parsed.mentions) {
    studentParts.push(stripMentionPrefix(mention));
  }
  const studentHaystack = studentParts.join(" ").toLowerCase();

  const tagSet = new Set<string>();
  for (const tag of display.tags) {
    tagSet.add(normalizeTag(tag).toLowerCase());
  }
  for (const tag of item.draft.parsed.tags) {
    tagSet.add(normalizeTag(tag).toLowerCase());
  }
  const tagHaystack = [...tagSet].join(" ");

  const generalParts: string[] = [
    rawNote,
    studentHaystack,
    tagHaystack,
    display.evidenceType,
    display.summaryLine,
  ];
  if (display.topic) {
    generalParts.push(display.topic);
  }
  if (display.performance) {
    generalParts.push(display.performance);
  }
  if (display.behavior) {
    generalParts.push(...display.behavior);
  }
  if (display.followUps.length > 0) {
    generalParts.push(...display.followUps);
  }

  const generalHaystack = generalParts.join(" ").toLowerCase();

  return { rawNote, studentHaystack, tagHaystack, generalHaystack };
}

function captureMatchesSearch(
  item: FeedItem,
  rawQuery: string,
  rosterStudents: CaptureRosterStudent[]
): boolean {
  const trimmed = rawQuery.trim();
  if (!trimmed) {
    return true;
  }

  const { rawNote, studentHaystack, tagHaystack, generalHaystack } =
    buildCaptureSearchHaystacks(item, rosterStudents);

  if (trimmed.startsWith("@")) {
    const needle = stripMentionPrefix(trimmed).toLowerCase();
    if (!needle) {
      return true;
    }
    if (studentHaystack.includes(needle)) {
      return true;
    }
    return generalHaystack.includes(needle);
  }

  if (trimmed.startsWith("#")) {
    const needle = normalizeTag(trimmed).toLowerCase();
    if (!needle) {
      return true;
    }
    if (tagHaystack.includes(needle)) {
      return true;
    }
    if (rawNote.toLowerCase().includes(`#${needle}`)) {
      return true;
    }
    return generalHaystack.includes(needle);
  }

  const needle = trimmed.toLowerCase();
  return generalHaystack.includes(needle);
}

function evidenceRecordMatchesSearch(
  record: EvidenceFeedRecord,
  rawQuery: string
): boolean {
  const trimmed = rawQuery.trim();

  if (!trimmed) {
    return true;
  }

  const tagHaystack = record.tags
    .map((tag) => normalizeTag(tag).toLowerCase())
    .join(" ");
  const studentHaystack = [
    record.studentDisplayName,
    record.studentMentionHandle,
    record.rosterStudentId,
  ]
    .join(" ")
    .toLowerCase();

  if (trimmed.startsWith("@")) {
    const needle = stripMentionPrefix(trimmed).toLowerCase();
    return !needle || studentHaystack.includes(needle);
  }

  if (trimmed.startsWith("#")) {
    const needle = normalizeTag(trimmed).toLowerCase();
    return !needle || tagHaystack.includes(needle);
  }

  const generalHaystack = [
    record.summary,
    record.studentDisplayName,
    record.studentMentionHandle,
    record.classGroupName,
    record.evidenceType,
    record.topic,
    record.performance,
    record.behavior,
    record.followUpNotes,
    tagHaystack,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return generalHaystack.includes(trimmed.toLowerCase());
}

function EvidenceSearchControl({
  query,
  onQueryChange,
}: {
  query: string;
  onQueryChange: (query: string) => void;
}) {
  return (
    <div className="relative min-w-0 flex-1 sm:max-w-[280px]">
      <input
        type="search"
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        placeholder="Search"
        aria-label="Search evidence inbox"
        className="h-10 w-full rounded-lg border border-border bg-card py-2 pl-3 pr-9 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20"
      />
      {query ? (
        <button
          type="button"
          onClick={() => onQueryChange("")}
          aria-label="Clear search"
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted-foreground hover:text-foreground"
        >
          <X className="size-4" />
        </button>
      ) : null}
    </div>
  );
}

function InboxFilterControl({
  filter,
  onFilterChange,
}: {
  filter: InboxFilter;
  onFilterChange: (filter: InboxFilter) => void;
}) {
  return (
    <div
      role="group"
      aria-label="Filter evidence inbox"
      className="flex flex-wrap gap-1.5"
    >
      {filterOptions.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onFilterChange(option.value)}
          className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
            filter === option.value
              ? "border-border bg-muted text-foreground"
              : "border-transparent text-muted-foreground hover:bg-muted/60 hover:text-foreground"
          }`}
        >
          {option.label}
          {filter === option.value ? <span className="sr-only"> selected</span> : null}
        </button>
      ))}
    </div>
  );
}

function FilterEmptyMessage({ filter }: { filter: InboxFilter }) {
  if (filter === "needs_review") {
    return (
      <p className="px-1 py-8 text-center text-sm text-muted-foreground">
        Nothing needs review right now.
      </p>
    );
  }

  if (filter === "validated") {
    return (
      <p className="px-1 py-8 text-center text-sm text-muted-foreground">
        No validated evidence yet. Review a capture to turn it into a record.
      </p>
    );
  }

  return null;
}

function RosterRequiredState() {
  return (
    <section className="rounded-card border border-border bg-card p-6 shadow-paper">
      <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        Roster needed
      </p>
      <h2 className="font-display text-lg font-semibold text-foreground">
        Add one student before capturing evidence.
      </h2>
      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
        Captures need one student from your roster. Start with a name and handle,
        then come back here for your first student-specific capture.
      </p>
      <Button asChild className="mt-4 h-9 rounded-lg px-5 text-sm font-semibold">
        <Link href={routes.roster}>Set up roster</Link>
      </Button>
    </section>
  );
}

function studentResolutionErrorMessage(
  resolution: CaptureStudentResolution
): string {
  if (resolution.status === "no_student_mentioned") {
    return "Mention one student from your roster before saving this edit.";
  }

  if (resolution.status === "multiple_students") {
    return "Choose one student for this V1 capture before saving this edit.";
  }

  if (resolution.status === "unresolved_student") {
    return "This edit was not saved because a mentioned student is not on your roster yet.";
  }

  return "";
}

export function EvidenceFeed({
  rosterStudents,
  initialEvidenceRecords,
}: EvidenceFeedProps) {
  const router = useRouter();
  const [draftItems, setDraftItems] = useState<FeedItem[]>([]);
  const [filter, setFilter] = useState<InboxFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [captureEditError, setCaptureEditError] = useState("");
  const [hiddenSavedEvidenceIds, setHiddenSavedEvidenceIds] = useState<
    Set<string>
  >(() => new Set());
  const rosterSetupNeeded = rosterStudents.length === 0;

  const summaryItems = useMemo(
    () =>
      draftItems.map((item) => ({
        draft: item.draft,
        validation: item.validation,
      })),
    [draftItems]
  );

  const savedEvidenceIds = useMemo(
    () => new Set(initialEvidenceRecords.map((record) => record.id)),
    [initialEvidenceRecords]
  );

  const visibleDraftItems = useMemo(() => {
    let result = draftItems.filter(
      (item) =>
        !(
          item.validation?.status === "validated" &&
          item.validation.savedEvidenceId &&
          (savedEvidenceIds.has(item.validation.savedEvidenceId) ||
            hiddenSavedEvidenceIds.has(item.validation.savedEvidenceId))
        )
    );

    if (filter === "validated") {
      result = result.filter(isValidated);
    } else if (filter === "needs_review") {
      result = result.filter((item) => needsReview(item, rosterStudents));
    }

    if (searchQuery.trim()) {
      result = result.filter((item) =>
        captureMatchesSearch(item, searchQuery, rosterStudents)
      );
    }

    return result;
  }, [
    draftItems,
    filter,
    searchQuery,
    rosterStudents,
    savedEvidenceIds,
    hiddenSavedEvidenceIds,
  ]);

  const visibleEvidenceRecords = useMemo(() => {
    if (filter === "needs_review") {
      return [];
    }

    if (searchQuery.trim()) {
      return initialEvidenceRecords.filter((record) =>
        evidenceRecordMatchesSearch(record, searchQuery)
      );
    }

    return initialEvidenceRecords;
  }, [filter, initialEvidenceRecords, searchQuery]);

  const hasAnyFeedItems =
    draftItems.length > 0 || initialEvidenceRecords.length > 0;
  const hasVisibleFeedItems =
    visibleDraftItems.length > 0 || visibleEvidenceRecords.length > 0;

  function handleDraft(draft: NoteDraft) {
    const resolution = resolveCaptureStudents(
      draft.parsed.mentions,
      rosterStudents
    );

    if (resolution.status !== "resolved_one_student") {
      handleInvalidCaptureEdit(resolution);
      return;
    }

    setCaptureEditError("");
    setDraftItems((current) => {
      const newItem: FeedItem = {
        id: crypto.randomUUID(),
        draft,
        timestamp: "Just now",
        timestampMs: Date.now(),
      };
      return [newItem, ...current];
    });
  }

  function handleInvalidCaptureEdit(resolution: CaptureStudentResolution): void {
    setCaptureEditError(studentResolutionErrorMessage(resolution));
  }

  async function handleValidate(
    id: string,
    fields: InterpretationFields,
    saveInput: SaveValidatedEvidenceActionInput
  ): Promise<SaveValidatedEvidenceActionResult> {
    setCaptureEditError("");
    const result = await saveValidatedEvidence(saveInput);

    if (!result.success) {
      return result;
    }

    setDraftItems((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              validation: {
                status: "validated" as const,
                fields,
                validatedAt: Date.now(),
                savedEvidenceId: result.evidenceId,
                savedAt: Date.now(),
              },
            }
          : item
      )
    );
    router.refresh();
    return result;
  }

  function handleEditCapture(id: string, rawNote: string): boolean {
    const trimmed = rawNote.trim();
    if (!trimmed) {
      return false;
    }

    const nextDraft = buildNoteDraft(trimmed);
    const resolution = resolveCaptureStudents(
      nextDraft.parsed.mentions,
      rosterStudents
    );

    if (resolution.status !== "resolved_one_student") {
      handleInvalidCaptureEdit(resolution);
      return false;
    }

    setCaptureEditError("");
    setDraftItems((current) =>
      current.map((item) => {
        if (item.id !== id) {
          return item;
        }

        const rawChanged = trimmed !== item.draft.parsed.rawNote;

        return {
          ...item,
          draft: nextDraft,
          validation: rawChanged ? undefined : item.validation,
        };
      })
    );
    return true;
  }

  function handleDeleteCapture(id: string) {
    setCaptureEditError("");
    setDraftItems((current) => current.filter((item) => item.id !== id));
  }

  function handleSavedEvidenceHidden(evidenceId: string): void {
    setHiddenSavedEvidenceIds((current) => {
      const next = new Set(current);
      next.add(evidenceId);
      return next;
    });
  }

  function renderFeedList() {
    if (rosterSetupNeeded) {
      return (
        <p className="px-6 py-10 text-center text-sm text-muted-foreground">
          Your evidence feed will start here after roster setup.
        </p>
      );
    }

    if (!hasAnyFeedItems) {
      return (
        <p className="px-6 py-10 text-center text-sm text-muted-foreground">
          No validated evidence yet. Capture a student-specific note, review it,
          and saved evidence will appear here.
        </p>
      );
    }

    if (!hasVisibleFeedItems) {
      if (searchQuery.trim()) {
        return (
          <p className="px-6 py-10 text-center text-sm text-muted-foreground">
            No evidence matches your search.
          </p>
        );
      }

      return <FilterEmptyMessage filter={filter} />;
    }

    return (
      <>
        {visibleDraftItems.map((item) => (
          <EvidenceCaptureCard
            key={item.id}
            draft={item.draft}
            timestamp={item.timestamp}
            validation={item.validation}
            rosterStudents={rosterStudents}
            onValidate={(fields, saveInput) =>
              handleValidate(item.id, fields, saveInput)
            }
            onEdit={(rawNote) => handleEditCapture(item.id, rawNote)}
            onDelete={() => handleDeleteCapture(item.id)}
          />
        ))}
        {visibleEvidenceRecords.map((record) => (
          <SavedEvidenceRow
            key={record.id}
            record={record}
            onArchived={handleSavedEvidenceHidden}
            onDeleted={handleSavedEvidenceHidden}
          />
        ))}
      </>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-[1560px] flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row lg:items-start lg:px-8">
      <div className="min-w-0 flex-1 space-y-6">
        <EvidenceFeedHeader />
        {rosterSetupNeeded ? (
          <RosterRequiredState />
        ) : (
          <QuickCaptureCard
            rosterStudents={rosterStudents}
            onDraft={handleDraft}
          />
        )}

        <section className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-5">
              <RecentCapturesLabel />
              <button
                type="button"
                className="inline-flex items-center gap-2 text-sm font-medium text-foreground"
              >
                <ArrowDownUp className="size-4 text-muted-foreground" />
                Newest
              </button>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <EvidenceSearchControl
                query={searchQuery}
                onQueryChange={setSearchQuery}
              />
            </div>
          </div>

          <InboxFilterControl filter={filter} onFilterChange={setFilter} />

          {captureEditError ? (
            <p className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm text-destructive">
              {captureEditError}
            </p>
          ) : null}

          <div className="overflow-hidden rounded-card border border-border bg-card shadow-paper">
            {renderFeedList()}
          </div>
        </section>
      </div>

      <ClassTraceNoticedPanel
        items={summaryItems}
        rosterStudents={rosterStudents}
        evidenceRecords={initialEvidenceRecords}
      />
    </div>
  );
}

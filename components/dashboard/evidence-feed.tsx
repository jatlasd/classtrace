"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  saveValidatedEvidence,
  type SaveValidatedEvidenceActionInput,
  type SaveValidatedEvidenceActionResult,
} from "@/actions/evidence";
import { createRosterStudent } from "@/actions/roster";
import { EvidenceCaptureCard } from "@/components/dashboard/evidence-capture-card";
import type {
  CreateStudentFromReviewInput,
  CreateStudentFromReviewResult,
  StudentResolutionClassOption,
} from "@/components/dashboard/student-resolution-field";
import {
  EvidenceSearchControl,
  FeedEmptyState,
  FilterEmptyMessage,
  InboxFilterControl,
  RosterRequiredState,
  type InboxFilter,
} from "@/components/dashboard/evidence-feed-controls";
import {
  EvidenceFeedHeader,
  RecentCapturesLabel,
} from "@/components/dashboard/evidence-feed-header";
import { QuickCaptureCard } from "@/components/dashboard/quick-capture-card";
import { SavedEvidenceRow } from "@/components/dashboard/saved-evidence-row";
import { Button } from "@/components/ui/button";
import type { InterpretationFields } from "@/lib/evidence/capture-validation";
import {
  captureMatchesSearch,
  evidenceRecordMatchesSearch,
  isValidated,
  needsReview,
  type FeedItem,
} from "@/lib/evidence/evidence-feed-filtering";
import type { EvidenceFeedRecord } from "@/lib/evidence/evidence-feed-records";
import { formatTagLabel } from "@/lib/format-tag";
import {
  isCurrentLocalDay,
  loadSessionDrafts,
  nextLocalMidnight,
  removeSessionDraft,
  saveSessionDrafts,
  upsertSessionDraft,
  type SessionDraftStorage,
} from "@/lib/evidence/session-draft-storage";
import {
  loadPhotoDraft,
  pruneExpiredPhotoDrafts,
  removePhotoDraft,
  savePhotoDraft,
  type PhotoDraft,
} from "@/lib/evidence/photo-draft-storage";
import { buildNoteDraft, type NoteDraft } from "@/lib/note-processing";
import { routes } from "@/lib/routes";
import {
  resolveCaptureStudents,
  type CaptureRosterStudent,
  type CaptureStudentResolution,
} from "@/lib/students/resolve-capture-students";
import { ArrowDownUp, CheckCircle2, Tags, UserRound } from "lucide-react";

type EvidenceFeedProps = {
  workspaceId: string;
  workspaceCreatedAt: string;
  rosterStudents: CaptureRosterStudent[];
  classGroups: StudentResolutionClassOption[];
  initialEvidenceRecords: EvidenceFeedRecord[];
  evidencePage: number;
  hasNewerEvidence: boolean;
  hasOlderEvidence: boolean;
  initialFilter: string;
  initialSearchQuery: string;
};

type DraftFeedItem = FeedItem & {
  reviewOpen: boolean;
  photo?: PhotoDraft;
  photoRecoveryWarning?: string;
};

type BlockedCaptureStudentResolution = Extract<
  CaptureStudentResolution,
  { status: "no_student_mentioned" | "multiple_students" }
>;

const EMPTY_FEED_ITEMS: DraftFeedItem[] = [];

function normalizeInboxFilter(value: string): InboxFilter {
  return value === "needs_review" || value === "validated" ? value : "all";
}

function feedItemCountLabel(count: number): string {
  return count === 1 ? "1 item showing" : `${count} items showing`;
}

function formatSessionDraftTimestamp(timestampMs: number): string {
  const capturedAt = new Date(timestampMs);
  const ageMs = Date.now() - timestampMs;

  if (ageMs >= 0 && ageMs < 60_000) {
    return "Just now";
  }

  return `Today at ${capturedAt.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  })}`;
}

function getBrowserSessionStorage(): SessionDraftStorage | null {
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

function studentResolutionErrorMessage(
  resolution: BlockedCaptureStudentResolution
): string {
  if (resolution.status === "no_student_mentioned") {
    return "Mention one student before saving this edit.";
  }

  return "Choose one student for this capture before saving this edit.";
}

function EvidenceFeedRail({
  students,
  tags,
  draftCount,
  onTagSelect,
}: {
  students: CaptureRosterStudent[];
  tags: string[];
  draftCount: number;
  onTagSelect: (tag: string) => void;
}) {
  return (
    <aside aria-label="Feed context" className="hidden space-y-3 xl:block">
      <section className="overflow-hidden rounded-card border border-border bg-card shadow-surface">
        <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
          <h2 className="text-sm font-semibold text-foreground">Students</h2>
          <span className="text-xs tabular-nums text-muted-foreground">
            {students.length}
          </span>
        </div>
        <ul>
          {students.slice(0, 5).map((student) => (
            <li key={student.id} className="border-b border-border/70 last:border-b-0">
              <Link
                href={routes.student(student.id)}
                className="flex min-h-14 items-center gap-3 px-4 py-2.5 outline-none transition-colors hover:bg-muted/35 focus-visible:bg-muted/35 focus-visible:ring-3 focus-visible:ring-ring/20"
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-secondary text-secondary-foreground">
                  <UserRound aria-hidden="true" className="size-4" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-foreground">
                    {student.displayName}
                  </span>
                  <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                    {student.classGroupName ?? `@${student.mentionHandle}`}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <Link
          href={routes.roster}
          className="flex min-h-10 items-center px-4 text-xs font-medium text-link outline-none transition-colors hover:bg-muted/35 hover:underline focus-visible:ring-3 focus-visible:ring-ring/20"
        >
          View all students
        </Link>
      </section>

      <section className="rounded-card border border-border bg-card px-4 py-3 shadow-surface">
        <div className="flex items-center gap-2">
          <Tags aria-hidden="true" className="size-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold text-foreground">Recent tags</h2>
        </div>
        {tags.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => onTagSelect(tag)}
                className="rounded-md border border-border bg-muted/50 px-2 py-1 text-xs font-medium text-link outline-none transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/20"
              >
                {formatTagLabel(tag)}
              </button>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            Tags from saved evidence will appear here.
          </p>
        )}
      </section>

      <section className="rounded-card border border-border bg-card px-4 py-3 shadow-surface">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-foreground">Draft review</h2>
          <span className="rounded-md bg-accent px-2 py-1 text-xs font-semibold tabular-nums text-accent-foreground">
            {draftCount}
          </span>
        </div>
        <ul className="mt-3 space-y-2.5">
          {[
            "One roster student",
            "Evidence note, photo, or both",
            "Teacher review before save",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
              <CheckCircle2
                aria-hidden="true"
                className="mt-0.5 size-3.5 shrink-0 text-validated-foreground"
              />
              {item}
            </li>
          ))}
        </ul>
      </section>
    </aside>
  );
}

export function EvidenceFeed({
  workspaceId,
  workspaceCreatedAt,
  rosterStudents,
  classGroups,
  initialEvidenceRecords,
  evidencePage,
  hasNewerEvidence,
  hasOlderEvidence,
  initialFilter,
  initialSearchQuery,
}: EvidenceFeedProps) {
  const router = useRouter();
  const [draftItems, setDraftItems] = useState<DraftFeedItem[]>([]);
  const [locallyCreatedRosterStudents, setLocallyCreatedRosterStudents] =
    useState<CaptureRosterStudent[]>([]);
  const [hydratedWorkspaceId, setHydratedWorkspaceId] = useState<string | null>(
    null
  );
  const sessionStorageRef = useRef<SessionDraftStorage | null>(null);
  const [filter, setFilter] = useState<InboxFilter>(() =>
    normalizeInboxFilter(initialFilter)
  );
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [captureEditError, setCaptureEditError] = useState("");
  const captureEditErrorRef = useRef<HTMLParagraphElement | null>(null);
  const [composerFocusRequestKey, setComposerFocusRequestKey] = useState(0);
  const [hiddenSavedEvidenceIds, setHiddenSavedEvidenceIds] = useState<
    Set<string>
  >(() => new Set());
  const sessionDraftsReady = hydratedWorkspaceId === workspaceId;
  const activeDraftItems = sessionDraftsReady ? draftItems : EMPTY_FEED_ITEMS;
  const activeRosterStudents = useMemo(() => {
    const studentsById = new Map(
      [...rosterStudents, ...locallyCreatedRosterStudents].map((student) => [
        student.id,
        student,
      ])
    );

    return [...studentsById.values()].sort((left, right) =>
      left.displayName.localeCompare(right.displayName)
    );
  }, [locallyCreatedRosterStudents, rosterStudents]);
  const rosterSetupNeeded = activeRosterStudents.length === 0;

  useEffect(() => {
    const storage = getBrowserSessionStorage();
    sessionStorageRef.current = storage;
    let cancelled = false;
    const hydrationTimer = window.setTimeout(async () => {
      const restored = loadSessionDrafts(storage, workspaceId);
      const restoredItems = await Promise.all(
        restored.drafts.map(async (sessionDraft) => {
          const photo = sessionDraft.hasPhoto
            ? await loadPhotoDraft(workspaceId, sessionDraft.id)
            : null;
          return {
            id: sessionDraft.id,
            draft: buildNoteDraft(sessionDraft.rawNote),
            timestamp: formatSessionDraftTimestamp(sessionDraft.capturedAt),
            timestampMs: sessionDraft.capturedAt,
            reviewOpen: false,
            photo: photo ?? undefined,
            photoRecoveryWarning:
              sessionDraft.hasPhoto && !photo && sessionDraft.rawNote.trim()
                ? "The draft photo could not be restored. Choose it again before saving."
                : undefined,
          } satisfies DraftFeedItem;
        })
      );
      const usableItems = restoredItems
        .filter((item) => item.draft.parsed.rawNote.trim() || item.photo)
        .sort((a, b) => b.timestampMs - a.timestampMs);
      await pruneExpiredPhotoDrafts();
      if (cancelled) return;
      setDraftItems(usableItems);
      setHydratedWorkspaceId(workspaceId);
    }, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(hydrationTimer);
    };
  }, [workspaceId]);

  useEffect(() => {
    if (!sessionDraftsReady) {
      return;
    }

    saveSessionDrafts(
      sessionStorageRef.current,
      workspaceId,
      draftItems
        .filter((item) => !isValidated(item))
        .map((item) => ({
          id: item.id,
          rawNote: item.draft.parsed.rawNote,
          capturedAt: item.timestampMs,
          hasPhoto: Boolean(item.photo),
        }))
    );
  }, [draftItems, sessionDraftsReady, workspaceId]);

  useEffect(() => {
    if (!sessionDraftsReady) {
      return;
    }

    const storage = sessionStorageRef.current;
    let midnightTimer: number | undefined;

    function purgeExpiredDrafts(): void {
      const now = Date.now();
      loadSessionDrafts(storage, workspaceId, now);
      setDraftItems((current) => {
        const active = current.filter(
          (item) => isValidated(item) || isCurrentLocalDay(item.timestampMs, now)
        );
        void pruneExpiredPhotoDrafts(now);
        return active;
      });
    }

    function scheduleMidnightPurge(): void {
      const now = Date.now();
      const delay = Math.max(0, nextLocalMidnight(now) - now + 50);
      midnightTimer = window.setTimeout(() => {
        purgeExpiredDrafts();
        scheduleMidnightPurge();
      }, delay);
    }

    function handleVisibilityChange(): void {
      if (document.visibilityState === "visible") {
        purgeExpiredDrafts();
      }
    }

    window.addEventListener("focus", purgeExpiredDrafts);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    scheduleMidnightPurge();

    return () => {
      if (midnightTimer !== undefined) {
        window.clearTimeout(midnightTimer);
      }
      window.removeEventListener("focus", purgeExpiredDrafts);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [sessionDraftsReady, workspaceId]);

  useEffect(() => {
    function syncFeedStateFromUrl(): void {
      const params = new URLSearchParams(window.location.search);
      setSearchQuery(params.get("q") ?? "");
      setFilter(normalizeInboxFilter(params.get("filter") ?? ""));
    }

    window.addEventListener("popstate", syncFeedStateFromUrl);
    return () => window.removeEventListener("popstate", syncFeedStateFromUrl);
  }, []);

  useEffect(() => {
    if (captureEditError) {
      captureEditErrorRef.current?.focus();
    }
  }, [captureEditError]);

  const savedEvidenceIds = useMemo(
    () => new Set(initialEvidenceRecords.map((record) => record.id)),
    [initialEvidenceRecords]
  );

  const visibleDraftItems = useMemo(() => {
    let result = activeDraftItems.filter(
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
      result = result.filter(needsReview);
    }

    if (searchQuery.trim()) {
      result = result.filter((item) =>
        captureMatchesSearch(item, searchQuery, activeRosterStudents)
      );
    }

    return result;
  }, [
    activeDraftItems,
    filter,
    searchQuery,
    activeRosterStudents,
    savedEvidenceIds,
    hiddenSavedEvidenceIds,
  ]);

  const visibleEvidenceRecords = useMemo(() => {
    if (filter === "needs_review") {
      return [];
    }

    const activeEvidenceRecords = initialEvidenceRecords.filter(
      (record) => !hiddenSavedEvidenceIds.has(record.id)
    );

    if (searchQuery.trim()) {
      return activeEvidenceRecords.filter((record) =>
        evidenceRecordMatchesSearch(record, searchQuery)
      );
    }

    return activeEvidenceRecords;
  }, [filter, hiddenSavedEvidenceIds, initialEvidenceRecords, searchQuery]);

  const recentTags = useMemo(
    () =>
      [...new Set(initialEvidenceRecords.flatMap((record) => record.tags))].slice(
        0,
        8
      ),
    [initialEvidenceRecords]
  );

  const hasAnyFeedItems =
    activeDraftItems.length > 0 || initialEvidenceRecords.length > 0;
  const visibleFeedItemCount =
    visibleDraftItems.length + visibleEvidenceRecords.length;
  const hasVisibleFeedItems = visibleFeedItemCount > 0;

  async function handleDraft(
    draft: NoteDraft,
    identity: { id: string; capturedAt: number },
    photo?: PhotoDraft
  ): Promise<void> {
    const resolution = resolveCaptureStudents(
      draft.parsed.mentions,
      activeRosterStudents
    );

    if (
      resolution.status !== "resolved_one_student" &&
      resolution.status !== "unresolved_student" &&
      !(photo && resolution.status === "no_student_mentioned")
    ) {
      handleInvalidCaptureEdit(resolution);
      return;
    }

    setCaptureEditError("");
    const newItem: DraftFeedItem = {
      id: identity.id,
      draft,
      timestamp: "Just now",
      timestampMs: identity.capturedAt,
      reviewOpen: false,
      photo,
    };
    const photoStored = photo
      ? await savePhotoDraft({
          workspaceId,
          draftId: identity.id,
          expiresAt: nextLocalMidnight(identity.capturedAt),
          photo,
        })
      : true;
    if (!photoStored) {
      newItem.photoRecoveryWarning =
        "This photo is available now but cannot be recovered after a refresh.";
    }
    upsertSessionDraft(sessionStorageRef.current, workspaceId, {
      id: newItem.id,
      rawNote: draft.parsed.rawNote,
      capturedAt: identity.capturedAt,
      hasPhoto: Boolean(photo),
    });
    setDraftItems((current) => [newItem, ...current]);
  }

  function handleInvalidCaptureEdit(
    resolution: BlockedCaptureStudentResolution
  ): void {
    setCaptureEditError(studentResolutionErrorMessage(resolution));
  }

  async function handleCreateStudent(
    input: CreateStudentFromReviewInput
  ): Promise<CreateStudentFromReviewResult> {
    const result = await createRosterStudent(input);
    if (!result.success) {
      return result;
    }

    const student: CaptureRosterStudent = {
      id: result.student.id,
      displayName: result.student.displayName,
      mentionHandle: result.student.mentionHandle,
      classGroupName: result.student.classGroupName,
    };

    setLocallyCreatedRosterStudents((current) =>
      current.some((candidate) => candidate.id === student.id)
        ? current
        : [...current, student]
    );

    return { success: true, student };
  }

  async function handleValidate(
    id: string,
    fields: InterpretationFields,
    saveInput: SaveValidatedEvidenceActionInput
  ): Promise<SaveValidatedEvidenceActionResult> {
    setCaptureEditError("");
    const item = draftItems.find((candidate) => candidate.id === id);
    const formData = new FormData();
    formData.set("evidence", JSON.stringify(saveInput));
    if (item?.photo) {
      formData.set("photo", item.photo.blob);
    }
    const result = await saveValidatedEvidence(formData);

    if (!result.success) {
      return result;
    }

    removeSessionDraft(sessionStorageRef.current, workspaceId, id);
    await removePhotoDraft(workspaceId, id);

    setDraftItems((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              validation: {
                status: "validated" as const,
                fields,
                evidenceNote: saveInput.evidenceNote,
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
      activeRosterStudents
    );

    if (
      resolution.status !== "resolved_one_student" &&
      resolution.status !== "unresolved_student"
    ) {
      handleInvalidCaptureEdit(resolution);
      return false;
    }

    setCaptureEditError("");
    const currentItem = draftItems.find((item) => item.id === id);
    if (currentItem) {
      upsertSessionDraft(sessionStorageRef.current, workspaceId, {
        id,
        rawNote: nextDraft.parsed.rawNote,
        capturedAt: currentItem.timestampMs,
        hasPhoto: Boolean(currentItem.photo),
      });
    }
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
    removeSessionDraft(sessionStorageRef.current, workspaceId, id);
    void removePhotoDraft(workspaceId, id);
    setDraftItems((current) => current.filter((item) => item.id !== id));
  }

  async function handlePhotoChanged(id: string, photo: PhotoDraft): Promise<void> {
    const item = draftItems.find((candidate) => candidate.id === id);
    if (!item) return;
    const stored = await savePhotoDraft({
      workspaceId,
      draftId: id,
      expiresAt: nextLocalMidnight(item.timestampMs),
      photo,
    });
    setDraftItems((current) =>
      current.map((candidate) =>
        candidate.id === id
          ? {
              ...candidate,
              photo,
              photoRecoveryWarning: stored
                ? undefined
                : "This photo is available now but cannot be recovered after a refresh.",
            }
          : candidate
      )
    );
  }

  function handlePhotoRemoved(id: string): void {
    void removePhotoDraft(workspaceId, id);
    setDraftItems((current) =>
      current
        .map((candidate) =>
          candidate.id === id
            ? { ...candidate, photo: undefined, photoRecoveryWarning: undefined }
            : candidate
        )
        .filter(
          (candidate) =>
            candidate.id !== id || candidate.draft.parsed.rawNote.trim().length > 0
        )
    );
  }

  function handleReviewOpenChange(id: string, reviewOpen: boolean): void {
    setDraftItems((current) =>
      current.map((item) =>
        item.id === id ? { ...item, reviewOpen } : item
      )
    );
  }

  function handleSavedEvidenceHidden(evidenceId: string): void {
    setHiddenSavedEvidenceIds((current) => {
      const next = new Set(current);
      next.add(evidenceId);
      return next;
    });
  }

  function updateFeedUrl(
    nextQuery: string,
    nextFilter: InboxFilter,
    mode: "push" | "replace"
  ): void {
    const params = new URLSearchParams(window.location.search);

    if (nextQuery.trim()) {
      params.set("q", nextQuery);
    } else {
      params.delete("q");
    }

    if (nextFilter === "all") {
      params.delete("filter");
    } else {
      params.set("filter", nextFilter);
    }

    const href = `${window.location.pathname}${params.size ? `?${params}` : ""}`;
    window.history[mode === "push" ? "pushState" : "replaceState"](
      null,
      "",
      href
    );
  }

  function handleSearchQueryChange(query: string): void {
    setSearchQuery(query);
    updateFeedUrl(query, filter, "replace");
  }

  function handleFilterChange(nextFilter: InboxFilter): void {
    setFilter(nextFilter);
    updateFeedUrl(searchQuery, nextFilter, "push");
  }

  function handleTagSelect(tag: string): void {
    handleSearchQueryChange(formatTagLabel(tag));
  }

  function evidencePageHref(page: number): string {
    const params = new URLSearchParams();
    if (page > 1) params.set("page", String(page));
    if (filter !== "all") params.set("filter", filter);
    if (searchQuery.trim()) params.set("q", searchQuery);
    return `${routes.feed}${params.size ? `?${params}` : ""}`;
  }

  function renderFeedList() {
    if (rosterSetupNeeded) {
      return (
        <FeedEmptyState
          title="Roster setup comes first"
          body="Add one active student to keep every capture attached to exactly one roster record."
          action={
            <Button asChild variant="outline" size="sm">
              <Link href={routes.roster}>Set up roster</Link>
            </Button>
          }
        />
      );
    }

    if (!hasAnyFeedItems) {
      return (
        <FeedEmptyState
          title="No evidence in the inbox yet"
          body="Drafts stay in this tab until you save or delete them, and are cleared at midnight. Saved evidence stays in your evidence records."
        />
      );
    }

    if (!hasVisibleFeedItems) {
      if (searchQuery.trim()) {
        return (
          <FeedEmptyState
            title="No evidence on this page matches"
            body="Try another term or move to a newer or older evidence page."
          />
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
            capturedAt={item.timestampMs}
            workspaceCreatedAt={workspaceCreatedAt}
            validation={item.validation}
            rosterStudents={activeRosterStudents}
            classGroups={classGroups}
            onValidate={(fields, saveInput) =>
              handleValidate(item.id, fields, saveInput)
            }
            onCreateStudent={handleCreateStudent}
            photo={item.photo}
            photoRecoveryWarning={item.photoRecoveryWarning}
            onPhotoChange={(photo) => handlePhotoChanged(item.id, photo)}
            onPhotoRemove={() => handlePhotoRemoved(item.id)}
            onEdit={(rawNote) => handleEditCapture(item.id, rawNote)}
            onDelete={() => handleDeleteCapture(item.id)}
            reviewOpen={item.reviewOpen}
            onReviewOpenChange={(reviewOpen) =>
              handleReviewOpenChange(item.id, reviewOpen)
            }
            onCaptureAnother={() =>
              setComposerFocusRequestKey((current) => current + 1)
            }
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
    <div className="mx-auto w-full max-w-[1560px] px-3 py-3 sm:px-4 lg:px-5 lg:py-4">
      <EvidenceFeedHeader />

      <div className="grid items-start gap-3 xl:grid-cols-[minmax(0,1fr)_16.5rem]">
        <div className="min-w-0 space-y-3">
          <section aria-label="Capture desk">
            {rosterSetupNeeded ? (
              <RosterRequiredState />
            ) : (
              <QuickCaptureCard
                rosterStudents={activeRosterStudents}
                focusRequestKey={composerFocusRequestKey}
                onDraft={handleDraft}
              />
            )}
          </section>

          <section
            className="min-w-0 overflow-hidden rounded-card border border-border bg-card shadow-surface"
            aria-labelledby="evidence-inbox-heading"
          >
            <div className="space-y-3 border-b border-border bg-card px-3 py-3 sm:px-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="min-w-0">
                  <RecentCapturesLabel />
                  <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs leading-relaxed text-muted-foreground">
                    <span>
                      {hasVisibleFeedItems
                        ? feedItemCountLabel(visibleFeedItemCount)
                        : "Drafts and saved evidence will appear here."}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="inline-flex items-center gap-1.5">
                      <ArrowDownUp aria-hidden="true" className="size-3.5" />
                      Newest first
                    </span>
                  </p>
                </div>
                <EvidenceSearchControl
                  query={searchQuery}
                  onQueryChange={handleSearchQueryChange}
                />
              </div>

              <InboxFilterControl
                filter={filter}
                onFilterChange={handleFilterChange}
              />
            </div>

            {captureEditError ? (
              <p
                ref={captureEditErrorRef}
                role="alert"
                tabIndex={-1}
                className="border-b border-border bg-muted/30 px-4 py-3 text-sm text-destructive outline-none focus-visible:ring-3 focus-visible:ring-ring/30 sm:px-6"
              >
                {captureEditError}
              </p>
            ) : null}

            <div>
              {renderFeedList()}
              {filter !== "needs_review" &&
              (hasNewerEvidence || hasOlderEvidence) ? (
                <nav
                  aria-label="Evidence pages"
                  className="flex items-center justify-between gap-3 border-t border-border px-4 py-4 sm:px-6"
                >
                  <div>
                    {hasNewerEvidence ? (
                      <Button asChild variant="outline" size="sm">
                        <Link href={evidencePageHref(evidencePage - 1)}>
                          Newer evidence
                        </Link>
                      </Button>
                    ) : null}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Page {evidencePage}
                  </p>
                  <div>
                    {hasOlderEvidence ? (
                      <Button asChild variant="outline" size="sm">
                        <Link href={evidencePageHref(evidencePage + 1)}>
                          Older evidence
                        </Link>
                      </Button>
                    ) : null}
                  </div>
                </nav>
              ) : null}
            </div>
          </section>
        </div>

        <EvidenceFeedRail
          students={activeRosterStudents}
          tags={recentTags}
          draftCount={activeDraftItems.filter(needsReview).length}
          onTagSelect={handleTagSelect}
        />
      </div>
    </div>
  );
}

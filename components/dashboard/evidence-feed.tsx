"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
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
  photoMissing?: boolean;
  photoRecoveryWarning?: string;
};

type BlockedCaptureStudentResolution = Extract<
  CaptureStudentResolution,
  { status: "no_student_mentioned" | "multiple_students" }
>;

const EMPTY_FEED_ITEMS: DraftFeedItem[] = [];

function formatEvidenceDay(value: string, relative: boolean): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently";
  if (relative) {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const dayKey = (day: Date) => `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, "0")}-${String(day.getDate()).padStart(2, "0")}`;
    if (value.slice(0, 10) === dayKey(today)) return "Today";
    if (value.slice(0, 10) === dayKey(yesterday)) return "Yesterday";
  }
  return new Intl.DateTimeFormat("en", {
    month: "long", day: "numeric", year: "numeric", timeZone: "UTC",
  }).format(date);
}

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
            photoMissing: sessionDraft.hasPhoto && !photo,
            photoRecoveryWarning:
              sessionDraft.hasPhoto && !photo
                ? "The draft photo could not be restored. Choose it again before saving."
                : undefined,
          } satisfies DraftFeedItem;
        })
      );
      const usableItems = restoredItems
        .filter(
          (item) =>
            item.draft.parsed.rawNote.trim() || item.photo || item.photoMissing
        )
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
          hasPhoto: Boolean(item.photo) || Boolean(item.photoMissing),
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
    saveInput: SaveValidatedEvidenceActionInput,
    reviewedPhoto?: PhotoDraft
  ): Promise<SaveValidatedEvidenceActionResult> {
    setCaptureEditError("");
    const formData = new FormData();
    formData.set("evidence", JSON.stringify(saveInput));
    if (reviewedPhoto) {
      formData.set("photo", reviewedPhoto.blob);
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
              photoMissing: false,
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
            ? {
                ...candidate,
                photo: undefined,
                photoMissing: false,
                photoRecoveryWarning: undefined,
              }
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
            <Button asChild variant="outline" size="sm" className="rounded-full">
              <Link href={routes.roster}>Set up roster</Link>
            </Button>
          }
        />
      );
    }

    if (!hasAnyFeedItems) {
      return (
        <FeedEmptyState
          title="Nothing here yet"
          body="Drafts stay in this browser until you save or delete them, and clear at midnight. Saved evidence stays in the student's trace."
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
      <div className="space-y-3">
        {visibleDraftItems.length > 0 ? (
          <h3 className="flex items-baseline gap-3 pb-1">
            <span className="label flex items-center gap-2 text-live">
              <span aria-hidden="true" className="size-1.5 rounded-full bg-live-bright" />
              Drafts
            </span>
            <span className="font-mono text-sm tabular-nums text-fg-3">
              {visibleDraftItems.filter(needsReview).length} need review
            </span>
          </h3>
        ) : null}
        {visibleDraftItems.map((item) => (
          <div key={item.id}>
            <EvidenceCaptureCard
              draft={item.draft}
              timestamp={item.timestamp}
              capturedAt={item.timestampMs}
              workspaceCreatedAt={workspaceCreatedAt}
              validation={item.validation}
              rosterStudents={activeRosterStudents}
              classGroups={classGroups}
              onValidate={(fields, saveInput, reviewedPhoto) =>
                handleValidate(item.id, fields, saveInput, reviewedPhoto)
              }
              onCreateStudent={handleCreateStudent}
              photo={item.photo}
              photoMissing={item.photoMissing}
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
          </div>
        ))}
        {visibleEvidenceRecords.length > 0 ? (
          <div className={visibleDraftItems.length > 0 ? "pt-6" : ""}>
            {visibleEvidenceRecords.map((record, index) => {
              const newDay =
                index === 0 ||
                record.evidenceDate.slice(0, 10) !==
                  visibleEvidenceRecords[index - 1].evidenceDate.slice(0, 10);
              return (
                <Fragment key={record.id}>
                  {newDay ? (
                    <h3 className={`sticky top-14 z-10 -mx-4 bg-base/95 px-4 py-2 backdrop-blur sm:-mx-6 sm:px-6 lg:top-[4.5rem] ${index === 0 ? "" : "mt-4"}`}>
                      <time dateTime={record.evidenceDate} className="font-display text-[1.1rem] font-semibold text-fg-2">
                        {formatEvidenceDay(record.evidenceDate, sessionDraftsReady)}
                      </time>
                    </h3>
                  ) : null}
                  <div className="trace">
                    <SavedEvidenceRow
                      record={record}
                      onDeleted={handleSavedEvidenceHidden}
                    />
                  </div>
                </Fragment>
              );
            })}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="evidence-journal mx-auto w-full max-w-[880px] px-4 py-5 sm:px-6 sm:py-7 lg:px-8 lg:py-9">
      <EvidenceFeedHeader />

      <section aria-label="Capture desk" className="min-w-0">
        {rosterSetupNeeded ? (
          <RosterRequiredState />
        ) : (
          <QuickCaptureCard
            rosterStudents={activeRosterStudents}
            focusRequestKey={composerFocusRequestKey}
            disabled={!sessionDraftsReady}
            onDraft={handleDraft}
          />
        )}
      </section>

      <section
        className="mt-10 min-w-0 sm:mt-12"
        aria-labelledby="evidence-inbox-heading"
      >
        <div className="space-y-4 border-b border-line pb-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div className="min-w-0">
              <RecentCapturesLabel />
              <p className="label mt-2 text-fg-3">
                {hasVisibleFeedItems
                  ? feedItemCountLabel(visibleFeedItemCount)
                  : "Drafts and saved evidence will appear here."}
                <span aria-hidden="true"> · </span>
                Newest first
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
            className="mt-4 rounded-md border-l-2 border-danger bg-danger-soft px-4 py-3 text-sm text-danger outline-none focus-visible:ring-2 focus-visible:ring-live-bright focus-visible:ring-offset-2 focus-visible:ring-offset-base"
          >
            {captureEditError}
          </p>
        ) : null}

        <div className="pt-5">
          {renderFeedList()}
          {filter !== "needs_review" &&
          (hasNewerEvidence || hasOlderEvidence) ? (
            <nav
              aria-label="Evidence pages"
              className="mt-6 flex items-center justify-between gap-3 border-t border-line pt-4"
            >
              <div>
                {hasNewerEvidence ? (
                  <Button asChild variant="outline" size="sm" className="rounded-full">
                    <Link href={evidencePageHref(evidencePage - 1)}>
                      Newer evidence
                    </Link>
                  </Button>
                ) : null}
              </div>
              <p className="label text-fg-3">
                Page {evidencePage}
              </p>
              <div>
                {hasOlderEvidence ? (
                  <Button asChild variant="outline" size="sm" className="rounded-full">
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
  );
}

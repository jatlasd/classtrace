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
import {
  DraftReviewQueue,
  type DraftReviewQueueItem,
} from "@/components/dashboard/draft-review-queue";
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
import {
  resolveCaptureDisplay,
  validateSingleStudentForInterpretation,
  type InterpretationFields,
} from "@/lib/evidence/capture-validation";
import { evidenceRecordMatchesSearch } from "@/lib/evidence/evidence-feed-filtering";
import {
  evidenceCalendarDayKey,
  formatEvidenceDayLabel,
} from "@/lib/evidence/evidence-calendar-date";
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

type DraftFeedItem = {
  id: string;
  draft: NoteDraft;
  timestamp: string;
  timestampMs: number;
  detailsOpen: boolean;
  photo?: PhotoDraft;
  photoMissing?: boolean;
  photoRecoveryWarning?: string;
  resolvedStudent?: CaptureRosterStudent;
};

type FeedToast =
  | {
      id: number;
      kind: "draft";
      draftId: string;
      message: string;
    }
  | {
      id: number;
      kind: "saved";
      studentId: string;
      studentName: string;
      message: string;
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
  const [isDraftQueueOpen, setIsDraftQueueOpen] = useState(false);
  const [activeDraftId, setActiveDraftId] = useState<string | null>(null);
  const [toast, setToast] = useState<FeedToast | null>(null);
  const [hiddenSavedEvidenceIds, setHiddenSavedEvidenceIds] = useState<
    Set<string>
  >(() => new Set());
  const sessionDraftsReady = hydratedWorkspaceId === workspaceId;
  const evidenceTimeZone = sessionDraftsReady
    ? Intl.DateTimeFormat().resolvedOptions().timeZone
    : "UTC";
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
            detailsOpen: false,
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
      draftItems.map((item) => ({
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
        const active = current.filter((item) =>
          isCurrentLocalDay(item.timestampMs, now)
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

  useEffect(() => {
    if (!toast) return;

    const timer = window.setTimeout(() => setToast(null), 5000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const queueItems = useMemo<DraftReviewQueueItem[]>(
    () =>
      activeDraftItems.map((item) => {
        const rosterForDisplay = item.resolvedStudent
          ? activeRosterStudents.map((student) =>
              student.id === item.resolvedStudent?.id &&
              item.draft.parsed.mentions.length === 1
                ? {
                    ...student,
                    mentionHandle: item.draft.parsed.mentions[0],
                  }
                : student
            )
          : activeRosterStudents;
        const display = resolveCaptureDisplay(
          item.draft,
          undefined,
          rosterForDisplay
        );
        const studentValidation = validateSingleStudentForInterpretation(display);
        const studentLabel =
          studentValidation.status === "valid_one_student"
            ? studentValidation.studentName
            : studentValidation.status === "unresolved_student" &&
                studentValidation.studentNames.length === 1
              ? `@${studentValidation.studentNames[0]}`
              : "Student needed";
        const note = display.cleanText.trim() || "Photo evidence without a note.";
        const photoOnly = Boolean(item.photo) && !display.cleanText.trim();
        const needsCorrection =
          studentValidation.status !== "valid_one_student" ||
          Boolean(item.photoMissing) ||
          (!display.cleanText.trim() && !item.photo) ||
          (!photoOnly &&
            (!display.evidenceType.trim() || display.evidenceType === "Unclear"));
        const filing = photoOnly
          ? "Photo evidence"
          : [
              display.evidenceType,
              display.topic,
              display.performance,
              ...(display.behavior ?? []),
              ...display.tags.map((tag) => `#${tag.replace(/^#/, "")}`),
            ]
              .filter(Boolean)
              .join(" · ");

        return {
          id: item.id,
          studentLabel,
          note,
          filing,
          timestamp: item.timestamp,
          needsCorrection,
          hasPhoto: Boolean(item.photo) || Boolean(item.photoMissing),
        };
      }),
    [activeDraftItems, activeRosterStudents]
  );

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
  }, [
    filter,
    hiddenSavedEvidenceIds,
    initialEvidenceRecords,
    searchQuery,
  ]);

  const hasAnyFeedItems = initialEvidenceRecords.length > 0;
  const visibleFeedItemCount = visibleEvidenceRecords.length;
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
      detailsOpen: false,
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
    setIsDraftQueueOpen(false);
    setActiveDraftId(null);
    setToast({
      id: identity.capturedAt,
      kind: "draft",
      draftId: identity.id,
      message:
        resolution.status === "resolved_one_student"
          ? `Draft added for ${resolution.student.displayName}.`
          : resolution.status === "unresolved_student"
            ? `Draft added for @${resolution.unresolvedMentions[0]}.`
            : "Photo draft added.",
    });
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
    _fields: InterpretationFields,
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

    return result;
  }

  function handleSaveCompleted(
    id: string,
    result: Extract<SaveValidatedEvidenceActionResult, { success: true }>,
    fields: InterpretationFields,
    saveInput: SaveValidatedEvidenceActionInput
  ): void {
    const studentName = fields.students[0];
    const wasLastDraft = activeDraftItems.length === 1;
    setDraftItems((current) => current.filter((item) => item.id !== id));
    setActiveDraftId(null);
    if (wasLastDraft) {
      setIsDraftQueueOpen(false);
      setComposerFocusRequestKey((current) => current + 1);
    }
    setToast({
      id: Date.now(),
      kind: "saved",
      studentId: saveInput.rosterStudentId,
      studentName,
      message: result.isFirstWorkspaceEvidence
        ? `First observation saved to ${studentName}'s trace.`
        : `Saved to ${studentName}'s trace.`,
    });
    router.refresh();
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

        return {
          ...item,
          draft: nextDraft,
          resolvedStudent:
            trimmed === item.draft.parsed.rawNote
              ? item.resolvedStudent
              : undefined,
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
    setToast((current) =>
      current?.kind === "draft" && current.draftId === id ? null : current
    );
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

  function handleDetailsOpenChange(id: string, detailsOpen: boolean): void {
    setDraftItems((current) =>
      current.map((item) =>
        item.id === id ? { ...item, detailsOpen } : item
      )
    );
  }

  function handleResolvedStudentChange(
    id: string,
    student: CaptureRosterStudent | null
  ): void {
    setDraftItems((current) =>
      current.map((item) =>
        item.id === id
          ? { ...item, resolvedStudent: student ?? undefined }
          : item
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

  function renderCaptureCard(item: DraftFeedItem) {
    return (
      <EvidenceCaptureCard
        draft={item.draft}
        timestamp={item.timestamp}
        capturedAt={item.timestampMs}
        workspaceCreatedAt={workspaceCreatedAt}
        rosterStudents={activeRosterStudents}
        classGroups={classGroups}
        onValidate={(fields, saveInput, reviewedPhoto) =>
          handleValidate(item.id, fields, saveInput, reviewedPhoto)
        }
        onSaved={(result, fields, saveInput) =>
          handleSaveCompleted(item.id, result, fields, saveInput)
        }
        onResolvedStudentChange={(student) =>
          handleResolvedStudentChange(item.id, student)
        }
        onCreateStudent={handleCreateStudent}
        photo={item.photo}
        photoMissing={item.photoMissing}
        photoRecoveryWarning={item.photoRecoveryWarning}
        onPhotoChange={(photo) => handlePhotoChanged(item.id, photo)}
        onPhotoRemove={() => handlePhotoRemoved(item.id)}
        onEdit={(rawNote) => handleEditCapture(item.id, rawNote)}
        onDelete={() => handleDeleteCapture(item.id)}
        detailsOpen={item.detailsOpen}
        onDetailsOpenChange={(detailsOpen) =>
          handleDetailsOpenChange(item.id, detailsOpen)
        }
        embedded
      />
    );
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
          body="Approved observations will collect here. Drafts stay in the review queue until you save or delete them, and clear at midnight."
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
      <div>
        {visibleEvidenceRecords.length > 0 ? (
          <div>
            {visibleEvidenceRecords.map((record, index) => {
              const newDay =
                index === 0 ||
                evidenceCalendarDayKey(record.evidenceDate, evidenceTimeZone) !==
                  evidenceCalendarDayKey(
                    visibleEvidenceRecords[index - 1].evidenceDate,
                    evidenceTimeZone
                  );
              return (
                <Fragment key={record.id}>
                  {newDay ? (
                    <h3 className={`sticky top-14 z-10 -mx-4 bg-base/95 px-4 py-2 backdrop-blur sm:-mx-6 sm:px-6 lg:top-[4.5rem] ${index === 0 ? "" : "mt-4"}`}>
                      <time dateTime={record.evidenceDate} className="font-display text-[1.1rem] font-semibold text-fg-2">
                        {formatEvidenceDayLabel(
                          record.evidenceDate,
                          evidenceTimeZone,
                          sessionDraftsReady
                        )}
                      </time>
                    </h3>
                  ) : null}
                  <div className="trace">
                    <SavedEvidenceRow
                      record={record}
                      evidenceTimeZone={evidenceTimeZone}
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

        {!rosterSetupNeeded ? (
          <DraftReviewQueue
            items={queueItems}
            open={isDraftQueueOpen}
            onOpenChange={setIsDraftQueueOpen}
            activeDraftId={activeDraftId}
            onActiveDraftChange={setActiveDraftId}
            renderReview={(id) => {
              const item = activeDraftItems.find((draft) => draft.id === id);
              return item ? renderCaptureCard(item) : null;
            }}
          />
        ) : null}
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
                  : "Saved evidence will appear here."}
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

      {toast ? (
        <div
          role="status"
          aria-live="polite"
          className={`fixed inset-x-4 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-[80] mx-auto flex max-w-md items-center gap-3 rounded-xl border bg-plate px-3.5 py-3 shadow-lift lg:inset-x-auto lg:bottom-6 lg:right-6 lg:mx-0 ${
            toast.kind === "draft" ? "border-live-bright" : "border-line-2"
          }`}
        >
          <p className="min-w-0 flex-1 text-sm font-medium text-fg">
            {toast.message}
          </p>
          {toast.kind === "draft" ? (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => {
                setActiveDraftId(toast.draftId);
                setIsDraftQueueOpen(true);
                setToast(null);
              }}
            >
              Review
            </Button>
          ) : (
            <Button asChild size="sm" variant="ghost">
              <Link
                href={routes.student(toast.studentId)}
                onClick={() => setToast(null)}
              >
                Open trace
              </Link>
            </Button>
          )}
          <button
            type="button"
            aria-label="Dismiss notification"
            onClick={() => setToast(null)}
            className="flex size-8 shrink-0 items-center justify-center rounded-full text-fg-3 outline-none transition-colors hover:bg-well hover:text-fg focus-visible:ring-2 focus-visible:ring-live-bright"
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>
      ) : null}
    </div>
  );
}

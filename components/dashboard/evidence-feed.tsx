"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
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
import {
  EvidenceCaptureCard,
  type CaptureEditResult,
} from "@/components/dashboard/evidence-capture-card";
import type { DraftReviewProjection } from "@/components/dashboard/interpretation-review-panel";
import type {
  CreateStudentFromReviewInput,
  CreateStudentFromReviewResult,
  StudentResolutionClassOption,
} from "@/components/dashboard/student-resolution-field";
import {
  EvidenceSearchControl,
  FeedEmptyState,
  RosterRequiredState,
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
  totalMatches: number;
  hasNewerEvidence: boolean;
  hasOlderEvidence: boolean;
  initialSearchQuery: string;
  tagSuggestions: string[];
  initialCaptureStudent?: CaptureRosterStudent;
  initialCaptureStudentError?: string;
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
const EVIDENCE_RESULTS_HASH = "#evidence-inbox-heading";

function feedResultCountLabel(count: number, hasQuery: boolean): string {
  const noun = hasQuery
    ? count === 1
      ? "matching observation"
      : "matching observations"
    : count === 1
      ? "saved observation"
      : "saved observations";
  return `${count} ${noun}`;
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
  totalMatches,
  hasNewerEvidence,
  hasOlderEvidence,
  initialSearchQuery,
  tagSuggestions,
  initialCaptureStudent,
  initialCaptureStudentError,
}: EvidenceFeedProps) {
  const router = useRouter();
  const [draftItems, setDraftItems] = useState<DraftFeedItem[]>([]);
  const [locallyCreatedRosterStudents, setLocallyCreatedRosterStudents] =
    useState<CaptureRosterStudent[]>([]);
  const [hydratedWorkspaceId, setHydratedWorkspaceId] = useState<string | null>(
    null
  );
  const sessionStorageRef = useRef<SessionDraftStorage | null>(null);
  const feedNavigationRequestedRef = useRef(false);
  const [resultsAnnouncement, setResultsAnnouncement] = useState("");
  const [captureEditError, setCaptureEditError] = useState("");
  const captureEditErrorRef = useRef<HTMLParagraphElement | null>(null);
  const [composerFocusRequestKey, setComposerFocusRequestKey] = useState(0);
  const [isDraftQueueOpen, setIsDraftQueueOpen] = useState(false);
  const [activeDraftId, setActiveDraftId] = useState<string | null>(null);
  const [reviewProjections, setReviewProjections] = useState<
    Map<string, DraftReviewProjection>
  >(() => new Map());
  const [suppressQueueFocusRecovery, setSuppressQueueFocusRecovery] =
    useState(false);
  const draftItemsRef = useRef<DraftFeedItem[]>([]);
  const previousDraftCountRef = useRef(0);
  const draftRemovalShouldRecoverFocusRef = useRef(false);
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

  function setReviewProjection(
    id: string,
    projection: DraftReviewProjection
  ): void {
    setReviewProjections((current) => {
      const previous = current.get(id);
      if (
        previous &&
        previous.note === projection.note &&
        previous.filing === projection.filing &&
        previous.needsCorrection === projection.needsCorrection
      ) {
        return current;
      }

      const next = new Map(current);
      next.set(id, projection);
      return next;
    });
  }

  function clearReviewProjection(id: string): void {
    setReviewProjections((current) => {
      if (!current.has(id)) {
        return current;
      }

      const next = new Map(current);
      next.delete(id);
      return next;
    });
  }

  function markDraftRemovalIntent(
    intent: "user" | "passive",
    recoverFocus = intent === "user"
  ): void {
    draftRemovalShouldRecoverFocusRef.current = recoverFocus;
    setSuppressQueueFocusRecovery(!recoverFocus);
  }

  useEffect(() => {
    draftItemsRef.current = draftItems;
  }, [draftItems]);

  useEffect(() => {
    if (!sessionDraftsReady) {
      previousDraftCountRef.current = 0;
      return;
    }

    const currentCount = draftItems.length;
    if (previousDraftCountRef.current > 0 && currentCount === 0) {
      setIsDraftQueueOpen(false);
      setActiveDraftId(null);
      if (draftRemovalShouldRecoverFocusRef.current) {
        setComposerFocusRequestKey((current) => current + 1);
      }
    }

    previousDraftCountRef.current = currentCount;
    draftRemovalShouldRecoverFocusRef.current = false;
  }, [draftItems.length, sessionDraftsReady]);

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
      setReviewProjections(new Map());
      setActiveDraftId(null);
      setIsDraftQueueOpen(false);
      setSuppressQueueFocusRecovery(true);
      previousDraftCountRef.current = 0;
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
      const currentItems = draftItemsRef.current;
      const active = currentItems.filter((item) =>
        isCurrentLocalDay(item.timestampMs, now)
      );
      void pruneExpiredPhotoDrafts(now);
      if (active.length !== currentItems.length) {
        const activeElement = document.activeElement;
        const focusIsInsideQueue = Boolean(
          activeElement?.closest("[data-draft-review-queue]")
        );
        markDraftRemovalIntent("passive", focusIsInsideQueue);
        const activeIds = new Set(active.map((item) => item.id));
        setReviewProjections((current) => {
          const next = new Map(current);
          for (const id of current.keys()) {
            if (!activeIds.has(id)) {
              next.delete(id);
            }
          }
          return next.size === current.size ? current : next;
        });
        setDraftItems(active);
      }
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
    if (!feedNavigationRequestedRef.current) return;

    feedNavigationRequestedRef.current = false;
    document.getElementById("evidence-inbox-heading")?.focus();
    setResultsAnnouncement(
      `${feedResultCountLabel(totalMatches, Boolean(initialSearchQuery))}. Page ${evidencePage}.`
    );
  }, [evidencePage, initialSearchQuery, totalMatches]);

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
        const note =
          display.cleanText.trim() ||
          (item.photo
            ? "Photo evidence without a note."
            : "Evidence note needed.");
        const photoOnly = Boolean(item.photo) && !display.cleanText.trim();
        const parserNeedsCorrection =
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
        const projection = reviewProjections.get(item.id);

        return {
          id: item.id,
          studentLabel,
          note: projection?.note ?? note,
          filing: projection?.filing ?? filing,
          timestamp: item.timestamp,
          needsCorrection: projection?.needsCorrection ?? parserNeedsCorrection,
          hasPhoto: Boolean(item.photo) || Boolean(item.photoMissing),
        };
      }),
    [activeDraftItems, activeRosterStudents, reviewProjections]
  );

  const visibleEvidenceRecords = useMemo(
    () =>
      initialEvidenceRecords.filter(
        (record) => !hiddenSavedEvidenceIds.has(record.id)
      ),
    [hiddenSavedEvidenceIds, initialEvidenceRecords]
  );

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
    markDraftRemovalIntent("user");
    clearReviewProjection(id);
    setDraftItems((current) => current.filter((item) => item.id !== id));
    setToast({
      // Saved toast IDs intentionally use the current timestamp for replacement semantics.
      // eslint-disable-next-line react-hooks/purity
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

  function handleEditCapture(id: string, rawNote: string): CaptureEditResult {
    const trimmed = rawNote.trim();
    if (!trimmed) {
      return {
        success: false,
        error: "Enter an original capture before saving this edit.",
      };
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
      return {
        success: false,
        error: studentResolutionErrorMessage(resolution),
      };
    }

    setCaptureEditError("");
    const currentItem = draftItems.find((item) => item.id === id);
    const sourceChanged =
      currentItem !== undefined && trimmed !== currentItem.draft.parsed.rawNote;
    if (currentItem) {
      upsertSessionDraft(sessionStorageRef.current, workspaceId, {
        id,
        rawNote: nextDraft.parsed.rawNote,
        capturedAt: currentItem.timestampMs,
        hasPhoto: Boolean(currentItem.photo),
      });
    }
    if (sourceChanged) {
      clearReviewProjection(id);
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
    return { success: true };
  }

  function handleDeleteCapture(id: string) {
    setCaptureEditError("");
    markDraftRemovalIntent("user");
    clearReviewProjection(id);
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
    const item = draftItems.find((candidate) => candidate.id === id);
    const removesDraft = Boolean(item && !item.draft.parsed.rawNote.trim());
    if (removesDraft) {
      markDraftRemovalIntent("user");
      clearReviewProjection(id);
    }
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

  function markFeedNavigation(): void {
    feedNavigationRequestedRef.current = true;
  }

  function evidencePageHref(page: number): string {
    const params = new URLSearchParams();
    if (page > 1) params.set("page", String(page));
    if (initialSearchQuery) params.set("q", initialSearchQuery);
    return `${routes.feed}${params.size ? `?${params}` : ""}${EVIDENCE_RESULTS_HASH}`;
  }

  function handleSearch(query: string): void {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    markFeedNavigation();
    if (query === initialSearchQuery && evidencePage === 1) {
      feedNavigationRequestedRef.current = false;
      document.getElementById("evidence-inbox-heading")?.focus();
      setResultsAnnouncement(
        `${feedResultCountLabel(totalMatches, Boolean(initialSearchQuery))}. Page 1.`
      );
    }
    router.push(
      `${routes.feed}${params.size ? `?${params}` : ""}${EVIDENCE_RESULTS_HASH}`
    );
  }

  function renderPager(placement: "heading" | "footer") {
    if (!hasNewerEvidence && !hasOlderEvidence) return null;

    const headingPlacement = placement === "heading";
    return (
      <nav
        aria-label={
          headingPlacement
            ? "Evidence pages by results heading"
            : "Evidence pages after results"
        }
        className={
          headingPlacement
            ? "flex shrink-0 items-center gap-1.5"
            : "mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4"
        }
      >
        <div>
          {hasNewerEvidence ? (
            <Button
              asChild
              variant="outline"
              size={headingPlacement ? "icon-xs" : "sm"}
              className="rounded-full"
            >
              <Link
                href={evidencePageHref(evidencePage - 1)}
                onClick={markFeedNavigation}
                aria-label={`Newer evidence, page ${evidencePage - 1}`}
              >
                {headingPlacement ? (
                  <ChevronLeft aria-hidden="true" />
                ) : (
                  "Newer evidence"
                )}
              </Link>
            </Button>
          ) : null}
        </div>
        <p className="label whitespace-nowrap text-fg-3">Page {evidencePage}</p>
        <div>
          {hasOlderEvidence ? (
            <Button
              asChild
              variant="outline"
              size={headingPlacement ? "icon-xs" : "sm"}
              className="rounded-full"
            >
              <Link
                href={evidencePageHref(evidencePage + 1)}
                onClick={markFeedNavigation}
                aria-label={`Older evidence, page ${evidencePage + 1}`}
              >
                {headingPlacement ? (
                  <ChevronRight aria-hidden="true" />
                ) : (
                  "Older evidence"
                )}
              </Link>
            </Button>
          ) : null}
        </div>
      </nav>
    );
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
        onReviewProjectionChange={(projection) =>
          setReviewProjection(item.id, projection)
        }
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

    if (totalMatches === 0 && initialSearchQuery) {
      return (
        <FeedEmptyState
          title="No saved evidence matches"
          body="Try another term, student handle, or exact tag."
          action={
            <Button asChild variant="outline" size="sm" className="rounded-full">
              <Link
                href={`${routes.feed}${EVIDENCE_RESULTS_HASH}`}
                onClick={markFeedNavigation}
              >
                Clear search
              </Link>
            </Button>
          }
        />
      );
    }

    if (totalMatches === 0) {
      return (
        <FeedEmptyState
          title="No saved evidence yet"
          body="Approved observations will collect here. Drafts stay in the review queue until you save or delete them, and clear at midnight."
        />
      );
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
            initialStudent={initialCaptureStudent}
            initialStudentError={initialCaptureStudentError}
            tagSuggestions={tagSuggestions}
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
            suppressFocusRecovery={suppressQueueFocusRecovery}
            renderReview={(id) => {
              const item = activeDraftItems.find((draft) => draft.id === id);
              return item ? renderCaptureCard(item) : null;
            }}
          />
        ) : null}
      </section>

      <section
        className="mt-8 min-w-0 sm:mt-12"
        aria-labelledby="evidence-inbox-heading"
      >
        <div className="space-y-4 border-b border-line pb-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <RecentCapturesLabel />
              <p className="label mt-2 text-fg-3">
                {feedResultCountLabel(
                  totalMatches,
                  Boolean(initialSearchQuery)
                )}
                <span aria-hidden="true"> · </span>
                Newest first
              </p>
            </div>
            {renderPager("heading")}
          </div>

          <EvidenceSearchControl
            key={initialSearchQuery}
            query={initialSearchQuery}
            onSearch={handleSearch}
          />
        </div>

        <p className="sr-only" role="status" aria-live="polite">
          {resultsAnnouncement}
        </p>

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
          {renderPager("footer")}
        </div>
      </section>

      {toast ? (
        <div
          role="status"
          aria-live="polite"
          className={`fixed inset-x-4 bottom-[calc(1rem+env(safe-area-inset-bottom))] z-[60] mx-auto flex max-w-md items-center gap-3 rounded-xl border bg-plate px-3.5 py-3 shadow-lift lg:inset-x-auto lg:bottom-6 lg:right-6 lg:mx-0 ${
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

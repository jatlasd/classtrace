"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  saveValidatedEvidence,
  type SaveValidatedEvidenceActionInput,
  type SaveValidatedEvidenceActionResult,
} from "@/actions/evidence";
import { EvidenceCaptureCard } from "@/components/dashboard/evidence-capture-card";
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
import { buildNoteDraft, type NoteDraft } from "@/lib/note-processing";
import { routes } from "@/lib/routes";
import {
  resolveCaptureStudents,
  type CaptureRosterStudent,
  type CaptureStudentResolution,
} from "@/lib/students/resolve-capture-students";
import { ArrowDownUp } from "lucide-react";

type EvidenceFeedProps = {
  workspaceId: string;
  rosterStudents: CaptureRosterStudent[];
  initialEvidenceRecords: EvidenceFeedRecord[];
  evidencePage: number;
  hasNewerEvidence: boolean;
  hasOlderEvidence: boolean;
  initialFilter: string;
  initialSearchQuery: string;
};

type DraftFeedItem = FeedItem & {
  reviewOpen: boolean;
};

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
  resolution: CaptureStudentResolution
): string {
  if (resolution.status === "no_student_mentioned") {
    return "Mention one student from your roster before saving this edit.";
  }

  if (resolution.status === "multiple_students") {
    return "Choose one student for this capture before saving this edit.";
  }

  if (resolution.status === "unresolved_student") {
    return "This edit was not saved because a mentioned student is not on your roster yet.";
  }

  return "";
}

export function EvidenceFeed({
  workspaceId,
  rosterStudents,
  initialEvidenceRecords,
  evidencePage,
  hasNewerEvidence,
  hasOlderEvidence,
  initialFilter,
  initialSearchQuery,
}: EvidenceFeedProps) {
  const router = useRouter();
  const [draftItems, setDraftItems] = useState<DraftFeedItem[]>([]);
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
  const rosterSetupNeeded = rosterStudents.length === 0;
  const sessionDraftsReady = hydratedWorkspaceId === workspaceId;
  const activeDraftItems = sessionDraftsReady ? draftItems : EMPTY_FEED_ITEMS;

  useEffect(() => {
    const storage = getBrowserSessionStorage();
    sessionStorageRef.current = storage;
    const hydrationTimer = window.setTimeout(() => {
      const restored = loadSessionDrafts(storage, workspaceId);

      setDraftItems(
        restored.drafts
          .map((sessionDraft) => ({
            id: sessionDraft.id,
            draft: buildNoteDraft(sessionDraft.rawNote),
            timestamp: formatSessionDraftTimestamp(sessionDraft.capturedAt),
            timestampMs: sessionDraft.capturedAt,
            reviewOpen: false,
          }))
          .sort((a, b) => b.timestampMs - a.timestampMs)
      );
      setHydratedWorkspaceId(workspaceId);
    }, 0);

    return () => window.clearTimeout(hydrationTimer);
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
      setDraftItems((current) =>
        current.filter(
          (item) => isValidated(item) || isCurrentLocalDay(item.timestampMs, now)
        )
      );
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
        captureMatchesSearch(item, searchQuery, rosterStudents)
      );
    }

    return result;
  }, [
    activeDraftItems,
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
  const needsReviewItemCount = activeDraftItems.filter(needsReview).length;

  function handleDraft(
    draft: NoteDraft,
    identity: { id: string; capturedAt: number }
  ) {
    const resolution = resolveCaptureStudents(
      draft.parsed.mentions,
      rosterStudents
    );

    if (resolution.status !== "resolved_one_student") {
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
    };
    upsertSessionDraft(sessionStorageRef.current, workspaceId, {
      id: newItem.id,
      rawNote: draft.parsed.rawNote,
      capturedAt: identity.capturedAt,
    });
    setDraftItems((current) => [newItem, ...current]);
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

    removeSessionDraft(sessionStorageRef.current, workspaceId, id);

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
      rosterStudents
    );

    if (resolution.status !== "resolved_one_student") {
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
    setDraftItems((current) => current.filter((item) => item.id !== id));
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
            validation={item.validation}
            rosterStudents={rosterStudents}
            onValidate={(fields, saveInput) =>
              handleValidate(item.id, fields, saveInput)
            }
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
    <div className="mx-auto w-full max-w-[1560px] px-4 py-5 sm:px-6 lg:px-8">
      <EvidenceFeedHeader
        rosterCount={rosterStudents.length}
        savedCount={initialEvidenceRecords.length}
        reviewCount={needsReviewItemCount}
      />

      <section className="mt-5" aria-label="Capture desk">
        {rosterSetupNeeded ? (
          <RosterRequiredState />
        ) : (
          <QuickCaptureCard
            rosterStudents={rosterStudents}
            focusRequestKey={composerFocusRequestKey}
            onDraft={handleDraft}
          />
        )}
      </section>

      <section
        className="mt-5 overflow-hidden rounded-card border border-border bg-card shadow-paper"
        aria-labelledby="evidence-inbox-heading"
      >
        <div className="space-y-4 border-b border-border bg-card px-4 py-4 sm:px-6">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
            <div className="min-w-0 space-y-1">
              <div className="flex flex-wrap items-center gap-3">
                <RecentCapturesLabel />
                <span className="inline-flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm font-medium text-muted-foreground">
                  <ArrowDownUp aria-hidden="true" className="size-4" />
                  Newest first
                </span>
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">
                {hasVisibleFeedItems
                  ? feedItemCountLabel(visibleFeedItemCount)
                  : "Drafts and saved evidence will appear here."}
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
  );
}

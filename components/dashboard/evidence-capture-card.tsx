"use client";

import Link from "next/link";
import { useId, useRef, useState } from "react";
import { InterpretationReviewPanel } from "@/components/dashboard/interpretation-review-panel";
import { LocalPhotoPreview } from "@/components/evidence/local-photo-preview";
import { NoteContent } from "@/components/dashboard/note-content";
import type {
  CreateStudentFromReviewInput,
  CreateStudentFromReviewResult,
  StudentResolutionClassOption,
} from "@/components/dashboard/student-resolution-field";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmationPanel } from "@/components/ui/confirmation-panel";
import { Textarea } from "@/components/ui/textarea";
import { formatTagLabel } from "@/lib/format-tag";
import {
  resolveCaptureDisplay,
  type CaptureValidation,
  type InterpretationFields,
} from "@/lib/evidence/capture-validation";
import { draftToDisplay } from "@/lib/note-processing/draft-to-display";
import type { NoteDraft } from "@/lib/note-processing/types";
import { routes } from "@/lib/routes";
import type { CaptureRosterStudent } from "@/lib/students/resolve-capture-students";
import {
  normalizeEvidencePhoto,
  type PhotoDraft,
} from "@/lib/evidence/photo-draft-storage";
import {
  type StudentMentionDisplay,
  type StudentMentionRef,
} from "@/lib/students/student-mention-display";
import { ArrowRight, ImagePlus, Trash2, X } from "lucide-react";

type EvidenceCaptureCardProps = {
  draft: NoteDraft;
  timestamp?: string;
  capturedAt?: number;
  workspaceCreatedAt: string;
  validation?: CaptureValidation;
  rosterStudents: CaptureRosterStudent[];
  classGroups: StudentResolutionClassOption[];
  onValidate: (
    fields: InterpretationFields,
    saveInput: ValidatedEvidenceSaveInput,
    reviewedPhoto?: PhotoDraft
  ) => Promise<ValidatedEvidenceSaveResult>;
  onEdit?: (rawNote: string) => boolean;
  onDelete?: () => void;
  reviewOpen: boolean;
  onReviewOpenChange: (open: boolean) => void;
  onCaptureAnother: () => void;
  onCreateStudent: (
    input: CreateStudentFromReviewInput
  ) => Promise<CreateStudentFromReviewResult>;
  photo?: PhotoDraft;
  photoMissing?: boolean;
  photoRecoveryWarning?: string;
  onPhotoChange?: (photo: PhotoDraft) => Promise<void> | void;
  onPhotoRemove?: () => void;
};

type ValidatedEvidenceSaveInput = {
  rosterStudentId: string;
  evidenceDate: string;
  evidenceDateOffsetMinutes: number;
  evidenceNote?: string;
  summary?: string;
  evidenceType?: string;
  topic?: string;
  performance?: string;
  behavior?: string[];
  tags: string[];
  followUpNotes?: string[];
};

type ValidatedEvidenceSaveResult =
  | {
      success: true;
      evidenceId: string;
      isFirstWorkspaceEvidence: boolean;
    }
  | { success: false; error: string };

function DetailLabel({
  children,
  kind,
}: {
  children: React.ReactNode;
  kind?: "type" | "tag" | "detail";
}) {
  return (
    <span
      className={`inline-flex max-w-full items-center break-words font-mono text-[0.75rem] [overflow-wrap:anywhere] ${
        kind === "tag"
          ? "text-fg-2"
          : kind === "type"
            ? "rounded-full border border-dashed border-line-2 px-2 py-px text-fg-2"
            : "text-fg-3"
      }`}
    >
      {children}
    </span>
  );
}

function ResolvedStudentChip({ student }: { student: StudentMentionDisplay }) {
  return (
    <Link
      href={routes.student(student.id)}
      className="inline-flex max-w-full items-center break-words font-display text-[1.35rem] font-semibold leading-tight text-fg underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-live-bright focus-visible:ring-offset-2 focus-visible:ring-offset-plate"
    >
      {student.displayName}
    </Link>
  );
}

function UnresolvedStudentChip({ mention }: { mention: string }) {
  return (
    <span className="inline-flex items-center gap-2 font-display text-[1.35rem] font-semibold leading-tight text-fg-2">
      Unmatched student
      <span className="font-mono text-sm text-live">@{mention}</span>
    </span>
  );
}

function StudentMentionChip({ mentionRef }: { mentionRef: StudentMentionRef }) {
  if (mentionRef.status === "resolved") {
    return <ResolvedStudentChip student={mentionRef.student} />;
  }
  return <UnresolvedStudentChip mention={mentionRef.mention} />;
}

function StatusFlag({
  status,
  needsReview,
}: {
  status: "pending" | "validated";
  needsReview: boolean;
}) {
  if (status === "validated") {
    return <Badge variant="validated">Validated</Badge>;
  }

  if (!needsReview) {
    return <Badge variant="ghost">Ready to review</Badge>;
  }

  return <Badge variant="live">Needs review</Badge>;
}

export function EvidenceCaptureCard({
  draft,
  timestamp = "Just now",
  capturedAt,
  workspaceCreatedAt,
  validation,
  rosterStudents,
  classGroups,
  onValidate,
  onEdit,
  onDelete,
  reviewOpen,
  onReviewOpenChange,
  onCaptureAnother,
  onCreateStudent,
  photo,
  photoMissing = false,
  photoRecoveryWarning,
  onPhotoChange,
  onPhotoRemove,
}: EvidenceCaptureCardProps) {
  const sourceEditorId = useId();
  const photoErrorId = useId();
  const [isReviewSavePending, setIsReviewSavePending] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [editText, setEditText] = useState("");
  const [resolvedStudentOverride, setResolvedStudentOverride] =
    useState<CaptureRosterStudent | null>(null);
  const [reviewWasOpenBeforeEdit, setReviewWasOpenBeforeEdit] =
    useState(false);
  const deleteButtonRef = useRef<HTMLButtonElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [photoError, setPhotoError] = useState("");
  const [isProcessingPhoto, setIsProcessingPhoto] = useState(false);
  const parserDisplay = resolveCaptureDisplay(draft, validation, rosterStudents);
  const parserUnresolvedMentions = parserDisplay.studentMentions.filter(
    (ref) => ref.status === "unresolved"
  );
  const displayRosterStudents =
    resolvedStudentOverride && parserUnresolvedMentions.length === 1
      ? rosterStudents.map((student) =>
          student.id === resolvedStudentOverride.id
            ? {
                ...student,
                mentionHandle: parserUnresolvedMentions[0].mention,
              }
            : student
        )
      : rosterStudents;
  const display = resolveCaptureDisplay(
    draft,
    validation,
    displayRosterStudents
  );
  const reviewDisplay = draftToDisplay(draft, rosterStudents);
  const isPending = display.validationStatus !== "validated";
  const unresolvedMentions = display.studentMentions.filter(
    (ref) => ref.status === "unresolved"
  );
  const hasUnresolvedMentions = unresolvedMentions.length > 0;
  const showActions = Boolean((onEdit && draft.parsed.rawNote.trim()) || onDelete);
  const canSaveEdit = editText.trim().length > 0;

  async function handlePhotoFile(file: File | undefined): Promise<void> {
    if (!file) return;
    setPhotoError("");
    setIsProcessingPhoto(true);
    try {
      const result = await normalizeEvidencePhoto(file);
      if (!result.success) {
        setPhotoError(result.error);
        return;
      }
      await onPhotoChange?.(result.photo);
    } catch {
      setPhotoError("This photo could not be attached. Choose it again.");
    } finally {
      setIsProcessingPhoto(false);
    }
  }

  async function handleConfirm(
    fields: InterpretationFields,
    saveInput: ValidatedEvidenceSaveInput
  ): Promise<ValidatedEvidenceSaveResult> {
    if (isProcessingPhoto) {
      return { success: false, error: "Wait for the photo to finish processing." };
    }
    if (photoMissing && !photo) {
      return {
        success: false,
        error: "Choose the photo again or continue without it before saving.",
      };
    }

    const result = await onValidate(fields, saveInput, photo);

    return result;
  }

  function handleStartEdit() {
    if (isReviewSavePending) {
      return;
    }

    setEditText(draft.parsed.rawNote);
    setReviewWasOpenBeforeEdit(reviewOpen);
    setIsConfirmingDelete(false);
    onReviewOpenChange(false);
    setIsEditing(true);
  }

  function handleSaveEdit() {
    const trimmed = editText.trim();
    if (!trimmed) {
      return;
    }
    const saved = onEdit?.(trimmed) ?? true;
    if (saved) {
      if (trimmed !== draft.parsed.rawNote) {
        setResolvedStudentOverride(null);
      }
      setIsEditing(false);
      onReviewOpenChange(true);
    }
  }

  function handleCancelEdit() {
    setIsEditing(false);
    onReviewOpenChange(reviewWasOpenBeforeEdit);
  }

  function handleRequestDraftDelete() {
    if (isReviewSavePending) {
      return;
    }

    setIsConfirmingDelete(true);
  }

  function handleCancelDraftDelete() {
    deleteButtonRef.current?.focus();
    setIsConfirmingDelete(false);
  }

  function handleConfirmDraftDelete() {
    setIsConfirmingDelete(false);
    onDelete?.();
  }

  return (
    <article
      className={`plate overflow-hidden ${
        isPending ? "border-l-2 border-l-live-bright" : ""
      }`}
    >
      <div className="flex flex-col gap-2 px-4 pt-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <StatusFlag
            status={display.validationStatus}
            needsReview={display.needsReview}
          />
          <span className="label text-fg-3">
            {timestamp}
            {isPending ? " · clears at midnight" : ""}
          </span>
        </div>

        {showActions && !isEditing ? (
          <div className="flex flex-wrap items-center gap-1">
            {onEdit && draft.parsed.rawNote.trim() ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={isReviewSavePending || isProcessingPhoto}
                onClick={handleStartEdit}
              >
                Edit original capture
              </Button>
            ) : null}
            {onDelete ? (
              <Button
                ref={deleteButtonRef}
                type="button"
                variant="ghost"
                size="sm"
                className="hover:text-danger"
                disabled={isReviewSavePending || isProcessingPhoto}
                onClick={handleRequestDraftDelete}
              >
                <Trash2 aria-hidden="true" className="size-3.5" />
                Delete draft
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="px-4 pb-4 pt-3 sm:px-5">
        {isConfirmingDelete ? (
          <ConfirmationPanel
            ariaLabel="Confirm draft deletion"
            description="Delete this draft? It will be removed from this browser. This cannot be undone."
            confirmLabel="Delete this draft"
            tone="destructive"
            className="mb-4"
            disabled={isReviewSavePending}
            onConfirm={handleConfirmDraftDelete}
            onCancel={handleCancelDraftDelete}
          />
        ) : null}

        {photo || photoMissing ? (
          <input
            ref={photoInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            className="sr-only"
            aria-label={photo ? "Replace photo evidence" : "Choose photo evidence again"}
            aria-invalid={Boolean(photoError)}
            aria-describedby={photoError ? photoErrorId : undefined}
            disabled={isProcessingPhoto || isReviewSavePending}
            onChange={(event) => void handlePhotoFile(event.target.files?.[0])}
          />
        ) : null}

        {photo ? (
          <div className="mb-4 grid gap-3 rounded-lg border border-line bg-well p-3 sm:grid-cols-[7rem_1fr] sm:items-start">
            <LocalPhotoPreview
              blob={photo.blob}
              alt="Temporary photo evidence preview"
              width={photo.width}
              height={photo.height}
            />
            <div className="space-y-2">
              <p className="label text-live">Temporary photo</p>
              <p className="text-[13px] leading-relaxed text-fg-2">
                This photo stays on this device until you validate and save it.
              </p>
              {photoRecoveryWarning ? (
                <p role="alert" className="text-xs leading-relaxed text-danger">
                  {photoRecoveryWarning}
                </p>
              ) : null}
              {photoError ? (
                <p id={photoErrorId} role="alert" className="text-xs text-danger">
                  {photoError}
                </p>
              ) : null}
              {isProcessingPhoto ? (
                <p role="status" className="text-xs text-fg-2">
                  Processing photo…
                </p>
              ) : null}
              <div className="flex flex-wrap gap-1.5">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={isProcessingPhoto || isReviewSavePending}
                  onClick={() => photoInputRef.current?.click()}
                >
                  <ImagePlus aria-hidden="true" className="size-4" />
                  {isProcessingPhoto ? "Processing…" : "Replace photo"}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  disabled={isProcessingPhoto || isReviewSavePending}
                  onClick={onPhotoRemove}
                >
                  <X aria-hidden="true" className="size-4" />
                  Remove photo
                </Button>
              </div>
            </div>
          </div>
        ) : photoMissing ? (
          <div className="mb-4 space-y-3 rounded-lg border-l-2 border-danger bg-danger-soft p-3">
            <div>
              <p className="text-sm font-medium text-danger">Photo needs attention</p>
              <p role="alert" className="mt-1 text-xs leading-relaxed text-danger">
                {photoRecoveryWarning}
              </p>
            </div>
            {photoError ? (
              <p id={photoErrorId} role="alert" className="text-xs text-danger">
                {photoError}
              </p>
            ) : null}
            {isProcessingPhoto ? (
              <p role="status" className="text-xs text-fg-2">
                Processing photo…
              </p>
            ) : null}
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={isProcessingPhoto || isReviewSavePending}
                onClick={() => photoInputRef.current?.click()}
              >
                <ImagePlus aria-hidden="true" className="size-4" />
                {isProcessingPhoto ? "Processing…" : "Choose photo again"}
              </Button>
              {draft.parsed.rawNote.trim() ? (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  disabled={isProcessingPhoto || isReviewSavePending}
                  onClick={onPhotoRemove}
                >
                  Continue without photo
                </Button>
              ) : null}
            </div>
          </div>
        ) : null}

        {isEditing ? (
          <div className="space-y-3">
            <div className="space-y-1">
              <label htmlFor={sourceEditorId} className="label block text-fg-2">
                Original capture
              </label>
              <p className="text-[13px] leading-relaxed text-fg-2">
                Correct the source note or student mention, then return to review.
              </p>
            </div>
            <Textarea
              id={sourceEditorId}
              value={editText}
              onChange={(event) => setEditText(event.target.value)}
              className="min-h-[120px] text-[17px] leading-relaxed"
            />
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                disabled={!canSaveEdit}
                onClick={handleSaveEdit}
              >
                Save original capture
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCancelEdit}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : null}

        {!isEditing && !reviewOpen ? (
          <div className="space-y-3">
            {draft.parsed.rawNote.trim() ? (
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                {display.studentMentions.map((mentionRef, index) => (
                  <StudentMentionChip
                    key={
                      mentionRef.status === "resolved"
                        ? mentionRef.student.id
                        : `${mentionRef.mention}-${index}`
                    }
                    mentionRef={mentionRef}
                  />
                ))}
              </div>
            ) : null}

            {draft.parsed.rawNote.trim() ? (
              <NoteContent text={draft.parsed.rawNote} />
            ) : (
              <p className="text-sm text-fg-2">Photo evidence without a note.</p>
            )}

            {draft.parsed.rawNote.trim() ? (
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                <DetailLabel kind="type">{display.evidenceType}</DetailLabel>
                {display.topic ? <DetailLabel>{display.topic}</DetailLabel> : null}
                {display.performance ? <DetailLabel>{display.performance}</DetailLabel> : null}
                {display.behavior?.map((item) => (
                  <DetailLabel key={item}>{item}</DetailLabel>
                ))}
                {display.tags.map((tag) => (
                  <DetailLabel key={tag} kind="tag">
                    {formatTagLabel(tag)}
                  </DetailLabel>
                ))}
              </div>
            ) : null}

            {hasUnresolvedMentions ? (
              <p className="rounded-md bg-live-soft px-3 py-2 text-[13px] leading-relaxed text-fg">
                {unresolvedMentions.length === 1 ? (
                  <>
                    <span className="font-mono font-medium text-live">
                      @{unresolvedMentions[0].mention}
                    </span>{" "}
                    isn&apos;t on your roster yet. Match or add the student when
                    you review.
                  </>
                ) : (
                  <>
                    Some @mentions aren&apos;t on your roster yet. Correct the
                    original capture before saving.
                  </>
                )}
              </p>
            ) : null}

            {display.followUps.length > 0 ? (
              <ul className="space-y-1 border-l-2 border-live-bright pl-3">
                {display.followUps.map((item) => (
                  <li key={item} className="text-[13px] leading-relaxed text-fg-2">
                    <span className="label mr-2 text-live">Follow up</span>
                    {item}
                  </li>
                ))}
              </ul>
            ) : null}

            {isPending ? (
              <div className="pt-1">
                <Button type="button" variant="outline" onClick={() => onReviewOpenChange(true)}>
                  Review before saving
                  <ArrowRight aria-hidden="true" className="size-4" />
                </Button>
              </div>
            ) : null}
          </div>
        ) : null}

        <div hidden={!reviewOpen || isEditing}>
          <InterpretationReviewPanel
            display={reviewDisplay}
            resetKey={draft.parsed.rawNote}
            onConfirm={handleConfirm}
            onReviewLater={() => onReviewOpenChange(false)}
            onCaptureAnother={onCaptureAnother}
            rosterStudents={rosterStudents}
            classGroups={classGroups}
            onCreateStudent={onCreateStudent}
            onSavePendingChange={setIsReviewSavePending}
            onResolvedStudentChange={setResolvedStudentOverride}
            hasPhoto={Boolean(photo)}
            photoChangePending={isProcessingPhoto}
            photoResolutionRequired={photoMissing && !photo}
            capturedAt={capturedAt}
            workspaceCreatedAt={workspaceCreatedAt}
          />
        </div>
      </div>
    </article>
  );
}

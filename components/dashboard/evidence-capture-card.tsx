"use client";

import { useId, useRef, useState } from "react";
import { InterpretationReviewPanel } from "@/components/dashboard/interpretation-review-panel";
import { LocalPhotoPreview } from "@/components/evidence/local-photo-preview";
import type {
  CreateStudentFromReviewInput,
  CreateStudentFromReviewResult,
  StudentResolutionClassOption,
} from "@/components/dashboard/student-resolution-field";
import { Button } from "@/components/ui/button";
import { ConfirmationPanel } from "@/components/ui/confirmation-panel";
import { Textarea } from "@/components/ui/textarea";
import {
  resolveCaptureDisplay,
  type CaptureValidation,
  type InterpretationFields,
} from "@/lib/evidence/capture-validation";
import { draftToDisplay } from "@/lib/note-processing/draft-to-display";
import type { NoteDraft } from "@/lib/note-processing/types";
import type { CaptureRosterStudent } from "@/lib/students/resolve-capture-students";
import {
  normalizeEvidencePhoto,
  type PhotoDraft,
} from "@/lib/evidence/photo-draft-storage";
import { ImagePlus, Trash2, X } from "lucide-react";

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
  detailsOpen: boolean;
  onDetailsOpenChange: (open: boolean) => void;
  onSaved: (
    result: ValidatedEvidenceSaveSuccess,
    fields: InterpretationFields,
    saveInput: ValidatedEvidenceSaveInput
  ) => void;
  onResolvedStudentChange?: (student: CaptureRosterStudent | null) => void;
  onCreateStudent: (
    input: CreateStudentFromReviewInput
  ) => Promise<CreateStudentFromReviewResult>;
  photo?: PhotoDraft;
  photoMissing?: boolean;
  photoRecoveryWarning?: string;
  onPhotoChange?: (photo: PhotoDraft) => Promise<void> | void;
  onPhotoRemove?: () => void;
  embedded?: boolean;
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
  | ValidatedEvidenceSaveSuccess
  | { success: false; error: string };

type ValidatedEvidenceSaveSuccess = {
  success: true;
  evidenceId: string;
  isFirstWorkspaceEvidence: boolean;
};

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
  detailsOpen,
  onDetailsOpenChange,
  onSaved,
  onResolvedStudentChange,
  onCreateStudent,
  photo,
  photoMissing = false,
  photoRecoveryWarning,
  onPhotoChange,
  onPhotoRemove,
  embedded = false,
}: EvidenceCaptureCardProps) {
  const sourceEditorId = useId();
  const photoErrorId = useId();
  const [isReviewSavePending, setIsReviewSavePending] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [editText, setEditText] = useState("");
  const [resolvedStudentOverride, setResolvedStudentOverride] =
    useState<CaptureRosterStudent | null>(null);
  const [detailsWereOpenBeforeEdit, setDetailsWereOpenBeforeEdit] =
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
  const reviewDisplay = draftToDisplay(draft, displayRosterStudents);
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
    setDetailsWereOpenBeforeEdit(detailsOpen);
    setIsConfirmingDelete(false);
    onDetailsOpenChange(false);
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
        onResolvedStudentChange?.(null);
      }
      setIsEditing(false);
      onDetailsOpenChange(true);
    }
  }

  function handleCancelEdit() {
    setIsEditing(false);
    onDetailsOpenChange(detailsWereOpenBeforeEdit);
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
      className={
        embedded
          ? "overflow-hidden border-t border-line bg-plate"
          : "plate overflow-hidden border-l-2 border-l-live-bright"
      }
    >
      <div
        className={`flex flex-col gap-2 px-4 pt-3.5 sm:flex-row sm:items-center ${
          embedded ? "sm:justify-end sm:px-4" : "sm:justify-between sm:px-5"
        }`}
      >
        {!embedded ? (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="label text-live">Pending approval</span>
            <span className="label text-fg-3">
              {timestamp} · clears at midnight
            </span>
          </div>
        ) : null}

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

      <div className={`px-4 pb-4 pt-3 ${embedded ? "" : "sm:px-5"}`}>
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
            aria-label={
              photo ? "Replace photo evidence" : "Choose photo evidence again"
            }
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
                This photo stays on this device until you approve and save it.
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
              <p className="text-sm font-medium text-danger">
                Photo needs attention
              </p>
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
                Correct the source note or student mention, then return to the
                prepared record.
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

        <div hidden={isEditing}>
          <InterpretationReviewPanel
            display={reviewDisplay}
            resetKey={draft.parsed.rawNote}
            onConfirm={handleConfirm}
            detailsOpen={detailsOpen}
            onDetailsOpenChange={onDetailsOpenChange}
            onSaved={onSaved}
            rosterStudents={rosterStudents}
            classGroups={classGroups}
            onCreateStudent={onCreateStudent}
            onSavePendingChange={setIsReviewSavePending}
            onResolvedStudentChange={(student) => {
              setResolvedStudentOverride(student);
              onResolvedStudentChange?.(student);
            }}
            hasPhoto={Boolean(photo)}
            photoChangePending={isProcessingPhoto}
            photoResolutionRequired={photoMissing && !photo}
            capturedAt={capturedAt}
            workspaceCreatedAt={workspaceCreatedAt}
            embedded={embedded}
          />
        </div>
      </div>
    </article>
  );
}

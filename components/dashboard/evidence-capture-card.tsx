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
import { CheckCircle2, Circle, ClipboardCheck, ImagePlus, Trash2, X } from "lucide-react";

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
    saveInput: ValidatedEvidenceSaveInput
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

const chipStyles = {
  default: "border-border bg-card text-foreground",
  student: "border-border bg-secondary text-foreground",
  tag: "border-border bg-transparent text-muted-foreground",
  evidence: "border-border bg-transparent text-foreground",
  unresolved:
    "border-border bg-transparent text-foreground",
};

function Chip({
  children,
  variant = "default",
  className = "",
}: {
  children: React.ReactNode;
  variant?: keyof typeof chipStyles;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${chipStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

function StudentAvatar({ student }: { student: StudentMentionDisplay }) {
  return (
    <span
      className={`mr-1.5 inline-flex size-4 items-center justify-center rounded-full text-[9px] font-bold text-link ${student.colorClass}`}
    >
      {student.initials}
    </span>
  );
}

function ResolvedStudentChip({ student }: { student: StudentMentionDisplay }) {
  return (
    <Link
      href={routes.student(student.id)}
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize transition-opacity hover:opacity-80 ${chipStyles.student}`}
    >
      <StudentAvatar student={student} />
      {student.displayName}
    </Link>
  );
}

function UnresolvedStudentChip({ mention }: { mention: string }) {
  return (
    <Chip variant="unresolved">
      Unmatched student
      <span className="ml-1.5 font-normal normal-case text-muted-foreground">
        ({mention})
      </span>
    </Chip>
  );
}

function StudentMentionChip({ mentionRef }: { mentionRef: StudentMentionRef }) {
  if (mentionRef.status === "resolved") {
    return <ResolvedStudentChip student={mentionRef.student} />;
  }
  return <UnresolvedStudentChip mention={mentionRef.mention} />;
}

function CaptureIcon({
  status,
}: {
  status: "pending" | "validated";
}) {
  if (status === "validated") {
    return (
      <span className="flex size-9 items-center justify-center rounded-md border border-border text-muted-foreground">
        <CheckCircle2 className="size-4" strokeWidth={1.75} />
      </span>
    );
  }

  return (
    <span className="flex size-9 items-center justify-center rounded-md border border-border text-muted-foreground">
      <ClipboardCheck className="size-4" strokeWidth={1.75} />
    </span>
  );
}

function StatusPill({
  status,
  needsReview,
}: {
  status: "pending" | "validated";
  needsReview: boolean;
}) {
  if (status === "validated") {
    return (
      <span className="inline-flex items-center gap-2 rounded-lg border border-border px-2.5 py-1 text-xs font-semibold text-muted-foreground">
        <Circle className="size-2 fill-current" />
        Validated
      </span>
    );
  }

  if (!needsReview) {
    return (
      <span className="inline-flex items-center gap-2 rounded-lg border border-border px-2.5 py-1 text-xs font-semibold text-muted-foreground">
        <Circle className="size-2 fill-current" />
        Ready to review
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-2 rounded-lg border border-border px-2.5 py-1 text-xs font-semibold text-foreground">
      <Circle className="size-2 fill-current text-link" />
      Needs review
    </span>
  );
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
    const result = await normalizeEvidencePhoto(file);
    setIsProcessingPhoto(false);
    if (!result.success) {
      setPhotoError(result.error);
      return;
    }
    await onPhotoChange?.(result.photo);
  }

  async function handleConfirm(
    fields: InterpretationFields,
    saveInput: ValidatedEvidenceSaveInput
  ): Promise<ValidatedEvidenceSaveResult> {
    const result = await onValidate(fields, saveInput);

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
    <article className="border-b border-border last:border-b-0">
      <div className="grid gap-3 px-3 py-3 sm:grid-cols-[2.25rem_minmax(0,1fr)] sm:px-4">
        <CaptureIcon status={display.validationStatus} />

        <div className="min-w-0">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <StatusPill
                status={display.validationStatus}
                needsReview={display.needsReview}
              />
              <span className="text-xs text-muted-foreground">{timestamp}</span>
            </div>

            {showActions && !isEditing ? (
              <div className="flex flex-wrap items-center gap-1">
                {onEdit && draft.parsed.rawNote.trim() ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={isReviewSavePending}
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
                    className="text-muted-foreground hover:text-destructive"
                    disabled={isReviewSavePending}
                    onClick={handleRequestDraftDelete}
                  >
                    <Trash2 aria-hidden="true" className="size-3.5" />
                    Delete draft
                  </Button>
                ) : null}
              </div>
            ) : null}
          </div>

          {isConfirmingDelete ? (
            <ConfirmationPanel
              ariaLabel="Confirm draft deletion"
              description="Delete this draft? It will be removed from this browser. This cannot be undone."
              confirmLabel="Delete this draft"
              tone="destructive"
              className="mt-3"
              disabled={isReviewSavePending}
              onConfirm={handleConfirmDraftDelete}
              onCancel={handleCancelDraftDelete}
            />
          ) : null}

          {photo ? (
            <div className="mt-4 grid gap-3 border-y border-border/70 py-3 sm:grid-cols-[7rem_1fr] sm:items-start">
              <input
                ref={photoInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                className="sr-only"
                aria-label="Replace photo evidence"
                aria-invalid={Boolean(photoError)}
                aria-describedby={photoError ? photoErrorId : undefined}
                onChange={(event) => void handlePhotoFile(event.target.files?.[0])}
              />
              <LocalPhotoPreview
                blob={photo.blob}
                alt="Temporary photo evidence preview"
                width={photo.width}
                height={photo.height}
              />
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">Temporary photo</p>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  This photo stays on this device until you validate and save it.
                </p>
                {photoRecoveryWarning ? (
                  <p role="alert" className="text-xs leading-relaxed text-destructive">
                    {photoRecoveryWarning}
                  </p>
                ) : null}
                {photoError ? (
                  <p id={photoErrorId} role="alert" className="text-xs text-destructive">
                    {photoError}
                  </p>
                ) : null}
                {isProcessingPhoto ? (
                  <p role="status" className="text-xs text-muted-foreground">
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
          ) : null}

          {isEditing ? (
            <div className="mt-4 space-y-3 border-y border-border bg-muted/20 px-3 py-4 sm:px-4">
              <div className="space-y-1">
                <label
                  htmlFor={sourceEditorId}
                  className="text-sm font-medium text-foreground"
                >
                  Original capture
                </label>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Correct the source note or student mention, then return to
                  review.
                </p>
              </div>
              <Textarea
                id={sourceEditorId}
                value={editText}
                onChange={(event) => setEditText(event.target.value)}
                className="min-h-[120px] text-[15px] leading-relaxed"
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
            <div className="mt-2.5 space-y-2.5">
              {draft.parsed.rawNote.trim() ? (
                <NoteContent text={draft.parsed.rawNote} />
              ) : (
                <p className="text-sm text-muted-foreground">Photo evidence without a note.</p>
              )}

              {draft.parsed.rawNote.trim() ? (
              <div className="flex flex-wrap gap-1.5">
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

                {display.topic ? <Chip>{display.topic}</Chip> : null}
                {display.performance ? <Chip>{display.performance}</Chip> : null}
                {display.behavior?.map((item) => (
                  <Chip key={item}>{item}</Chip>
                ))}
                <Chip variant="evidence">{display.evidenceType}</Chip>
                {display.tags.map((tag) => (
                  <Chip key={tag} variant="tag">
                    {formatTagLabel(tag)}
                  </Chip>
                ))}
              </div>
              ) : null}

              {hasUnresolvedMentions ? (
                <div className="rounded-md border border-border bg-card px-3 py-2.5">
                  <p className="text-xs leading-relaxed text-foreground">
                    {unresolvedMentions.length === 1 ? (
                      <>
                        <span className="font-medium">
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
                </div>
              ) : null}

              {display.followUps.length > 0 ? (
                <ul className="space-y-1 border-t border-border/50 pt-2.5">
                  {display.followUps.map((item) => (
                    <li
                      key={item}
                      className="text-xs leading-relaxed text-muted-foreground"
                    >
                      <span className="font-medium text-foreground">
                        Follow-up:
                      </span>{" "}
                      {item}
                    </li>
                  ))}
                </ul>
              ) : null}

              {isPending ? (
                <div className="border-t border-border/50 pt-2.5">
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => onReviewOpenChange(true)}
                  >
                    Review before saving
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
              capturedAt={capturedAt}
              workspaceCreatedAt={workspaceCreatedAt}
            />
          </div>
        </div>
      </div>
    </article>
  );
}

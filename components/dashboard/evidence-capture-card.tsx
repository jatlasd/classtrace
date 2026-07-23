"use client";

import Link from "next/link";
import { useId, useRef, useState } from "react";
import { InterpretationReviewPanel } from "@/components/dashboard/interpretation-review-panel";
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
  type StudentMentionDisplay,
  type StudentMentionRef,
} from "@/lib/students/student-mention-display";
import { CheckCircle2, Circle, ClipboardCheck, Trash2 } from "lucide-react";

type EvidenceCaptureCardProps = {
  draft: NoteDraft;
  timestamp?: string;
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
};

type ValidatedEvidenceSaveInput = {
  rosterStudentId: string;
  evidenceNote: string;
  summary: string;
  evidenceType: string;
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
  tag: "border-border bg-muted/60 text-link",
  evidence: "border-primary/25 bg-primary/10 text-primary",
  unresolved:
    "border-accent/50 bg-accent/25 text-foreground",
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
      className={`mr-1.5 inline-flex size-4 items-center justify-center rounded-full text-[9px] font-bold text-white ${student.colorClass}`}
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
      <span className="flex size-11 items-center justify-center rounded-lg border border-validated/50 bg-validated/35 text-validated-foreground">
        <CheckCircle2 className="size-5" strokeWidth={1.75} />
      </span>
    );
  }

  return (
    <span className="flex size-11 items-center justify-center rounded-lg border border-accent/40 bg-accent/15 text-primary">
      <ClipboardCheck className="size-5" strokeWidth={1.75} />
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
      <span className="inline-flex items-center gap-2 rounded-lg border border-validated/60 bg-validated/35 px-2.5 py-1 text-xs font-semibold text-validated-foreground">
        <Circle className="size-2 fill-current" />
        Validated
      </span>
    );
  }

  if (!needsReview) {
    return (
      <span className="inline-flex items-center gap-2 rounded-lg border border-validated/50 bg-validated/25 px-2.5 py-1 text-xs font-semibold text-validated-foreground">
        <Circle className="size-2 fill-current" />
        Ready to review
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-2 rounded-lg border border-accent/40 bg-accent/20 px-2.5 py-1 text-xs font-semibold text-foreground">
      <Circle className="size-2 fill-current text-primary" />
      Needs review
    </span>
  );
}

export function EvidenceCaptureCard({
  draft,
  timestamp = "Just now",
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
}: EvidenceCaptureCardProps) {
  const sourceEditorId = useId();
  const [isReviewSavePending, setIsReviewSavePending] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [editText, setEditText] = useState("");
  const [resolvedStudentOverride, setResolvedStudentOverride] =
    useState<CaptureRosterStudent | null>(null);
  const [reviewWasOpenBeforeEdit, setReviewWasOpenBeforeEdit] =
    useState(false);
  const deleteButtonRef = useRef<HTMLButtonElement>(null);
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
  const showActions = Boolean(onEdit || onDelete);
  const canSaveEdit = editText.trim().length > 0;

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
      setResolvedStudentOverride(null);
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
      <div className="grid gap-4 px-4 py-5 sm:grid-cols-[48px_minmax(0,1fr)] md:px-6">
        <CaptureIcon status={display.validationStatus} />

        <div className="min-w-0">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <StatusPill
                status={display.validationStatus}
                needsReview={display.needsReview}
              />
              <span className="text-xs text-muted-foreground">{timestamp}</span>
            </div>

            {showActions && !isEditing ? (
              <div className="flex flex-wrap items-center gap-1">
                {onEdit ? (
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
            <div className="mt-4 space-y-3">
              <NoteContent text={draft.parsed.rawNote} />

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

              {hasUnresolvedMentions ? (
                <div className="rounded-md border border-accent/40 bg-accent/15 px-3 py-2.5">
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
                <div className="border-t border-border/50 pt-3">
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
            />
          </div>
        </div>
      </div>
    </article>
  );
}

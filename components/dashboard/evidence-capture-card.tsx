"use client";

import Link from "next/link";
import { useState } from "react";
import { InterpretationReviewPanel } from "@/components/dashboard/interpretation-review-panel";
import { NoteContent } from "@/components/dashboard/note-content";
import { Button } from "@/components/ui/button";
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
  type Student,
  type StudentMentionRef,
} from "@/lib/students";
import {
  BarChart3,
  CheckCircle2,
  Circle,
  MessageCircle,
  MoreHorizontal,
  Star,
  User,
} from "lucide-react";

type EvidenceCaptureCardProps = {
  draft: NoteDraft;
  timestamp?: string;
  validation?: CaptureValidation;
  rosterStudents: CaptureRosterStudent[];
  onValidate: (fields: InterpretationFields) => void;
  onEdit?: (rawNote: string) => boolean;
  onDelete?: () => void;
};

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

function StudentAvatar({ student }: { student: Student }) {
  return (
    <span
      className={`mr-1.5 inline-flex size-4 items-center justify-center rounded-full text-[9px] font-bold text-white ${student.colorClass}`}
    >
      {student.initials}
    </span>
  );
}

function ResolvedStudentChip({ student }: { student: Student }) {
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

function CaptureIcon({ evidenceType }: { evidenceType: string }) {
  const normalizedType = evidenceType.toLowerCase();

  if (normalizedType.includes("behavior")) {
    return (
      <span className="flex size-11 items-center justify-center rounded-lg border border-accent/40 bg-accent/15 text-primary">
        <Star className="size-5" strokeWidth={1.75} />
      </span>
    );
  }

  if (normalizedType.includes("academic") || normalizedType.includes("skill")) {
    return (
      <span className="flex size-11 items-center justify-center rounded-lg border border-link/20 bg-secondary text-link">
        <BarChart3 className="size-5" strokeWidth={1.75} />
      </span>
    );
  }

  if (normalizedType.includes("communication")) {
    return (
      <span className="flex size-11 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
        <MessageCircle className="size-5" strokeWidth={1.75} />
      </span>
    );
  }

  return (
    <span className="flex size-11 items-center justify-center rounded-lg border border-validated/50 bg-validated/35 text-validated-foreground">
      <CheckCircle2 className="size-5" strokeWidth={1.75} />
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
  onValidate,
  onEdit,
  onDelete,
}: EvidenceCaptureCardProps) {
  const [reviewOpen, setReviewOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState("");
  const display = resolveCaptureDisplay(draft, validation, rosterStudents);
  const parserDisplay = draftToDisplay(draft, rosterStudents);
  const showReviewCta =
    display.needsReview && display.validationStatus !== "validated";
  const unresolvedMentions = display.studentMentions.filter(
    (ref) => ref.status === "unresolved"
  );
  const hasUnresolvedMentions = unresolvedMentions.length > 0;
  const showActions = Boolean(onEdit || onDelete);
  const canSaveEdit = editText.trim().length > 0;

  function handleConfirm(fields: InterpretationFields) {
    onValidate(fields);
    setReviewOpen(false);
  }

  function handleStartEdit() {
    setEditText(draft.parsed.rawNote);
    setReviewOpen(false);
    setIsEditing(true);
  }

  function handleSaveEdit() {
    const trimmed = editText.trim();
    if (!trimmed) {
      return;
    }
    const saved = onEdit?.(trimmed) ?? true;
    if (saved) {
      setIsEditing(false);
    }
  }

  function handleCancelEdit() {
    setIsEditing(false);
  }

  function handleDelete() {
    if (
      window.confirm(
        "Delete this capture? It will be removed from this browser."
      )
    ) {
      onDelete?.();
    }
  }

  return (
    <article className="border-b border-border last:border-b-0">
      <div className="grid gap-4 px-4 py-5 md:grid-cols-[72px_88px_minmax(0,1fr)_220px] md:px-6">
        <div className="flex items-start gap-3 md:block">
          <CaptureIcon evidenceType={display.evidenceType} />
          <div className="md:hidden">
            <p className="text-xs text-muted-foreground">{timestamp}</p>
            <StatusPill
              status={display.validationStatus}
              needsReview={showReviewCta}
            />
          </div>
        </div>

        <div className="hidden text-sm leading-relaxed text-muted-foreground md:block">
          <p>{timestamp.split(" ")[0] ?? timestamp}</p>
          {timestamp.includes(" ") && <p>{timestamp.split(" ").slice(1).join(" ")}</p>}
        </div>

        <div className="min-w-0 space-y-3">
          {isEditing ? (
            <div className="space-y-2">
            <Textarea
              value={editText}
              onChange={(event) => setEditText(event.target.value)}
              className="min-h-[120px] text-[15px] leading-relaxed"
              aria-label="Edit capture note"
            />
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                disabled={!canSaveEdit}
                onClick={handleSaveEdit}
              >
                Save
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
          ) : (
            <NoteContent text={draft.parsed.rawNote} />
          )}

          {!isEditing && (
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

            {display.topic && <Chip>{display.topic}</Chip>}

            {display.performance && <Chip>{display.performance}</Chip>}

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
          )}

          {hasUnresolvedMentions && (
            <div className="mt-3 rounded-md border border-accent/40 bg-accent/15 px-3 py-2.5">
              <p className="text-xs leading-relaxed text-foreground">
                {unresolvedMentions.length === 1 ? (
                  <>
                    <span className="font-medium">@{unresolvedMentions[0].mention}</span>{" "}
                    isn&apos;t on your roster yet. Add them from My roster, or fix
                    student names when you review.
                  </>
                ) : (
                  <>
                    Some @mentions aren&apos;t on your roster yet. Add students from
                    My roster, or fix student names when you review.
                  </>
                )}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <Link
                  href={routes.roster}
                  className="text-xs font-medium text-link underline-offset-2 hover:underline"
                >
                  My roster
                </Link>
                {showReviewCta && !reviewOpen && (
                  <button
                    type="button"
                    className="text-xs font-medium text-link underline-offset-2 hover:underline"
                    onClick={() => setReviewOpen(true)}
                  >
                    Review interpretation
                  </button>
                )}
              </div>
            </div>
          )}

          {display.followUps.length > 0 && (
            <ul className="mt-3 space-y-1 border-t border-border/50 pt-2.5">
              {display.followUps.map((item) => (
                <li
                  key={item}
                  className="text-xs leading-relaxed text-muted-foreground"
                >
                  <span className="font-medium text-foreground">Follow-up:</span>{" "}
                  {item}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="space-y-3 md:border-l md:border-border md:pl-6">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-2">
              <StatusPill
                status={display.validationStatus}
                needsReview={showReviewCta}
              />
              <p className="text-sm text-muted-foreground">Ms. Rivera</p>
              {display.validationStatus === "validated" && validation?.status === "validated" && (
                <p className="text-xs text-muted-foreground">
                  Filed after review
                </p>
              )}
            </div>

            {showActions && !isEditing && (
              <div className="flex items-center gap-1">
                {onEdit && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="xs"
                    onClick={handleStartEdit}
                  >
                    Edit
                  </Button>
                )}
                {onDelete && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="text-muted-foreground hover:text-destructive"
                    aria-label="Delete capture"
                    onClick={handleDelete}
                  >
                    <MoreHorizontal className="size-4" />
                  </Button>
                )}
              </div>
            )}
          </div>

          {!isEditing && showReviewCta && !reviewOpen && (
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={() => setReviewOpen(true)}
            >
              Review interpretation
            </Button>
          )}

          {!isEditing && !showReviewCta && (
            <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <User className="size-3.5" />
              Teacher-controlled draft
            </p>
          )}
        </div>

        {!isEditing && showReviewCta && reviewOpen && (
          <div className="md:col-span-4">
          <InterpretationReviewPanel
            display={parserDisplay}
            onConfirm={handleConfirm}
            onDismiss={() => setReviewOpen(false)}
          />
          </div>
        )}
      </div>
    </article>
  );
}

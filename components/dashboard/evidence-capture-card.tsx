"use client";

import { useState } from "react";
import { InterpretationReviewPanel } from "@/components/dashboard/interpretation-review-panel";
import { NoteContent } from "@/components/dashboard/note-content";
import { Button } from "@/components/ui/button";
import {
  resolveCaptureDisplay,
  type CaptureValidation,
  type InterpretationFields,
} from "@/lib/evidence/capture-validation";
import { draftToDisplay } from "@/lib/note-processing/draft-to-display";
import type { NoteDraft } from "@/lib/note-processing/types";
import { studentColors } from "@/lib/mock-data";

type EvidenceCaptureCardProps = {
  draft: NoteDraft;
  timestamp?: string;
  validation?: CaptureValidation;
  onValidate: (fields: InterpretationFields) => void;
};

function Chip({
  children,
  variant = "default",
}: {
  children: React.ReactNode;
  variant?: "default" | "student" | "tag" | "evidence";
}) {
  const styles = {
    default: "border-border bg-card text-foreground",
    student:
      "border-sky-200/80 bg-sky-50 text-sky-900 dark:border-sky-900/50 dark:bg-sky-950/40 dark:text-sky-200",
    tag: "border-border bg-muted/60 text-link",
    evidence: "border-primary/20 bg-primary/5 text-primary",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${styles[variant]}`}
    >
      {children}
    </span>
  );
}

export function EvidenceCaptureCard({
  draft,
  timestamp = "Just now",
  validation,
  onValidate,
}: EvidenceCaptureCardProps) {
  const [reviewOpen, setReviewOpen] = useState(false);
  const display = resolveCaptureDisplay(draft, validation);
  const parserDisplay = draftToDisplay(draft);
  const showReviewCta =
    display.needsReview && display.validationStatus !== "validated";

  function handleConfirm(fields: InterpretationFields) {
    onValidate(fields);
    setReviewOpen(false);
  }

  return (
    <article className="rounded-xl border border-border bg-card shadow-sm">
      <div className="space-y-3 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground">{timestamp}</span>
          {showReviewCta && (
            <span className="rounded-full border border-amber-200/80 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200">
              Needs review
            </span>
          )}
          {display.validationStatus === "validated" && (
            <span className="rounded-full border border-emerald-200/80 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-200">
              Validated
            </span>
          )}
        </div>

        <NoteContent text={draft.parsed.rawNote} />

        <div className="rounded-lg border border-border/60 bg-muted/30 px-3 py-3">
          <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            ClassTrace read this as
          </p>

          <div className="flex flex-wrap gap-1.5">
            {display.students.map((student) => (
              <Chip key={student} variant="student">
                <span
                  className={`mr-1.5 inline-flex size-4 items-center justify-center rounded-full text-[9px] font-bold text-white ${studentColors[student] ?? "bg-slate-400"}`}
                >
                  {student.charAt(0)}
                </span>
                {student}
              </Chip>
            ))}

            {display.topic && <Chip>{display.topic}</Chip>}

            {display.performance && <Chip>{display.performance}</Chip>}

            {display.behavior?.map((item) => (
              <Chip key={item}>{item}</Chip>
            ))}

            <Chip variant="evidence">{display.evidenceType}</Chip>

            {display.tags.map((tag) => (
              <Chip key={tag} variant="tag">
                {tag}
              </Chip>
            ))}
          </div>

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

        {showReviewCta && !reviewOpen && (
          <Button
            variant="outline"
            size="sm"
            className="w-full sm:w-auto"
            onClick={() => setReviewOpen(true)}
          >
            Review interpretation
          </Button>
        )}

        {showReviewCta && reviewOpen && (
          <InterpretationReviewPanel
            display={parserDisplay}
            onConfirm={handleConfirm}
            onDismiss={() => setReviewOpen(false)}
          />
        )}
      </div>
    </article>
  );
}

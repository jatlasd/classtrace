"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatTagLabel } from "@/lib/format-tag";
import {
  displayToInterpretationFields,
  joinFollowUpNotes,
  joinOptionalList,
  NOTE_TYPE_OPTIONS,
  parseFollowUpNotes,
  parseTags,
  validateSingleStudentForInterpretation,
  type InterpretationFields,
} from "@/lib/evidence/capture-validation";
import type { DraftDisplay } from "@/lib/note-processing/draft-to-display";

type InterpretationReviewPanelProps = {
  display: DraftDisplay;
  onConfirm: (fields: InterpretationFields) => void;
  onDismiss: () => void;
};

type FormState = {
  evidenceType: string;
  topic: string;
  performance: string;
  behavior: string;
  tags: string;
  followUpNotes: string;
};

function displayToFormState(display: DraftDisplay): FormState {
  const fields = displayToInterpretationFields(display);
  return {
    evidenceType: fields.evidenceType,
    topic: fields.topic ?? "",
    performance: fields.performance ?? "",
    behavior: joinOptionalList(fields.behavior),
    tags: fields.tags.map(formatTagLabel).join(", "),
    followUpNotes: joinFollowUpNotes(fields.followUpNotes),
  };
}

function parseOptionalList(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function formStateToFields(
  form: FormState,
  studentName: string
): InterpretationFields {
  const behavior = parseOptionalList(form.behavior);

  return {
    students: [studentName],
    evidenceType: form.evidenceType,
    topic: form.topic.trim() || undefined,
    performance: form.performance.trim() || undefined,
    behavior: behavior.length > 0 ? behavior : undefined,
    tags: parseTags(form.tags),
    followUpNotes: parseFollowUpNotes(form.followUpNotes),
  };
}

const fieldInputClass =
  "h-8 w-full rounded-md border border-border bg-background px-2.5 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30";

function FieldRow({
  label,
  value,
  isEditing,
  children,
}: {
  label: string;
  value: string;
  isEditing: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      {isEditing ? (
        children
      ) : (
        <p className="text-sm leading-snug text-foreground">
          {value.trim() || "—"}
        </p>
      )}
    </div>
  );
}

function draftDisplayKey(display: DraftDisplay): string {
  return [
    display.summaryLine,
    display.evidenceType,
    display.studentMentions
      .map((mention) =>
        mention.status === "resolved"
          ? mention.student.handle
          : mention.mention
      )
      .join(","),
    display.tags.join(","),
  ].join("|");
}

function InterpretationReviewPanelContent({
  display,
  onConfirm,
  onDismiss,
}: InterpretationReviewPanelProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<FormState>(() => displayToFormState(display));
  const [validationError, setValidationError] = useState("");
  const studentValidation = validateSingleStudentForInterpretation(display);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function studentValidationMessage(): string {
    if (studentValidation.status === "valid_one_student") {
      return "";
    }

    if (studentValidation.status === "no_student") {
      return "Choose one roster student before validating this draft.";
    }

    if (studentValidation.status === "multiple_students") {
      return "Choose one student for this V1 evidence record.";
    }

    return "This student is not on your roster yet.";
  }

  function handleConfirm() {
    if (studentValidation.status !== "valid_one_student") {
      setValidationError(studentValidationMessage());
      return;
    }

    if (!form.evidenceType.trim()) {
      setValidationError("Choose an evidence type before validating this draft.");
      return;
    }

    setValidationError("");
    onConfirm(formStateToFields(form, studentValidation.studentName));
  }

  return (
    <div className="mt-3 rounded-card border border-border bg-card px-4 py-4 shadow-paper">
      <div className="mb-4 space-y-1">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          ClassTrace read this as
        </p>
        <p className="font-display text-lg font-semibold text-foreground">
          Review before saving
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Adjust anything that looks off before this becomes validated evidence.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <FieldRow
          label="Student"
          value={
            studentValidation.status === "valid_one_student"
              ? studentValidation.studentName
              : studentValidation.status === "no_student"
                ? ""
                : studentValidation.studentNames.join(", ")
          }
          isEditing={false}
        >
          <span />
        </FieldRow>

        <FieldRow
          label="Evidence type"
          value={form.evidenceType}
          isEditing={isEditing}
        >
          <select
            id="review-evidence-type"
            aria-label="Evidence type"
            value={form.evidenceType}
            onChange={(e) => updateField("evidenceType", e.target.value)}
            className={fieldInputClass}
          >
            {!NOTE_TYPE_OPTIONS.includes(form.evidenceType) && (
              <option value={form.evidenceType}>{form.evidenceType}</option>
            )}
            {NOTE_TYPE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </FieldRow>

        <FieldRow label="Topic / skill" value={form.topic} isEditing={isEditing}>
          <input
            id="review-topic"
            aria-label="Topic or skill"
            type="text"
            value={form.topic}
            onChange={(e) => updateField("topic", e.target.value)}
            className={fieldInputClass}
          />
        </FieldRow>

        <FieldRow
          label="Performance"
          value={form.performance}
          isEditing={isEditing}
        >
          <input
            id="review-performance"
            aria-label="Performance"
            type="text"
            value={form.performance}
            onChange={(e) => updateField("performance", e.target.value)}
            className={fieldInputClass}
          />
        </FieldRow>

        <FieldRow
          label="Behavior / work habit"
          value={form.behavior}
          isEditing={isEditing}
        >
          <input
            id="review-behavior"
            aria-label="Behavior or work habit"
            type="text"
            value={form.behavior}
            onChange={(e) => updateField("behavior", e.target.value)}
            className={fieldInputClass}
          />
        </FieldRow>

        <FieldRow label="Tags" value={form.tags} isEditing={isEditing}>
          <input
            id="review-tags"
            aria-label="Tags"
            type="text"
            value={form.tags}
            onChange={(e) => updateField("tags", e.target.value)}
            className={fieldInputClass}
          />
        </FieldRow>

        <div className="space-y-1 sm:col-span-2">
          <label
            htmlFor="review-follow-ups"
            className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground"
          >
            Follow-up notes
          </label>
          {isEditing ? (
            <Textarea
              id="review-follow-ups"
              value={form.followUpNotes}
              onChange={(e) => updateField("followUpNotes", e.target.value)}
              rows={2}
              className="min-h-[60px] resize-none text-sm"
            />
          ) : (
            <p className="whitespace-pre-line text-sm leading-snug text-foreground">
              {form.followUpNotes.trim() || "—"}
            </p>
          )}
        </div>
      </div>

      <div aria-live="polite" className="mt-3 min-h-5">
        {validationError ? (
          <p className="text-sm text-destructive">{validationError}</p>
        ) : (
          <p className="text-xs leading-relaxed text-muted-foreground">
            Validated captures stay in this browser for now.
          </p>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border/50 pt-3">
        <Button size="sm" onClick={handleConfirm}>
          Validate draft
        </Button>
        {!isEditing && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsEditing(true)}
          >
            Edit
          </Button>
        )}
        <Button size="sm" variant="ghost" onClick={onDismiss}>
          Dismiss for now
        </Button>
      </div>
    </div>
  );
}

export function InterpretationReviewPanel(
  props: InterpretationReviewPanelProps
) {
  return (
    <InterpretationReviewPanelContent
      key={draftDisplayKey(props.display)}
      {...props}
    />
  );
}

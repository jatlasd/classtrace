"use client";

import Link from "next/link";
import { useId, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatTagLabel } from "@/lib/format-tag";
import {
  buildValidatedEvidenceSummary,
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
import { routes } from "@/lib/routes";

type InterpretationReviewPanelProps = {
  display: DraftDisplay;
  onConfirm: (
    fields: InterpretationFields,
    saveInput: ValidatedEvidenceSaveInput
  ) => Promise<ValidatedEvidenceSaveResult>;
  onReviewLater: () => void;
  onCaptureAnother: () => void;
  onSavePendingChange?: (isPending: boolean) => void;
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

type FormState = {
  evidenceNote: string;
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
    evidenceNote: display.cleanText,
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
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <label
        htmlFor={htmlFor}
        className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground"
      >
        {label}
      </label>
      {children}
    </div>
  );
}

function draftDisplayKey(display: DraftDisplay): string {
  return [
    display.summaryLine,
    display.cleanText,
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
  onReviewLater,
  onCaptureAnother,
  onSavePendingChange,
}: InterpretationReviewPanelProps) {
  const fieldIdPrefix = useId();
  const evidenceNoteId = `${fieldIdPrefix}-evidence-note`;
  const evidenceTypeId = `${fieldIdPrefix}-evidence-type`;
  const topicId = `${fieldIdPrefix}-topic`;
  const performanceId = `${fieldIdPrefix}-performance`;
  const behaviorId = `${fieldIdPrefix}-behavior`;
  const tagsId = `${fieldIdPrefix}-tags`;
  const followUpsId = `${fieldIdPrefix}-follow-ups`;
  const [form, setForm] = useState<FormState>(() => displayToFormState(display));
  const [validationError, setValidationError] = useState("");
  const validationErrorRef = useRef<HTMLParagraphElement | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [savedEvidenceId, setSavedEvidenceId] = useState("");
  const [isFirstWorkspaceEvidence, setIsFirstWorkspaceEvidence] =
    useState(false);
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
      return "Choose one student for this evidence record.";
    }

    return "This student is not on your roster yet.";
  }

  function showValidationError(message: string): void {
    setValidationError(message);
    window.requestAnimationFrame(() => validationErrorRef.current?.focus());
  }

  async function handleConfirm() {
    if (isSaving || savedEvidenceId) {
      return;
    }

    if (studentValidation.status !== "valid_one_student") {
      showValidationError(studentValidationMessage());
      return;
    }

    if (!form.evidenceType.trim()) {
      showValidationError("Choose an evidence type before validating this draft.");
      return;
    }

    const evidenceNote = form.evidenceNote.trim();

    if (!evidenceNote) {
      showValidationError("Add an evidence note before saving evidence.");
      return;
    }

    const fields = formStateToFields(form, studentValidation.studentName);
    const summary = buildValidatedEvidenceSummary(fields);

    if (!summary) {
      showValidationError("Add a summary before saving evidence.");
      return;
    }

    setValidationError("");
    setIsSaving(true);
    onSavePendingChange?.(true);

    let result: ValidatedEvidenceSaveResult;

    try {
      result = await onConfirm(fields, {
        rosterStudentId: studentValidation.studentId,
        evidenceNote,
        summary,
        evidenceType: fields.evidenceType,
        topic: fields.topic,
        performance: fields.performance,
        behavior: fields.behavior,
        tags: fields.tags,
        followUpNotes: fields.followUpNotes,
      });
    } catch {
      result = { success: false, error: "Failed to save evidence." };
    } finally {
      setIsSaving(false);
      onSavePendingChange?.(false);
    }

    if (result.success) {
      setSavedEvidenceId(result.evidenceId);
      setIsFirstWorkspaceEvidence(result.isFirstWorkspaceEvidence);
      return;
    }

    showValidationError(result.error);
  }

  return (
    <div className="mt-4 border-t border-border pt-4">
      <div className="mb-4 space-y-1">
        <p className="text-xs font-semibold text-primary">Teacher review</p>
        <h3 className="font-display text-xl font-semibold text-foreground">
          Review before saving
        </h3>
        <p className="text-sm leading-relaxed text-muted-foreground">
          The Evidence note is the saved observation. Structured details below
          support searching and scanning.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1 sm:col-span-2">
          <label
            htmlFor={evidenceNoteId}
            className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground"
          >
            Evidence note
          </label>
          <Textarea
            id={evidenceNoteId}
            value={form.evidenceNote}
            onChange={(e) => updateField("evidenceNote", e.target.value)}
            rows={3}
            disabled={isSaving || Boolean(savedEvidenceId)}
            className="min-h-[84px] resize-none text-sm"
          />
          <p className="text-xs leading-relaxed text-muted-foreground">
            This note will be saved exactly as shown.
          </p>
        </div>

        <div className="border-t border-border/50 pt-3 sm:col-span-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Structured details
          </p>
        </div>

        <div className="space-y-1">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Student
          </p>
          <p className="text-sm leading-snug text-foreground">
            {studentValidation.status === "valid_one_student"
              ? studentValidation.studentName
              : studentValidation.status === "no_student"
                ? "—"
                : studentValidation.studentNames.join(", ")}
          </p>
        </div>

        <FieldRow label="Evidence type" htmlFor={evidenceTypeId}>
          <select
            id={evidenceTypeId}
            value={form.evidenceType}
            onChange={(e) => updateField("evidenceType", e.target.value)}
            disabled={isSaving || Boolean(savedEvidenceId)}
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

        <FieldRow label="Topic / skill" htmlFor={topicId}>
          <input
            id={topicId}
            type="text"
            value={form.topic}
            onChange={(e) => updateField("topic", e.target.value)}
            disabled={isSaving || Boolean(savedEvidenceId)}
            className={fieldInputClass}
          />
        </FieldRow>

        <FieldRow label="Performance" htmlFor={performanceId}>
          <input
            id={performanceId}
            type="text"
            value={form.performance}
            onChange={(e) => updateField("performance", e.target.value)}
            disabled={isSaving || Boolean(savedEvidenceId)}
            className={fieldInputClass}
          />
        </FieldRow>

        <FieldRow
          label="Behavior / work habit"
          htmlFor={behaviorId}
        >
          <input
            id={behaviorId}
            type="text"
            value={form.behavior}
            onChange={(e) => updateField("behavior", e.target.value)}
            disabled={isSaving || Boolean(savedEvidenceId)}
            className={fieldInputClass}
          />
        </FieldRow>

        <FieldRow label="Tags" htmlFor={tagsId}>
          <input
            id={tagsId}
            type="text"
            value={form.tags}
            onChange={(e) => updateField("tags", e.target.value)}
            disabled={isSaving || Boolean(savedEvidenceId)}
            className={fieldInputClass}
          />
        </FieldRow>

        <div className="space-y-1 sm:col-span-2">
          <label
            htmlFor={followUpsId}
            className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground"
          >
            Follow-up notes
          </label>
          <Textarea
            id={followUpsId}
            value={form.followUpNotes}
            onChange={(e) => updateField("followUpNotes", e.target.value)}
            rows={2}
            disabled={isSaving || Boolean(savedEvidenceId)}
            className="min-h-[60px] resize-none text-sm"
          />
        </div>
      </div>

      <div aria-live="polite" className="mt-3 min-h-5">
        {validationError ? (
          <p
            ref={validationErrorRef}
            role="alert"
            tabIndex={-1}
            className="text-sm text-destructive outline-none focus-visible:ring-3 focus-visible:ring-ring/30"
          >
            {validationError}
          </p>
        ) : savedEvidenceId &&
          isFirstWorkspaceEvidence &&
          studentValidation.status === "valid_one_student" ? (
          <section className="rounded-card border border-validated/60 bg-validated/20 p-4 shadow-paper">
            <p className="text-xs font-semibold uppercase tracking-wider text-validated-foreground">
              Evidence trail started
            </p>
            <h3 className="mt-1 font-display text-lg font-semibold text-foreground">
              Saved to {studentValidation.studentName}&apos;s timeline.
            </h3>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              This observation is now part of the record, ready when you need to
              look back instead of reconstructing the moment from memory.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button asChild size="sm">
                <Link href={routes.student(studentValidation.studentId)}>
                  View {studentValidation.studentName}&apos;s timeline
                </Link>
              </Button>
              <Button asChild size="sm" variant="outline">
                <Link href={routes.studentReport(studentValidation.studentId)}>
                  Preview report
                </Link>
              </Button>
              <Button size="sm" variant="ghost" onClick={onCaptureAnother}>
                Capture another note
              </Button>
            </div>
          </section>
        ) : savedEvidenceId ? (
          <p className="text-sm text-validated-foreground">
            Validated evidence saved.
          </p>
        ) : isSaving ? (
          <p className="text-sm text-muted-foreground">Saving evidence…</p>
        ) : (
          <p className="text-xs leading-relaxed text-muted-foreground">
            Save validated evidence to your evidence records after review.
          </p>
        )}
      </div>

      <div
        className={`mt-4 flex flex-wrap items-center gap-2 border-t border-border/50 pt-3 ${
          savedEvidenceId && isFirstWorkspaceEvidence ? "hidden" : ""
        }`}
      >
        <Button
          size="sm"
          disabled={isSaving || Boolean(savedEvidenceId)}
          onClick={handleConfirm}
        >
          {savedEvidenceId
            ? "Evidence saved"
            : isSaving
              ? "Saving evidence…"
              : "Save validated evidence"}
        </Button>
        {!savedEvidenceId ? (
          <Button
            size="sm"
            variant="ghost"
            disabled={isSaving}
            onClick={onReviewLater}
          >
            Review later
          </Button>
        ) : null}
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

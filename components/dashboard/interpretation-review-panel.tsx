"use client";

import Link from "next/link";
import { useId, useRef, useState } from "react";
import {
  StudentResolutionField,
  type CreateStudentFromReviewInput,
  type CreateStudentFromReviewResult,
  type StudentResolutionClassOption,
} from "@/components/dashboard/student-resolution-field";
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
import type { CaptureRosterStudent } from "@/lib/students/resolve-capture-students";
import { CheckCircle2 } from "lucide-react";

type InterpretationReviewPanelProps = {
  display: DraftDisplay;
  resetKey?: string;
  onConfirm: (
    fields: InterpretationFields,
    saveInput: ValidatedEvidenceSaveInput
  ) => Promise<ValidatedEvidenceSaveResult>;
  onReviewLater: () => void;
  onCaptureAnother: () => void;
  rosterStudents: CaptureRosterStudent[];
  classGroups: StudentResolutionClassOption[];
  onCreateStudent: (
    input: CreateStudentFromReviewInput
  ) => Promise<CreateStudentFromReviewResult>;
  onSavePendingChange?: (isPending: boolean) => void;
  onResolvedStudentChange?: (student: CaptureRosterStudent | null) => void;
  hasPhoto?: boolean;
  capturedAt?: number;
  workspaceCreatedAt?: string;
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

type FormState = {
  evidenceDate: string;
  evidenceNote: string;
  evidenceType: string;
  topic: string;
  performance: string;
  behavior: string;
  tags: string;
  followUpNotes: string;
};

function localDateInputValue(timestamp = Date.now()): string {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function displayToFormState(
  display: DraftDisplay,
  photoOnly: boolean,
  capturedAt?: number
): FormState {
  const fields = displayToInterpretationFields(display);
  return {
    evidenceDate: localDateInputValue(capturedAt),
    evidenceNote: display.cleanText,
    evidenceType: photoOnly ? "" : fields.evidenceType,
    topic: photoOnly ? "" : (fields.topic ?? ""),
    performance: photoOnly ? "" : (fields.performance ?? ""),
    behavior: photoOnly ? "" : joinOptionalList(fields.behavior),
    tags: photoOnly ? "" : fields.tags.map(formatTagLabel).join(", "),
    followUpNotes: photoOnly ? "" : joinFollowUpNotes(fields.followUpNotes),
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
  rosterStudents,
  classGroups,
  onCreateStudent,
  onSavePendingChange,
  onResolvedStudentChange,
  hasPhoto = false,
  capturedAt,
  workspaceCreatedAt = "1970-01-01T00:00:00.000Z",
}: InterpretationReviewPanelProps) {
  const fieldIdPrefix = useId();
  const evidenceNoteId = `${fieldIdPrefix}-evidence-note`;
  const evidenceDateId = `${fieldIdPrefix}-evidence-date`;
  const evidenceTypeId = `${fieldIdPrefix}-evidence-type`;
  const topicId = `${fieldIdPrefix}-topic`;
  const performanceId = `${fieldIdPrefix}-performance`;
  const behaviorId = `${fieldIdPrefix}-behavior`;
  const tagsId = `${fieldIdPrefix}-tags`;
  const followUpsId = `${fieldIdPrefix}-follow-ups`;
  const studentResolutionErrorId = `${fieldIdPrefix}-student-resolution-error`;
  const initialPhotoOnly = hasPhoto && !display.cleanText.trim();
  const [form, setForm] = useState<FormState>(() =>
    displayToFormState(display, initialPhotoOnly, capturedAt)
  );
  const photoOnly = hasPhoto && !form.evidenceNote.trim();
  const [validationError, setValidationError] = useState("");
  const validationErrorRef = useRef<HTMLParagraphElement | null>(null);
  const studentResolutionRef = useRef<HTMLDivElement | null>(null);
  const [studentResolutionError, setStudentResolutionError] = useState("");
  const [resolvedStudentOverride, setResolvedStudentOverride] =
    useState<CaptureRosterStudent | null>(null);
  const [isResolvingStudent, setIsResolvingStudent] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedEvidenceId, setSavedEvidenceId] = useState("");
  const [isFirstWorkspaceEvidence, setIsFirstWorkspaceEvidence] =
    useState(false);
  const parsedStudentValidation = validateSingleStudentForInterpretation(display);
  const studentValidation = resolvedStudentOverride
    ? {
        status: "valid_one_student" as const,
        studentId: resolvedStudentOverride.id,
        studentName: resolvedStudentOverride.displayName,
      }
    : parsedStudentValidation;
  const unresolvedMention =
    parsedStudentValidation.status === "unresolved_student" &&
    parsedStudentValidation.studentNames.length === 1
      ? parsedStudentValidation.studentNames[0]
      : "";
  const needsStudentResolution =
    parsedStudentValidation.status === "unresolved_student" ||
    parsedStudentValidation.status === "no_student";
  const isBusy = isSaving || isResolvingStudent;
  const minimumEvidenceDate = localDateInputValue(
    new Date(workspaceCreatedAt).getTime()
  );
  const maximumEvidenceDate = localDateInputValue();

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

    return "Resolve the student before saving validated evidence.";
  }

  function showValidationError(message: string): void {
    setValidationError(message);
    window.requestAnimationFrame(() => validationErrorRef.current?.focus());
  }

  function showStudentResolutionError(message: string): void {
    setStudentResolutionError(message);
    if (message) {
      window.requestAnimationFrame(() => studentResolutionRef.current?.focus());
    }
  }

  function handleStudentResolved(student: CaptureRosterStudent): void {
    setResolvedStudentOverride(student);
    onResolvedStudentChange?.(student);
    setStudentResolutionError("");
    setValidationError("");
  }

  function handleStudentResolutionReset(): void {
    setResolvedStudentOverride(null);
    onResolvedStudentChange?.(null);
  }

  function handleStudentResolutionPendingChange(isPending: boolean): void {
    setIsResolvingStudent(isPending);
    onSavePendingChange?.(isPending);
  }

  async function handleConfirm() {
    if (isBusy || savedEvidenceId) {
      return;
    }

    if (studentValidation.status !== "valid_one_student") {
      if (unresolvedMention) {
        showStudentResolutionError(studentValidationMessage());
      } else {
        showValidationError(studentValidationMessage());
      }
      return;
    }

    if (!photoOnly && !form.evidenceType.trim()) {
      showValidationError("Choose an evidence type before validating this draft.");
      return;
    }

    const evidenceNote = form.evidenceNote.trim();

    if (!evidenceNote && !hasPhoto) {
      showValidationError("Add an evidence note or photo before saving evidence.");
      return;
    }

    if (
      !form.evidenceDate ||
      form.evidenceDate < minimumEvidenceDate ||
      form.evidenceDate > maximumEvidenceDate
    ) {
      showValidationError("Choose a valid evidence date before saving.");
      return;
    }

    const fields = formStateToFields(form, studentValidation.studentName);
    const hasStructuredFields = Boolean(
      fields.evidenceType.trim() ||
        fields.topic ||
        fields.performance ||
        fields.behavior?.length ||
        fields.tags.length ||
        fields.followUpNotes.length
    );
    const summary = hasStructuredFields
      ? buildValidatedEvidenceSummary(fields)
      : undefined;

    if (!photoOnly && !summary) {
      showValidationError("Add a summary before saving evidence.");
      return;
    }

    setValidationError("");
    setStudentResolutionError("");
    setIsSaving(true);
    onSavePendingChange?.(true);

    let result: ValidatedEvidenceSaveResult;

    try {
      result = await onConfirm(fields, {
        rosterStudentId: studentValidation.studentId,
        evidenceDate: form.evidenceDate,
        evidenceDateOffsetMinutes: new Date().getTimezoneOffset(),
        evidenceNote: evidenceNote || undefined,
        summary,
        evidenceType: fields.evidenceType || undefined,
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
        <p className="text-xs font-semibold text-link">Teacher review</p>
        <h3 className="font-sans text-xl font-semibold text-foreground">
          Review before saving
        </h3>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Review the student, date, optional Evidence note, and photo before
          anything is saved permanently.
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
            disabled={isBusy || Boolean(savedEvidenceId)}
            className="min-h-[84px] resize-none text-sm"
          />
          <p className="text-xs leading-relaxed text-muted-foreground">
            {hasPhoto
              ? "Optional for photo evidence. Any note is saved exactly as shown."
              : "This note will be saved exactly as shown."}
          </p>
        </div>

        <FieldRow label="Evidence date" htmlFor={evidenceDateId}>
          <input
            id={evidenceDateId}
            type="date"
            min={minimumEvidenceDate}
            max={maximumEvidenceDate}
            value={form.evidenceDate}
            onChange={(event) => updateField("evidenceDate", event.target.value)}
            disabled={isBusy || Boolean(savedEvidenceId)}
            required
            className={fieldInputClass}
          />
        </FieldRow>

        <div className="border-t border-border/50 pt-3 sm:col-span-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Structured details
          </p>
        </div>

        {needsStudentResolution ? (
          <div
            ref={studentResolutionRef}
            tabIndex={-1}
            className={`space-y-3 border-y px-3 py-3 outline-none focus-visible:ring-3 focus-visible:ring-ring/30 sm:col-span-2 sm:px-4 ${
              resolvedStudentOverride
                ? "border-validated/50 bg-validated/15"
                : "border-accent/50 bg-accent/15"
            }`}
          >
            {resolvedStudentOverride ? (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2.5">
                  <CheckCircle2
                    aria-hidden="true"
                    className="size-4 shrink-0 text-validated-foreground"
                  />
                  <p className="min-w-0 text-sm text-foreground">
                    <span className="font-medium">Student:</span>{" "}
                    {resolvedStudentOverride.displayName}
                  </p>
                </div>
                {!savedEvidenceId ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    disabled={isBusy}
                    onClick={handleStudentResolutionReset}
                  >
                    Change student
                  </Button>
                ) : null}
              </div>
            ) : (
              <>
                <p className="text-sm font-medium text-foreground">
                  {unresolvedMention
                    ? `Resolve @${unresolvedMention}`
                    : "Choose one student"}
                </p>
                <StudentResolutionField
                  mention={unresolvedMention}
                  rosterStudents={rosterStudents}
                  classGroups={classGroups}
                  disabled={isBusy || Boolean(savedEvidenceId)}
                  errorId={
                    studentResolutionError
                      ? studentResolutionErrorId
                      : undefined
                  }
                  onResolve={handleStudentResolved}
                  onCreateStudent={onCreateStudent}
                  onPendingChange={handleStudentResolutionPendingChange}
                  onError={showStudentResolutionError}
                  allowCreate={Boolean(unresolvedMention)}
                />
                {studentResolutionError ? (
                  <p
                    id={studentResolutionErrorId}
                    role="alert"
                    className="text-sm text-destructive"
                  >
                    {studentResolutionError}
                  </p>
                ) : null}
              </>
            )}
          </div>
        ) : (
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
        )}

        <FieldRow label="Evidence type" htmlFor={evidenceTypeId}>
          <select
            id={evidenceTypeId}
            value={form.evidenceType}
            onChange={(e) => updateField("evidenceType", e.target.value)}
            disabled={isBusy || Boolean(savedEvidenceId)}
            className={fieldInputClass}
          >
            <option value="">Optional for photo-only evidence</option>
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
            disabled={isBusy || Boolean(savedEvidenceId)}
            className={fieldInputClass}
          />
        </FieldRow>

        <FieldRow label="Performance" htmlFor={performanceId}>
          <input
            id={performanceId}
            type="text"
            value={form.performance}
            onChange={(e) => updateField("performance", e.target.value)}
            disabled={isBusy || Boolean(savedEvidenceId)}
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
            disabled={isBusy || Boolean(savedEvidenceId)}
            className={fieldInputClass}
          />
        </FieldRow>

        <FieldRow label="Tags" htmlFor={tagsId}>
          <input
            id={tagsId}
            type="text"
            value={form.tags}
            onChange={(e) => updateField("tags", e.target.value)}
            disabled={isBusy || Boolean(savedEvidenceId)}
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
            disabled={isBusy || Boolean(savedEvidenceId)}
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
          <section className="rounded-card border border-validated/60 bg-validated/20 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-validated-foreground">
              Evidence trail started
            </p>
            <h3 className="mt-1 font-sans text-lg font-semibold text-foreground">
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
          disabled={isBusy || Boolean(savedEvidenceId)}
          onClick={handleConfirm}
        >
          {savedEvidenceId
            ? "Evidence saved"
            : isSaving
              ? "Saving evidence…"
              : "Validate and save"}
        </Button>
        {!savedEvidenceId ? (
          <Button
            size="sm"
            variant="ghost"
            disabled={isBusy}
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
      key={props.resetKey ?? draftDisplayKey(props.display)}
      {...props}
    />
  );
}

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
import { ValidatedStamp } from "@/components/evidence/validated-stamp";

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
  photoChangePending?: boolean;
  photoResolutionRequired?: boolean;
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

const fieldInputClass = "field";

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
      <label htmlFor={htmlFor} className="label text-fg-2">
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
  photoChangePending = false,
  photoResolutionRequired = false,
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
    if (isBusy || photoChangePending || photoResolutionRequired || savedEvidenceId) {
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
    <div className="mt-2 border-t border-line pt-5">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="font-display text-[1.6rem] font-semibold leading-none text-fg">
            Review before saving
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-fg-2">
            Check the student, date, optional Evidence note, and photo. Only what you approve here becomes permanent.
          </p>
        </div>
        <p aria-hidden="true" className="label flex items-center gap-2 text-fg-3">
          <span className="size-2 rounded-full bg-live-bright" /> draft
          <span className="h-px w-8 bg-line-2" />
          <span className="size-2 rounded-full bg-fg" /> saved
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1 sm:col-span-2">
          <label htmlFor={evidenceNoteId} className="label text-fg-2">
            Evidence note
          </label>
          <Textarea
            id={evidenceNoteId}
            value={form.evidenceNote}
            onChange={(e) => updateField("evidenceNote", e.target.value)}
            rows={3}
            disabled={isBusy || Boolean(savedEvidenceId)}
            className="min-h-[96px] resize-none text-[17px]"
          />
          <p className="text-xs leading-relaxed text-fg-3">
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

        <div className="flex items-center gap-3 pt-2 sm:col-span-2">
          <p className="label shrink-0 text-fg-3">Structured details</p>
          <span aria-hidden="true" className="h-px flex-1 bg-line" />
        </div>

        {needsStudentResolution ? (
          <div
            ref={studentResolutionRef}
            tabIndex={-1}
            className="space-y-3 rounded-md border-l-2 border-live-bright bg-live-soft px-3 py-3 outline-none focus-visible:ring-2 focus-visible:ring-live-bright focus-visible:ring-offset-2 focus-visible:ring-offset-plate sm:col-span-2 sm:px-4"
          >
            {resolvedStudentOverride ? (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2.5">
                  <CheckCircle2
                    aria-hidden="true"
                    className="size-4 shrink-0 text-fg"
                  />
                  <p className="min-w-0 text-sm text-fg">
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
                <p className="text-sm font-medium text-fg">
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
                    className="text-sm text-danger"
                  >
                    {studentResolutionError}
                  </p>
                ) : null}
              </>
            )}
          </div>
        ) : (
          <div className="space-y-1">
            <p className="label text-fg-2">
              Student
            </p>
            <p className="font-display text-[1.35rem] font-semibold leading-snug text-fg">
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
          <label htmlFor={followUpsId} className="label text-fg-2">
            Follow-up notes
          </label>
          <Textarea
            id={followUpsId}
            value={form.followUpNotes}
            onChange={(e) => updateField("followUpNotes", e.target.value)}
            rows={2}
            disabled={isBusy || Boolean(savedEvidenceId)}
            className="min-h-[64px] resize-none text-[15px]"
          />
        </div>
      </div>

      <div aria-live="polite" className="mt-3 min-h-5">
        {validationError ? (
          <p
            ref={validationErrorRef}
            role="alert"
            tabIndex={-1}
            className="text-sm text-danger outline-none focus-visible:ring-2 focus-visible:ring-live-bright focus-visible:ring-offset-2 focus-visible:ring-offset-plate"
          >
            {validationError}
          </p>
        ) : savedEvidenceId &&
          isFirstWorkspaceEvidence &&
          studentValidation.status === "valid_one_student" ? (
          <section className="rounded-lg bg-fg p-4 text-base sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="label text-base/70">Evidence trail started</p>
              <ValidatedStamp className="text-base [&>span]:bg-base [&>span]:text-fg" />
            </div>
            <h3 className="mt-2 font-display text-[1.75rem] font-semibold leading-none text-base">
              Saved to {studentValidation.studentName}&apos;s folder.
            </h3>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-base/75">
              This observation is now part of the record, ready when you need to
              look back instead of reconstructing the moment from memory.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button asChild size="sm" className="bg-base text-fg hover:bg-plate">
                <Link href={routes.student(studentValidation.studentId)}>
                  Open {studentValidation.studentName}&apos;s folder
                </Link>
              </Button>
              <Button asChild size="sm" variant="outline" className="border-base/40 text-base hover:bg-base/10">
                <Link href={routes.studentReport(studentValidation.studentId)}>
                  Preview report
                </Link>
              </Button>
              <Button size="sm" variant="ghost" className="text-base/80 hover:bg-base/10 hover:text-base" onClick={onCaptureAnother}>
                Capture another note
              </Button>
            </div>
          </section>
        ) : savedEvidenceId ? (
          <p className="inline-flex items-center gap-2 text-sm text-fg">
            <ValidatedStamp /> Validated evidence saved.
          </p>
        ) : isSaving ? (
          <p className="text-sm text-fg-2">Saving evidence…</p>
        ) : photoChangePending ? (
          <p className="text-sm text-fg-2">Finishing photo processing…</p>
        ) : photoResolutionRequired ? (
          <p className="text-sm text-danger">
            Choose the photo again or continue without it before saving.
          </p>
        ) : (
          <p className="text-xs leading-relaxed text-fg-3">
            Saving makes this draft a permanent record in the student&apos;s trace.
          </p>
        )}
      </div>

      <div
        className={`mt-4 flex flex-wrap items-center gap-2 border-t border-line pt-4 ${
          savedEvidenceId && isFirstWorkspaceEvidence ? "hidden" : ""
        }`}
      >
        <Button
          variant="solid"
          disabled={
            isBusy ||
            photoChangePending ||
            photoResolutionRequired ||
            Boolean(savedEvidenceId)
          }
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

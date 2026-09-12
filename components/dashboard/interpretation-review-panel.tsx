"use client";

import { useEffect, useId, useRef, useState } from "react";
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
import type { CaptureRosterStudent } from "@/lib/students/resolve-capture-students";
import { CheckCircle2 } from "lucide-react";

type InterpretationReviewPanelProps = {
  display: DraftDisplay;
  resetKey?: string;
  onConfirm: (
    fields: InterpretationFields,
    saveInput: ValidatedEvidenceSaveInput
  ) => Promise<ValidatedEvidenceSaveResult>;
  detailsOpen: boolean;
  onDetailsOpenChange: (open: boolean) => void;
  onSaved?: (
    result: ValidatedEvidenceSaveSuccess,
    fields: InterpretationFields,
    saveInput: ValidatedEvidenceSaveInput
  ) => void;
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

type ApprovalBlocker =
  | "student"
  | "evidence_type"
  | "content"
  | "date"
  | "photo";

function approvalBlockerMessage(blocker: ApprovalBlocker): string {
  switch (blocker) {
    case "student":
      return "Resolve one student before this record can be approved.";
    case "evidence_type":
      return "Choose a meaningful evidence type before approving this record.";
    case "content":
      return "Add an Evidence note or photo before approving this record.";
    case "date":
      return "Choose a valid evidence date before approving this record.";
    case "photo":
      return "Choose the photo again or continue without it before approving this record.";
  }
}

function formatPreparedDate(value: string): string {
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
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
  detailsOpen,
  onDetailsOpenChange,
  onSaved,
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
  embedded = false,
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
  const evidenceNote = form.evidenceNote.trim();
  const preparedFields =
    studentValidation.status === "valid_one_student"
      ? formStateToFields(form, studentValidation.studentName)
      : null;
  const approvalBlocker: ApprovalBlocker | null =
    studentValidation.status !== "valid_one_student"
      ? "student"
      : photoResolutionRequired
        ? "photo"
        : !evidenceNote && !hasPhoto
          ? "content"
          : !photoOnly &&
              (!form.evidenceType.trim() || form.evidenceType === "Unclear")
            ? "evidence_type"
            : !form.evidenceDate ||
                form.evidenceDate < minimumEvidenceDate ||
                form.evidenceDate > maximumEvidenceDate
              ? "date"
              : null;
  const showDetails = detailsOpen || approvalBlocker !== null;

  useEffect(() => {
    if (approvalBlocker && !detailsOpen) {
      onDetailsOpenChange(true);
    }
  }, [approvalBlocker, detailsOpen, onDetailsOpenChange]);

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
    if (
      isBusy ||
      photoChangePending ||
      approvalBlocker ||
      savedEvidenceId
    ) {
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
    const saveInput: ValidatedEvidenceSaveInput = {
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
    };

    try {
      result = await onConfirm(fields, saveInput);
    } catch {
      result = { success: false, error: "Failed to save evidence." };
    } finally {
      setIsSaving(false);
      onSavePendingChange?.(false);
    }

    if (result.success) {
      setSavedEvidenceId(result.evidenceId);
      onSaved?.(result, fields, saveInput);
      return;
    }

    showValidationError(result.error);
  }

  return (
    <div
      aria-busy={isBusy || photoChangePending}
      className={embedded ? "pt-3" : "mt-2 border-t border-line pt-5"}
    >
      <div className="mb-4">
        <h3 className={`label ${approvalBlocker ? "text-danger" : "text-live"}`}>
          {approvalBlocker
            ? "Needs correction"
            : showDetails
              ? "Edit note or details"
              : "Prepared for approval"}
        </h3>
        {approvalBlocker || showDetails ? (
          <p className="mt-1.5 text-sm leading-relaxed text-fg-2">
            {approvalBlocker
              ? approvalBlockerMessage(approvalBlocker)
              : "Adjust what ClassTrace prepared. Only the record you approve becomes permanent."}
          </p>
        ) : null}
      </div>

      {!showDetails && preparedFields ? (
        <section aria-label="Prepared evidence record" className="space-y-4">
          <div className="flex flex-wrap items-baseline justify-between gap-x-5 gap-y-2">
            <div>
              <p className="label text-fg-3">Student</p>
              <p className="font-display text-[1.2rem] font-semibold leading-snug text-fg">
                {studentValidation.status === "valid_one_student"
                  ? studentValidation.studentName
                  : ""}
              </p>
            </div>
            <div className="sm:text-right">
              <p className="label text-fg-3">Evidence date</p>
              <time
                dateTime={form.evidenceDate}
                className="font-mono text-sm tabular-nums text-fg-2"
              >
                {formatPreparedDate(form.evidenceDate)}
              </time>
            </div>
          </div>

          <div className="border-y border-line py-3">
            <p className="label text-fg-3">Evidence note</p>
            {evidenceNote ? (
              <p className="mt-1.5 max-w-3xl whitespace-pre-wrap text-[17px] leading-relaxed text-fg">
                {evidenceNote}
              </p>
            ) : (
              <p className="mt-2 text-sm italic text-fg-2">
                No Evidence note — photo only.
              </p>
            )}
          </div>

          {!photoOnly ? (
            <p className="text-sm leading-relaxed text-fg-2">
              <span className="label mr-2 text-fg-3">Filed as</span>
              <span className="font-mono">
                {[
                  preparedFields.evidenceType,
                  preparedFields.topic,
                  preparedFields.performance,
                  ...(preparedFields.behavior ?? []),
                  ...preparedFields.tags.map(formatTagLabel),
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </span>
            </p>
          ) : null}

          {preparedFields.followUpNotes.length > 0 ? (
            <p className="border-l-2 border-live-bright pl-3 text-sm leading-relaxed text-fg-2">
              <span className="label mr-2 text-live">Follow up</span>
              {preparedFields.followUpNotes.join(" · ")}
            </p>
          ) : null}

          {hasPhoto ? (
            <p className="text-sm text-fg-2">
              <span className="label mr-2 text-live">Photo included</span>
              The photo shown above will be saved with this record.
            </p>
          ) : null}
        </section>
      ) : null}

      {showDetails ? <div id={`${fieldIdPrefix}-details`} className="grid gap-3 sm:grid-cols-2">
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
      </div> : null}

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
        ) : isSaving ? (
          <p className="text-sm text-fg-2">Saving evidence…</p>
        ) : photoChangePending ? (
          <p className="text-sm text-fg-2">Finishing photo processing…</p>
        ) : approvalBlocker ? (
          <p className="text-sm text-danger">
            {approvalBlockerMessage(approvalBlocker)}
          </p>
        ) : (
          <p className="text-xs leading-relaxed text-fg-3">
            Saving makes this draft a permanent record in the student&apos;s trace.
          </p>
        )}
      </div>

      <div className="mt-4 flex flex-col gap-2 border-t border-line pt-4 sm:flex-row sm:flex-wrap sm:items-center">
        {!approvalBlocker ? (
          <Button
            variant="solid"
            className="w-full sm:w-auto"
            disabled={isBusy || photoChangePending || Boolean(savedEvidenceId)}
            onClick={handleConfirm}
          >
            {savedEvidenceId
              ? "Evidence saved"
              : isSaving
                ? "Saving evidence…"
                : "Approve and save"}
          </Button>
        ) : null}
        {!showDetails ? (
          <Button
            size="sm"
            variant="outline"
            disabled={isBusy}
            aria-expanded={false}
            aria-controls={`${fieldIdPrefix}-details`}
            onClick={() => onDetailsOpenChange(true)}
          >
            Edit note or details
          </Button>
        ) : !approvalBlocker ? (
          <Button
            size="sm"
            variant="ghost"
            disabled={isBusy}
            aria-expanded={true}
            aria-controls={`${fieldIdPrefix}-details`}
            onClick={() => onDetailsOpenChange(false)}
          >
            Show prepared record
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

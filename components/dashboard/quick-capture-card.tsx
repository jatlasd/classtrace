"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { MentionsInput, Mention } from "react-mentions";
import type { MentionsInputStyle } from "react-mentions";
import { Button } from "@/components/ui/button";
import { LocalPhotoPreview } from "@/components/evidence/local-photo-preview";
import { buildNoteDraft } from "@/lib/note-processing";
import { buildCapturePlaceholder } from "@/lib/students/build-capture-placeholder";
import type { NoteDraft } from "@/lib/note-processing/types";
import { parseRawNote } from "@/lib/note-processing/parse-raw-note";
import {
  resolveCaptureStudents,
  type CaptureRosterStudent,
  type CaptureStudentResolution,
} from "@/lib/students/resolve-capture-students";
import {
  ArrowUp,
  Check,
  Camera,
  ImagePlus,
  LoaderCircle,
  X,
} from "lucide-react";
import {
  normalizeEvidencePhoto,
  type PhotoDraft,
} from "@/lib/evidence/photo-draft-storage";

const LINE_HEIGHT = 34;
const MIN_LINES = 2;

const captureTextLayerStyle = {
  boxSizing: "border-box" as const,
  width: "100%",
  margin: 0,
  padding: 0,
  border: 0,
  fontFamily: "var(--font-grotesk), ui-sans-serif, system-ui, sans-serif",
  fontSize: 23,
  fontWeight: 500,
  lineHeight: `${LINE_HEIGHT}px`,
  letterSpacing: "-0.01em",
  textAlign: "start" as const,
  whiteSpace: "pre-wrap" as const,
  overflowWrap: "anywhere" as const,
  wordBreak: "break-word" as const,
};

const quickCaptureMentionsStyle: MentionsInputStyle = {
  control: {
    ...captureTextLayerStyle,
  },
  "&multiLine": {
    control: {
      minHeight: LINE_HEIGHT * MIN_LINES,
    },
    highlighter: {
      ...captureTextLayerStyle,
      minHeight: LINE_HEIGHT * MIN_LINES,
      overflow: "hidden",
    },
    input: {
      ...captureTextLayerStyle,
      outline: 0,
      minHeight: LINE_HEIGHT * MIN_LINES,
      overflow: "auto",
      resize: "none",
      color: "var(--fg)",
    },
  },
  suggestions: {
    zIndex: 50,
    backgroundColor: "var(--well)",
    border: "1px solid var(--line-2)",
    borderRadius: 10,
    boxShadow: "var(--shadow-lift)",
    minWidth: 200,
    marginTop: 8,
    list: {
      margin: 0,
      padding: 4,
      listStyleType: "none",
    },
    item: {
      padding: "9px 12px",
      borderRadius: 6,
      fontSize: 15,
      color: "var(--fg)",
      cursor: "pointer",
      "&focused": {
        backgroundColor: "var(--live-soft)",
        color: "var(--fg)",
      },
    },
  },
};

const mentionHighlightStyle = {
  color: "var(--live)",
  backgroundColor: "var(--live-soft)",
  borderRadius: 4,
};

type QuickCaptureCardProps = {
  rosterStudents: CaptureRosterStudent[];
  focusRequestKey?: number;
  disabled?: boolean;
  onDraft: (
    draft: NoteDraft,
    identity: { id: string; capturedAt: number },
    photo?: PhotoDraft
  ) => Promise<void> | void;
};

function resolutionMessage(
  resolution: CaptureStudentResolution,
  hasText: boolean
): { tone: "ready" | "error"; text: string } | null {
  if (!hasText) {
    return null;
  }

  if (resolution.status === "resolved_one_student") {
    return {
      tone: "ready",
      text: `Ready to capture for ${resolution.student.displayName}.`,
    };
  }

  if (resolution.status === "no_student_mentioned") {
    return {
      tone: "error",
      text: "Mention one student before capturing.",
    };
  }

  if (resolution.status === "multiple_students") {
    return {
      tone: "error",
      text: "Choose one student for this capture.",
    };
  }

  return {
    tone: "ready",
    text: `Ready to capture. You'll resolve @${resolution.unresolvedMentions[0]} before saving.`,
  };
}

export function QuickCaptureCard({
  rosterStudents,
  focusRequestKey = 0,
  disabled = false,
  onDraft,
}: QuickCaptureCardProps) {
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);
  const choosePhotoRef = useRef<HTMLInputElement | null>(null);
  const takePhotoRef = useRef<HTMLInputElement | null>(null);
  const postedTimerRef = useRef<number | null>(null);
  const [markupValue, setMarkupValue] = useState("");
  const [plainText, setPlainText] = useState("");
  const [posted, setPosted] = useState(false);
  const [photo, setPhoto] = useState<PhotoDraft | null>(null);
  const [photoError, setPhotoError] = useState("");
  const [isProcessingPhoto, setIsProcessingPhoto] = useState(false);
  const photoErrorId = useId();

  const studentSuggestions = useMemo(
    () =>
      rosterStudents.map((student) => ({
        id: student.mentionHandle,
        display: student.displayName,
      })),
    [rosterStudents]
  );
  const placeholder = useMemo(
    () => buildCapturePlaceholder(rosterStudents),
    [rosterStudents]
  );

  const tagSuggestions = useMemo(() => [], []);
  const trimmedPlainText = plainText.trim();
  const parsedNote = useMemo(
    () => parseRawNote(trimmedPlainText),
    [trimmedPlainText]
  );
  const studentResolution = useMemo(
    () => resolveCaptureStudents(parsedNote.mentions, rosterStudents),
    [parsedNote.mentions, rosterStudents]
  );
  const guidance = resolutionMessage(
    studentResolution,
    trimmedPlainText.length > 0
  );
  const hasCaptureContent = trimmedPlainText.length > 0 || photo !== null;
  const canCapture =
    !disabled &&
    hasCaptureContent &&
    !isProcessingPhoto &&
    (studentResolution.status === "resolved_one_student" ||
      studentResolution.status === "unresolved_student" ||
      (photo !== null && studentResolution.status === "no_student_mentioned"));

  useEffect(() => {
    if (focusRequestKey > 0) {
      inputRef.current?.focus();
      inputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [focusRequestKey]);

  useEffect(
    () => () => {
      if (postedTimerRef.current !== null) {
        window.clearTimeout(postedTimerRef.current);
      }
    },
    []
  );

  function handleChange(
    _event: { target: { value: string } },
    newMarkupValue: string,
    newPlainTextValue: string
  ) {
    setMarkupValue(newMarkupValue);
    setPlainText(newPlainTextValue);
  }

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
    setPhoto(result.photo);
  }

  async function handlePost() {
    if (!canCapture) return;
    await onDraft(
      buildNoteDraft(trimmedPlainText),
      {
        id: crypto.randomUUID(),
        capturedAt: Date.now(),
      },
      photo ?? undefined
    );
    setPosted(true);
    setMarkupValue("");
    setPlainText("");
    setPhoto(null);
    setPhotoError("");
    if (postedTimerRef.current !== null) {
      window.clearTimeout(postedTimerRef.current);
    }
    postedTimerRef.current = window.setTimeout(() => {
      setPosted(false);
      postedTimerRef.current = null;
    }, 2000);
  }

  function handleKeyDown(
    e: React.KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>
  ) {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      handlePost();
    }
  }

  return (
    <section
      className={`plate relative min-w-0 overflow-visible px-5 pb-4 pt-5 transition-shadow sm:px-7 sm:pt-6 ${
        hasCaptureContent ? "glow-live" : ""
      }`}
    >
      <div className="flex items-center justify-between gap-4">
        <label
          htmlFor="quick-capture"
          className="label flex items-center gap-2 text-live"
        >
          <span aria-hidden="true" className="size-1.5 rounded-full bg-live-bright" />
          What happened?
        </label>
        <p className="label text-fg-3">
          @student <span className="hidden sm:inline">· #tag · ⌘↵</span>
        </p>
      </div>

      <div className="quick-capture-mentions mt-3">
        <MentionsInput
          inputRef={(element: HTMLInputElement | HTMLTextAreaElement | null) => {
            inputRef.current = element;
          }}
          id="quick-capture"
          name="quick-capture"
          autoComplete="off"
          disabled={disabled}
          value={markupValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          style={quickCaptureMentionsStyle}
          allowSuggestionsAboveCursor
        >
          <Mention
            trigger="@"
            data={studentSuggestions}
            markup="@[__display__](__id__)"
            displayTransform={(id) => `@${id}`}
            appendSpaceOnAdd
            style={mentionHighlightStyle}
          />
          <Mention
            trigger="#"
            data={tagSuggestions}
            markup="#[__display__](__id__)"
            displayTransform={(id) => `#${id}`}
            appendSpaceOnAdd
            style={{ color: "var(--fg-2)" }}
          />
        </MentionsInput>
      </div>

      <input
        ref={takePhotoRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        capture="environment"
        className="sr-only"
        aria-label="Take photo"
        aria-invalid={Boolean(photoError)}
        aria-describedby={photoError ? photoErrorId : undefined}
        disabled={disabled}
        onChange={(event) => void handlePhotoFile(event.target.files?.[0])}
      />
      <input
        ref={choosePhotoRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        className="sr-only"
        aria-label="Choose photo"
        aria-invalid={Boolean(photoError)}
        aria-describedby={photoError ? photoErrorId : undefined}
        disabled={disabled}
        onChange={(event) => void handlePhotoFile(event.target.files?.[0])}
      />

      {photo ? (
        <div className="mt-4 grid gap-3 rounded-lg border border-line bg-well p-3 sm:grid-cols-[6rem_1fr] sm:items-start">
          <LocalPhotoPreview
            blob={photo.blob}
            alt="Selected photo evidence preview"
            width={photo.width}
            height={photo.height}
          />
          <div className="space-y-2">
            <p className="label text-live">Photo ready</p>
            <p className="text-[13px] leading-relaxed text-fg-2">
              Check for other students or identifying details. It stays on this
              device until you validate and save.
            </p>
            <div className="flex flex-wrap gap-1.5">
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={disabled || isProcessingPhoto}
                onClick={() => choosePhotoRef.current?.click()}
              >
                <ImagePlus aria-hidden="true" className="size-4" />
                Replace photo
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                disabled={disabled || isProcessingPhoto}
                onClick={() => setPhoto(null)}
              >
                <X aria-hidden="true" className="size-4" />
                Remove photo
              </Button>
            </div>
          </div>
        </div>
      ) : null}
      {photoError ? (
        <p id={photoErrorId} role="alert" className="mt-3 text-sm text-danger">
          {photoError}
        </p>
      ) : null}

      <div className="mt-4 flex flex-col gap-3 border-t border-line pt-3 sm:flex-row sm:items-center">
        {!photo ? (
          <div className="flex items-center gap-1">
            <Button
              type="button"
              size="sm"
              variant="ghost"
              disabled={disabled || isProcessingPhoto}
              onClick={() => takePhotoRef.current?.click()}
            >
              <Camera aria-hidden="true" className="size-4" />
              Take photo
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              disabled={disabled || isProcessingPhoto}
              onClick={() => choosePhotoRef.current?.click()}
            >
              <ImagePlus aria-hidden="true" className="size-4" />
              Choose photo
            </Button>
            {isProcessingPhoto ? (
              <span role="status" className="inline-flex items-center gap-2 text-xs text-fg-2">
                <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
                Processing photo…
              </span>
            ) : null}
          </div>
        ) : null}

        <div aria-live="polite" className="min-w-0 flex-1 sm:text-right">
          <p
            className={`text-[13px] leading-relaxed ${
              guidance?.tone === "error" ? "text-danger" : "text-fg-2"
            }`}
          >
            {disabled
              ? "Restoring drafts before capture opens…"
              : guidance?.text ?? "Captures become drafts. Nothing saves until you review it."}
          </p>
        </div>

        <Button
          onClick={() => void handlePost()}
          disabled={!canCapture}
          size="lg"
          className="w-full shrink-0 rounded-full sm:w-auto"
        >
          {posted ? (
            <>
              <Check aria-hidden="true" className="size-4" strokeWidth={3} />
              Captured
            </>
          ) : (
            <>
              Capture
              <ArrowUp aria-hidden="true" className="size-4" strokeWidth={2.5} />
            </>
          )}
        </Button>
      </div>
    </section>
  );
}

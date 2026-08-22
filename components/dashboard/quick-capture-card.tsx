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

const captureTextLayerStyle = {
  boxSizing: "border-box" as const,
  width: "100%",
  margin: 0,
  padding: 0,
  border: 0,
  fontFamily: "var(--font-body), ui-sans-serif, system-ui, sans-serif",
  fontSize: 15,
  fontWeight: 400,
  lineHeight: "22.5px",
  letterSpacing: "normal",
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
      minHeight: 76,
    },
    highlighter: {
      ...captureTextLayerStyle,
      minHeight: 76,
      overflow: "hidden",
    },
    input: {
      ...captureTextLayerStyle,
      outline: 0,
      minHeight: 76,
      overflow: "auto",
      resize: "none",
    },
  },
  suggestions: {
    zIndex: 50,
    backgroundColor: "var(--popover)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-lg)",
    boxShadow: "var(--shadow-paper)",
    minWidth: 160,
    marginTop: 4,
    list: {
      margin: 0,
      padding: 4,
      listStyleType: "none",
    },
    item: {
      padding: "6px 10px",
      borderRadius: "var(--radius-sm)",
      fontSize: 14,
      color: "var(--foreground)",
      cursor: "pointer",
      "&focused": {
        backgroundColor: "var(--muted)",
      },
    },
  },
};

const mentionHighlightStyle = {
  backgroundColor: "color-mix(in srgb, var(--link) 13%, transparent)",
  borderRadius: 3,
};

type QuickCaptureCardProps = {
  rosterStudents: CaptureRosterStudent[];
  focusRequestKey?: number;
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
    <section className="overflow-hidden rounded-card border border-border bg-card shadow-paper ring-1 ring-transparent transition-shadow focus-within:ring-primary/20">
      <div className="px-5 pb-5 pt-5 sm:px-6 lg:px-8 lg:pb-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
          <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Quick capture
          </p>
          <label
            htmlFor="quick-capture"
              className="mt-1.5 block font-display text-2xl font-semibold tracking-tight text-foreground"
          >
            What happened?
          </label>
          </div>
          <p className="max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-right">
            Mention one student with{" "}
            <span className="font-semibold text-link">@</span>. Add context with{" "}
            <span className="font-semibold text-validated-foreground">#tags</span>.
          </p>
        </div>

        <div className="quick-capture-mentions mt-4 rounded-lg border border-border bg-background/45 px-4 py-3 transition-colors focus-within:border-ring focus-within:bg-card focus-within:ring-3 focus-within:ring-ring/20">
            <MentionsInput
              inputRef={(element: HTMLInputElement | HTMLTextAreaElement | null) => {
                inputRef.current = element;
              }}
              id="quick-capture"
              name="quick-capture"
              autoComplete="off"
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
                style={mentionHighlightStyle}
              />
            </MentionsInput>
        </div>

        <div className="mt-3 border-t border-border/70 pt-3">
          <input
            ref={takePhotoRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif,image/heic,image/heif"
            capture="environment"
            className="sr-only"
            aria-label="Take photo"
            aria-invalid={Boolean(photoError)}
            aria-describedby={photoError ? photoErrorId : undefined}
            onChange={(event) => void handlePhotoFile(event.target.files?.[0])}
          />
          <input
            ref={choosePhotoRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif,image/heic,image/heif"
            className="sr-only"
            aria-label="Choose photo"
            aria-invalid={Boolean(photoError)}
            aria-describedby={photoError ? photoErrorId : undefined}
            onChange={(event) => void handlePhotoFile(event.target.files?.[0])}
          />

          {photo ? (
            <div className="grid gap-3 sm:grid-cols-[7rem_1fr] sm:items-start">
              <LocalPhotoPreview
                blob={photo.blob}
                alt="Selected photo evidence preview"
              />
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">Photo ready</p>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Check for other students or identifying details. It stays on
                  this device until you validate and save.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => choosePhotoRef.current?.click()}
                  >
                    <ImagePlus aria-hidden="true" className="size-4" />
                    Replace photo
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => setPhoto(null)}
                  >
                    <X aria-hidden="true" className="size-4" />
                    Remove photo
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={isProcessingPhoto}
                onClick={() => takePhotoRef.current?.click()}
              >
                <Camera aria-hidden="true" className="size-4" />
                Take photo
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                disabled={isProcessingPhoto}
                onClick={() => choosePhotoRef.current?.click()}
              >
                <ImagePlus aria-hidden="true" className="size-4" />
                Choose photo
              </Button>
              {isProcessingPhoto ? (
                <span role="status" className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                  <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
                  Processing photo…
                </span>
              ) : null}
            </div>
          )}
          {photoError ? (
            <p id={photoErrorId} role="alert" className="mt-2 text-sm text-destructive">
              {photoError}
            </p>
          ) : null}
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t border-border bg-muted/15 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div aria-live="polite">
          <p
            className={`text-sm leading-relaxed ${
              guidance?.tone === "error"
                ? "text-destructive"
                : "text-muted-foreground"
            }`}
          >
            {guidance ? (
              guidance.text
            ) : (
              <>
                Capture creates a draft for review.
                <span className="hidden sm:inline">
                  {" "}
                  Press Ctrl or ⌘ + Enter.
                </span>
              </>
            )}
          </p>
        </div>

        <Button
          onClick={() => void handlePost()}
          disabled={!canCapture}
          className="min-h-11 w-full rounded-lg px-5 text-sm font-semibold sm:min-h-10 sm:w-auto"
        >
          {posted ? (
            <>
              <Check aria-hidden="true" className="size-4" />
              Captured
            </>
          ) : (
            "Capture"
          )}
        </Button>
      </div>
    </section>
  );
}

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { MentionsInput, Mention } from "react-mentions";
import type { MentionsInputStyle } from "react-mentions";
import { Button } from "@/components/ui/button";
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
  AtSign,
  Check,
  ClipboardCheck,
  Hash,
} from "lucide-react";

const captureHints = [
  { icon: AtSign, label: "Mention one student" },
  { icon: Hash, label: "Add tags" },
  { icon: ClipboardCheck, label: "Review before saving" },
];

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
      minHeight: 88,
    },
    highlighter: {
      ...captureTextLayerStyle,
      minHeight: 88,
      overflow: "hidden",
    },
    input: {
      ...captureTextLayerStyle,
      outline: 0,
      minHeight: 88,
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
      borderRadius: "calc(var(--radius-lg) * 0.75)",
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
    identity: { id: string; capturedAt: number }
  ) => void;
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
      text: "Mention one student from your roster before capturing.",
    };
  }

  if (resolution.status === "multiple_students") {
    return {
      tone: "error",
      text: "Choose one student for this capture.",
    };
  }

  return {
    tone: "error",
    text: "This student is not on your roster yet.",
  };
}

export function QuickCaptureCard({
  rosterStudents,
  focusRequestKey = 0,
  onDraft,
}: QuickCaptureCardProps) {
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);
  const [markupValue, setMarkupValue] = useState("");
  const [plainText, setPlainText] = useState("");
  const [posted, setPosted] = useState(false);

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
  const canCapture =
    trimmedPlainText.length > 0 &&
    studentResolution.status === "resolved_one_student";

  useEffect(() => {
    if (focusRequestKey > 0) {
      inputRef.current?.focus();
      inputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [focusRequestKey]);

  function handleChange(
    _event: { target: { value: string } },
    newMarkupValue: string,
    newPlainTextValue: string
  ) {
    setMarkupValue(newMarkupValue);
    setPlainText(newPlainTextValue);
  }

  function handlePost() {
    if (!canCapture) return;
    onDraft(buildNoteDraft(trimmedPlainText), {
      id: crypto.randomUUID(),
      capturedAt: Date.now(),
    });
    setPosted(true);
    setMarkupValue("");
    setPlainText("");
    window.setTimeout(() => setPosted(false), 2000);
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
      <div className="grid lg:grid-cols-[180px_minmax(0,1fr)]">
        <div className="border-b border-border bg-muted/25 px-5 py-4 lg:border-b-0 lg:border-r lg:px-6 lg:py-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Quick capture
          </p>
          <label
            htmlFor="quick-capture"
            className="mt-2 block font-display text-2xl font-semibold tracking-tight text-foreground"
          >
            What happened?
          </label>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Write the moment first. Mention exactly one roster student before
            capture.
          </p>
        </div>

        <div className="min-w-0 px-5 py-5 sm:px-6 lg:px-8 lg:py-6">
          <p className="mb-4 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            Use <span className="font-semibold text-link">@student</span> to
            name one student and <span className="font-semibold text-validated-foreground">#tag</span>{" "}
            to add context.
          </p>
          <div className="quick-capture-mentions rounded-lg border border-border bg-background/45 px-4 py-3 transition-colors focus-within:border-ring focus-within:bg-card focus-within:ring-3 focus-within:ring-ring/20">
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
          <div aria-live="polite" className="mt-3 min-h-5">
            {guidance ? (
              <p
                className={`text-sm ${
                  guidance.tone === "error"
                    ? "text-destructive"
                    : "text-muted-foreground"
                }`}
              >
                {guidance.text}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center gap-2">
          {captureHints.map((hint) => (
            <span
              key={hint.label}
              className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-border bg-muted/30 px-3 text-sm font-medium text-muted-foreground"
            >
              <hint.icon aria-hidden="true" className="size-4" strokeWidth={1.75} />
              <span>{hint.label}</span>
            </span>
          ))}
        </div>

        <Button
          onClick={handlePost}
          disabled={!canCapture}
          className="h-10 rounded-lg px-5 text-sm font-semibold"
        >
          {posted ? (
            <>
              <Check aria-hidden="true" className="size-4" />
              Captured
            </>
          ) : (
            "Capture Note"
          )}
        </Button>
      </div>
    </section>
  );
}

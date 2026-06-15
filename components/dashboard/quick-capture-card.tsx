"use client";

import { useMemo, useState } from "react";
import { MentionsInput, Mention } from "react-mentions";
import type { MentionsInputStyle } from "react-mentions";
import { Button } from "@/components/ui/button";
import { buildNoteDraft } from "@/lib/note-processing";
import type { NoteDraft } from "@/lib/note-processing/types";
import { getAllStudents } from "@/lib/students";
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

const quickCaptureMentionsStyle: MentionsInputStyle = {
  control: {
    fontSize: 15,
    lineHeight: 1.5,
  },
  "&multiLine": {
    control: {
      minHeight: 88,
    },
    highlighter: {
      padding: 0,
      minHeight: 88,
      border: "1px solid transparent",
    },
    input: {
      padding: 0,
      outline: 0,
      border: 0,
      minHeight: 88,
      overflow: "auto",
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
  color: "var(--primary)",
  fontWeight: 500,
};

type QuickCaptureCardProps = {
  onDraft: (draft: NoteDraft) => void;
};

export function QuickCaptureCard({ onDraft }: QuickCaptureCardProps) {
  // markupValue is react-mentions' internal serialized form (e.g. @[Jeremy](Jeremy));
  // plainText is what the teacher sees and what parseRawNote / buildNoteDraft expect (@Jeremy, #fractions).
  const [markupValue, setMarkupValue] = useState("");
  const [plainText, setPlainText] = useState("");
  const [posted, setPosted] = useState(false);

  const studentSuggestions = useMemo(
    () =>
      getAllStudents().map((student) => ({
        id: student.handle,
        display: student.displayName,
      })),
    []
  );

  const tagSuggestions = useMemo(() => [], []);

  function handleChange(
    _event: { target: { value: string } },
    newMarkupValue: string,
    newPlainTextValue: string
  ) {
    setMarkupValue(newMarkupValue);
    setPlainText(newPlainTextValue);
  }

  function handlePost() {
    if (!plainText.trim()) return;
    onDraft(buildNoteDraft(plainText.trim()));
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
    <div className="rounded-card border border-border bg-card shadow-paper ring-1 ring-transparent transition-shadow focus-within:ring-primary/20">
      <div className="px-5 pb-2 pt-5 sm:px-8 sm:pt-7">
        <label
          htmlFor="quick-capture"
          className="font-display mb-3 block text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
        >
          What happened?
        </label>
        <p className="mb-6 text-sm leading-relaxed text-muted-foreground sm:text-base">
          Type a quick note. Use <span className="font-semibold text-link">@student</span>{" "}
          to name one student and <span className="font-semibold text-validated-foreground">#tag</span>{" "}
          to add context.
        </p>
        <div className="quick-capture-mentions">
          <MentionsInput
            id="quick-capture"
            value={markupValue}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="@Mary used a new reading strategy during small group #reading #strategy"
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
      </div>

      <div className="flex flex-col gap-3 border-t border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <div className="flex flex-wrap items-center gap-2">
          {captureHints.map((hint) => (
            <span
              key={hint.label}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border bg-muted/30 px-3 text-sm font-medium text-muted-foreground"
            >
              <hint.icon className="size-[18px]" strokeWidth={1.75} />
              <span>{hint.label}</span>
            </span>
          ))}
        </div>

        <Button
          onClick={handlePost}
          disabled={!plainText.trim()}
          variant="outline"
          className="h-11 rounded-lg px-6 text-sm font-semibold text-primary hover:text-primary sm:self-auto"
        >
          {posted ? (
            <>
              <Check className="size-4" />
              Captured
            </>
          ) : (
            "Capture Note"
          )}
        </Button>
      </div>
    </div>
  );
}

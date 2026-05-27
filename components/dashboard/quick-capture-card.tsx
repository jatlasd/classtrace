"use client";

import { useMemo, useState } from "react";
import { MentionsInput, Mention } from "react-mentions";
import type { MentionsInputStyle } from "react-mentions";
import { Button } from "@/components/ui/button";
import { buildNoteDraft } from "@/lib/note-processing";
import type { NoteDraft } from "@/lib/note-processing/types";
import { recentCaptures } from "@/lib/mock-data";
import { getAllStudents } from "@/lib/students";
import {
  AtSign,
  Camera,
  Check,
  Hash,
  Link2,
  Video,
} from "lucide-react";

const actions = [
  { icon: Camera, label: "Photo" },
  { icon: Video, label: "Video" },
  { icon: Link2, label: "Link" },
  { icon: AtSign, label: "Mention" },
  { icon: Hash, label: "Tag" },
];

const quickCaptureMentionsStyle: MentionsInputStyle = {
  control: {
    fontSize: 15,
    lineHeight: 1.5,
  },
  "&multiLine": {
    control: {
      minHeight: 120,
    },
    highlighter: {
      padding: 0,
      minHeight: 120,
      border: "1px solid transparent",
    },
    input: {
      padding: 0,
      outline: 0,
      border: 0,
      minHeight: 120,
      overflow: "auto",
    },
  },
  suggestions: {
    zIndex: 50,
    backgroundColor: "var(--popover)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-lg)",
    boxShadow: "0 4px 12px oklch(0 0 0 / 8%)",
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

  const tagSuggestions = useMemo(() => {
    const tags = new Set(recentCaptures.flatMap((capture) => capture.tags));
    return [...tags].sort().map((tag) => ({ id: tag, display: tag }));
  }, []);

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
    <div className="rounded-xl border border-border bg-card shadow-sm ring-1 ring-transparent transition-shadow focus-within:ring-primary/20">
      <div className="p-4 pb-2">
        <label
          htmlFor="quick-capture"
          className="mb-2 block text-base font-semibold text-foreground"
        >
          What happened?
        </label>
        <div className="quick-capture-mentions">
          <MentionsInput
            id="quick-capture"
            value={markupValue}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="@Jeremy still struggling on multiplying fractions review #fractions #review #checkin"
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
        <p className="mt-1 text-xs text-muted-foreground">
          Use @student and #tag in your note
        </p>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-border px-4 py-3">
        <div className="flex items-center gap-0.5">
          {actions.map((action) => (
            <button
              key={action.label}
              type="button"
              title={action.label}
              className="flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <action.icon className="size-[18px]" strokeWidth={1.75} />
            </button>
          ))}
        </div>

        <Button
          onClick={handlePost}
          disabled={!plainText.trim()}
          className="h-9 rounded-lg px-5 text-sm font-semibold shadow-sm"
        >
          {posted ? (
            <>
              <Check className="size-4" />
              Captured
            </>
          ) : (
            "Capture"
          )}
        </Button>
      </div>
    </div>
  );
}

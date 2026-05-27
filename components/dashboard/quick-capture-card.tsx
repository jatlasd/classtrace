"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { buildNoteDraft } from "@/lib/note-processing";
import type { NoteDraft } from "@/lib/note-processing/types";
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

type QuickCaptureCardProps = {
  onDraft: (draft: NoteDraft) => void;
};

export function QuickCaptureCard({ onDraft }: QuickCaptureCardProps) {
  const [note, setNote] = useState("");
  const [posted, setPosted] = useState(false);

  function handlePost() {
    if (!note.trim()) return;
    onDraft(buildNoteDraft(note.trim()));
    setPosted(true);
    setNote("");
    window.setTimeout(() => setPosted(false), 2000);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
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
        <Textarea
          id="quick-capture"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="@Jeremy still struggling on multiplying fractions review #fractions #review #checkin"
          rows={4}
          className="min-h-[120px] resize-none border-0 bg-transparent px-0 text-[15px] shadow-none focus-visible:ring-0"
        />
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
          disabled={!note.trim()}
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

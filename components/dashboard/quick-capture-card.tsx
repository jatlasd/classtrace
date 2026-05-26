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

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm">
      <div className="p-4 pb-3">
        <Textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="What evidence did you see?"
          rows={3}
          className="min-h-[88px] resize-none border-0 bg-transparent px-0 text-[15px] shadow-none focus-visible:ring-0"
        />
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
              Posted
            </>
          ) : (
            "Post"
          )}
        </Button>
      </div>
    </div>
  );
}

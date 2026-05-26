"use client";

import { useState } from "react";
import { EvidenceFeedHeader } from "@/components/dashboard/evidence-feed-header";
import { ParsedNoteCard } from "@/components/dashboard/parsed-note-card";
import { QuickCaptureCard } from "@/components/dashboard/quick-capture-card";
import type { NoteDraft } from "@/lib/note-processing/types";

export function EvidenceFeed() {
  const [drafts, setDrafts] = useState<NoteDraft[]>([]);

  function handleDraft(draft: NoteDraft) {
    setDrafts((current) => [draft, ...current]);
  }

  return (
    <div className="mx-auto w-full max-w-[640px] px-4 py-6 sm:px-6 lg:py-8">
      <EvidenceFeedHeader />
      <div className="space-y-4">
        <QuickCaptureCard onDraft={handleDraft} />
        {drafts.length === 0 ? (
          <p className="px-1 py-8 text-center text-sm text-muted-foreground">
            Post a note to see how it parses and matches.
          </p>
        ) : (
          drafts.map((draft, index) => (
            <ParsedNoteCard
              key={`${draft.parsed.rawNote}-${index}`}
              draft={draft}
            />
          ))
        )}
      </div>
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import { ClassTraceNoticedPanel } from "@/components/dashboard/classtrace-noticed-panel";
import { EvidenceCaptureCard } from "@/components/dashboard/evidence-capture-card";
import {
  EvidenceFeedHeader,
  RecentCapturesLabel,
} from "@/components/dashboard/evidence-feed-header";
import { QuickCaptureCard } from "@/components/dashboard/quick-capture-card";
import type {
  CaptureValidation,
  InterpretationFields,
} from "@/lib/evidence/capture-validation";
import { buildNoteDraft } from "@/lib/note-processing";
import type { NoteDraft } from "@/lib/note-processing/types";
import { recentCaptures } from "@/lib/mock-data";

type FeedItem = {
  id: string;
  draft: NoteDraft;
  timestamp: string;
  validation?: CaptureValidation;
};

function seedFeedItems(): FeedItem[] {
  return recentCaptures.map((capture) => ({
    id: capture.id,
    draft: buildNoteDraft(capture.note),
    timestamp: capture.timestamp,
  }));
}

export function EvidenceFeed() {
  const [items, setItems] = useState<FeedItem[]>(() => seedFeedItems());

  const summaryItems = useMemo(
    () =>
      items.map((item) => ({
        draft: item.draft,
        validation: item.validation,
      })),
    [items]
  );

  function handleDraft(draft: NoteDraft) {
    setItems((current) => [
      {
        id: crypto.randomUUID(),
        draft,
        timestamp: "Just now",
      },
      ...current,
    ]);
  }

  function handleValidate(id: string, fields: InterpretationFields) {
    setItems((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              validation: {
                status: "validated",
                fields,
                validatedAt: Date.now(),
              },
            }
          : item
      )
    );
  }

  return (
    <div className="flex flex-col lg:flex-row">
      <div className="mx-auto w-full max-w-[640px] flex-1 px-4 py-6 sm:px-6 lg:py-8">
        <EvidenceFeedHeader />
        <div className="space-y-4">
          <QuickCaptureCard onDraft={handleDraft} />
          <RecentCapturesLabel />
          {items.length === 0 ? (
            <p className="px-1 py-8 text-center text-sm text-muted-foreground">
              Your evidence inbox is empty — capture what you noticed in class.
            </p>
          ) : (
            items.map((item) => (
              <EvidenceCaptureCard
                key={item.id}
                draft={item.draft}
                timestamp={item.timestamp}
                validation={item.validation}
                onValidate={(fields) => handleValidate(item.id, fields)}
              />
            ))
          )}
        </div>
      </div>

      <ClassTraceNoticedPanel items={summaryItems} />
    </div>
  );
}

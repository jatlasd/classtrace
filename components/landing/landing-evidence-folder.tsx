"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { ArtChip } from "@/components/landing/story-artifacts";
import styles from "./landing.module.css";

const FOLDER_FILTERS = [
  "Everything",
  "#strategy",
  "#fluency",
  "Follow-ups",
] as const;

type FolderFilter = (typeof FOLDER_FILTERS)[number];

type FolderEntry = {
  date: string;
  text: string;
  tags: string[];
  followUp: string | null;
};

const entries: FolderEntry[] = [
  {
    date: "Sept 18",
    text: "Used her calm-down strategy after a teacher prompt.",
    tags: ["#strategy"],
    followUp: null,
  },
  {
    date: "Oct 12",
    text: "Read the science warm-up aloud and self-corrected twice.",
    tags: ["#fluency"],
    followUp: null,
  },
  {
    date: "Nov 04",
    text: "Asked for a break card before escalation — first time self-initiated.",
    tags: ["#strategy"],
    followUp: "Check again after the schedule change.",
  },
  {
    date: "Jan 22",
    text: "Used her calm-down strategy independently during the math transition.",
    tags: ["#strategy", "#independence"],
    followUp: null,
  },
  {
    date: "Mar 07",
    text: "Growth pattern shared at the progress review.",
    tags: ["#strategy"],
    followUp: null,
  },
];

function matchesFilter(entry: FolderEntry, filter: FolderFilter): boolean {
  if (filter === "Everything") return true;
  if (filter === "Follow-ups") return entry.followUp !== null;
  return entry.tags.includes(filter);
}

export function LandingEvidenceFolder() {
  const [activeFilter, setActiveFilter] = useState<FolderFilter>("Everything");
  const visibleEntries = entries.filter((entry) =>
    matchesFilter(entry, activeFilter)
  );

  return (
    <div className="mx-auto mt-10 max-w-3xl px-4 md:px-6 lg:mt-12">
      <div
        role="group"
        aria-label="Filter Stacy's evidence folder"
        className="flex items-end gap-1 overflow-x-auto px-2 sm:gap-1.5 sm:px-6"
      >
        {FOLDER_FILTERS.map((filter) => {
          const isActive = filter === activeFilter;
          return (
            <button
              key={filter}
              type="button"
              aria-pressed={isActive}
              onClick={() => setActiveFilter(filter)}
              className={
                isActive ? `${styles.tab} ${styles.tabActive}` : styles.tab
              }
            >
              {filter}
            </button>
          );
        })}
      </div>

      <div className="relative rounded-card border border-border bg-card shadow-floating">
        <div className="flex flex-wrap items-center gap-3 border-b border-border px-5 py-4">
          <span className="flex size-10 items-center justify-center rounded-md border border-border bg-muted/50 text-sm font-bold text-foreground">
            ST
          </span>
          <div className="min-w-[9rem] flex-1">
            <p className="font-display text-xl font-semibold tracking-tight text-foreground">
              Stacy
            </p>
            <p className="text-xs text-muted-foreground">
              @stacy · Math Support
            </p>
          </div>
          <p
            aria-live="polite"
            className="inline-flex items-center gap-2 rounded-full border border-validated/60 bg-validated/35 px-3 py-1 text-xs font-semibold text-validated-foreground"
          >
            <CheckCircle2
              className="size-3.5"
              strokeWidth={2}
              aria-hidden="true"
            />
            {visibleEntries.length} validated{" "}
            {visibleEntries.length === 1 ? "record" : "records"}
          </p>
        </div>

        <ol>
          {visibleEntries.map((entry) => (
            <li
              key={entry.date}
              className="border-b border-border/60 px-5 py-4 last:border-b-0"
            >
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1.5">
                <span className="w-16 shrink-0 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {entry.date}
                </span>
                <span className="min-w-[11rem] flex-1 text-sm leading-relaxed text-foreground">
                  {entry.text}
                </span>
                <span className="flex flex-wrap gap-1.5">
                  {entry.tags.map((tag) => (
                    <ArtChip key={tag} variant="tag">
                      {tag}
                    </ArtChip>
                  ))}
                </span>
              </div>
              {entry.followUp ? (
                <p className="mt-1.5 pl-0 text-xs leading-relaxed text-muted-foreground sm:pl-[4.75rem]">
                  <span className="font-medium text-foreground">
                    Follow-up:
                  </span>{" "}
                  {entry.followUp}
                </p>
              ) : null}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

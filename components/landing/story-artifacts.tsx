import { AtSign, CheckCircle2, ClipboardCheck, Hash } from "lucide-react";
import type { ReactNode } from "react";

const RULED_LINES_CLASS =
  "pointer-events-none absolute inset-0 opacity-60 [background-image:repeating-linear-gradient(to_bottom,transparent,transparent_31px,color-mix(in_srgb,var(--foreground)_16%,transparent)_31px,color-mix(in_srgb,var(--foreground)_16%,transparent)_32px)]";

export const EVIDENCE_NOTE_TEXT =
  "Used her calm-down strategy independently during the math transition — first observed unprompted use.";

export function ArtChip({
  children,
  variant = "default",
}: {
  children: ReactNode;
  variant?: "default" | "tag" | "evidence" | "validated";
}) {
  const variantClass =
    variant === "tag"
      ? "border-border bg-muted/60 text-link"
      : variant === "evidence"
        ? "border-primary/25 bg-primary/10 text-primary"
        : variant === "validated"
          ? "border-validated/60 bg-validated/35 text-validated-foreground"
          : "border-border bg-card text-foreground";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${variantClass}`}
    >
      {children}
    </span>
  );
}

export function RawNoteArt({ className = "" }: { className?: string }) {
  return (
    <figure
      className={`relative -rotate-2 rounded-sm border border-accent-foreground/10 bg-accent/60 px-6 pb-7 pt-5 shadow-floating ${className}`}
    >
      <span
        aria-hidden="true"
        className="tape-tab absolute -top-3 left-1/2 h-6 w-20 -translate-x-1/2 rotate-1 rounded-sm"
      />
      <span aria-hidden="true" className={RULED_LINES_CLASS} />
      <p className="font-hand relative text-lg leading-8 text-foreground/75">
        Tuesday, 11:42 AM — between classes
      </p>
      <p className="font-hand relative mt-1 text-2xl leading-8 text-foreground">
        <span className="text-primary">@stacy</span> used her calm-down
        strategy on her own during the math transition!! first time unprompted{" "}
        <span className="text-link">#strategy #independence</span>
      </p>
    </figure>
  );
}

export function CaptureComposerArt() {
  return (
    <div
      aria-hidden="true"
      className="w-full max-w-xl overflow-hidden rounded-card border border-border bg-card shadow-floating"
    >
      <div className="grid sm:grid-cols-[9.5rem_minmax(0,1fr)]">
        <div className="border-b border-border bg-muted/25 px-4 py-4 sm:border-b-0 sm:border-r">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Quick capture
          </p>
          <p className="font-display mt-1.5 text-xl font-semibold tracking-tight text-foreground">
            What happened?
          </p>
          <p className="mt-2.5 text-xs leading-relaxed text-muted-foreground">
            Write the moment first. Mention exactly one roster student.
          </p>
        </div>
        <div className="min-w-0 px-4 py-4">
          <div className="rounded-lg border border-ring bg-card px-3.5 py-3 ring-3 ring-ring/20">
            <p className="text-[15px] leading-relaxed text-foreground">
              <span className="font-medium text-primary">@stacy</span> used her
              calm-down strategy on her own during the math transition!! first
              time unprompted{" "}
              <span className="font-medium text-primary">#strategy</span>{" "}
              <span className="font-medium text-primary">#independence</span>
              <span className="ml-0.5 inline-block h-[1.05em] w-px translate-y-[3px] animate-pulse bg-foreground/80" />
            </p>
          </div>
          <p className="mt-2.5 text-sm text-muted-foreground">
            Ready to capture for Stacy.
          </p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 border-t border-border px-4 py-3">
        <span className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-muted/30 px-2.5 text-xs font-medium text-muted-foreground">
          <AtSign className="size-3.5" strokeWidth={1.75} />
          Mention one student
        </span>
        <span className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-muted/30 px-2.5 text-xs font-medium text-muted-foreground">
          <Hash className="size-3.5" strokeWidth={1.75} />
          Add tags
        </span>
        <span className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-muted/30 px-2.5 text-xs font-medium text-muted-foreground">
          <ClipboardCheck className="size-3.5" strokeWidth={1.75} />
          Review before saving
        </span>
        <span className="ml-auto inline-flex h-9 items-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground">
          Capture Note
        </span>
      </div>
    </div>
  );
}

export const REVIEW_FIELDS = [
  ["Student", "Stacy"],
  ["Evidence type", "Behavior observation"],
  ["Topic / skill", "Calm-down strategy"],
  ["Performance", "Independent"],
  ["Tags", "#strategy, #independence"],
  ["Follow-up", "Watch for use in other settings"],
] as const;

export function ReviewPanelArt() {
  return (
    <div
      aria-hidden="true"
      className="w-full max-w-xl rounded-card border border-border bg-card p-5 shadow-floating"
    >
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        ClassTrace read this as
      </p>
      <p className="font-display mt-1 text-xl font-semibold tracking-tight text-foreground">
        Review before saving
      </p>

      <p className="mt-4 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        Evidence note
      </p>
      <div className="mt-1.5 rounded-lg border border-border bg-background/45 px-3.5 py-3">
        <p className="text-[15px] leading-relaxed text-foreground">
          {EVIDENCE_NOTE_TEXT}
        </p>
      </div>
      <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
        This note will be saved exactly as shown.
      </p>

      <p className="mt-4 border-t border-border/50 pt-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        Structured details
      </p>
      <dl className="mt-2 grid gap-x-6 gap-y-3 sm:grid-cols-2">
        {REVIEW_FIELDS.map(([label, value]) => (
          <div key={label}>
            <dt className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {label}
            </dt>
            <dd className="mt-0.5 text-sm leading-snug text-foreground">
              {value}
            </dd>
          </div>
        ))}
      </dl>

      <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-border/50 pt-4">
        <span className="inline-flex h-8 items-center rounded-lg bg-primary px-3 text-[13px] font-semibold text-primary-foreground">
          Save validated evidence
        </span>
        <span className="inline-flex h-8 items-center rounded-lg border border-border bg-card px-3 text-[13px] font-medium text-foreground">
          Edit
        </span>
        <span className="inline-flex h-8 items-center rounded-lg px-3 text-[13px] font-medium text-muted-foreground">
          Dismiss for now
        </span>
      </div>
    </div>
  );
}

export function ValidatedRecordArt() {
  return (
    <div
      aria-hidden="true"
      className="w-full max-w-lg rounded-card border border-border bg-card p-5 shadow-floating"
    >
      <div className="flex items-start gap-3.5">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-lg border border-validated/50 bg-validated/35 text-validated-foreground">
          <CheckCircle2 className="size-5" strokeWidth={1.75} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Jan 22 · 11:42 AM
          </p>
          <p className="font-display mt-0.5 text-xl font-semibold tracking-tight text-foreground">
            Stacy
          </p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full border border-validated/60 bg-validated/35 px-3 py-1 text-xs font-semibold text-validated-foreground">
          <span className="size-2 rounded-full bg-current" />
          Validated
        </span>
      </div>

      <p className="mt-4 text-[15px] leading-relaxed text-foreground">
        {EVIDENCE_NOTE_TEXT}
      </p>
      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
        <span className="font-medium text-foreground">Structured details:</span>{" "}
        Behavior observation · Calm-down strategy · Independent
      </p>

      <div className="mt-3 flex flex-wrap gap-1.5">
        <ArtChip>Calm-down strategy</ArtChip>
        <ArtChip>Independent</ArtChip>
        <ArtChip variant="evidence">Behavior observation</ArtChip>
        <ArtChip variant="tag">#strategy</ArtChip>
        <ArtChip variant="tag">#independence</ArtChip>
      </div>

      <p className="mt-4 border-t border-border/50 pt-3 text-xs text-muted-foreground">
        Saved to Stacy&apos;s timeline · Reviewed by you
      </p>
    </div>
  );
}

const timelineEntries = [
  {
    date: "Sept 18",
    text: "Used her calm-down strategy after a teacher prompt.",
    chip: "Prompted",
    current: false,
  },
  {
    date: "Nov 04",
    text: "Asked for a break card before escalation.",
    chip: "Emerging",
    current: false,
  },
  {
    date: "Jan 22",
    text: "Used her calm-down strategy independently during the math transition.",
    chip: "Independent",
    current: true,
  },
  {
    date: "Mar 07",
    text: "Pattern shared during the progress review.",
    chip: "Discussed",
    current: false,
  },
];

export function StudentTimelineArt() {
  return (
    <div
      aria-hidden="true"
      className="w-full max-w-xl rounded-card border border-border bg-card p-5 shadow-floating"
    >
      <div className="flex flex-wrap items-center gap-3 border-b border-border pb-4">
        <span className="flex size-11 items-center justify-center rounded-md border border-border bg-muted/50 text-sm font-bold text-foreground">
          ST
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-display text-xl font-semibold tracking-tight text-foreground">
            Stacy
          </p>
          <p className="text-xs text-muted-foreground">@stacy · Math Support</p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full border border-validated/60 bg-validated/35 px-3 py-1 text-xs font-semibold text-validated-foreground">
          <span className="size-2 rounded-full bg-current" />4 validated
          records
        </span>
      </div>

      <ol className="relative mt-4 space-y-2.5 pl-6">
        <span
          aria-hidden="true"
          className="absolute bottom-3 left-[7px] top-3 w-px bg-border"
        />
        {timelineEntries.map((entry) => (
          <li
            key={entry.date}
            className={`relative rounded-lg py-2 pl-2 pr-2.5 ${
              entry.current
                ? "-ml-2 border border-validated/60 bg-validated/20 pl-4"
                : ""
            }`}
          >
            <span
              className={`absolute top-[1.15rem] size-[9px] rounded-full border ${
                entry.current
                  ? "-left-[1.05rem] border-validated-foreground/40 bg-validated"
                  : "-left-[1.55rem] border-foreground/15 bg-tape"
              }`}
            />
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {entry.date}
              </span>
              <span className="min-w-0 flex-1 text-sm leading-snug text-foreground">
                {entry.text}
              </span>
              <ArtChip variant={entry.current ? "validated" : "default"}>
                {entry.chip}
              </ArtChip>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

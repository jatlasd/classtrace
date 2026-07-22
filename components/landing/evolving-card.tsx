import {
  AtSign,
  CheckCircle2,
  ClipboardCheck,
  Hash,
  PenLine,
  Users,
} from "lucide-react";
import Image from "next/image";
import type { ReactNode } from "react";
import {
  ArtChip,
  EVIDENCE_NOTE_TEXT,
  RAW_NOTE_TEXT,
  REVIEW_FIELDS,
} from "@/components/landing/story-artifacts";

const EASE = "ease-[cubic-bezier(0.22,1,0.36,1)]";

function Collapse({
  open,
  children,
  className = "",
  delay = false,
}: {
  open: boolean;
  children: ReactNode;
  className?: string;
  delay?: boolean;
}) {
  return (
    <div
      className={`grid transition-[grid-template-rows,opacity] duration-700 ${EASE} ${
        open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
      } ${delay && open ? "delay-200" : ""} ${className}`}
    >
      <div className="min-h-0 overflow-hidden">{children}</div>
    </div>
  );
}

function StaggerItem({
  open,
  index,
  children,
  className = "",
}: {
  open: boolean;
  index: number;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      style={{ transitionDelay: open ? `${180 + index * 70}ms` : "0ms" }}
      className={`transition-[opacity,transform] duration-500 ${EASE} ${
        open ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
      } ${className}`}
    >
      {children}
    </div>
  );
}

function HintPill({
  icon: Icon,
  label,
}: {
  icon: typeof AtSign;
  label: string;
}) {
  return (
    <span className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-muted/30 px-2.5 text-xs font-medium text-muted-foreground">
      <Icon className="size-3.5" strokeWidth={1.75} />
      {label}
    </span>
  );
}

function TimelineEntry({
  open,
  index,
  date,
  text,
  chip,
}: {
  open: boolean;
  index: number;
  date: string;
  text: string;
  chip: string;
}) {
  return (
    <Collapse open={open}>
      <StaggerItem open={open} index={index}>
        <div className="mx-1 flex flex-wrap items-baseline gap-x-3 gap-y-1 rounded-lg border border-border/80 bg-card/80 px-4 py-2.5">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {date}
          </span>
          <span className="min-w-0 flex-1 text-sm leading-snug text-foreground">
            {text}
          </span>
          <ArtChip>{chip}</ArtChip>
        </div>
      </StaggerItem>
    </Collapse>
  );
}

export function EvolvingCard({ phase }: { phase: number }) {
  const isNote = phase === 0;
  const isComposer = phase === 1;
  const isReview = phase === 2;
  const isRecord = phase >= 3;
  const isFiled = phase >= 4;

  return (
    <div aria-hidden="true" className="w-full max-w-xl">
      <Collapse open={isFiled} className="mb-3">
        <div className="flex items-center justify-between rounded-lg border border-border bg-card/95 px-4 py-2 shadow-paper">
          <span className="flex items-center gap-2">
            <PenLine className="size-4 text-primary" strokeWidth={2.25} />
            <span className="font-display text-base font-semibold tracking-tight text-foreground">
              ClassTrace
            </span>
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-flex h-7 items-center gap-1.5 rounded-md px-2.5 text-xs font-semibold text-foreground">
              <PenLine className="size-3.5 text-primary" strokeWidth={2.25} />
              Capture
            </span>
            <span className="inline-flex h-7 items-center gap-1.5 rounded-md px-2.5 text-xs font-semibold text-muted-foreground">
              <Users className="size-3.5" strokeWidth={1.75} />
              Students
            </span>
          </span>
        </div>
      </Collapse>

      <Collapse open={isFiled} className="mb-3">
        <StaggerItem open={isFiled} index={0}>
          <div className="mx-1 flex flex-wrap items-center gap-3 border-b border-border px-3 pb-3">
            <span className="flex size-10 items-center justify-center rounded-md border border-border bg-muted/50 text-xs font-bold text-foreground">
              ST
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-display text-lg font-semibold tracking-tight text-foreground">
                Stacy
              </p>
              <p className="text-xs text-muted-foreground">
                @stacy · Math Support
              </p>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full border border-validated/60 bg-validated/35 px-3 py-1 text-xs font-semibold text-validated-foreground">
              <span className="size-2 rounded-full bg-current" />4 validated
              records
            </span>
          </div>
        </StaggerItem>
      </Collapse>

      <TimelineEntry
        open={isFiled}
        index={1}
        date="Sept 18"
        text="Used her calm-down strategy after a teacher prompt."
        chip="Prompted"
      />
      <TimelineEntry
        open={isFiled}
        index={2}
        date="Nov 04"
        text="Asked for a break card before escalation."
        chip="Emerging"
      />

      <div
        className={`relative my-0 w-full border transition-[background-color,border-color,border-radius,transform,margin] duration-700 ${EASE} ${
          isNote
            ? "-rotate-2 rounded-sm border-transparent bg-transparent"
            : "rotate-0 rounded-card border-border bg-card shadow-floating"
        } ${isFiled ? "my-2 scale-[0.985] border-validated/60" : ""}`}
      >
        <Image
          src="/svg/landing/ruled-teacher-note.svg?v=4"
          alt=""
          fill
          sizes="(max-width: 768px) 90vw, 576px"
          className={`object-fill transition-opacity duration-500 ${
            isNote ? "opacity-100" : "opacity-0"
          }`}
        />
        <Image
          src="/svg/landing/tape-strip.svg?v=2"
          alt=""
          width={96}
          height={34}
          className={`absolute -top-3 left-1/2 h-7 w-24 -translate-x-1/2 rotate-1 transition-opacity duration-500 ${
            isNote ? "opacity-100" : "opacity-0"
          }`}
        />

        <Collapse open={isComposer}>
          <div className="flex items-baseline gap-3 border-b border-border bg-muted/25 px-5 py-3">
            <p className="font-display text-lg font-semibold tracking-tight text-foreground">
              What happened?
            </p>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Quick capture
            </p>
          </div>
        </Collapse>

        <Collapse open={isReview}>
          <div className="border-b border-border/60 px-5 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              ClassTrace read this as
            </p>
            <p className="font-display mt-0.5 text-lg font-semibold tracking-tight text-foreground">
              Review before saving
            </p>
          </div>
        </Collapse>

        <Collapse open={isRecord}>
          <div className="flex items-start gap-3 px-5 pb-1 pt-4">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-validated/50 bg-validated/35 text-validated-foreground">
              <CheckCircle2 className="size-4.5" strokeWidth={1.75} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Jan 22 · 11:42 AM
              </p>
              <p className="font-display text-lg font-semibold tracking-tight text-foreground">
                Stacy
              </p>
            </div>
            <span
              className={`inline-flex items-center gap-2 rounded-full border border-validated/60 bg-validated/35 px-3 py-1 text-xs font-semibold text-validated-foreground transition-[transform,opacity] duration-500 delay-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                isRecord ? "rotate-0 scale-100 opacity-100" : "-rotate-6 scale-150 opacity-0"
              }`}
            >
              <span className="size-2 rounded-full bg-current" />
              Validated
            </span>
          </div>
        </Collapse>

        <div className={`relative px-5 transition-[padding] duration-700 ${isNote ? "py-5" : "py-4"}`}>
          <Collapse open={isNote}>
            <p className="font-hand py-2 text-[2rem] font-medium leading-tight tracking-[0.01em] text-foreground/90">
              {RAW_NOTE_TEXT}
            </p>
          </Collapse>

          <Collapse open={isComposer}>
            <div className="rounded-lg border border-ring bg-card px-3.5 py-3 ring-3 ring-ring/20">
              <p className="text-[15px] leading-relaxed text-foreground">
                <span className="font-medium text-primary">@stacy</span> used
                her calm-down strategy on her own during the math transition!!
                first time unprompted{" "}
                <span className="font-medium text-primary">#strategy</span>{" "}
                <span className="font-medium text-primary">#independence</span>
                <span className="ml-0.5 inline-block h-[1.05em] w-px translate-y-[3px] animate-pulse bg-foreground/80" />
              </p>
            </div>
            <p className="mt-2.5 text-sm text-muted-foreground">
              Ready to capture for Stacy.
            </p>
          </Collapse>

          <Collapse open={isReview}>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
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
          </Collapse>

          <Collapse open={isRecord}>
            <p className="text-[15px] leading-relaxed text-foreground">
              {EVIDENCE_NOTE_TEXT}
            </p>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              <span className="font-medium text-foreground">
                Structured details:
              </span>{" "}
              Behavior observation · Calm-down strategy · Independent
            </p>
          </Collapse>
        </div>

        <Collapse open={isReview}>
          <div className="px-5 pb-4">
            <p className="border-t border-border/50 pt-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Structured details
            </p>
            <dl className="mt-2 grid gap-x-6 gap-y-3 sm:grid-cols-2">
              {REVIEW_FIELDS.map(([label, value], index) => (
                <StaggerItem key={label} open={isReview} index={index}>
                  <dt className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {label}
                  </dt>
                  <dd className="mt-0.5 text-sm leading-snug text-foreground">
                    {value}
                  </dd>
                </StaggerItem>
              ))}
            </dl>
          </div>
        </Collapse>

        <Collapse open={isRecord} delay>
          <div className="flex flex-wrap gap-1.5 px-5 pb-4">
            <ArtChip>Calm-down strategy</ArtChip>
            <ArtChip>Independent</ArtChip>
            <ArtChip variant="evidence">Behavior observation</ArtChip>
            <ArtChip variant="tag">#strategy</ArtChip>
            <ArtChip variant="tag">#independence</ArtChip>
          </div>
        </Collapse>

        <Collapse open={isComposer}>
          <div className="flex flex-wrap items-center gap-2 border-t border-border px-5 py-3">
            <HintPill icon={AtSign} label="Mention one student" />
            <HintPill icon={Hash} label="Add tags" />
            <HintPill icon={ClipboardCheck} label="Review before saving" />
            <span className="ml-auto inline-flex h-9 items-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground">
              Capture Note
            </span>
          </div>
        </Collapse>

        <Collapse open={isReview}>
          <div className="flex flex-wrap items-center gap-2 border-t border-border/50 px-5 py-3.5">
            <span className="inline-flex h-8 items-center rounded-lg bg-primary px-3 text-[13px] font-semibold text-primary-foreground">
              Save validated evidence
            </span>
            <span className="inline-flex h-8 items-center rounded-lg px-3 text-[13px] font-medium text-muted-foreground">
              Review later
            </span>
          </div>
        </Collapse>

        <Collapse open={isRecord && !isFiled}>
          <p className="border-t border-border/50 px-5 py-3 text-xs text-muted-foreground">
            Saved to Stacy&apos;s timeline · Reviewed by you
          </p>
        </Collapse>
      </div>

      <TimelineEntry
        open={isFiled}
        index={3}
        date="Mar 07"
        text="Pattern shared during the progress review."
        chip="Discussed"
      />
    </div>
  );
}

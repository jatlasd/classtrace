import type { ReactNode } from "react";
import {
  CalendarDays,
  Camera,
  Check,
  CheckCircle2,
  FileDown,
  Search,
  Tag,
  UserRoundCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

const steps = [
  {
    eyebrow: "Capture while it is fresh",
    title: "A ten-second note keeps the context attached.",
    body: "Write what you saw, mention one roster student, and add a work-sample photo or tags when they help. The note stays a draft until you review it.",
    points: ["One student mention", "A note, one photo, or both"],
    preview: "capture",
  },
  {
    eyebrow: "Keep your judgment in control",
    title: "ClassTrace structures the draft. You approve the record.",
    body: "Check the resolved student, Evidence note, date, and suggested details. Edit anything that needs your context before permanent save.",
    points: ["Nothing auto-saves", "Exactly one resolved student"],
    preview: "review",
  },
  {
    eyebrow: "Use it when the conversation matters",
    title: "Walk in with a record, not a recollection.",
    body: "Open one student’s date-ordered timeline, filter a printable report, or export the validated evidence you need for your own documentation.",
    points: ["Searchable student history", "Date-filtered report and CSV export"],
    preview: "retrieve",
  },
] as const;

type PreviewKind = (typeof steps)[number]["preview"];

function PreviewFrame({ children, label }: { children: ReactNode; label: string }) {
  return (
    <div aria-hidden="true" className="overflow-hidden rounded-card border border-border bg-background shadow-floating">
      <div className="flex h-10 items-center justify-between border-b border-border bg-card px-4">
        <div className="flex items-center gap-2 text-[10px] font-bold text-foreground">
          <span className="flex size-4 items-center justify-center rounded-sm bg-navy text-[8px] text-mint">CT</span>
          ClassTrace
        </div>
        <span className="text-[9px] font-medium text-muted-foreground">{label}</span>
      </div>
      {children}
    </div>
  );
}

function WorkflowPreview({ kind }: { kind: PreviewKind }) {
  if (kind === "capture") {
    return (
      <PreviewFrame label="Quick capture">
        <div className="bg-background p-5 sm:p-6">
          <div className="rounded-lg border border-border bg-card shadow-surface">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <span className="text-[11px] font-semibold text-foreground">What happened?</span>
              <span className="text-[9px] text-muted-foreground">Review before saving</span>
            </div>
            <div className="p-4">
              <p className="min-h-20 rounded-md border border-input bg-background px-3 py-2.5 text-[11px] leading-5 text-muted-foreground">
                <span className="font-semibold text-link">@stacy</span> used her calm-down strategy independently during the math transition <span className="font-semibold text-link">#strategy</span>
              </p>
              <div className="mt-3 flex items-center justify-between gap-3">
                <span className="flex items-center gap-1.5 rounded-md border border-border px-2 py-1.5 text-[9px] text-muted-foreground"><Camera className="size-3" /> Add one photo</span>
                <span className="rounded-md bg-primary px-3 py-2 text-[9px] font-semibold text-primary-foreground">Capture note</span>
              </div>
            </div>
          </div>
        </div>
      </PreviewFrame>
    );
  }

  if (kind === "review") {
    return (
      <PreviewFrame label="Teacher review">
        <div className="bg-background p-5 sm:p-6">
          <div className="overflow-hidden rounded-lg border border-border bg-card">
            <div className="flex items-center gap-3 border-b border-border bg-card px-4 py-3">
              <span className="flex size-7 items-center justify-center rounded-full border border-border text-muted-foreground"><UserRoundCheck className="size-3.5" /></span>
              <div>
                <p className="text-[10px] font-semibold text-foreground">Stacy · Math Support</p>
                <p className="text-[8px] text-muted-foreground">One resolved roster student</p>
              </div>
            </div>
            <div className="grid gap-3 p-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <p className="text-[8px] font-semibold text-muted-foreground">Evidence note</p>
                <p className="mt-1 rounded-md border border-input bg-background px-3 py-2 text-[10px] leading-4 text-foreground">Used her calm-down strategy independently during the math transition.</p>
              </div>
              <div><p className="text-[8px] font-semibold text-muted-foreground">Date</p><p className="mt-1 flex items-center gap-1.5 rounded-md border border-input px-2.5 py-2 text-[9px] text-foreground"><CalendarDays className="size-3 text-link" /> Today</p></div>
              <div><p className="text-[8px] font-semibold text-muted-foreground">Topic</p><p className="mt-1 flex items-center gap-1.5 rounded-md border border-input px-2.5 py-2 text-[9px] text-foreground"><Tag className="size-3 text-link" /> Self-regulation</p></div>
            </div>
            <div className="flex items-center justify-between border-t border-border bg-muted/20 px-4 py-3">
              <span className="flex items-center gap-1.5 text-[8px] text-muted-foreground"><CheckCircle2 className="size-3 text-validated-foreground" /> You approve the final record</span>
              <span className="rounded-md bg-primary px-3 py-2 text-[9px] font-semibold text-primary-foreground">Save evidence</span>
            </div>
          </div>
        </div>
      </PreviewFrame>
    );
  }

  return (
    <PreviewFrame label="Student timeline">
      <div className="bg-background p-5 sm:p-6">
        <div className="flex items-end justify-between gap-4">
          <div><p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">Student evidence</p><p className="mt-1 text-base font-semibold text-foreground">Stacy’s timeline</p></div>
          <div className="flex gap-2"><span className="flex items-center gap-1 rounded-md border border-border bg-card px-2 py-1.5 text-[8px] text-muted-foreground"><Search className="size-3" /> Search</span><span className="flex items-center gap-1 rounded-md border border-border bg-card px-2 py-1.5 text-[8px] text-foreground"><FileDown className="size-3 text-link" /> Report</span></div>
        </div>
        <div className="mt-4 overflow-hidden rounded-lg border border-border bg-card">
          {[
            ["Today", "Used her calm-down strategy independently during the math transition.", "Self-regulation"],
            ["Aug 27", "Asked for a short break, then returned and completed the assignment.", "Self-advocacy"],
          ].map(([date, note, topic]) => (
            <div key={date} className="grid grid-cols-[58px_1fr] gap-3 border-b border-border px-3 py-3 last:border-b-0">
              <span className="text-[9px] font-semibold text-muted-foreground">{date}</span>
              <div><p className="text-[10px] leading-4 text-foreground">{note}</p><span className="mt-2 inline-flex rounded-full border border-border bg-muted/50 px-2 py-0.5 text-[8px] font-medium text-muted-foreground">{topic}</span></div>
            </div>
          ))}
        </div>
      </div>
    </PreviewFrame>
  );
}

export function LandingHowItWorks() {
  return (
    <section id="how-it-works" aria-labelledby="how-it-works-heading" className="scroll-mt-20 border-b border-border/70 bg-background">
      <div className="mx-auto max-w-[1180px] px-4 py-12 md:px-6 lg:px-8 lg:py-16">
        <div className="mx-auto max-w-2xl text-center">
          <h2 id="how-it-works-heading" className="text-3xl font-bold tracking-[-0.03em] text-balance text-foreground sm:text-[2.5rem]">
            One path from “I should remember that” to a useful record
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-7 text-pretty text-muted-foreground">
            ClassTrace separates quick capture from permanent evidence, so speed
            never replaces teacher review.
          </p>
        </div>
        <ol className="mt-12 space-y-14 lg:mt-16 lg:space-y-20">
          {steps.map((step, index) => (
            <li key={step.title} className="grid items-center gap-8 lg:grid-cols-2 lg:gap-14">
              <div className={cn("max-w-lg", index % 2 === 1 && "lg:order-2")}>
                <p className="flex items-center gap-3 text-sm font-semibold text-link">
                  <span className="flex size-7 items-center justify-center rounded-full border border-link/35 text-xs tabular-nums">{index + 1}</span>
                  {step.eyebrow}
                </p>
                <h3 className="mt-4 text-2xl font-bold leading-tight tracking-[-0.025em] text-balance text-foreground sm:text-[2rem]">{step.title}</h3>
                <p className="mt-4 text-[15px] leading-7 text-pretty text-muted-foreground">{step.body}</p>
                <ul className="mt-5 space-y-2.5">
                  {step.points.map((point) => (
                    <li key={point} className="flex items-center gap-2.5 text-sm font-medium text-foreground">
                      <span className="flex size-5 items-center justify-center rounded-full border border-border text-muted-foreground"><Check className="size-3" strokeWidth={2.4} /></span>
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
              <div className={cn("min-w-0", index % 2 === 1 && "lg:order-1")}><WorkflowPreview kind={step.preview} /></div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

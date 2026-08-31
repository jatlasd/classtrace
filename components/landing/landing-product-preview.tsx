import {
  CalendarDays,
  CheckCircle2,
  FileText,
  Menu,
  Search,
  Settings,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

const previewEvidence = [
  {
    initials: "ST",
    student: "Stacy",
    className: "Math Support",
    date: "Today, 11:42 AM",
    note: "Used her calm-down strategy independently during the math transition.",
    tags: ["Independent", "#strategy"],
  },
  {
    initials: "JF",
    student: "Jeff",
    className: "Period 3",
    date: "Yesterday, 1:18 PM",
    note: "Asked a clarifying question before starting the lab.",
    tags: ["Self-advocacy", "#science"],
  },
] as const;

function EvidenceRows({ compact = false }: { compact?: boolean }) {
  return (
    <div className="divide-y divide-border">
      {previewEvidence.slice(0, compact ? 1 : 2).map((record) => (
        <article key={record.student} className="flex gap-3 px-3 py-3.5">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-link">
            {record.initials}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
              <span className="text-xs font-semibold text-foreground">
                {record.student}
              </span>
              <span className="text-[9px] text-muted-foreground">
                {record.className} · {record.date}
              </span>
            </div>
            <p className="mt-1 text-[10px] leading-4 text-foreground">
              {record.note}
            </p>
            <div className="mt-2 flex flex-wrap gap-1">
              {record.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-border bg-muted/50 px-1.5 py-0.5 text-[8px] font-medium text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <CheckCircle2
            aria-hidden="true"
            className="mt-0.5 size-3.5 shrink-0 text-validated-foreground"
          />
        </article>
      ))}
    </div>
  );
}

export function LandingProductPreview({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "overflow-hidden rounded-card border border-border bg-background shadow-floating",
        className,
      )}
    >
      <div className="flex h-9 items-center justify-between border-b border-border bg-card px-3">
        <div className="flex items-center gap-2 text-[10px] font-bold text-foreground">
          <span className="flex size-4 items-center justify-center rounded-sm bg-primary text-[8px] text-primary-foreground">
            CT
          </span>
          ClassTrace
        </div>
        <div className="flex items-center gap-2 text-[9px] text-muted-foreground">
          <Search aria-hidden="true" className="size-3" />
          Search evidence
          <Settings aria-hidden="true" className="size-3" />
        </div>
      </div>

      <div className="grid min-h-[310px] grid-cols-1 sm:grid-cols-[96px_minmax(0,1fr)]">
        <aside className="hidden border-r border-sidebar-border bg-sidebar p-2 text-sidebar-foreground sm:block">
          <p className="px-2 pt-1 text-[8px] font-semibold uppercase tracking-wider text-sidebar-foreground/60">
            Workspace
          </p>
          <div className="mt-2 space-y-1">
            <span className="flex items-center gap-1.5 rounded-sm bg-sidebar-accent px-2 py-2 text-[9px] font-semibold">
              <FileText aria-hidden="true" className="size-3" /> Evidence
            </span>
            <span className="flex items-center gap-1.5 px-2 py-2 text-[9px] text-sidebar-foreground/75">
              <Users aria-hidden="true" className="size-3" /> Students
            </span>
          </div>
        </aside>

        <div className="min-w-0 bg-background p-3 sm:p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[8px] font-semibold uppercase tracking-wider text-muted-foreground">
                Evidence feed
              </p>
              <h2 className="mt-0.5 text-sm font-semibold tracking-tight text-foreground">
                Capture, review, and retrieve
              </h2>
            </div>
            <span className="rounded-md border border-border bg-card px-2 py-1 text-[8px] font-medium text-muted-foreground">
              All evidence
            </span>
          </div>

          <div className="mt-3 rounded-md border border-border bg-card shadow-surface">
            <div className="flex items-center justify-between border-b border-border px-3 py-2">
              <span className="text-[9px] font-semibold text-foreground">
                What happened?
              </span>
              <span className="text-[8px] text-muted-foreground">
                Review before saving
              </span>
            </div>
            <div className="px-3 py-2.5">
              <p className="rounded-md border border-input bg-background px-2.5 py-2 text-[9px] leading-4 text-muted-foreground">
                <span className="font-semibold text-link">@stacy</span> used her
                calm-down strategy independently{" "}
                <span className="font-semibold text-link">#strategy</span>
              </p>
              <div className="mt-2 flex items-center justify-between gap-2">
                <span className="text-[8px] text-muted-foreground">
                  Ready to capture for Stacy.
                </span>
                <span className="rounded-md bg-primary px-2.5 py-1.5 text-[8px] font-semibold text-primary-foreground">
                  Capture note
                </span>
              </div>
            </div>
          </div>

          <div className="mt-3 overflow-hidden rounded-md border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border px-3 py-2">
              <span className="text-[9px] font-semibold text-foreground">
                Recent evidence
              </span>
              <span className="text-[8px] text-muted-foreground">Newest first</span>
            </div>
            <EvidenceRows compact={compact} />
          </div>
        </div>
      </div>
    </div>
  );
}

export function LandingMobilePreview() {
  return (
    <div
      aria-hidden="true"
      className="w-[220px] overflow-hidden rounded-[1.6rem] border-[5px] border-navy bg-background shadow-floating"
    >
      <div className="flex h-11 items-center justify-between bg-sidebar px-3 text-sidebar-foreground">
        <span className="text-[10px] font-bold">ClassTrace</span>
        <Menu aria-hidden="true" className="size-4" />
      </div>
      <div className="p-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[8px] uppercase tracking-wider text-muted-foreground">Evidence</p>
            <p className="text-xs font-semibold text-foreground">Today&apos;s feed</p>
          </div>
          <CalendarDays aria-hidden="true" className="size-4 text-link" />
        </div>
        <div className="mt-3 rounded-md border border-border bg-card p-2.5 shadow-surface">
          <p className="text-[9px] font-semibold text-foreground">What happened?</p>
          <p className="mt-2 rounded-md border border-input bg-background px-2 py-2 text-[8px] leading-3.5 text-muted-foreground">
            <span className="font-semibold text-link">@stacy</span> used her calm-down strategy independently.
          </p>
          <div className="mt-2 flex justify-end">
            <span className="rounded-md bg-primary px-2 py-1 text-[8px] font-semibold text-primary-foreground">Capture</span>
          </div>
        </div>
        <div className="mt-3 overflow-hidden rounded-md border border-border bg-card">
          <EvidenceRows compact />
        </div>
      </div>
    </div>
  );
}

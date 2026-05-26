import { NoteContent } from "@/components/dashboard/note-content";
import type { Capture } from "@/lib/mock-data";
import { studentColors } from "@/lib/mock-data";
import { Heart, MessageCircle, Share2 } from "lucide-react";

function StudentAvatar({ name }: { name: string }) {
  return (
    <div
      className={`flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white ${studentColors[name] ?? "bg-slate-400"}`}
    >
      {name.charAt(0)}
    </div>
  );
}

function NotebookAttachment() {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-[#faf8f3]">
      <div className="border-b border-border/60 bg-[#f0ebe0] px-3 py-2">
        <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          Student work — attached
        </p>
      </div>
      <div className="relative p-4">
        <div className="space-y-2.5 font-hand text-sm leading-relaxed text-slate-700">
          <p>1. 3/4 × 2/5 = ?</p>
          <p className="text-sky-700 underline decoration-wavy decoration-sky-400/60">
            multiply numerators, then denominators
          </p>
          <p>3/4 × 2/5 = 6/20 = 3/10 ✓</p>
        </div>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.04] [background-image:repeating-linear-gradient(transparent,transparent_23px,#94a3b8_23px,#94a3b8_24px)]"
        />
      </div>
    </div>
  );
}

export function CaptureCard({ capture }: { capture: Capture }) {
  return (
    <article className="rounded-xl border border-border bg-card shadow-sm">
      <div className="p-4 pb-3">
        <div className="flex items-start gap-3">
          <StudentAvatar name={capture.primaryStudent} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
              <span className="text-sm font-semibold text-foreground">
                {capture.primaryStudent}
              </span>
              <span className="text-xs text-muted-foreground">
                {capture.timestamp}
              </span>
            </div>
            <div className="mt-2">
              <NoteContent text={capture.note} />
            </div>
          </div>
        </div>

        {capture.attachment === "notebook" && (
          <div className="mt-3 pl-[52px]">
            <NotebookAttachment />
          </div>
        )}

        {capture.summary && (
          <div className="mt-3 pl-[52px]">
            <div className="rounded-lg border border-border/60 bg-muted/40 px-3 py-2.5">
              <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Organized summary
              </p>
              <p className="text-xs leading-relaxed text-muted-foreground">
                {capture.summary}
              </p>
            </div>
          </div>
        )}
      </div>

      <footer className="flex items-center justify-between border-t border-border px-4 py-2.5">
        <span className="rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
          {capture.evidenceType}
          {capture.followUp ? " · Follow-up" : ""}
        </span>
        <div className="flex items-center gap-1">
          {[Heart, MessageCircle, Share2].map((Icon, i) => (
            <button
              key={i}
              type="button"
              className="flex size-8 items-center justify-center rounded-lg text-muted-foreground/60 transition-colors hover:bg-muted hover:text-muted-foreground"
            >
              <Icon className="size-4" strokeWidth={1.75} />
            </button>
          ))}
        </div>
      </footer>
    </article>
  );
}

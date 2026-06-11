import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/routes";

export function LandingHero() {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-40 [background-image:repeating-linear-gradient(to_bottom,transparent,transparent_35px,var(--border)_35px,var(--border)_36px)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 right-[-12%] size-[560px] rounded-full bg-accent/70 blur-3xl"
      />
      <div className="relative mx-auto grid max-w-6xl gap-14 px-4 pb-20 pt-16 md:px-6 lg:grid-cols-[1.15fr_1fr] lg:items-center lg:gap-10 lg:px-8 lg:pb-28 lg:pt-24">
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          <p className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-semibold text-muted-foreground shadow-sm">
            <span className="font-hand text-base leading-none text-primary">✎</span>
            For teachers who have to remember everything
          </p>
          <h1 className="mt-6 text-5xl font-semibold leading-[1.02] tracking-tighter text-foreground sm:text-6xl lg:text-7xl">
            Catch the{" "}
            <span className="relative inline-block whitespace-nowrap">
              <span
                aria-hidden="true"
                className="absolute inset-x-[-4px] bottom-[0.08em] top-[0.18em] -rotate-1 rounded-sm bg-primary/15"
              />
              <span className="font-hand relative font-medium text-primary">
                moment.
              </span>
            </span>
            <br />
            Keep the evidence.
          </h1>
          <p className="mt-6 max-w-lg text-base leading-relaxed text-muted-foreground lg:text-lg">
            A student note scribbled in the hallway shouldn&apos;t die on a
            sticky note. Write what happened in plain language — ClassTrace
            structures it, you approve it, and it lands on the student&apos;s
            timeline. Ready for the meeting you haven&apos;t scheduled yet.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button
              asChild
              className="h-11 rounded-lg px-7 text-[15px] font-semibold shadow-sm"
            >
              <Link href={routes.signUp}>Start capturing free</Link>
            </Button>
            <Link
              href={routes.signIn}
              className="px-2 py-2 text-center text-sm font-medium text-link underline-offset-4 hover:underline sm:text-left"
            >
              Sign in
            </Link>
          </div>
          <p className="font-hand mt-5 text-lg text-muted-foreground">
            no district setup. no IT ticket. just you and your roster.
          </p>
        </div>

        <div className="relative mx-auto w-full max-w-md lg:max-w-none">
          <div className="group relative -rotate-2 animate-in fade-in slide-in-from-bottom-6 rounded-xl border border-border bg-card p-5 shadow-md transition-transform duration-500 [animation-delay:150ms] [animation-fill-mode:backwards] hover:rotate-0">
            <span
              aria-hidden="true"
              className="absolute -top-3 left-1/2 h-6 w-24 -translate-x-1/2 rotate-2 rounded-sm border border-border/50 bg-accent/80"
            />
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Tuesday, 11:42 am — between classes
            </p>
            <p className="font-hand mt-3 text-2xl leading-snug text-foreground">
              @stacy used her calm-down strategy on her own during the math
              transition!! first time unprompted{" "}
              <span className="text-primary">#strategy #independence</span>
            </p>
          </div>

          <p
            aria-hidden="true"
            className="font-hand my-4 pr-8 text-right text-xl text-muted-foreground"
          >
            you review it ↓
          </p>

          <div className="group relative ml-4 rotate-1 animate-in fade-in slide-in-from-bottom-6 rounded-xl border border-border bg-card p-5 shadow-md transition-transform duration-500 [animation-delay:350ms] [animation-fill-mode:backwards] hover:rotate-0 lg:ml-10">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-full border border-sky-200/80 bg-sky-50 px-2.5 py-0.5 text-xs font-medium text-sky-900">
                Stacy
              </span>
              <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-2.5 py-0.5 text-xs font-medium text-primary">
                Self-regulation
              </span>
              <span className="ml-auto inline-flex items-center gap-1 rounded-full border border-emerald-200/80 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-900">
                <CheckCircle2 className="size-3" strokeWidth={2} />
                Validated
              </span>
            </div>
            <p className="mt-3.5 text-[15px] leading-relaxed text-foreground">
              Used her calm-down strategy independently during the math
              transition — first observed unprompted use.
            </p>
            <p className="mt-2.5 border-t border-border/60 pt-2.5 text-xs text-muted-foreground">
              Saved to Stacy&apos;s timeline · Reviewed by you
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

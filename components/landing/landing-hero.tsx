import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/routes";

export function LandingHero() {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-50 ruled-lines"
      />
      <div className="relative mx-auto grid max-w-6xl gap-14 px-4 pb-20 pt-16 md:px-6 lg:grid-cols-[1.15fr_1fr] lg:items-center lg:gap-10 lg:px-8 lg:pb-28 lg:pt-24">
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h1 className="font-display text-4xl font-semibold leading-[1.08] tracking-tight text-foreground sm:text-5xl lg:text-[3.25rem]">
            The note you lose today is the evidence you&apos;ll need in March.
          </h1>
          <p className="mt-6 max-w-lg text-base leading-relaxed text-muted-foreground lg:text-lg">
            ClassTrace turns quick teacher notes into a private student evidence
            trail — captured in the moment, reviewed by you, and ready when the
            conversation finally happens.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button
              asChild
              className="h-11 rounded-md px-7 text-[15px] font-semibold"
            >
              <Link href={routes.signUp}>Capture your first note</Link>
            </Button>
            <Button
              asChild
              variant="navy"
              className="h-11 rounded-md px-7 text-[15px] font-semibold"
            >
              <Link href="#how-it-works">
                See how one moment becomes evidence
              </Link>
            </Button>
          </div>
          <p className="font-hand mt-6 text-xl text-muted-foreground">
            for teachers who have to remember everything
          </p>
        </div>

        <div className="relative mx-auto w-full max-w-md lg:max-w-none">
          <div className="group relative -rotate-2 animate-in fade-in slide-in-from-bottom-6 rounded-card border border-border bg-accent/40 p-5 shadow-floating transition-transform duration-500 [animation-delay:150ms] [animation-fill-mode:backwards] hover:rotate-0">
            <span
              aria-hidden="true"
              className="tape-tab absolute -top-3 left-1/2 h-6 w-24 -translate-x-1/2 rotate-2 rounded-sm"
            />
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Tuesday, 11:42 AM — between classes
            </p>
            <p className="font-hand mt-3 text-2xl leading-snug text-foreground">
              @stacy used her calm-down strategy on her own during the math
              transition!! first time unprompted{" "}
              <span className="text-link">#strategy #independence</span>
            </p>
          </div>

          <p
            aria-hidden="true"
            className="font-hand my-4 pr-8 text-right text-xl text-primary"
          >
            you review it ↓
          </p>

          <div className="group relative ml-4 rotate-1 animate-in fade-in slide-in-from-bottom-6 rounded-card border border-border bg-card p-5 shadow-floating transition-transform duration-500 [animation-delay:350ms] [animation-fill-mode:backwards] hover:rotate-0 lg:ml-10">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-full border border-border bg-secondary px-2.5 py-0.5 text-xs font-medium text-foreground">
                Student: Stacy
              </span>
              <span className="inline-flex items-center rounded-full border border-border bg-secondary px-2.5 py-0.5 text-xs font-medium text-foreground">
                Category: Self-regulation
              </span>
              <span className="ml-auto inline-flex items-center gap-1 rounded-full border border-validated/60 bg-validated px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-validated-foreground">
                <CheckCircle2 className="size-3" strokeWidth={2} />
                Validated
              </span>
            </div>
            <p className="mt-3.5 text-[15px] leading-relaxed text-foreground">
              <span className="font-medium">Evidence:</span> &ldquo;Used her
              calm-down strategy independently during the math transition —
              first observed unprompted use.&rdquo;
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

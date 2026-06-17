import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/routes";

export function LandingHero() {
  return (
    <section className="relative overflow-hidden pb-8">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-40 "
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-[-8%] bottom-[-76px] h-36 rounded-[0_0_50%_50%/0_0_100%_100%] bg-secondary/60"
      />
      <div className="relative mx-auto grid max-w-6xl gap-14 px-4 pb-16 pt-14 md:px-6 lg:grid-cols-[1.05fr_1fr] lg:items-start lg:gap-12 lg:px-8 lg:pb-20 lg:pt-16">
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h1 className="font-display text-4xl font-semibold leading-[1.12] tracking-tight text-foreground sm:text-5xl lg:text-[3.4rem]">
            The note you lose today is the evidence you&apos;ll need in March.
          </h1>
          <p className="mt-6 max-w-md text-[15px] leading-relaxed text-muted-foreground">
            ClassTrace turns quick teacher notes into a private student
            evidence trail — captured in the moment, reviewed by you, and ready
            when the conversation finally happens.
          </p>
          <div className="relative mt-9 max-w-md">
            <Button
              asChild
              className="h-11 rounded-md px-7 text-[15px] font-semibold"
            >
              <Link href={routes.signUp}>Capture your first note</Link>
            </Button>
            <p
              aria-hidden="true"
              className="font-hand pointer-events-none absolute -top-10 right-0 hidden w-40 rotate-[-4deg] text-xl leading-tight text-primary sm:block"
            >
              for teachers who have to remember everything
              <span className="block pl-16 text-2xl">↘</span>
            </p>
          </div>
          <Link
            href="#how-it-works"
            className="mt-6 inline-block border-b border-link pb-0.5 text-sm font-medium text-link transition-colors hover:text-foreground"
          >
            See how one moment becomes evidence →
          </Link>
        </div>

        <div className="relative mx-auto w-full max-w-md lg:max-w-none">
          <div className="relative -rotate-1 animate-in fade-in slide-in-from-bottom-6 rounded-sm border border-accent-foreground/10 bg-accent/60 px-5 pb-6 pt-4 shadow-floating transition-transform duration-500 [animation-delay:150ms] [animation-fill-mode:backwards] hover:rotate-0">
            <span
              aria-hidden="true"
              className="tape-tab absolute -top-3 left-1/2 h-6 w-20 -translate-x-1/2 rotate-1 rounded-sm"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 opacity-60 [background-image:repeating-linear-gradient(to_bottom,transparent,transparent_31px,rgba(24,37,54,0.18)_31px,rgba(24,37,54,0.18)_32px)]"
            />
            <p className="font-hand relative text-xl leading-[2rem] text-foreground">
              Tuesday, 11:42 AM — between classes
            </p>
            <p className="font-hand relative mt-0 text-2xl leading-[2rem] text-foreground">
              @stacy used her calm-down strategy on her own during the math
              transition!! first time unprompted #strategy #independence
            </p>
          </div>

          <p className="font-hand my-4 flex items-center justify-center gap-2 text-xl text-foreground">
            <span
              aria-hidden="true"
              className="h-px w-10 border-t border-dashed border-foreground/40"
            />
            you review it ↓
          </p>

          <div className="relative rotate-1 animate-in fade-in slide-in-from-bottom-6 rounded-card border border-border bg-card p-5 pl-7 shadow-floating transition-transform duration-500 [animation-delay:350ms] [animation-fill-mode:backwards] hover:rotate-0">
            <span
              aria-hidden="true"
              className="absolute left-4 top-9 size-3 rounded-full border border-primary/40 bg-primary/70 shadow-inner"
            />
            <dl className="divide-y divide-border/70 text-sm">
              <div className="flex items-baseline gap-3 py-2.5">
                <dt className="font-mono text-[13px] text-muted-foreground">
                  Student:
                </dt>
                <dd className="font-mono text-[13px] font-medium text-foreground">
                  Stacy
                </dd>
              </div>
              <div className="flex items-baseline gap-3 py-2.5">
                <dt className="font-mono text-[13px] text-muted-foreground">
                  Category:
                </dt>
                <dd className="font-mono text-[13px] font-medium text-foreground">
                  Self-regulation
                </dd>
              </div>
              <div className="flex items-center gap-3 py-2.5">
                <dt className="font-mono text-[13px] text-muted-foreground">
                  Status:
                </dt>
                <dd>
                  <span className="inline-flex items-center rounded-full border border-validated-foreground/20 bg-validated px-2.5 py-0.5 font-mono text-xs font-medium text-validated-foreground">
                    Validated
                  </span>
                </dd>
              </div>
              <div className="py-2.5">
                <dt className="font-mono text-[13px] text-muted-foreground">
                  Evidence:
                </dt>
                <dd className="mt-1 font-mono text-[13px] leading-relaxed text-foreground">
                  &ldquo;Used her calm-down strategy independently during the
                  math transition — first observed unprompted use.&rdquo;
                </dd>
              </div>
            </dl>
            <p className="mt-1 flex items-center justify-between border-t border-border/70 pt-3 font-mono text-xs text-muted-foreground">
              <span>Saved to Stacy&apos;s timeline · Reviewed by you</span>
              <Check className="size-4 text-validated-foreground/70" strokeWidth={2} aria-hidden="true" />
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

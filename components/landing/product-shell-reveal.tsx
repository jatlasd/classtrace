import Link from "next/link";
import {
  CheckCircle2,
  FileText,
  ListChecks,
  PenLine,
  Settings,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ParallaxDrift, Reveal } from "@/components/landing/scroll-motion";
import { routes } from "@/lib/routes";

const facts = [
  {
    icon: ListChecks,
    title: "A scannable evidence feed",
    body: "Validated records land in one paged inbox — searchable, filterable, and free of dashboard noise.",
  },
  {
    icon: Users,
    title: "One timeline per student",
    body: "Each student's validated evidence stacks in date order, ready before the conversation happens.",
  },
  {
    icon: FileText,
    title: "Reports and export",
    body: "Filter a student's record by date, print a clean report, or export their evidence as CSV.",
  },
];

function ShellChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-border bg-card px-2.5 py-0.5 text-xs font-medium text-foreground">
      {children}
    </span>
  );
}

function ProductShellArt() {
  return (
    <div
      aria-hidden="true"
      className="overflow-hidden rounded-card border border-border bg-background shadow-floating"
    >
      <div className="flex items-center justify-between gap-4 border-b border-border bg-card/95 px-5 py-3">
        <span className="flex items-center gap-2.5">
          <PenLine className="size-4 text-primary" strokeWidth={2.25} />
          <span className="font-display text-lg font-semibold tracking-tight text-foreground">
            ClassTrace
          </span>
        </span>
        <span className="hidden items-center gap-1 sm:flex">
          <span className="relative inline-flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-foreground">
            <PenLine className="size-4 text-primary" strokeWidth={2.25} />
            Capture
            <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-primary" />
          </span>
          <span className="inline-flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-muted-foreground">
            <Users className="size-4" strokeWidth={1.75} />
            Students
          </span>
        </span>
        <span className="hidden items-center gap-2 text-sm font-semibold text-foreground lg:inline-flex">
          Account
          <Settings className="size-4 text-muted-foreground" />
        </span>
      </div>

      <div className="space-y-5 px-5 py-5 sm:px-6">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Evidence feed
          </p>
          <p className="font-display mt-1 text-xl font-semibold tracking-tight text-foreground">
            Capture, check, and file student evidence
          </p>
        </div>

        <div className="overflow-hidden rounded-card border border-border bg-card shadow-paper">
          <div className="grid sm:grid-cols-[8.5rem_minmax(0,1fr)]">
            <div className="border-b border-border bg-muted/25 px-4 py-3.5 sm:border-b-0 sm:border-r">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Quick capture
              </p>
              <p className="font-display mt-1 text-lg font-semibold tracking-tight text-foreground">
                What happened?
              </p>
            </div>
            <div className="flex flex-col justify-center gap-2.5 px-4 py-3.5">
              <div className="rounded-lg border border-border bg-background/45 px-3 py-2.5">
                <p className="text-sm leading-relaxed text-muted-foreground">
                  <span className="font-medium text-primary">@jeremy</span>{" "}
                  self-corrected twice while reading aloud today{" "}
                  <span className="font-medium text-primary">#fluency</span>
                </p>
              </div>
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs text-muted-foreground">
                  Ready to capture for Jeremy.
                </p>
                <span className="inline-flex h-8 items-center rounded-lg bg-primary px-3.5 text-xs font-semibold text-primary-foreground">
                  Capture Note
                </span>
              </div>
            </div>
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-foreground">
            Recent captures and saved evidence
          </p>
          <div className="mt-2.5 rounded-card border border-border bg-card">
            <div className="flex items-start gap-3.5 border-b border-border px-4 py-4">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-validated/50 bg-validated/35 text-validated-foreground">
                <CheckCircle2 className="size-4" strokeWidth={1.75} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="text-sm font-semibold text-foreground">
                    Stacy
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Math Support · Jan 22
                  </span>
                  <span className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-validated/60 bg-validated/35 px-2.5 py-0.5 text-[11px] font-semibold text-validated-foreground">
                    <span className="size-1.5 rounded-full bg-current" />
                    Validated
                  </span>
                </div>
                <p className="mt-1.5 text-sm leading-relaxed text-foreground">
                  Used her calm-down strategy independently during the math
                  transition — first observed unprompted use.
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <ShellChip>Calm-down strategy</ShellChip>
                  <span className="inline-flex items-center rounded-full border border-primary/25 bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                    Behavior observation
                  </span>
                  <span className="inline-flex items-center rounded-full border border-border bg-muted/60 px-2.5 py-0.5 text-xs font-medium text-link">
                    #independence
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3.5 px-4 py-4">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-validated/50 bg-validated/35 text-validated-foreground">
                <CheckCircle2 className="size-4" strokeWidth={1.75} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="text-sm font-semibold text-foreground">
                    Jeff
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Period 3 · Jan 20
                  </span>
                  <span className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-validated/60 bg-validated/35 px-2.5 py-0.5 text-[11px] font-semibold text-validated-foreground">
                    <span className="size-1.5 rounded-full bg-current" />
                    Validated
                  </span>
                </div>
                <p className="mt-1.5 text-sm leading-relaxed text-foreground">
                  Asked a clarifying question before starting the lab instead
                  of waiting for a check-in.
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <ShellChip>Self-advocacy</ShellChip>
                  <span className="inline-flex items-center rounded-full border border-primary/25 bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                    General observation
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProductShellReveal() {
  return (
    <section className="overflow-x-clip border-t border-border/70">
      <div className="mx-auto max-w-6xl px-4 py-16 md:px-6 lg:px-8 lg:py-24">
        <Reveal className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            The whole product
          </p>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-foreground lg:text-4xl">
            A calm evidence inbox — and that&apos;s the point.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
            The loop you just followed is the product. Capture sits at the top
            of every day, validated evidence files itself below, and nothing
            competes for your attention.
          </p>
        </Reveal>

        <Reveal
          from="translate-y-16 scale-[0.97]"
          className="relative mx-auto mt-12 max-w-4xl"
        >
          <ParallaxDrift depth={-18}>
            <ProductShellArt />
          </ParallaxDrift>
        </Reveal>

        <ul className="mx-auto mt-12 grid max-w-4xl gap-x-10 gap-y-8 sm:grid-cols-3">
          {facts.map((fact, index) => (
            <li key={fact.title}>
              <Reveal delay={index * 120}>
                <fact.icon
                  aria-hidden="true"
                  className="size-5 text-primary"
                  strokeWidth={1.75}
                />
                <h3 className="mt-3 font-display text-lg font-semibold text-foreground">
                  {fact.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {fact.body}
                </p>
              </Reveal>
            </li>
          ))}
        </ul>

        <div className="mt-12 flex justify-center">
          <Button
            asChild
            variant="outline"
            className="h-11 rounded-md px-6 text-sm font-semibold"
          >
            <Link href={routes.signUp} prefetch={false}>
              Set up your roster and capture
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

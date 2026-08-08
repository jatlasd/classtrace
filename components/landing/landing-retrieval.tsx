import Link from "next/link";
import { FileText, ListChecks, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LandingEvidenceFolder } from "@/components/landing/landing-evidence-folder";
import { Reveal } from "@/components/landing/scroll-motion";
import { routes } from "@/lib/routes";

const facts = [
  {
    icon: ListChecks,
    title: "A calm evidence feed",
    body: "Validated records land in one paged inbox — searchable, filterable, and free of dashboard noise.",
  },
  {
    icon: Users,
    title: "One folder per student",
    body: "Each student's validated evidence stacks in date order, ready before the conversation happens.",
  },
  {
    icon: FileText,
    title: "Reports and export",
    body: "Filter a student's record by date, print a clean report, or export their evidence as CSV.",
  },
];

export function LandingRetrieval() {
  return (
    <section
      id="find-it-later"
      className="scroll-mt-20 overflow-x-clip border-t border-border/70"
    >
      <div className="mx-auto max-w-6xl px-4 py-16 md:px-6 lg:px-8 lg:py-24">
        <Reveal className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            Find it later
          </p>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-foreground lg:text-4xl">
            When later arrives, it&apos;s already filed.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
            Pull one student&apos;s whole story by tag, follow-up, or date. The
            moment you validated in September is still exactly where ClassTrace
            filed it — no binder to maintain, no system to remember.
          </p>
        </Reveal>

        <Reveal from="translate-y-12 scale-[0.98]">
          <p
            aria-hidden="true"
            className="font-hand mx-auto mt-10 max-w-3xl -rotate-1 px-8 text-left text-xl text-primary md:px-10"
          >
            the meeting you haven&apos;t scheduled yet? already prepped.
          </p>
          <LandingEvidenceFolder />
        </Reveal>

        <ul className="mx-auto mt-14 grid max-w-4xl gap-x-10 gap-y-8 sm:grid-cols-3">
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

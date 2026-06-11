import Link from "next/link";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/routes";

export function LandingClosingCta() {
  return (
    <section className="relative overflow-hidden border-t border-border/70">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-45 ruled-lines"
      />
      <div
        aria-hidden="true"
        className="absolute right-5 top-1/2 z-10 hidden -translate-y-1/2 flex-col gap-2 md:flex"
      >
        {Array.from({ length: 8 }).map((_, index) => (
          <span
            key={index}
            className="size-4 rounded-full border border-border/90 bg-card shadow-[inset_0_2px_4px_rgba(31,25,17,0.18)]"
          />
        ))}
      </div>
      <div className="relative mx-auto grid max-w-5xl grid-cols-1 items-center gap-6 px-4 py-10 md:grid-cols-[170px_1fr_100px] md:px-6 lg:grid-cols-[200px_1fr_120px] lg:px-8 lg:py-12">
        <p
          aria-hidden="true"
          className="font-hand hidden -rotate-6 text-[1.65rem] leading-tight text-link md:block"
        >
          that moment from third period today?
          <span className="block pl-20 pt-1 text-5xl leading-none">→</span>
        </p>
        <div className="mx-auto max-w-xl text-center md:mx-0 md:text-left">
          <h2 className="font-display text-4xl font-semibold leading-[1.05] tracking-tight text-foreground lg:text-[2.75rem]">
            You&apos;re going to{" "}
            <span className="hand-underline-rust">need it later</span>.
          </h2>
          <p className="mt-4 max-w-md text-base leading-relaxed text-foreground">
            Start with one student. Capture one moment. Let the evidence build
            into something you can actually bring to the table.
          </p>
          <div className="mt-5 flex justify-center">
            <Button
              asChild
              className="h-11 min-w-56 rounded-md px-7 text-[15px] font-semibold"
            >
              <Link href={routes.signUp}>Capture your first note</Link>
            </Button>
          </div>
        </div>
        <p
          aria-hidden="true"
          className="font-hand hidden -rotate-6 text-center text-7xl leading-none text-primary lg:block"
        >
          ☆
        </p>
      </div>
    </section>
  );
}

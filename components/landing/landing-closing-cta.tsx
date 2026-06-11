import Link from "next/link";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/routes";

export function LandingClosingCta() {
  return (
    <section className="relative overflow-hidden border-t border-border/70">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-50 ruled-lines"
      />
      <div className="relative mx-auto max-w-3xl px-4 py-20 text-center md:px-6 lg:py-28">
        <p className="font-hand text-2xl text-primary">
          that moment from third period today?
        </p>
        <h2 className="font-display mt-3 text-4xl font-semibold tracking-tight text-foreground lg:text-5xl">
          You&apos;re going to need it later.
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-muted-foreground">
          Start with one student. Capture one moment. Let the evidence build
          into something you can actually bring to the table.
        </p>
        <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Button
            asChild
            className="h-11 rounded-md px-7 text-[15px] font-semibold"
          >
            <Link href={routes.signUp}>Capture your first note</Link>
          </Button>
          <Link
            href={routes.signIn}
            className="text-sm font-medium text-link underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
        </div>
      </div>
    </section>
  );
}

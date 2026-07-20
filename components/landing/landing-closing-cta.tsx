import Link from "next/link";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/routes";

export function LandingClosingCta() {
  return (
    <section className="relative overflow-x-clip border-t border-border/70 bg-card/40">
      <div className="mx-auto max-w-3xl px-4 py-20 text-center md:px-6 lg:py-28">
        <p
          aria-hidden="true"
          className="font-hand mx-auto -rotate-2 text-2xl leading-tight text-link"
        >
          that moment from third period today?
        </p>
        <h2 className="mt-4 font-display text-4xl font-semibold leading-[1.08] tracking-tight text-foreground sm:text-5xl">
          You&apos;re going to{" "}
          <span className="hand-underline-rust">need it later</span>.
        </h2>
        <p className="mx-auto mt-6 max-w-md text-base leading-relaxed text-muted-foreground">
          If you received a beta invitation, complete sign-up and start with
          one student. Capture one moment. Build the record before you need it,
          so the next conversation does not start from memory.
        </p>
        <div className="mt-9 flex justify-center">
          <Button
            asChild
            className="h-12 min-w-60 rounded-md px-8 text-[15px] font-semibold"
          >
            <Link href={routes.signUp}>Complete invited sign-up</Link>
          </Button>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          Already tracing?{" "}
          <Link
            href={routes.signIn}
            className="font-medium text-link underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </section>
  );
}

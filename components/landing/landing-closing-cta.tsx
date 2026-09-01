import Link from "next/link";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/routes";

export function LandingClosingCta() {
  return (
    <section className="border-b border-navy-foreground/10 bg-navy px-4 py-10 text-navy-foreground md:px-6 lg:px-8 lg:py-12">
      <div className="mx-auto flex max-w-[1180px] flex-col items-start justify-between gap-7 sm:flex-row sm:items-center">
        <div className="min-w-0 max-w-xl">
          <h2 className="text-2xl font-bold tracking-[-0.025em] text-balance sm:text-3xl">
            Ready to stop reconstructing from memory?
          </h2>
          <p className="mt-2 text-sm leading-6 text-pretty text-ground-muted">
            Invited teachers can set up a roster and capture the first record in minutes.
          </p>
          <p className="mt-3 text-sm leading-6 text-pretty text-ground-muted">
            Invitation-only. You review the draft before anything is saved. One
            teacher-owned workspace.
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Button asChild className="h-11 bg-mint px-5 text-xs text-mint-ink hover:bg-[var(--mint-hover)] focus-visible:border-mint focus-visible:ring-mint focus-visible:ring-offset-navy">
            <Link href={routes.signUp} prefetch={false}>Invited sign-up</Link>
          </Button>
          <Button asChild variant="ghost" className="h-11 px-4 text-xs text-navy-foreground hover:bg-navy-foreground/10 hover:text-navy-foreground focus-visible:border-mint focus-visible:ring-mint focus-visible:ring-offset-navy">
            <Link href={routes.signIn} prefetch={false}>Sign in</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

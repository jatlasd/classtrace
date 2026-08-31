import Link from "next/link";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/routes";

export function LandingClosingCta() {
  return (
    <section className="bg-card px-4 pb-8 pt-3 md:px-6 lg:px-8">
      <div className="mx-auto flex max-w-[880px] flex-col items-center justify-between gap-5 rounded-card bg-navy px-6 py-6 text-center text-navy-foreground sm:flex-row sm:text-left lg:px-10">
        <div>
          <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
            Ready to stop reconstructing from memory?
          </h2>
          <p className="mt-1 text-sm text-navy-foreground/75">
            Invited teachers can set up a roster and capture the first record in minutes.
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap justify-center gap-2">
          <Button asChild variant="outline" className="h-10 border-card bg-card px-5 text-xs text-foreground">
            <Link href={routes.signUp} prefetch={false}>Invited sign-up</Link>
          </Button>
          <Button asChild variant="ghost" className="h-10 px-4 text-xs text-navy-foreground hover:bg-sidebar-accent hover:text-navy-foreground">
            <Link href={routes.signIn} prefetch={false}>Sign in</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

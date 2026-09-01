import Link from "next/link";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/routes";

export function LandingClosingCta() {
  return (
    <section className="border-b border-primary-foreground/10 bg-primary px-4 py-10 text-primary-foreground md:px-6 lg:px-8 lg:py-12">
      <div className="mx-auto flex max-w-[1180px] flex-col items-start justify-between gap-7 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-[-0.025em] sm:text-3xl">
            Ready to stop reconstructing from memory?
          </h2>
          <p className="mt-2 text-sm text-primary-foreground/80">
            Invited teachers can set up a roster and capture the first record in minutes.
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Button asChild variant="outline" className="h-11 border-primary-foreground bg-primary-foreground px-5 text-xs text-primary hover:bg-primary-foreground/90 hover:text-primary">
            <Link href={routes.signUp} prefetch={false}>Invited sign-up</Link>
          </Button>
          <Button asChild variant="ghost" className="h-11 px-4 text-xs text-primary-foreground hover:bg-primary-foreground/12 hover:text-primary-foreground">
            <Link href={routes.signIn} prefetch={false}>Sign in</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

import Link from "next/link";
import { LandingHeader } from "@/components/landing/landing-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/routes";

export default function PublicNotFound() {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <a
        href="#main-content"
        className="fixed left-4 top-3 z-[70] -translate-y-20 rounded-md bg-foreground px-3 py-2 text-sm font-semibold text-background transition-transform focus:translate-y-0"
      >
        Skip to main content
      </a>
      <LandingHeader />
      <main
        id="main-content"
        tabIndex={-1}
        className="mx-auto flex w-full max-w-[760px] flex-1 items-center px-4 py-10 outline-none sm:px-6 lg:px-8"
      >
        <section className="w-full rounded-card border border-border bg-card p-6 shadow-paper sm:p-7">
          <p className="text-xs font-semibold text-muted-foreground">
            Page not found
          </p>
          <h1 className="mt-2 font-display text-2xl font-semibold text-foreground">
            This ClassTrace page is not available
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Return to the ClassTrace home page or visit support for help finding
            what you need.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Button asChild>
              <Link href={routes.root}>ClassTrace home</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={routes.support}>Support</Link>
            </Button>
          </div>
        </section>
      </main>
      <SiteFooter showAccessLinks />
    </div>
  );
}

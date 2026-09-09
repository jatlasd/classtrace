import Link from "next/link";
import { LandingHeader } from "@/components/landing/landing-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/routes";

export default function PublicNotFound() {
  return (
    <div className="flex min-h-dvh flex-col bg-well">
      <a
        href="#main-content"
        className="fixed left-4 top-3 z-[70] -translate-y-20 rounded-sm bg-fg px-3 py-2 text-sm font-semibold text-on-ink transition-transform focus:translate-y-0"
      >
        Skip to main content
      </a>
      <LandingHeader />
      <main
        id="main-content"
        tabIndex={-1}
        className="mx-auto flex w-full max-w-[760px] flex-1 items-center px-4 py-10 outline-none sm:px-6 lg:px-8"
      >
        <section className="plate w-full p-6 sm:p-8">
          <p className="label text-fg-3">
            Page not found
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold leading-none tracking-[-0.01em] text-fg">
            This ClassTrace page is not available
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-fg-2">
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

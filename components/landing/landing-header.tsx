import Link from "next/link";
import { BrandLockup } from "@/components/layout/brand-lockup";
import { routes } from "@/lib/routes";

const sectionLinkClassName =
  "inline-flex h-11 items-center rounded-sm transition-colors hover:text-night-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-live-bright focus-visible:ring-offset-2 focus-visible:ring-offset-night md:h-auto";

export function LandingHeader() {
  return (
    <header className="z-40 border-b border-white/10 bg-night/95 backdrop-blur-md md:sticky md:top-0">
      <div className="mx-auto flex max-w-[1280px] flex-wrap items-center justify-between px-4 md:h-16 md:flex-nowrap md:px-6 lg:px-8">
        <Link
          href={routes.root}
          className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-live-bright focus-visible:ring-offset-4 focus-visible:ring-offset-night"
        >
          <BrandLockup size="sm" tone="inverse" />
        </Link>
        <nav
          aria-label="Landing"
          className="order-last flex w-full items-center gap-6 border-t border-white/10 text-sm font-medium text-night-fg-2 md:order-none md:w-auto md:gap-7 md:border-0"
        >
          <a href={`${routes.root}#how`} className={sectionLinkClassName}>How it works</a>
          <a href={`${routes.root}#later`} className={sectionLinkClassName}>Explore</a>
          <a href={`${routes.root}#boundaries`} className={sectionLinkClassName}>Boundaries</a>
        </nav>
        <div className="flex h-16 items-center gap-1 sm:gap-2">
          <Link
            href={routes.signIn}
            prefetch={false}
            className="inline-flex h-10 items-center rounded-full px-4 text-sm font-medium text-night-fg-2 transition-colors hover:text-night-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-live-bright focus-visible:ring-offset-2 focus-visible:ring-offset-night"
          >
            Sign in
          </Link>
          <Link
            href={routes.signUp}
            prefetch={false}
            className="inline-flex h-10 items-center rounded-full bg-live-bright px-4 text-sm font-semibold text-live-fg transition-colors hover:bg-[#ffc24d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-live-bright focus-visible:ring-offset-2 focus-visible:ring-offset-night"
          >
            Invited sign-up
          </Link>
        </div>
      </div>
    </header>
  );
}

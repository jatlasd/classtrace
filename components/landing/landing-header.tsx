import Link from "next/link";
import { BrandLockup } from "@/components/layout/brand-lockup";
import { routes } from "@/lib/routes";

export function LandingHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-night/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-4 md:px-6 lg:px-8">
        <Link
          href={routes.root}
          className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-live-bright focus-visible:ring-offset-4 focus-visible:ring-offset-night"
        >
          <BrandLockup size="sm" tone="inverse" />
        </Link>
        <nav aria-label="Landing" className="hidden items-center gap-7 text-sm font-medium text-night-fg-2 md:flex">
          <a href="#how" className="transition-colors hover:text-night-fg">How it works</a>
          <a href="#later" className="transition-colors hover:text-night-fg">Explore</a>
          <a href="#boundaries" className="transition-colors hover:text-night-fg">Boundaries</a>
        </nav>
        <div className="flex items-center gap-1 sm:gap-2">
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

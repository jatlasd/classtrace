import Link from "next/link";
import { BrandLockup } from "@/components/layout/brand-lockup";
import { routes } from "@/lib/routes";

export function LandingHeader() {
  return (
    <header className="sticky top-0 z-40 bg-base/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1240px] items-center justify-between px-4 md:px-6 lg:px-8">
        <Link
          href={routes.root}
          className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-live-bright focus-visible:ring-offset-4 focus-visible:ring-offset-base"
        >
          <BrandLockup size="sm" />
        </Link>
        <div className="flex items-center gap-1 sm:gap-2">
          <Link
            href={routes.signIn}
            prefetch={false}
            className="inline-flex h-10 items-center rounded-full px-4 text-sm font-medium text-fg-2 transition-colors hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-live-bright focus-visible:ring-offset-2 focus-visible:ring-offset-base"
          >
            Sign in
          </Link>
          <Link
            href={routes.signUp}
            prefetch={false}
            className="inline-flex h-10 items-center rounded-full bg-fg px-4 text-sm font-semibold text-base transition-colors hover:bg-[#3d3157] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-live-bright focus-visible:ring-offset-2 focus-visible:ring-offset-base"
          >
            Invited sign-up
          </Link>
        </div>
      </div>
    </header>
  );
}

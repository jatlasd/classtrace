import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { routes } from "@/lib/routes";

export function LandingInvitation() {
  return (
    <section aria-label="Get started" className="bg-live-bright text-live-fg">
      <div className="mx-auto max-w-[1280px] px-4 py-16 md:px-6 lg:px-8 lg:py-20">
        <p className="max-w-[18ch] font-display-wide text-[clamp(2.25rem,5vw,4.5rem)] font-semibold leading-[0.95]">
          Start with the next thing you notice.
        </p>
        <div className="mt-8 flex flex-col gap-5 border-t border-live-fg/20 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-semibold text-live-fg/75">
            Invitation-only · not a system of record · beta
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href={routes.signUp}
              prefetch={false}
              className="inline-flex h-12 items-center gap-2 rounded-full bg-night px-6 text-[15px] font-semibold text-night-fg transition-colors hover:bg-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-night focus-visible:ring-offset-2 focus-visible:ring-offset-live-bright"
            >
              Invited sign-up <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
            <Link
              href={routes.signIn}
              prefetch={false}
              className="inline-flex h-12 items-center rounded-full border border-live-fg/30 px-6 text-[15px] font-medium text-live-fg transition-colors hover:bg-live-fg/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-night focus-visible:ring-offset-2 focus-visible:ring-offset-live-bright"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

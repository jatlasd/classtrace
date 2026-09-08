import Link from "next/link";
import { routes } from "@/lib/routes";

export function LandingInvitation() {
  return (
    <section className="border-t border-line">
      <div className="mx-auto flex max-w-[1240px] flex-col gap-10 px-4 py-20 md:px-6 lg:flex-row lg:items-end lg:justify-between lg:px-8 lg:py-28">
        <p className="max-w-[18ch] font-display-wide text-[clamp(2.5rem,7vw,6rem)] font-semibold leading-[0.92] text-fg">
          Start with the next thing you notice.
        </p>
        <div className="flex flex-col items-start gap-4 lg:items-end">
          <div className="flex flex-wrap gap-3">
            <Link
              href={routes.signUp}
              prefetch={false}
              className="inline-flex h-12 items-center rounded-full bg-live-bright px-6 text-[15px] font-semibold text-live-fg transition-colors hover:bg-[#ffc24d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-live-bright focus-visible:ring-offset-2 focus-visible:ring-offset-base"
            >
              Invited sign-up
            </Link>
            <Link
              href={routes.signIn}
              prefetch={false}
              className="inline-flex h-12 items-center rounded-full border border-line-2 px-6 text-[15px] font-medium text-fg transition-colors hover:bg-plate focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-live-bright focus-visible:ring-offset-2 focus-visible:ring-offset-base"
            >
              Sign in
            </Link>
          </div>
          <p className="label text-fg-3">Invitation-only · not a system of record · beta</p>
        </div>
      </div>
    </section>
  );
}

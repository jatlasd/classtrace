import Link from "next/link";
import { ArrowDown } from "lucide-react";
import { BrowserScreen, PhoneScreen, screenshots } from "@/components/landing/landing-screens";
import { routes } from "@/lib/routes";

export function LandingOpening() {
  return (
    <section className="night-field relative text-night-fg">
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-20 bg-base sm:h-32 lg:h-44" />
      <div className="relative mx-auto max-w-[1280px] px-4 pt-12 md:px-6 lg:px-8 lg:pt-16">
        <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-[13px] font-semibold text-night-fg-2">
          <span aria-hidden="true" className="size-1.5 rounded-full bg-live-bright" />
          Invitation-only beta · for individual teachers
        </p>
        <h1 className="mt-6 max-w-[14ch] font-display-wide text-[clamp(2.5rem,6.5vw,6rem)] font-semibold leading-[0.9] text-night-fg">
          Write one sentence about{" "}
          <span className="text-live-bright">one student.</span>
        </h1>

        <div className="mt-8 flex flex-col gap-6 lg:mt-8 lg:flex-row lg:items-end lg:justify-between">
          <p className="max-w-lg text-[17px] leading-[1.6] text-night-fg-2">
            Jot what you noticed mid-lesson. ClassTrace turns it into a draft
            for that student — nothing is saved until you review it. When the
            meeting comes, the evidence is already there, in order.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href={routes.signUp}
              prefetch={false}
              className="inline-flex h-12 items-center rounded-full bg-live-bright px-6 text-[15px] font-semibold text-live-fg transition-colors hover:bg-[#ffc24d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-live-bright focus-visible:ring-offset-2 focus-visible:ring-offset-night"
            >
              Invited sign-up
            </Link>
            <Link
              href="#how"
              className="inline-flex h-12 items-center gap-2 rounded-full border border-white/20 px-5 text-[15px] font-medium text-night-fg transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-live-bright focus-visible:ring-offset-2 focus-visible:ring-offset-night"
            >
              How it works <ArrowDown aria-hidden="true" className="size-4" />
            </Link>
          </div>
        </div>

        <div className="relative mt-12 pb-10 lg:mt-14 lg:pb-12">
          <BrowserScreen
            src={screenshots.studentTrace}
            title="Jeremy"
            alt="A student page in ClassTrace: Jeremy's 17 saved observations, follow-ups, most-used tags, and a date-ordered trace with a photo of his work."
            sizes="(min-width: 1024px) 960px, 88vw"
            preload
            className="relative z-10 mr-[12%] lg:mx-auto lg:max-w-[960px]"
          />
          <PhoneScreen
            src={screenshots.mobileCapture}
            alt="Capturing on a phone: a one-sentence note about Stacy tagged #math, ready to capture."
            sizes="(min-width: 1024px) 220px, 40vw"
            className="absolute bottom-0 right-0 z-20 w-[40%] max-w-[240px] sm:w-[28%] lg:right-6 lg:w-[220px]"
          />
        </div>
      </div>
    </section>
  );
}

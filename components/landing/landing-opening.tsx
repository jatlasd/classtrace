import Link from "next/link";
import { ArrowUp } from "lucide-react";
import { routes } from "@/lib/routes";

export function LandingOpening() {
  return (
    <section className="grain relative overflow-hidden">
      <div className="mx-auto max-w-[1240px] px-4 pb-12 pt-10 md:px-6 lg:px-8 lg:pb-20 lg:pt-16">
        <div>
          <p className="label flex items-center gap-2 text-live">
            <span aria-hidden="true" className="size-1.5 rounded-full bg-live-bright" />
            Now · 10 seconds, mid-lesson
          </p>
          <h1 className="mt-6 max-w-[16ch] font-display-wide text-[clamp(2.75rem,9vw,7.5rem)] font-semibold leading-[0.9] text-fg">
            Write one sentence about one student.
          </h1>
        </div>

        <div className="mt-12 grid gap-8 lg:mt-16 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:items-end lg:gap-16">
          <div
            aria-hidden="true"
            className="plate glow-live px-5 pb-4 pt-5 sm:px-7 sm:pt-6"
          >
            <div className="flex items-center justify-between">
              <span className="label flex items-center gap-2 text-live">
                <span className="size-1.5 rounded-full bg-live-bright" />
                What happened?
              </span>
              <span className="label text-fg-3">@student · #tag</span>
            </div>
            <p className="mt-4 font-display text-[clamp(1.35rem,2.6vw,1.9rem)] font-medium leading-[1.3] text-fg">
              <span className="font-mono text-[0.9em] text-live">@jeremy</span>{" "}
              self-corrected his fraction model without a prompt{" "}
              <span className="font-mono text-[0.9em] text-fg-2">#independent</span>
              <span className="caret-blink ml-0.5 inline-block h-[1em] w-[2px] translate-y-[0.15em] bg-live-bright" />
            </p>
            <div className="mt-6 flex items-center justify-between gap-4 border-t border-line pt-4">
              <span className="text-[13px] text-fg-2">Ready to capture for Jeremy.</span>
              <span className="inline-flex h-11 items-center gap-2 rounded-full bg-live-bright px-5 text-sm font-semibold text-live-fg">
                Capture <ArrowUp className="size-4" strokeWidth={2.5} />
              </span>
            </div>
          </div>

          <div className="max-w-md">
            <p className="text-[17px] leading-[1.6] text-fg-2">
              That is the whole capture. It becomes a draft — nothing is saved
              until you review it. Later, when the meeting comes, you ask your
              evidence a question instead of reconstructing the semester from
              memory.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link
                href={routes.signUp}
                prefetch={false}
                className="inline-flex h-12 items-center rounded-full bg-fg px-6 text-[15px] font-semibold text-base transition-colors hover:bg-[#3d3157] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-live-bright focus-visible:ring-offset-2 focus-visible:ring-offset-base"
              >
                Invited sign-up
              </Link>
              <Link
                href="#later"
                className="inline-flex h-12 items-center rounded-full px-4 text-[15px] font-medium text-fg-2 underline decoration-line-2 underline-offset-4 transition-colors hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-live-bright focus-visible:ring-offset-2 focus-visible:ring-offset-base"
              >
                How it works
              </Link>
            </div>
            <p className="label mt-6 text-fg-3">
              Invitation-only beta · individual teachers · no generative AI
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

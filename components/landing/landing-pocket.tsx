import { PhoneScreen, screenshots } from "@/components/landing/landing-screens";

export function LandingPocket() {
  return (
    <section aria-labelledby="pocket-heading" className="overflow-hidden bg-live-soft">
      <div className="mx-auto grid max-w-[1280px] items-center gap-10 px-4 py-16 md:px-6 lg:grid-cols-2 lg:gap-14 lg:px-8 lg:py-20">
        <div>
          <p className="label text-live">In the hallway, at the door, on duty</p>
          <h2
            id="pocket-heading"
            className="mt-4 max-w-[14ch] font-display-wide text-[clamp(2.25rem,4.5vw,4rem)] font-semibold leading-[0.95] text-fg"
          >
            Built for the moment, not the desk.
          </h2>
          <p className="mt-5 max-w-md text-[16px] leading-relaxed text-fg-2">
            ClassTrace runs in your phone’s browser. Capture between periods,
            approve drafts when the room is quiet, and pull up a student’s
            whole trace before you walk into the meeting.
          </p>
        </div>
        <div className="relative mx-auto flex w-full max-w-[440px] justify-center gap-5 sm:gap-6">
          <PhoneScreen
            src={screenshots.mobileTrace}
            alt="Jeremy's student page on a phone, with his saved observations, follow-ups, and most-used tags."
            sizes="(min-width: 1024px) 200px, 44vw"
            className="w-[46%] max-w-[200px] -rotate-2 lg:translate-y-5"
          />
          <PhoneScreen
            src={screenshots.mobileReview}
            alt="A draft for Jeremy waiting for approval on a phone."
            sizes="(min-width: 1024px) 200px, 44vw"
            className="w-[46%] max-w-[200px] rotate-2 lg:-translate-y-5"
          />
        </div>
      </div>
    </section>
  );
}

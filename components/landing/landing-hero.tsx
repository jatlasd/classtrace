import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  CoffeeRing,
  IndexCard,
  StickyScrap,
} from "@/components/landing/landing-ephemera";
import { RawNoteArt } from "@/components/landing/story-artifacts";
import { ParallaxDrift } from "@/components/landing/scroll-motion";
import { routes } from "@/lib/routes";

export function LandingHero() {
  return (
    <section className="relative overflow-x-clip">
      <div aria-hidden="true" className="absolute inset-0 hidden lg:block">
        <ParallaxDrift
          depth={-52}
          className="absolute left-[4%] top-24 xl:left-[8%]"
        >
          <IndexCard className="relative -rotate-6" />
        </ParallaxDrift>
        <ParallaxDrift
          depth={-34}
          className="absolute right-[4%] top-36 xl:right-[8%]"
        >
          <StickyScrap className="relative rotate-3" color="bg-audience-blue">
            IEP meeting moved to Thursday
          </StickyScrap>
        </ParallaxDrift>
        <ParallaxDrift
          depth={-70}
          className="absolute right-[10%] top-[26rem] xl:right-[14%]"
        >
          <StickyScrap className="relative -rotate-2" color="bg-audience-rose">
            &ldquo;can you show growth over time?&rdquo;
          </StickyScrap>
        </ParallaxDrift>
        <CoffeeRing
          className="absolute left-[13%] top-[24rem] size-24 -rotate-12"
          variant="full"
        />
        <CoffeeRing
          className="absolute right-[22%] top-16 size-14 rotate-6"
          variant="arc"
        />
      </div>

      <div className="relative mx-auto max-w-4xl px-4 pb-10 pt-16 text-center md:px-6 lg:pt-24">
        <p className="animate-in fade-in slide-in-from-bottom-2 duration-500 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          Student evidence capture for teachers
        </p>
        <h1 className="mx-auto mt-5 max-w-3xl animate-in fade-in slide-in-from-bottom-3 font-display text-[2.6rem] font-semibold leading-[1.08] tracking-tight text-foreground duration-700 sm:text-6xl lg:text-[4.25rem]">
          The note you lose today is the evidence you&apos;ll need in March.
        </h1>
        <p className="mx-auto mt-6 max-w-xl animate-in fade-in slide-in-from-bottom-3 text-base leading-relaxed text-muted-foreground duration-700 [animation-delay:120ms] [animation-fill-mode:backwards]">
          ClassTrace turns the moment you almost forgot into a validated,
          student-specific evidence record — captured in seconds, reviewed by
          you, and filed where you can find it again.
        </p>
        <div className="mt-9 flex animate-in fade-in slide-in-from-bottom-3 flex-wrap items-center justify-center gap-4 duration-700 [animation-delay:220ms] [animation-fill-mode:backwards]">
          <Button
            asChild
            className="h-12 rounded-md px-8 text-[15px] font-semibold"
          >
            <Link href={routes.signUp}>Start an evidence trail</Link>
          </Button>
          <Link
            href={routes.signIn}
            className="rounded-md px-2 py-2 text-sm font-medium text-link underline-offset-4 transition-colors hover:text-foreground hover:underline"
          >
            Sign in
          </Link>
        </div>
      </div>

      <div className="relative mx-auto max-w-2xl px-6 pb-6 md:px-0">
        <p
          aria-hidden="true"
          className="font-hand mb-3 -rotate-2 pl-2 text-left text-xl leading-tight text-link sm:pl-0"
        >
          it starts as forty seconds between classes…
        </p>
        <ParallaxDrift depth={-30}>
          <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 [animation-delay:320ms] [animation-fill-mode:backwards]">
            <RawNoteArt />
          </div>
        </ParallaxDrift>
        <div className="mt-8 flex flex-col items-center gap-1 pb-2 text-center">
          <p aria-hidden="true" className="font-hand text-xl text-primary">
            watch this note become evidence
          </p>
          <Link
            href="#how-it-works"
            className="group mt-1 inline-flex flex-col items-center gap-1 rounded-md px-3 py-1.5 text-sm font-medium text-link transition-colors hover:text-foreground"
          >
            <span className="border-b border-current pb-0.5">
              Follow the note
            </span>
            <span
              aria-hidden="true"
              className="font-hand text-2xl leading-none transition-transform group-hover:translate-y-0.5"
            >
              ↓
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}

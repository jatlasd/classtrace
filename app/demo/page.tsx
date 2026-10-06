import type { Metadata } from "next";
import { OverviewPlayer } from "@/components/demo/overview-player";
import { LandingHeader } from "@/components/landing/landing-header";
import { SiteFooter } from "@/components/layout/site-footer";

const description =
  "An 80-second overview of ClassTrace: write one sentence about one student, approve the record, and find the evidence when the meeting comes.";

export const metadata: Metadata = {
  title: "ClassTrace overview",
  description,
  openGraph: {
    title: "ClassTrace overview",
    description,
    images: [{ url: "/demo/overview-title.jpg", width: 1920, height: 1080 }],
  },
};

const transcript = [
  "ClassTrace. Write one sentence about one student. Review it when you have a minute. Ask your evidence questions later.",
  "Start with the next thing you notice. Mention the student and say what happened in your own words. Add a tag or two if you like. Then press Capture.",
  "From that one sentence, ClassTrace suggests the student, the topic, and how it went. All from plain, predictable rules. Your words become the Evidence note, and the details become how it’s filed, and it lands as a draft.",
  "Look it over and fix anything that’s off. Nothing saves until you say so. Only then does it become permanent.",
  "One sentence at a time, the evidence adds up. For every student, week after week.",
  "When a question comes up, ask it. “Show me evidence for Jeremy tagged math.” It answers with the exact records that match. And there’s today’s note, right at the top.",
  "The lines we hold. You approve every record. One teacher, one workspace. No generative AI.",
  "Write one sentence. Keep the whole story.",
];

export default function DemoPage() {
  return (
    <div className="relative flex min-h-dvh flex-col bg-base">
      <a
        href="#main-content"
        className="fixed left-4 top-3 z-[70] -translate-y-20 rounded-full bg-live-bright px-4 py-2 text-sm font-semibold text-live-fg transition-transform focus:translate-y-0"
      >
        Skip to main content
      </a>
      <LandingHeader />
      <main id="main-content" tabIndex={-1} className="night-field flex-1 text-night-fg outline-none">
        <div className="mx-auto max-w-[1280px] px-4 pb-16 pt-10 md:px-6 lg:px-8 lg:pb-24 lg:pt-12">
          <div className="mx-auto w-[min(100%,70rem,calc((100svh_-_20rem)*16/9))]">
            <header className="text-center">
              <h1 className="text-balance font-display-wide text-[clamp(2.5rem,5.5vw,4.75rem)] font-semibold leading-[0.95] text-night-fg">
                Meet ClassTrace.
              </h1>
              <p className="mx-auto mt-4 max-w-[56ch] text-balance text-[16px] leading-[1.6] text-night-fg-2 sm:text-[17px]">
                An 80-second look at how one quick note becomes evidence you’ve
                approved, organized by student and ready when you need it.
              </p>
            </header>

            <div className="mt-8 lg:mt-10">
              <OverviewPlayer />
            </div>

            <details className="mt-12 border-t border-white/10 pt-6">
              <summary className="inline-flex min-h-11 cursor-pointer items-center rounded-sm text-[15px] font-semibold text-night-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-live-bright focus-visible:ring-offset-2 focus-visible:ring-offset-night">
                Read the transcript
              </summary>
              <div className="mt-4 max-w-[65ch] space-y-3 text-[15px] leading-relaxed text-night-fg-2">
                {transcript.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
            </details>
          </div>
        </div>
      </main>
      <SiteFooter showAccessLinks />
    </div>
  );
}

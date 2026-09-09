import type { Metadata } from "next";
import { LandingBoundaries } from "@/components/landing/landing-boundaries";
import { LandingHeader } from "@/components/landing/landing-header";
import { LandingInvitation } from "@/components/landing/landing-invitation";
import { LandingOpening } from "@/components/landing/landing-opening";
import { LandingQuestion } from "@/components/landing/landing-question";
import { LandingTrace } from "@/components/landing/landing-trace";
import { SiteFooter } from "@/components/layout/site-footer";

export const metadata: Metadata = {
  title: "ClassTrace — Write one sentence about one student",
  description:
    "Invitation-only beta. Capture a student observation in one sentence, review it before it saves, and ask your evidence questions later.",
};

export default function Home() {
  return (
    <div className="public-landing relative flex min-h-dvh flex-col bg-base">
      <a
        href="#main-content"
        className="fixed left-4 top-3 z-[70] -translate-y-20 rounded-full bg-live-bright px-4 py-2 text-sm font-semibold text-live-fg transition-transform focus:translate-y-0"
      >
        Skip to main content
      </a>
      <LandingHeader />
      <main id="main-content" tabIndex={-1} className="flex-1 outline-none">
        <LandingOpening />
        <LandingQuestion />
        <LandingTrace />
        <LandingBoundaries />
        <LandingInvitation />
      </main>
      <SiteFooter showAccessLinks />
    </div>
  );
}

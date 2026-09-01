import type { Metadata } from "next";
import { LandingHeader } from "@/components/landing/landing-header";
import { LandingHero } from "@/components/landing/landing-hero";
import { LandingBenefits } from "@/components/landing/landing-benefits";
import { LandingFeatures } from "@/components/landing/landing-features";
import { LandingHowItWorks } from "@/components/landing/landing-how-it-works";
import { LandingResponsive } from "@/components/landing/landing-responsive";
import { LandingClosingCta } from "@/components/landing/landing-closing-cta";
import { SiteFooter } from "@/components/layout/site-footer";

export const metadata: Metadata = {
  title: "ClassTrace — Student evidence capture for teachers",
  description:
    "Invitation-only beta for turning quick teacher notes into organized, teacher-validated student evidence.",
};

export default function Home() {
  return (
    <div className="public-landing relative flex min-h-dvh flex-col bg-background">
      <a
        href="#main-content"
        className="fixed left-4 top-3 z-[70] -translate-y-20 rounded-md bg-foreground px-3 py-2 text-sm font-semibold text-background transition-transform focus:translate-y-0"
      >
        Skip to main content
      </a>
      <LandingHeader />
      <main id="main-content" tabIndex={-1} className="flex-1 outline-none">
        <LandingHero />
        <LandingHowItWorks />
        <LandingBenefits />
        <LandingFeatures />
        <LandingResponsive />
        <LandingClosingCta />
      </main>
      <SiteFooter showAccessLinks tone="inverse" />
    </div>
  );
}

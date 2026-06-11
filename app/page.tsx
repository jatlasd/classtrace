import type { Metadata } from "next";
import { LandingHeader } from "@/components/landing/landing-header";
import { LandingHero } from "@/components/landing/landing-hero";
import { LandingAudience } from "@/components/landing/landing-audience";
import { LandingHowItWorks } from "@/components/landing/landing-how-it-works";
import { LandingNotDashboard } from "@/components/landing/landing-not-dashboard";
import { LandingClosingCta } from "@/components/landing/landing-closing-cta";
import { LandingFooter } from "@/components/landing/landing-footer";

export const metadata: Metadata = {
  title: "ClassTrace — Student evidence capture for teachers",
  description:
    "Turn quick teacher notes into organized, validated student evidence. Capture the moment now, review the structured draft, and build each student's timeline.",
};

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <LandingHeader />
      <main className="flex-1">
        <LandingHero />
        <LandingAudience />
        <LandingHowItWorks />
        <LandingNotDashboard />
        <LandingClosingCta />
      </main>
      <LandingFooter />
    </div>
  );
}

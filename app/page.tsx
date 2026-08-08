import type { Metadata } from "next";
import { LandingHeader } from "@/components/landing/landing-header";
import { LandingHero } from "@/components/landing/landing-hero";
import { EvidenceStory } from "@/components/landing/evidence-story";
import { LandingFilingCabinet } from "@/components/landing/landing-filing-cabinet";
import { LandingRetrieval } from "@/components/landing/landing-retrieval";
import { LandingTrust } from "@/components/landing/landing-trust";
import { LandingAudience } from "@/components/landing/landing-audience";
import { LandingClosingCta } from "@/components/landing/landing-closing-cta";
import { SiteFooter } from "@/components/layout/site-footer";

export const metadata: Metadata = {
  title: "ClassTrace — Student evidence capture for teachers",
  description:
    "Invitation-only beta for teachers: catch the moment in one quick note, sign off, and ClassTrace files it as organized, findable student evidence.",
};

export default function Home() {
  return (
    <div className="paperbackground relative flex min-h-dvh flex-col">
      <LandingHeader />
      <main className="flex-1">
        <LandingHero />
        <EvidenceStory />
        <LandingFilingCabinet />
        <LandingRetrieval />
        <LandingTrust />
        <LandingAudience />
        <LandingClosingCta />
      </main>
      <SiteFooter showAccessLinks />
    </div>
  );
}

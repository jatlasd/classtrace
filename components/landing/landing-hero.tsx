import Link from "next/link";
import { ArrowRight, CheckCircle2, PlayCircle } from "lucide-react";
import { LandingProductPreview } from "@/components/landing/landing-product-preview";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/routes";

export function LandingHero() {
  return (
    <section className="border-b border-border/70 bg-card">
      <div className="mx-auto grid max-w-[1360px] items-center gap-10 px-4 py-12 md:px-6 lg:grid-cols-[0.78fr_1.22fr] lg:gap-10 lg:px-8 lg:py-16 xl:grid-cols-[0.72fr_1.28fr]">
        <div className="max-w-xl">
          <p className="inline-flex rounded-full bg-accent px-3 py-1 text-[11px] font-semibold text-link">
            For teachers, by a teacher
          </p>
          <h1 className="mt-5 text-[2.65rem] font-bold leading-[1.04] tracking-[-0.045em] text-foreground sm:text-5xl lg:text-[3.25rem]">
            Capture student evidence without the{" "}
            <span className="text-link">mental filing cabinet.</span>
          </h1>
          <p className="mt-5 max-w-lg text-[15px] leading-7 text-muted-foreground">
            Record the classroom moment while it is fresh, review what will be
            saved, and find trustworthy evidence by student when you need it.
          </p>
          <p className="mt-3 max-w-lg text-sm font-medium leading-6 text-foreground">
            ClassTrace is currently an invitation-only beta for individual
            teachers.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button
              asChild
              variant="navy"
              className="h-11 px-6 text-sm"
            >
              <Link href={routes.signUp} prefetch={false}>
                Complete invited sign-up
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-11 px-5 text-sm"
            >
              <Link href="#how-it-works">
                <PlayCircle aria-hidden="true" className="size-4 text-link" />
                See how it works
              </Link>
            </Button>
          </div>
          <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
            <CheckCircle2
              aria-hidden="true"
              className="size-3.5 text-validated-foreground"
            />
            Teacher-reviewed · One student per saved record
          </p>
        </div>
        <div className="min-w-0 lg:py-1">
          <LandingProductPreview />
        </div>
      </div>
    </section>
  );
}

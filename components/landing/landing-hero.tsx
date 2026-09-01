import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { LandingProductPreview } from "@/components/landing/landing-product-preview";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/routes";

export function LandingHero() {
  return (
    <section className="border-b border-navy-foreground/10 bg-navy text-navy-foreground">
      <div className="mx-auto grid max-w-[1360px] items-center gap-12 px-4 py-14 md:px-6 lg:grid-cols-[0.78fr_1.22fr] lg:gap-12 lg:px-8 lg:py-40 xl:grid-cols-[0.72fr_1.28fr]">
        <div className="min-w-0 max-w-xl">
          <h1 className="mt-5 text-[2.75rem] font-bold leading-[1.03] tracking-[-0.04em] text-balance text-navy-foreground sm:text-[3.4rem] lg:text-[3.85rem]">
            Turn messy capture into teacher-validated evidence.
          </h1>
          <p className="mt-6 max-w-lg text-[15px] leading-7 text-pretty text-ground-muted">
            Say goodbye to the mental filing cabinet. Record the classroom
            moment while it is fresh, review what will be saved, and find
            trustworthy evidence by student when you need it.
          </p>
          <p className="mt-4 max-w-lg text-sm font-medium leading-6 text-pretty text-navy-foreground">
            ClassTrace is currently an invitation-only beta for individual
            teachers.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button
              asChild
              className="h-11 bg-mint px-6 text-sm text-mint-ink hover:bg-[var(--mint-hover)] focus-visible:border-mint focus-visible:ring-mint focus-visible:ring-offset-navy"
            >
              <Link href={routes.signUp} prefetch={false}>
                Invited sign-up
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-11 border-navy-foreground/30 bg-transparent px-5 text-sm text-navy-foreground hover:bg-navy-foreground/10 hover:text-navy-foreground focus-visible:border-mint focus-visible:ring-mint focus-visible:ring-offset-navy"
            >
              <Link href="#how-it-works">How it works</Link>
            </Button>
          </div>
          <p className="mt-5 flex items-center gap-2 text-xs text-ground-muted">
            <CheckCircle2
              aria-hidden="true"
              className="size-3.5 shrink-0 text-mint"
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

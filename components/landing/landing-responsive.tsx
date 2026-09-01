import { MonitorCheck, Smartphone } from "lucide-react";
import {
  LandingMobilePreview,
  LandingProductPreview,
} from "@/components/landing/landing-product-preview";

export function LandingResponsive() {
  return (
    <section aria-labelledby="responsive-heading" className="overflow-hidden border-b border-navy-foreground/10 bg-navy px-4 py-14 text-navy-foreground md:px-6 lg:px-8 lg:py-16">
      <div className="mx-auto grid max-w-[1280px] items-center gap-10 lg:grid-cols-[0.66fr_1.34fr] lg:gap-14">
        <div className="max-w-sm">
          <p className="text-sm font-semibold text-mint">One responsive workspace</p>
          <h2 id="responsive-heading" className="mt-4 text-3xl font-bold leading-tight tracking-[-0.03em] text-balance text-navy-foreground">
            Capture between classes. Review wherever you settle in.
          </h2>
          <p className="mt-4 text-sm leading-7 text-pretty text-ground-muted">
            ClassTrace adapts from phone to desktop without changing the evidence workflow or adding another app to manage.
          </p>
          <ul className="mt-6 space-y-3 text-xs font-medium text-navy-foreground">
            <li className="flex items-center gap-2">
              <Smartphone aria-hidden="true" className="size-4 text-mint" /> Responsive capture and review
            </li>
            <li className="flex items-center gap-2">
              <MonitorCheck aria-hidden="true" className="size-4 text-mint" /> Full feed, timelines, and reports on desktop
            </li>
          </ul>
        </div>
        <div className="relative mx-auto flex w-full max-w-[720px] justify-center sm:min-h-[470px] sm:block">
          <LandingProductPreview compact className="absolute left-0 top-12 hidden w-[560px] sm:block lg:w-[650px]" />
          <div className="relative mt-2 sm:absolute sm:bottom-3 sm:right-0 sm:mt-0 sm:origin-bottom-right sm:scale-[0.88]">
            <LandingMobilePreview />
          </div>
        </div>
      </div>
    </section>
  );
}

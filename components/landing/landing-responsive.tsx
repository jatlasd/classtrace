import { MonitorCheck, Smartphone } from "lucide-react";
import {
  LandingMobilePreview,
  LandingProductPreview,
} from "@/components/landing/landing-product-preview";

export function LandingResponsive() {
  return (
    <section className="bg-card px-4 py-10 md:px-6 lg:px-8 lg:py-12">
      <div className="mx-auto grid max-w-[1280px] items-center gap-8 overflow-hidden rounded-card border border-border bg-accent/55 px-6 py-8 sm:px-8 lg:grid-cols-[0.66fr_1.34fr] lg:gap-10 lg:px-12 lg:py-10">
        <div className="max-w-sm">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-link">One responsive workspace</p>
          <h2 className="mt-2 text-2xl font-bold leading-tight tracking-tight text-foreground">
            Capture between classes. Review wherever you settle in.
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            ClassTrace adapts from phone to desktop without changing the evidence workflow or adding another app to manage.
          </p>
          <ul className="mt-5 space-y-2 text-xs font-medium text-foreground">
            <li className="flex items-center gap-2">
              <Smartphone aria-hidden="true" className="size-4 text-link" /> Responsive capture and review
            </li>
            <li className="flex items-center gap-2">
              <MonitorCheck aria-hidden="true" className="size-4 text-link" /> Full feed, timelines, and reports on desktop
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

import Link from "next/link";
import { BrandLockup } from "@/components/layout/brand-lockup";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/routes";

export function LandingHeader() {
  return (
    <header className="relative z-40 border-b border-navy-foreground/10 bg-navy text-navy-foreground">
      <div className="mx-auto flex h-14 max-w-[1180px] items-center justify-between px-4 md:px-6 lg:px-8">
        <Link
          href={routes.root}
          className="rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint focus-visible:ring-offset-2 focus-visible:ring-offset-navy"
        >
          <BrandLockup size="sm" tone="inverse" />
        </Link>
        <nav
          aria-label="Landing page"
          className="hidden items-center gap-7 text-xs font-medium text-ground-muted md:flex"
        >
          <Link className="transition-colors hover:text-navy-foreground" href="#how-it-works">
            How it works
          </Link>
          <Link className="transition-colors hover:text-navy-foreground" href="#features">
            What you get
          </Link>
          <Link className="transition-colors hover:text-navy-foreground" href={routes.privacy}>
            Privacy
          </Link>
          <Link className="transition-colors hover:text-navy-foreground" href={routes.support}>
            Support
          </Link>
        </nav>
        <div className="flex items-center gap-2 sm:gap-4">
          <Link
            href={routes.signIn}
            prefetch={false}
            className="hidden rounded-md px-2 py-2 text-xs font-semibold text-ground-muted transition-colors hover:text-navy-foreground sm:block"
          >
            Sign in
          </Link>
          <Button asChild className="h-9 bg-mint px-4 text-xs text-mint-ink hover:bg-[var(--mint-hover)] focus-visible:border-mint focus-visible:ring-mint focus-visible:ring-offset-navy">
            <Link href={routes.signUp} prefetch={false}>
              Invited sign-up
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

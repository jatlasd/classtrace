import Link from "next/link";
import { BrandLockup } from "@/components/layout/brand-lockup";
import { cn } from "@/lib/utils";
import { routes } from "@/lib/routes";

type SiteFooterProps = {
  showAccessLinks?: boolean;
  tone?: "default" | "inverse";
};

export function SiteFooter({
  showAccessLinks = false,
  tone = "default",
}: SiteFooterProps) {
  const inverse = tone === "inverse";
  const linkClassName = cn(
    "inline-flex min-h-11 items-center text-sm transition-colors sm:min-h-9",
    inverse
      ? "text-ground-muted hover:text-navy-foreground"
      : "text-muted-foreground hover:text-foreground"
  );

  return (
    <footer
      className={cn(
        "site-footer mt-auto border-t",
        inverse
          ? "border-navy-foreground/10 bg-navy text-navy-foreground"
          : "border-border/70"
      )}
    >
      <div className="mx-auto flex max-w-[1360px] flex-col gap-4 px-4 py-5 md:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <BrandLockup size="sm" tone={tone} />
        <nav
          aria-label="Footer"
          className="grid w-full max-w-2xl grid-cols-2 gap-x-6 gap-y-3 sm:flex sm:w-auto sm:flex-wrap sm:items-center sm:gap-y-2"
        >
          <Link
            href={routes.privacy}
            className={linkClassName}
          >
            Privacy
          </Link>
          <Link
            href={routes.terms}
            className={linkClassName}
          >
            Beta terms
          </Link>
          <Link
            href={routes.support}
            className={linkClassName}
          >
            Support
          </Link>
          <Link
            href={routes.dataDeletion}
            className={linkClassName}
          >
            Account deletion
          </Link>
          {showAccessLinks ? (
            <>
              <Link
                href={routes.signIn}
                prefetch={false}
                className={cn(
                  "text-sm font-medium transition-colors",
                  inverse
                    ? "text-navy-foreground hover:text-mint"
                    : "text-foreground/80 hover:text-foreground"
                )}
              >
                Sign in
              </Link>
              <Link
                href={routes.signUp}
                prefetch={false}
                className={cn(
                  "text-sm transition-colors",
                  inverse
                    ? "text-ground-muted hover:text-mint"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Invited sign-up →
              </Link>
            </>
          ) : null}
        </nav>
      </div>
    </footer>
  );
}

import Link from "next/link";
import { NotebookPen } from "lucide-react";
import { routes } from "@/lib/routes";

type SiteFooterProps = {
  showAccessLinks?: boolean;
};

export function SiteFooter({ showAccessLinks = false }: SiteFooterProps) {
  return (
    <footer className="site-footer mt-auto border-t border-border/70">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6 md:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div className="flex items-center gap-2.5">
          <NotebookPen
            className="size-6 text-navy"
            strokeWidth={2}
            aria-hidden="true"
          />
          <span className="font-display text-lg font-semibold tracking-tight text-foreground">
            ClassTrace
          </span>
        </div>
        <nav
          aria-label="Footer"
          className="flex max-w-2xl flex-wrap items-center gap-x-6 gap-y-2"
        >
          <Link
            href={routes.privacy}
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Privacy
          </Link>
          <Link
            href={routes.terms}
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Beta terms
          </Link>
          <Link
            href={routes.support}
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Support
          </Link>
          <Link
            href={routes.dataDeletion}
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Account deletion
          </Link>
          {showAccessLinks ? (
            <>
              <Link
                href={routes.signIn}
                prefetch={false}
                className="text-sm font-medium text-foreground/80 transition-colors hover:text-foreground"
              >
                Sign in
              </Link>
              <Link
                href={routes.signUp}
                prefetch={false}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
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

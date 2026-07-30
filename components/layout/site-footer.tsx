import Link from "next/link";
import { NotebookPen } from "lucide-react";
import { routes } from "@/lib/routes";

type SiteFooterProps = {
  showAccessLinks?: boolean;
};

export function SiteFooter({ showAccessLinks = false }: SiteFooterProps) {
  return (
    <footer className="site-footer mt-auto border-t border-border/70">
      <div className="mx-auto flex max-w-[1360px] flex-col gap-4 px-4 py-5 md:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
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
          className="grid w-full max-w-2xl grid-cols-2 gap-x-6 gap-y-3 sm:flex sm:w-auto sm:flex-wrap sm:items-center sm:gap-y-2"
        >
          <Link
            href={routes.privacy}
            className="inline-flex min-h-11 items-center text-sm text-muted-foreground transition-colors hover:text-foreground sm:min-h-9"
          >
            Privacy
          </Link>
          <Link
            href={routes.terms}
            className="inline-flex min-h-11 items-center text-sm text-muted-foreground transition-colors hover:text-foreground sm:min-h-9"
          >
            Beta terms
          </Link>
          <Link
            href={routes.support}
            className="inline-flex min-h-11 items-center text-sm text-muted-foreground transition-colors hover:text-foreground sm:min-h-9"
          >
            Support
          </Link>
          <Link
            href={routes.dataDeletion}
            className="inline-flex min-h-11 items-center text-sm text-muted-foreground transition-colors hover:text-foreground sm:min-h-9"
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

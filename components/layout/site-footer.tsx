import Link from "next/link";
import { routes } from "@/lib/routes";

type SiteFooterProps = {
  showAccessLinks?: boolean;
};

const linkClassName =
  "inline-flex min-h-11 items-center rounded-sm text-[13px] font-medium text-fg-3 transition-colors hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-live-bright focus-visible:ring-offset-2 focus-visible:ring-offset-base sm:min-h-9";

export function SiteFooter({ showAccessLinks = false }: SiteFooterProps) {
  return (
    <footer className="site-footer mt-auto border-t border-line">
      <div className="mx-auto flex max-w-[1240px] flex-col gap-3 px-4 py-5 md:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <p className="text-[13px] font-medium text-fg-3">
          ClassTrace · invitation-only beta
        </p>
        <nav
          aria-label="Footer"
          className="grid w-full max-w-2xl grid-cols-2 gap-x-6 gap-y-1 sm:flex sm:w-auto sm:flex-wrap sm:items-center sm:gap-x-6"
        >
          <Link href={routes.privacy} className={linkClassName}>
            Privacy
          </Link>
          <Link href={routes.terms} className={linkClassName}>
            Beta terms
          </Link>
          <Link href={routes.support} className={linkClassName}>
            Support
          </Link>
          <Link href={routes.dataDeletion} className={linkClassName}>
            Account deletion
          </Link>
          {showAccessLinks ? (
            <>
              <Link
                href={routes.signIn}
                prefetch={false}
                className={`${linkClassName} text-fg`}
              >
                Sign in
              </Link>
              <Link href={routes.signUp} prefetch={false} className={`${linkClassName} text-live`}>
                Invited sign-up →
              </Link>
            </>
          ) : null}
        </nav>
      </div>
    </footer>
  );
}

import Link from "next/link";
import { PenLine } from "lucide-react";
import { routes } from "@/lib/routes";

export function LandingFooter() {
  return (
    <footer className="border-t border-border/70">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 md:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div className="flex items-center gap-2.5">
          <span className="flex size-7 items-center justify-center rounded-md bg-navy text-navy-foreground">
            <PenLine className="size-3.5" strokeWidth={2.5} />
          </span>
          <span className="font-display text-sm font-semibold tracking-tight text-foreground">
            ClassTrace
          </span>
        </div>
        <nav className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <Link
            href={routes.signIn}
            className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Sign in
          </Link>
          <Link
            href={routes.feed}
            className="text-xs text-muted-foreground/60 transition-colors hover:text-muted-foreground"
          >
            Open app workspace
          </Link>
        </nav>
        <p className="text-xs text-muted-foreground/60">
          © {new Date().getFullYear()} ClassTrace
        </p>
      </div>
    </footer>
  );
}

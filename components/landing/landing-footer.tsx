import Link from "next/link";
import { NotebookPen } from "lucide-react";
import { routes } from "@/lib/routes";

export function LandingFooter() {
  return (
    <footer className="border-t border-border/70">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6 md:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div className="flex items-center gap-2.5">
          <NotebookPen className="size-6 text-navy" strokeWidth={2} aria-hidden="true" />
          <span className="font-display text-lg font-semibold tracking-tight text-foreground">
            ClassTrace
          </span>
        </div>
        <nav className="flex flex-wrap items-center gap-x-8 gap-y-2">
          <Link
            href={routes.signIn}
            className="text-sm font-medium text-foreground/80 transition-colors hover:text-foreground"
          >
            Sign in
          </Link>
          <Link
            href={routes.signUp}
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Create account →
          </Link>
        </nav>
      </div>
    </footer>
  );
}

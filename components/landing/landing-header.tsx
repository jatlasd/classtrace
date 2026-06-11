import Link from "next/link";
import { NotebookPen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/routes";

export function LandingHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-6 lg:px-8">
        <Link href={routes.root} className="flex items-center gap-2.5">
          <NotebookPen className="size-7 text-navy" strokeWidth={2} aria-hidden="true" />
          <span className="font-display text-xl font-semibold tracking-tight text-foreground">
            ClassTrace
          </span>
        </Link>
        <nav className="flex items-center gap-2 sm:gap-5">
          <Link
            href={routes.signIn}
            className="hidden rounded-lg px-2 py-2 text-sm font-medium text-foreground/80 transition-colors hover:text-foreground sm:block"
          >
            Sign in
          </Link>
          <Button asChild variant="navy" className="h-9 rounded-md px-4 text-sm font-semibold">
            <Link href={routes.signUp}>Capture your first note</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}

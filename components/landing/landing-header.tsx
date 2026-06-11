import Link from "next/link";
import { PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/routes";

export function LandingHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-6 lg:px-8">
        <Link href={routes.root} className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-lg bg-navy text-navy-foreground">
            <PenLine className="size-4.5" strokeWidth={2.5} />
          </span>
          <span className="font-display text-[17px] font-semibold tracking-tight text-foreground">
            ClassTrace
          </span>
        </Link>
        <nav className="flex items-center gap-2 sm:gap-4">
          <Link
            href={routes.signIn}
            className="rounded-lg px-3 py-2 text-sm font-medium text-link underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
          <Button
            asChild
            className="h-9 rounded-md px-4 text-sm font-semibold"
          >
            <Link href={routes.signUp}>Capture your first note</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}

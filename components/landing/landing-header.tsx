import Link from "next/link";
import { PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/routes";

export function LandingHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-6 lg:px-8">
        <Link href={routes.root} className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <PenLine className="size-4.5" strokeWidth={2.5} />
          </span>
          <span className="text-[15px] font-semibold tracking-tight text-foreground">
            ClassTrace
          </span>
        </Link>
        <nav className="flex items-center gap-2 sm:gap-4">
          <Link
            href={routes.signIn}
            className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Sign in
          </Link>
          <Button asChild className="h-9 rounded-lg px-4 text-sm font-semibold shadow-sm">
            <Link href={routes.signUp}>Sign up</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}

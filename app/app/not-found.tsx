import Link from "next/link";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/routes";

export default function AppNotFound() {
  return (
    <div className="mx-auto w-full max-w-[760px] px-4 py-10 sm:px-6 lg:px-8">
      <section className="rounded-card border border-border bg-card p-6">
        <p className="text-xs font-semibold text-muted-foreground">
          Page not found
        </p>
        <h1 className="mt-2 font-display text-2xl font-semibold text-foreground">
          This ClassTrace page is not available
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Return to the evidence feed or choose a student from your roster.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Button asChild>
            <Link href={routes.feed}>Evidence feed</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={routes.roster}>Roster</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}

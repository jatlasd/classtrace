import Link from "next/link";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/routes";

export default function AppNotFound() {
  return (
    <div className="mx-auto w-full max-w-[760px] px-4 py-10 sm:px-6 lg:px-8">
      <section className="plate p-6 sm:p-8">
        <p className="label text-fg-3">
          Page not found
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold leading-none tracking-[-0.01em] text-fg">
          This ClassTrace page is not available
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-fg-2">
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

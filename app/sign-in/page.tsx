import Link from "next/link";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/routes";

export default function SignInPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-8">
      <section className="w-full max-w-md rounded-xl border border-border bg-card p-6 text-center shadow-sm">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Sign in
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-foreground">
          Sign-in coming soon
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Authentication will be wired in a later build unit. For now, you can
          continue to the local app workspace.
        </p>
        <Button asChild className="mt-5">
          <Link href={routes.feed}>Open app</Link>
        </Button>
      </section>
    </main>
  );
}

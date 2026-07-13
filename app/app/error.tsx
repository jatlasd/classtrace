"use client";

import { Button } from "@/components/ui/button";

export default function AppError({ reset }: { reset: () => void }) {
  return (
    <div className="mx-auto w-full max-w-[760px] px-4 py-10 sm:px-6 lg:px-8">
      <section className="rounded-card border border-border bg-card p-6">
        <p className="text-xs font-semibold text-muted-foreground">
          ClassTrace could not load this page
        </p>
        <h1 className="mt-2 font-display text-2xl font-semibold text-foreground">
          We couldn’t load this page
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Try loading the page again. If the problem continues, return to the
          previous page and retry the action.
        </p>
        <Button type="button" className="mt-5" onClick={reset}>
          Try again
        </Button>
      </section>
    </div>
  );
}

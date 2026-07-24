"use client";

import * as Sentry from "@sentry/nextjs";
import { MessageCircleQuestion, RefreshCw, TriangleAlert } from "lucide-react";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { registerUnexpectedErrorReference } from "@/actions/error-reporting";
import { Button } from "@/components/ui/button";
import {
  createClientErrorReference,
  getServerErrorReference,
  type ErrorBoundaryName,
} from "@/lib/errors/error-reference";
import { routes } from "@/lib/routes";

type UnexpectedErrorFallbackProps = {
  error: Error & { digest?: string };
  unstable_retry: () => void;
  boundary: ErrorBoundaryName;
};

export function UnexpectedErrorFallback({
  error,
  unstable_retry,
  boundary,
}: UnexpectedErrorFallbackProps) {
  const [retryState, setRetryState] = useState<{
    error: Error;
    active: boolean;
  }>(() => ({ error, active: false }));
  const [isPending, startTransition] = useTransition();
  const registeredReference = useRef<string | null>(null);
  const referenceId = useMemo(
    () =>
      getServerErrorReference(error.digest) ?? createClientErrorReference(),
    [error]
  );

  useEffect(() => {
    if (registeredReference.current === referenceId) return;
    registeredReference.current = referenceId;

    if (!getServerErrorReference(error.digest)) {
      Sentry.captureException(error, {
        tags: {
          "classtrace.boundary": boundary,
          "classtrace.error_reference": referenceId,
        },
      });
    }

    void registerUnexpectedErrorReference({ referenceId, boundary }).catch(
      () => undefined
    );
  }, [boundary, error, referenceId]);

  const retrying =
    (retryState.error === error && retryState.active) || isPending;
  const reportHref = `${routes.settings}?errorReference=${encodeURIComponent(
    referenceId
  )}`;

  function handleRetry(): void {
    if (retrying) return;
    setRetryState({ error, active: true });
    startTransition(() => unstable_retry());
  }

  return (
    <div className="mx-auto w-full max-w-[760px] px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <section
        aria-labelledby="unexpected-error-heading"
        className="rounded-card border border-border bg-card p-5 shadow-paper sm:p-7"
      >
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-md border border-destructive/25 bg-destructive/10 text-destructive">
            <TriangleAlert
              className="size-4"
              strokeWidth={1.75}
              aria-hidden="true"
            />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              ClassTrace could not finish this request
            </p>
            <h1
              id="unexpected-error-heading"
              className="mt-2 font-display text-2xl font-semibold tracking-tight text-foreground"
            >
              Something went wrong
            </h1>
          </div>
        </div>

        <div className="mt-5 space-y-3 text-sm leading-relaxed text-muted-foreground">
          <p>
            We can&apos;t confirm whether your latest work was saved. Retry, then
            check the page before repeating a save or other change.
          </p>
          <p>
            If the problem continues, send a report with the reference below so
            it can be matched to the server logs.
          </p>
        </div>

        <div className="mt-5 border-y border-border/70 py-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Reference ID
          </p>
          <code className="mt-1 block select-all break-all font-mono text-sm font-semibold text-foreground">
            {referenceId}
          </code>
        </div>

        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center">
          <Button
            type="button"
            size="lg"
            className="h-10 px-4 font-semibold"
            onClick={handleRetry}
            disabled={retrying}
          >
            <RefreshCw aria-hidden="true" />
            {retrying ? "Retrying…" : "Retry"}
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="h-10 px-4 font-semibold"
          >
            <a href={reportHref}>
              <MessageCircleQuestion aria-hidden="true" />
              Report this problem
            </a>
          </Button>
        </div>
      </section>
    </div>
  );
}

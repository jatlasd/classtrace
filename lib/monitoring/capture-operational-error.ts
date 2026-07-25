import * as Sentry from "@sentry/nextjs";
import type { SentryOperation } from "@/lib/monitoring/sentry-privacy";

const ERROR_LOG_PREFIX = "[monitoring/capture-operational-error] unexpected";

function getSafeErrorName(error: unknown): string {
  if (
    error instanceof Error &&
    /^[A-Za-z][A-Za-z0-9_.-]{0,79}$/.test(error.name)
  ) {
    return error.name;
  }

  return "UnknownError";
}

export function captureOperationalError(
  operation: SentryOperation,
  error: unknown
): void {
  const capturedError =
    error instanceof Error ? error : new Error("Non-Error thrown");
  const errorName = getSafeErrorName(error);

  Sentry.withScope((scope) => {
    scope.setTag("classtrace.operation", operation);
    Sentry.captureException(capturedError);
  });

  console.error(ERROR_LOG_PREFIX, { operation, errorName });
}

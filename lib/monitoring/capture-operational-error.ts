import * as Sentry from "@sentry/nextjs";
import type { SentryOperation } from "@/lib/monitoring/sentry-privacy";

const ERROR_LOG_PREFIX = "[monitoring/capture-operational-error] unexpected";
const SAFE_ERROR_NAMES = new Set([
  "AggregateError",
  "Error",
  "EvalError",
  "RangeError",
  "ReferenceError",
  "SyntaxError",
  "TypeError",
  "URIError",
]);

function getSafeErrorName(error: unknown): string {
  if (error instanceof Error && SAFE_ERROR_NAMES.has(error.name)) {
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

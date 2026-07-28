import * as Sentry from "@sentry/nextjs";
import {
  getSafeErrorDiagnostic,
  getSafeOperationStage,
} from "@/lib/monitoring/safe-error-diagnostic";
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

function isError(error: unknown): error is Error {
  try {
    return error instanceof Error;
  } catch {
    return false;
  }
}

function getSafeErrorName(error: unknown): string {
  if (!isError(error)) return "UnknownError";

  try {
    return SAFE_ERROR_NAMES.has(error.name) ? error.name : "UnknownError";
  } catch {
    return "UnknownError";
  }
}

export function captureOperationalError(
  operation: SentryOperation,
  error: unknown
): void {
  const capturedError = isError(error) ? error : new Error("Non-Error thrown");
  const errorName = getSafeErrorName(error);
  const diagnostic = getSafeErrorDiagnostic(error);
  const operationStage = getSafeOperationStage(error) ?? "operation.execute";

  Sentry.withScope((scope) => {
    scope.setTag("classtrace.operation", operation);
    scope.setTag("classtrace.operation_stage", operationStage);
    Sentry.captureException(capturedError);
  });

  console.error(ERROR_LOG_PREFIX, {
    operation,
    operationStage,
    errorName,
    ...(diagnostic
      ? {
          errorSource: diagnostic.source,
          errorType: diagnostic.errorType,
          failureKind: diagnostic.failureKind,
          ...(diagnostic.code ? { errorCode: diagnostic.code } : undefined),
          ...(diagnostic.databaseObject
            ? { databaseObject: diagnostic.databaseObject }
            : undefined),
        }
      : undefined),
  });
}

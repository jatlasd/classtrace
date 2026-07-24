import type { Instrumentation } from "next";
import * as Sentry from "@sentry/nextjs";
import { getServerErrorReference } from "@/lib/errors/error-reference";

const ERROR_LOG_PREFIX = "[instrumentation/onRequestError] unexpected";

function getDigest(error: unknown): unknown {
  if (typeof error !== "object" || error === null || !("digest" in error)) {
    return null;
  }
  return error.digest;
}

export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}

export const onRequestError: Instrumentation.onRequestError = (
  error,
  request,
  context
) => {
  const referenceId = getServerErrorReference(getDigest(error));

  Sentry.withScope((scope) => {
    scope.setTags({
      "classtrace.http_method": request.method,
      "classtrace.render_source": context.renderSource,
      "classtrace.route_template": context.routePath,
      "classtrace.route_type": context.routeType,
    });
    if (referenceId) {
      scope.setTag("classtrace.error_reference", referenceId);
    }
    Sentry.captureRequestError(error, request, context);
  });

  if (referenceId) {
    console.error(ERROR_LOG_PREFIX, {
      referenceId,
      routePath: context.routePath,
      routeType: context.routeType,
      renderSource: context.renderSource,
    });
  }
};

import type { Instrumentation } from "next";
import { getServerErrorReference } from "@/lib/errors/error-reference";

const ERROR_LOG_PREFIX = "[instrumentation/onRequestError] unexpected";

function getDigest(error: unknown): unknown {
  if (typeof error !== "object" || error === null || !("digest" in error)) {
    return null;
  }
  return error.digest;
}

export const onRequestError: Instrumentation.onRequestError = (
  error,
  _request,
  context
) => {
  const referenceId = getServerErrorReference(getDigest(error));
  if (!referenceId) return;

  console.error(ERROR_LOG_PREFIX, {
    referenceId,
    routePath: context.routePath,
    routeType: context.routeType,
    renderSource: context.renderSource,
  });
};

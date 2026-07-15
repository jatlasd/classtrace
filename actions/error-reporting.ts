"use server";

import {
  isErrorBoundaryName,
  normalizeErrorReference,
} from "@/lib/errors/error-reference";

const ERROR_LOG_PREFIX =
  "[actions/error-reporting/registerUnexpectedErrorReference] unexpected";

export type RegisterUnexpectedErrorReferenceResult =
  | { success: true }
  | { success: false };

export async function registerUnexpectedErrorReference(input: {
  referenceId: string;
  boundary: string;
}): Promise<RegisterUnexpectedErrorReferenceResult> {
  const referenceId = normalizeErrorReference(input.referenceId);
  if (!referenceId || !isErrorBoundaryName(input.boundary)) {
    return { success: false };
  }

  console.error(ERROR_LOG_PREFIX, {
    referenceId,
    boundary: input.boundary,
  });
  return { success: true };
}

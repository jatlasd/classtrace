import { INPUT_LIMITS } from "@/lib/validation/input-limits";

const SERVER_DIGEST_PATTERN = /^[A-Za-z0-9_-]{1,64}$/;
const SERVER_REFERENCE_PATTERN = /^CT-S-[A-Za-z0-9_-]{1,64}$/;
const CLIENT_REFERENCE_PATTERN =
  /^CT-C-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

export const ERROR_BOUNDARY_NAMES = ["app", "global"] as const;

export type ErrorBoundaryName = (typeof ERROR_BOUNDARY_NAMES)[number];

export function getServerErrorReference(digest: unknown): string | null {
  if (typeof digest !== "string" || !SERVER_DIGEST_PATTERN.test(digest)) {
    return null;
  }

  return `CT-S-${digest}`;
}

export function createClientErrorReference(
  createUuid: () => string = () => crypto.randomUUID()
): string {
  const reference = `CT-C-${createUuid()}`;
  if (!CLIENT_REFERENCE_PATTERN.test(reference)) {
    throw new Error("A valid error reference could not be generated.");
  }
  return reference;
}

export function normalizeErrorReference(value: unknown): string | null {
  if (
    typeof value !== "string" ||
    value.length > INPUT_LIMITS.errorReference
  ) {
    return null;
  }

  if (
    !SERVER_REFERENCE_PATTERN.test(value) &&
    !CLIENT_REFERENCE_PATTERN.test(value)
  ) {
    return null;
  }

  return value;
}

export function isErrorBoundaryName(
  value: unknown
): value is ErrorBoundaryName {
  return ERROR_BOUNDARY_NAMES.some((name) => name === value);
}

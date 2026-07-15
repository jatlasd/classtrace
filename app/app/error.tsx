"use client";

import { UnexpectedErrorFallback } from "@/components/errors/unexpected-error-fallback";

export default function AppError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <UnexpectedErrorFallback
      error={error}
      unstable_retry={unstable_retry}
      boundary="app"
    />
  );
}

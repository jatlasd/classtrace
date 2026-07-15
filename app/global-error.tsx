"use client";

import { UnexpectedErrorFallback } from "@/components/errors/unexpected-error-fallback";
import "./globals.css";

export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="paper-grain min-h-full font-sans">
        <title>Something went wrong | ClassTrace</title>
        <main id="main-content" tabIndex={-1} className="min-w-0 outline-none">
          <UnexpectedErrorFallback
            error={error}
            unstable_retry={unstable_retry}
            boundary="global"
          />
        </main>
      </body>
    </html>
  );
}

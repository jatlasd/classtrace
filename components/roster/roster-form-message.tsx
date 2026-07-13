"use client";

import { useEffect, useRef } from "react";

type RosterFormMessageProps = {
  id: string;
  message?: string | null;
  tone?: "error" | "status";
  className?: string;
};

export function RosterFormMessage({
  id,
  message,
  tone = "error",
  className = "min-h-5 text-sm",
}: RosterFormMessageProps) {
  const messageRef = useRef<HTMLParagraphElement | null>(null);

  useEffect(() => {
    if (message && tone === "error") {
      messageRef.current?.focus();
    }
  }, [message, tone]);

  return (
    <div aria-live={tone === "error" ? "assertive" : "polite"} className={className}>
      {message ? (
        <p
          id={id}
          ref={messageRef}
          role={tone === "error" ? "alert" : "status"}
          tabIndex={tone === "error" ? -1 : undefined}
          className={
            tone === "error"
              ? "text-destructive outline-none focus-visible:ring-3 focus-visible:ring-ring/30"
              : "text-muted-foreground"
          }
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}

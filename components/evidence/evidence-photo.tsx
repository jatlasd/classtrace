"use client";

import { useState } from "react";
import { routes } from "@/lib/routes";

type EvidencePhotoProps = {
  evidenceId: string;
  evidenceDate: string;
  className?: string;
  loading?: "eager" | "lazy";
};

function photoDateLabel(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "the evidence date"
    : new Intl.DateTimeFormat("en", {
        month: "long",
        day: "numeric",
        year: "numeric",
      }).format(date);
}

export function EvidencePhoto({
  evidenceId,
  evidenceDate,
  className = "",
  loading = "lazy",
}: EvidencePhotoProps) {
  const [unavailable, setUnavailable] = useState(false);

  if (unavailable) {
    return (
      <p className={`text-xs text-muted-foreground ${className}`}>
        Photo evidence is unavailable.
      </p>
    );
  }

  return (
    // The authenticated, no-store route cannot be optimized through a public image cache.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={routes.evidencePhoto(evidenceId)}
      alt={`Photo evidence from ${photoDateLabel(evidenceDate)}`}
      loading={loading}
      decoding="async"
      onError={() => setUnavailable(true)}
      className={`max-h-[32rem] w-auto max-w-full rounded-md border border-border bg-muted/20 object-contain ${className}`}
    />
  );
}

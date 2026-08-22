"use client";

import { useState } from "react";
import { PhotoThumbnail } from "@/components/evidence/photo-thumbnail";
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
    <PhotoThumbnail
      src={routes.evidencePhoto(evidenceId)}
      alt={`Photo evidence from ${photoDateLabel(evidenceDate)}`}
      loading={loading}
      onError={() => setUnavailable(true)}
      className={className}
    />
  );
}

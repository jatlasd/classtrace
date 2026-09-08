"use client";

import { useState } from "react";
import { PhotoThumbnail } from "@/components/evidence/photo-thumbnail";
import { routes } from "@/lib/routes";

type EvidencePhotoProps = {
  evidenceId: string;
  evidenceDate: string;
  width?: number;
  height?: number;
  className?: string;
  presentation?: "thumbnail" | "work-sample";
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
  width,
  height,
  className = "",
  presentation = "thumbnail",
  loading = "lazy",
}: EvidencePhotoProps) {
  const [unavailable, setUnavailable] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const photoRoute = routes.evidencePhoto(evidenceId);

  if (unavailable) {
    return (
      <div className={`flex flex-wrap items-center gap-2 ${className}`}>
        <p className="text-xs text-fg-2">
          Photo evidence is unavailable.
        </p>
        <button
          type="button"
          className="rounded-sm text-xs font-medium text-fg underline underline-offset-4 outline-none hover:decoration-2 focus-visible:ring-2 focus-visible:ring-live-bright focus-visible:ring-offset-2 focus-visible:ring-offset-base"
          onClick={() => {
            setRetryKey((current) => current + 1);
            setUnavailable(false);
          }}
        >
          Retry photo
        </button>
      </div>
    );
  }

  return (
    <PhotoThumbnail
      src={retryKey === 0 ? photoRoute : `${photoRoute}?retry=${retryKey}`}
      alt={`Photo evidence from ${photoDateLabel(evidenceDate)}`}
      loading={loading}
      onError={() => setUnavailable(true)}
      width={width}
      height={height}
      className={className}
      presentation={presentation}
    />
  );
}

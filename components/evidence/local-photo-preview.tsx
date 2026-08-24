"use client";

import { PhotoThumbnail } from "@/components/evidence/photo-thumbnail";

type LocalPhotoPreviewProps = {
  blob: Blob;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
};

export function LocalPhotoPreview({
  blob,
  alt,
  className = "",
  width,
  height,
}: LocalPhotoPreviewProps) {
  return (
    <PhotoThumbnail
      blob={blob}
      alt={alt}
      className={className}
      width={width}
      height={height}
    />
  );
}

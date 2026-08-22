"use client";

import { PhotoThumbnail } from "@/components/evidence/photo-thumbnail";

type LocalPhotoPreviewProps = {
  blob: Blob;
  alt: string;
  className?: string;
};

export function LocalPhotoPreview({
  blob,
  alt,
  className = "",
}: LocalPhotoPreviewProps) {
  return <PhotoThumbnail blob={blob} alt={alt} className={className} />;
}

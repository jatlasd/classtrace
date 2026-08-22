"use client";

import { useEffect, useRef } from "react";

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
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const url = URL.createObjectURL(blob);
    const image = imageRef.current;
    if (image) image.src = url;

    return () => {
      if (image?.src === url) image.removeAttribute("src");
      URL.revokeObjectURL(url);
    };
  }, [blob]);

  return (
    // Local object URLs are temporary browser resources and cannot use Next image optimization.
    // eslint-disable-next-line @next/next/no-img-element
    <img ref={imageRef} alt={alt} className={className} />
  );
}

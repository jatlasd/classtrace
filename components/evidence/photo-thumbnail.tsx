"use client";

import { Maximize2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

type PhotoThumbnailProps = {
  alt: string;
  className?: string;
  presentation?: "thumbnail" | "work-sample";
  loading?: "eager" | "lazy";
  onError?: () => void;
  width?: number;
  height?: number;
} & ({ src: string; blob?: never } | { src?: never; blob: Blob });

export function PhotoThumbnail({
  src,
  blob,
  alt,
  className = "",
  presentation = "thumbnail",
  loading = "lazy",
  onError,
  width,
  height,
}: PhotoThumbnailProps) {
  const [expanded, setExpanded] = useState(false);
  const [objectUrl, setObjectUrl] = useState<string>();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!blob) return;

    const nextObjectUrl = URL.createObjectURL(blob);
    // Object URLs are external resources and must follow the Blob lifecycle.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setObjectUrl(nextObjectUrl);

    return () => {
      URL.revokeObjectURL(nextObjectUrl);
    };
  }, [blob]);

  useEffect(() => {
    if (!expanded) return;

    const trigger = triggerRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === "Escape") setExpanded(false);
      if (event.key === "Tab") {
        event.preventDefault();
        closeButtonRef.current?.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      trigger?.focus();
    };
  }, [expanded]);

  const imageSource = src ?? objectUrl;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-label={`Expand ${alt}`}
        aria-haspopup="dialog"
        className={`group relative block ${presentation === "work-sample" ? "w-fit max-w-full sm:max-w-60" : "size-24 sm:size-28"} shrink-0 overflow-hidden rounded-lg bg-well outline-none ring-1 ring-line focus-visible:ring-2 focus-visible:ring-live-bright focus-visible:ring-offset-2 focus-visible:ring-offset-base print:pointer-events-none print:h-auto print:max-h-[6.5in] print:w-auto print:max-w-full print:border-0 print:shadow-none ${className}`}
        onClick={() => setExpanded(true)}
      >
        {/* Authenticated and local object URLs cannot use Next image optimization. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageSource}
          alt={alt}
          width={width}
          height={height}
          loading={loading}
          decoding="async"
          onError={onError}
          className={`${presentation === "work-sample" ? "h-auto max-h-64 w-auto max-w-full object-contain" : "size-full object-cover"} print:h-auto print:max-h-[6.5in] print:w-auto print:max-w-full print:object-contain`}
        />
        <span className="absolute right-1.5 bottom-1.5 inline-flex size-7 items-center justify-center rounded-full bg-base/80 text-fg backdrop-blur group-hover:bg-base print:hidden">
          <Maximize2 aria-hidden="true" className="size-3.5" />
        </span>
      </button>

      {expanded
        ? createPortal(
            <div
              role="dialog"
              aria-modal="true"
              aria-label={`Expanded ${alt}`}
              className="authenticated-app fixed inset-0 z-50 flex items-center justify-center bg-fg/90 p-4 sm:p-8"
              onMouseDown={(event) => {
                if (event.target === event.currentTarget) setExpanded(false);
              }}
            >
              <div className="relative flex max-h-full max-w-full items-center justify-center">
                {/* Authenticated and local object URLs cannot use Next image optimization. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageSource}
                  alt={alt}
                  width={width}
                  height={height}
                  decoding="async"
                  onError={onError}
                  className="max-h-[calc(100dvh-2rem)] max-w-[calc(100vw-2rem)] rounded-xl object-contain sm:max-h-[calc(100dvh-4rem)] sm:max-w-[calc(100vw-4rem)]"
                />
                <button
                  ref={closeButtonRef}
                  type="button"
                  aria-label="Close expanded photo"
                  className="absolute top-2 right-2 inline-flex size-11 items-center justify-center rounded-full bg-fg text-base shadow-lift outline-none hover:bg-[#3d3157] focus-visible:ring-2 focus-visible:ring-live-bright focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                  onClick={() => setExpanded(false)}
                >
                  <X aria-hidden="true" className="size-5" />
                </button>
              </div>
            </div>,
            document.body
          )
        : null}
    </>
  );
}

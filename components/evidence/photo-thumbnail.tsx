"use client";

import { Maximize2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

type PhotoThumbnailProps = {
  alt: string;
  className?: string;
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
        className={`group relative block size-24 shrink-0 overflow-hidden rounded-md border border-border bg-muted/20 outline-none focus-visible:ring-3 focus-visible:ring-ring/30 sm:size-28 print:pointer-events-none print:h-auto print:max-h-[6.5in] print:w-auto print:max-w-full ${className}`}
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
          className="size-full object-cover print:h-auto print:max-h-[6.5in] print:w-auto print:max-w-full print:object-contain"
        />
        <span className="absolute right-1.5 bottom-1.5 inline-flex size-7 items-center justify-center rounded-md bg-foreground/85 text-background shadow-sm group-hover:bg-foreground print:hidden">
          <Maximize2 aria-hidden="true" className="size-3.5" />
        </span>
      </button>

      {expanded
        ? createPortal(
            <div
              role="dialog"
              aria-modal="true"
              aria-label={`Expanded ${alt}`}
              className="authenticated-app fixed inset-0 z-50 flex items-center justify-center bg-foreground/85 p-4 sm:p-8"
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
                  className="max-h-[calc(100dvh-2rem)] max-w-[calc(100vw-2rem)] rounded-md bg-card object-contain sm:max-h-[calc(100dvh-4rem)] sm:max-w-[calc(100vw-4rem)]"
                />
                <button
                  ref={closeButtonRef}
                  type="button"
                  aria-label="Close expanded photo"
                  className="absolute top-2 right-2 inline-flex size-11 items-center justify-center rounded-md bg-card text-foreground shadow-sm outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/40"
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

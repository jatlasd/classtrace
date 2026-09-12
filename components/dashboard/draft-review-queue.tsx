"use client";

import { ChevronDown, Image as ImageIcon, X } from "lucide-react";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  type ReactNode,
} from "react";

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled]):not([tabindex='-1'])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

export type DraftReviewQueueItem = {
  id: string;
  studentLabel: string;
  note: string;
  filing: string;
  timestamp: string;
  needsCorrection: boolean;
  hasPhoto: boolean;
};

type DraftReviewQueueProps = {
  items: DraftReviewQueueItem[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activeDraftId: string | null;
  onActiveDraftChange: (id: string | null) => void;
  renderReview: (id: string) => ReactNode;
};

export function DraftReviewQueue({
  items,
  open,
  onOpenChange,
  activeDraftId,
  onActiveDraftChange,
  renderReview,
}: DraftReviewQueueProps) {
  const panelId = useId();
  const titleId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const visibleOpen = open && items.length > 0;

  const closeQueue = useCallback(() => {
    onOpenChange(false);
    triggerRef.current?.focus();
  }, [onOpenChange]);

  useEffect(() => {
    if (!visibleOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusTimer = window.setTimeout(
      () => closeButtonRef.current?.focus(),
      0
    );

    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === "Escape") {
        event.preventDefault();
        closeQueue();
        return;
      }

      if (event.key !== "Tab") return;

      const focusableElements = Array.from(
        dialogRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR) ?? []
      );
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.clearTimeout(focusTimer);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeQueue, visibleOpen]);

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="relative z-30 mt-3 flex justify-end">
      <button
        ref={triggerRef}
        type="button"
        aria-label={`Drafts to review, ${items.length}`}
        aria-haspopup="dialog"
        aria-expanded={visibleOpen}
        aria-controls={panelId}
        onClick={() => onOpenChange(!open)}
        className="inline-flex min-h-10 items-center gap-2 rounded-full border border-line-2 bg-plate px-3.5 text-sm font-semibold text-fg shadow-sm outline-none transition-colors hover:bg-well focus-visible:ring-2 focus-visible:ring-live-bright focus-visible:ring-offset-2 focus-visible:ring-offset-base"
      >
        Drafts to review
        <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-live-bright px-1.5 py-0.5 text-xs tabular-nums text-live-fg">
          {items.length}
        </span>
        <ChevronDown
          aria-hidden="true"
          className={`size-4 transition-transform ${visibleOpen ? "rotate-180" : ""}`}
        />
      </button>

      <div hidden={!visibleOpen}>
        <button
          type="button"
          tabIndex={-1}
          aria-label="Dismiss drafts to review"
          onClick={closeQueue}
          className="fixed inset-0 z-40 bg-fg/35 sm:bg-transparent"
        />
        <section
          ref={dialogRef}
          id={panelId}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          className="fixed inset-x-0 bottom-0 z-50 flex max-h-[88dvh] flex-col rounded-t-3xl border-t border-line bg-plate pb-[env(safe-area-inset-bottom)] shadow-lift sm:absolute sm:inset-x-auto sm:bottom-auto sm:right-0 sm:top-[calc(100%+0.5rem)] sm:max-h-[min(72dvh,46rem)] sm:w-[min(42rem,calc(100vw-3rem))] sm:rounded-xl sm:border"
        >
            <header className="flex shrink-0 items-center justify-between gap-4 border-b border-line px-4 py-3 sm:px-5">
              <div>
                <h2
                  id={titleId}
                  className="font-display text-xl font-semibold text-fg"
                >
                  Drafts to review
                </h2>
                <p className="mt-0.5 text-xs text-fg-3">
                  {items.length === 1 ? "1 draft" : `${items.length} drafts`} ·
                  clears at midnight
                </p>
              </div>
              <button
                ref={closeButtonRef}
                type="button"
                aria-label="Close drafts to review"
                onClick={closeQueue}
                className="flex size-10 items-center justify-center rounded-full text-fg-2 outline-none transition-colors hover:bg-well hover:text-fg focus-visible:ring-2 focus-visible:ring-live-bright focus-visible:ring-offset-2 focus-visible:ring-offset-plate"
              >
                <X aria-hidden="true" className="size-5" />
              </button>
            </header>

            <ul className="min-h-0 overflow-y-auto overscroll-contain">
              {items.map((item) => {
                const expanded = activeDraftId === item.id;
                const reviewId = `${panelId}-${item.id}`;

                return (
                  <li key={item.id} className="border-b border-line last:border-b-0">
                    <button
                      type="button"
                      aria-expanded={expanded}
                      aria-controls={reviewId}
                      onClick={() =>
                        onActiveDraftChange(expanded ? null : item.id)
                      }
                      className="block w-full px-4 py-3 text-left outline-none transition-colors hover:bg-well/70 focus-visible:bg-live-soft focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-live-bright sm:px-5"
                    >
                      <span className="flex items-center justify-between gap-3">
                        <span className="min-w-0 truncate text-sm font-semibold text-fg">
                          {item.studentLabel}
                        </span>
                        <span className="flex shrink-0 items-center gap-2">
                          {item.hasPhoto ? (
                            <ImageIcon
                              aria-label="Photo included"
                              className="size-3.5 text-fg-3"
                            />
                          ) : null}
                          {item.needsCorrection ? (
                            <span className="rounded-full bg-danger-soft px-2 py-0.5 text-[11px] font-semibold text-danger">
                              Needs correction
                            </span>
                          ) : null}
                          <span className="text-xs text-fg-3">
                            {item.timestamp}
                          </span>
                        </span>
                      </span>
                      <span className="mt-1.5 line-clamp-2 break-words text-sm leading-snug text-fg [overflow-wrap:anywhere]">
                        {item.note}
                      </span>
                      {item.filing ? (
                        <span className="mt-1.5 block truncate text-xs text-fg-3">
                          {item.filing}
                        </span>
                      ) : null}
                    </button>
                    <div id={reviewId} hidden={!expanded}>
                      {renderReview(item.id)}
                    </div>
                  </li>
                );
              })}
            </ul>
        </section>
      </div>
    </div>
  );
}

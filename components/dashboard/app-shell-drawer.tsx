"use client";

import { LogOut, Menu, X } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { BrandLockup } from "@/components/layout/brand-lockup";
import { routes } from "@/lib/routes";

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled]):not([tabindex='-1'])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

const TRUST_LINKS = [
  { label: "Privacy", href: routes.privacy },
  { label: "Beta terms", href: routes.terms },
  { label: "Support", href: routes.support },
  { label: "Account deletion", href: routes.dataDeletion },
] as const;

type AppShellDrawerProps = {
  isSigningOut: boolean;
  onSignOut: () => void;
};

export function AppShellDrawer({ isSigningOut, onSignOut }: AppShellDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dialogTitleId = useId();
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  const closeMenu = useCallback(() => {
    setIsOpen(false);
    menuButtonRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusTimer = window.setTimeout(() => closeButtonRef.current?.focus(), 0);

    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === "Escape") {
        event.preventDefault();
        closeMenu();
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
  }, [closeMenu, isOpen]);

  return (
    <>
      <button
        ref={menuButtonRef}
        type="button"
        aria-label="Open navigation menu"
        aria-controls="mobile-app-navigation"
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        onClick={() => setIsOpen(true)}
        className="flex size-11 shrink-0 items-center justify-center rounded-full text-fg outline-none transition-colors hover:bg-plate focus-visible:ring-2 focus-visible:ring-live-bright focus-visible:ring-offset-2 focus-visible:ring-offset-base lg:hidden"
      >
        <Menu aria-hidden="true" className="size-5" strokeWidth={2} />
      </button>

      {isOpen ? (
        <div
          ref={dialogRef}
          id="mobile-app-navigation"
          role="dialog"
          aria-modal="true"
          aria-labelledby={dialogTitleId}
          className="app-shell-mobile-dialog fixed inset-0 z-[70] lg:hidden"
        >
          <button
            type="button"
            tabIndex={-1}
            aria-label="Dismiss navigation menu"
            onClick={closeMenu}
            className="app-shell-drawer-backdrop absolute inset-0 bg-fg/50"
          />
          <div className="app-shell-drawer-panel absolute inset-x-0 bottom-0 flex max-h-[88dvh] flex-col rounded-t-3xl border-t border-line bg-plate pb-[env(safe-area-inset-bottom)] shadow-lift">
            <div className="flex h-16 items-center justify-between gap-4 px-5">
              <h2 id={dialogTitleId} className="font-display text-xl font-semibold text-fg">
                Navigation
              </h2>
              <button
                ref={closeButtonRef}
                type="button"
                aria-label="Close navigation menu"
                onClick={closeMenu}
                className="flex size-11 items-center justify-center rounded-full text-fg outline-none transition-colors hover:bg-well focus-visible:ring-2 focus-visible:ring-live-bright focus-visible:ring-offset-2 focus-visible:ring-offset-plate"
              >
                <X aria-hidden="true" className="size-5" strokeWidth={2} />
              </button>
            </div>

            <div className="overflow-y-auto px-5 pb-6">
              <BrandLockup size="sm" />
              <p className="mt-1 text-sm text-fg-2">
                One teacher. One workspace. Nothing saves until you review it.
              </p>

              <nav aria-label="Trust and support" className="mt-5">
                <ul className="divide-y divide-line border-y border-line">
                  {TRUST_LINKS.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={closeMenu}
                        className="flex min-h-12 items-center text-[15px] font-medium text-fg outline-none hover:text-fg-2 focus-visible:ring-2 focus-visible:ring-live-bright focus-visible:ring-inset"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>

              <button
                type="button"
                disabled={isSigningOut}
                onClick={onSignOut}
                className="mt-5 flex min-h-12 w-full items-center justify-center gap-3 rounded-full border border-line-2 px-3 text-sm font-semibold text-fg outline-none transition-colors hover:bg-well focus-visible:ring-2 focus-visible:ring-live-bright focus-visible:ring-offset-2 focus-visible:ring-offset-plate disabled:cursor-wait disabled:opacity-60"
              >
                <LogOut aria-hidden="true" className="size-4" strokeWidth={1.8} />
                <span>{isSigningOut ? "Signing out…" : "Sign out"}</span>
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

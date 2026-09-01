"use client";

import { LogOut, Menu, X } from "lucide-react";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import {
  APP_NAVIGATION_ITEMS,
  getAppRouteLabel,
  isAppNavigationItemActive,
} from "@/components/dashboard/app-navigation";
import { BrandLockup } from "@/components/layout/brand-lockup";
import { routes } from "@/lib/routes";

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled]):not([tabindex='-1'])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

type MobileAppHeaderProps = {
  isSigningOut: boolean;
  onSignOut: () => void;
  pathname: string;
};

export function MobileAppHeader({
  isSigningOut,
  onSignOut,
  pathname,
}: MobileAppHeaderProps) {
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

  const routeLabel = getAppRouteLabel(pathname);

  return (
    <>
      <header className="app-shell-mobile-header sticky top-0 z-50 flex min-h-16 items-center justify-between gap-3 border-b border-sidebar-border bg-sidebar px-4 pt-[env(safe-area-inset-top)] text-sidebar-foreground lg:hidden">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href={routes.feed}
            aria-label="ClassTrace capture"
            className="shrink-0 rounded-md outline-none focus-visible:ring-3 focus-visible:ring-sidebar-ring/50"
          >
            <BrandLockup size="sm" />
          </Link>
          <span aria-hidden="true" className="h-5 w-px shrink-0 bg-sidebar-border" />
          <span className="truncate text-xs font-semibold text-sidebar-foreground/72">
            {routeLabel}
          </span>
        </div>
        <button
          ref={menuButtonRef}
          type="button"
          aria-label="Open navigation menu"
          aria-controls="mobile-app-navigation"
          aria-expanded={isOpen}
          aria-haspopup="dialog"
          onClick={() => setIsOpen(true)}
          className="flex size-11 shrink-0 items-center justify-center rounded-md text-sidebar-foreground outline-none transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-3 focus-visible:ring-sidebar-ring/50"
        >
          <Menu aria-hidden="true" className="size-5" strokeWidth={2} />
        </button>
      </header>

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
            className="app-shell-drawer-backdrop absolute inset-0 bg-foreground/55"
          />
          <div className="app-shell-drawer-panel relative flex h-full w-[min(88vw,340px)] flex-col border-r border-sidebar-border bg-sidebar pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)] text-sidebar-foreground shadow-floating">
            <div className="flex h-16 items-center justify-between gap-4 border-b border-sidebar-border px-4">
              <h2 id={dialogTitleId} className="text-base font-semibold text-sidebar-primary">
                Navigation
              </h2>
              <button
                ref={closeButtonRef}
                type="button"
                aria-label="Close navigation menu"
                onClick={closeMenu}
                className="flex size-11 items-center justify-center rounded-md text-sidebar-foreground outline-none transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-3 focus-visible:ring-sidebar-ring/50"
              >
                <X aria-hidden="true" className="size-5" strokeWidth={2} />
              </button>
            </div>

            <nav aria-label="Primary" className="flex-1 overflow-y-auto px-3 py-5">
              <div className="space-y-1">
                {APP_NAVIGATION_ITEMS.map((item) => {
                  const active = isAppNavigationItemActive(pathname, item.match);

                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      onClick={closeMenu}
                      className={`flex min-h-12 items-center gap-3 rounded-md border px-3 text-sm font-semibold outline-none transition-colors focus-visible:ring-3 focus-visible:ring-sidebar-ring/50 ${
                        active
                          ? "border-sidebar-ring bg-sidebar-accent text-sidebar-accent-foreground"
                          : "border-transparent text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
                      }`}
                    >
                      <item.icon
                        aria-hidden="true"
                        className={`size-5 shrink-0 ${active ? "text-primary" : ""}`}
                        strokeWidth={active ? 2.2 : 1.8}
                      />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </nav>

            <div className="border-t border-sidebar-border px-4 py-4">
              <nav aria-label="Trust and support" className="grid grid-cols-2 gap-x-4 gap-y-1">
                <Link href={routes.privacy} onClick={closeMenu} className="flex min-h-11 items-center text-xs font-medium text-sidebar-foreground/68 outline-none hover:text-sidebar-primary focus-visible:ring-3 focus-visible:ring-sidebar-ring/50">
                  Privacy
                </Link>
                <Link href={routes.terms} onClick={closeMenu} className="flex min-h-11 items-center text-xs font-medium text-sidebar-foreground/68 outline-none hover:text-sidebar-primary focus-visible:ring-3 focus-visible:ring-sidebar-ring/50">
                  Beta terms
                </Link>
                <Link href={routes.support} onClick={closeMenu} className="flex min-h-11 items-center text-xs font-medium text-sidebar-foreground/68 outline-none hover:text-sidebar-primary focus-visible:ring-3 focus-visible:ring-sidebar-ring/50">
                  Support
                </Link>
                <Link href={routes.dataDeletion} onClick={closeMenu} className="flex min-h-11 items-center text-xs font-medium text-sidebar-foreground/68 outline-none hover:text-sidebar-primary focus-visible:ring-3 focus-visible:ring-sidebar-ring/50">
                  Account deletion
                </Link>
              </nav>
              <button
                type="button"
                disabled={isSigningOut}
                onClick={onSignOut}
                className="mt-3 flex min-h-12 w-full items-center gap-3 rounded-md border border-sidebar-border px-3 text-sm font-semibold text-sidebar-foreground outline-none transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-3 focus-visible:ring-sidebar-ring/50 disabled:cursor-wait disabled:opacity-60"
              >
                <LogOut aria-hidden="true" className="size-5" strokeWidth={1.8} />
                <span>{isSigningOut ? "Signing out…" : "Sign out"}</span>
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

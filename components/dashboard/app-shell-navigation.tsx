"use client";

import { useClerk } from "@clerk/nextjs";
import { LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getAppRouteLabel } from "@/components/dashboard/app-navigation";
import { AppShellDrawer } from "@/components/dashboard/app-shell-drawer";
import { AppTabBar } from "@/components/dashboard/app-tab-bar";
import { BrandLockup } from "@/components/layout/brand-lockup";
import {
  clearTemporaryEvidenceDrafts,
  subscribeToTemporaryDraftCleanup,
} from "@/lib/evidence/temporary-draft-cleanup";
import { routes } from "@/lib/routes";

function routeContextFor(pathname: string): string | null {
  if (pathname === routes.feed) return "All evidence";
  if (pathname === routes.explore) return "Saved evidence";
  if (pathname === routes.roster) return "All classes";
  if (pathname === routes.settings) return "Account";
  if (pathname.endsWith("/report")) return "Printable evidence";
  if (pathname.startsWith(`${routes.studentsPrefix}/`)) return "Evidence";
  return null;
}

export function AppShellNavigation() {
  const pathname = usePathname();
  const { signOut } = useClerk();
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => subscribeToTemporaryDraftCleanup(), []);

  async function handleSignOut(): Promise<void> {
    if (isSigningOut) return;

    setIsSigningOut(true);
    try {
      await clearTemporaryEvidenceDrafts();
      await signOut({ redirectUrl: routes.root });
    } catch {
      setIsSigningOut(false);
    }
  }

  const isFeed = pathname === routes.feed;
  const routeContext = routeContextFor(pathname);

  return (
    <div className={`app-shell-navigation ${isFeed ? "app-shell-feed-navigation" : ""}`}>
      <header className="sticky top-0 z-50 bg-base/95 pt-[env(safe-area-inset-top)]">
        <div className="mx-auto flex min-h-14 max-w-[1240px] items-center justify-between gap-4 px-4 sm:px-6 lg:min-h-[4.5rem] lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              href={routes.feed}
              aria-label="ClassTrace capture"
              className="shrink-0 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-live-bright focus-visible:ring-offset-4 focus-visible:ring-offset-base"
            >
              <BrandLockup size="sm" className="lg:[&_[data-slot=brand-wordmark]]:sr-only" />
            </Link>
            {!isFeed ? (
              <span className="label truncate text-fg-3 lg:hidden">
                {getAppRouteLabel(pathname)}
              </span>
            ) : null}
          </div>

          <AppTabBar pathname={pathname} />

          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              disabled={isSigningOut}
              onClick={() => void handleSignOut()}
              className="hidden h-9 items-center gap-2 rounded-full px-3 text-[13px] font-medium text-fg-3 outline-none transition-colors hover:bg-plate hover:text-fg focus-visible:ring-2 focus-visible:ring-live-bright focus-visible:ring-offset-2 focus-visible:ring-offset-base disabled:cursor-wait disabled:opacity-60 lg:inline-flex"
            >
              <LogOut aria-hidden="true" className="size-3.5" strokeWidth={2} />
              <span>{isSigningOut ? "Signing out…" : "Sign out"}</span>
            </button>
            <AppShellDrawer
              isSigningOut={isSigningOut}
              onSignOut={() => void handleSignOut()}
            />
          </div>
        </div>
      </header>

      {!isFeed && routeContext ? (
        <p className="app-shell-route-header sr-only">
          {getAppRouteLabel(pathname)} <span>{routeContext}</span>
        </p>
      ) : null}
    </div>
  );
}

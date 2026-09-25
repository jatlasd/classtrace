"use client";

import { useClerk } from "@clerk/nextjs";
import { LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getAppRouteLabel } from "@/components/dashboard/app-navigation";
import { AppPrimaryNavigation } from "@/components/dashboard/app-primary-navigation";
import { AppShellDrawer } from "@/components/dashboard/app-shell-drawer";
import { BrandLockup } from "@/components/layout/brand-lockup";
import { StudentQuickJump } from "@/components/students/student-quick-jump";
import {
  clearTemporaryEvidenceDrafts,
  subscribeToTemporaryDraftCleanup,
} from "@/lib/evidence/temporary-draft-cleanup";
import {
  loadSessionDrafts,
  nextLocalMidnight,
  subscribeToSessionDraftChanges,
} from "@/lib/evidence/session-draft-storage";
import { routes } from "@/lib/routes";

function routeContextFor(pathname: string): string | null {
  if (pathname === routes.feed) return "Saved evidence";
  if (pathname === routes.explore) return "Saved evidence";
  if (pathname === routes.roster) return "All classes";
  if (pathname === routes.settings) return "Account";
  if (pathname.endsWith("/report")) return "Printable evidence";
  if (pathname.startsWith(`${routes.studentsPrefix}/`)) return "Evidence";
  return null;
}

type AppShellNavigationProps = {
  workspaceId: string;
};

export function AppShellNavigation({ workspaceId }: AppShellNavigationProps) {
  const pathname = usePathname();
  const { signOut } = useClerk();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [draftCount, setDraftCount] = useState(0);

  useEffect(() => subscribeToTemporaryDraftCleanup(), []);

  useEffect(() => {
    let midnightTimer: number | undefined;

    function syncDraftCount(): void {
      let storage: Storage | null = null;
      try {
        storage = window.sessionStorage;
      } catch {
        // A blocked storage API behaves like an empty session draft queue.
      }
      setDraftCount(loadSessionDrafts(storage, workspaceId).drafts.length);
    }

    function scheduleMidnightSync(): void {
      const now = Date.now();
      const delay = Math.max(0, nextLocalMidnight(now) - now + 50);
      midnightTimer = window.setTimeout(() => {
        syncDraftCount();
        scheduleMidnightSync();
      }, delay);
    }

    function handleVisibilityChange(): void {
      if (document.visibilityState === "visible") {
        syncDraftCount();
      }
    }

    syncDraftCount();
    scheduleMidnightSync();
    const unsubscribe = subscribeToSessionDraftChanges(syncDraftCount);
    window.addEventListener("focus", syncDraftCount);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      if (midnightTimer !== undefined) {
        window.clearTimeout(midnightTimer);
      }
      unsubscribe();
      window.removeEventListener("focus", syncDraftCount);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [workspaceId]);

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
      <header className="sticky top-0 z-50 border-b border-line bg-base/95 pt-[env(safe-area-inset-top)]">
        <div className="mx-auto flex min-h-14 max-w-[1240px] items-center justify-between gap-4 px-4 sm:px-6 lg:min-h-16 lg:px-8">
          <div className="flex min-w-0 items-center gap-3 lg:gap-8">
            <Link
              href={routes.feed}
              aria-label="ClassTrace capture"
              className="shrink-0 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-live-bright focus-visible:ring-offset-4 focus-visible:ring-offset-base"
            >
              <BrandLockup size="sm" />
            </Link>
            {!isFeed ? (
              <span className="label truncate text-fg-3 lg:hidden">
                {getAppRouteLabel(pathname)}
              </span>
            ) : null}
            <AppPrimaryNavigation pathname={pathname} draftCount={draftCount} />
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <div className="hidden w-52 lg:block xl:w-64">
              <StudentQuickJump label="Student quick-jump" showLabel={false} />
            </div>
            <button
              type="button"
              disabled={isSigningOut}
              onClick={() => void handleSignOut()}
              className="hidden h-9 shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-3 text-[13px] font-medium text-fg-3 outline-none transition-colors hover:bg-plate hover:text-fg focus-visible:ring-2 focus-visible:ring-live-bright focus-visible:ring-offset-2 focus-visible:ring-offset-base disabled:cursor-wait disabled:opacity-60 lg:inline-flex"
            >
              <LogOut aria-hidden="true" className="size-3.5" strokeWidth={2} />
              <span>{isSigningOut ? "Signing out…" : "Sign out"}</span>
            </button>
            <AppShellDrawer
              draftCount={draftCount}
              pathname={pathname}
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

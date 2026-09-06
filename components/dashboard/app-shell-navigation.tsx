"use client";

import { useClerk } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getAppRouteLabel } from "@/components/dashboard/app-navigation";
import { DesktopAppSidebar } from "@/components/dashboard/desktop-app-sidebar";
import { MobileAppHeader } from "@/components/dashboard/mobile-app-header";
import {
  clearTemporaryEvidenceDrafts,
  subscribeToTemporaryDraftCleanup,
} from "@/lib/evidence/temporary-draft-cleanup";
import { routes } from "@/lib/routes";

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

  const routeContext =
    pathname === routes.feed
      ? "All evidence"
      : pathname === routes.explore
        ? "Saved evidence"
      : pathname === routes.roster
        ? "All classes"
        : pathname === routes.settings
          ? "Account"
          : pathname.endsWith("/report")
            ? "Printable evidence"
            : pathname.startsWith(`${routes.studentsPrefix}/`)
              ? "Evidence"
              : null;

  return (
    <div className={`app-shell-navigation ${pathname === routes.feed ? "app-shell-feed-navigation" : ""}`}>
      <DesktopAppSidebar
        pathname={pathname}
        isSigningOut={isSigningOut}
        onSignOut={() => void handleSignOut()}
      />
      <MobileAppHeader
        pathname={pathname}
        isSigningOut={isSigningOut}
        onSignOut={() => void handleSignOut()}
      />
      {pathname !== routes.feed ? <header className="app-shell-route-header fixed left-52 right-0 top-0 z-40 hidden h-14 items-center border-b border-border bg-card/95 px-5 backdrop-blur lg:flex">
        <p className="text-sm font-semibold text-foreground">
          {getAppRouteLabel(pathname)}
        </p>
        {routeContext ? (
          <p className="ml-4 border-l border-border pl-4 text-sm font-medium text-muted-foreground">
            {routeContext}
          </p>
        ) : null}
      </header> : null}
    </div>
  );
}

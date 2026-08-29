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

  return (
    <div className="app-shell-navigation">
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
      <header className="app-shell-route-header fixed left-[232px] right-0 top-0 z-40 hidden h-14 items-center border-b border-border bg-card/95 px-6 backdrop-blur lg:flex">
        <p className="text-sm font-semibold text-foreground">
          {getAppRouteLabel(pathname)}
        </p>
      </header>
    </div>
  );
}

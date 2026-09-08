"use client";

import { useClerk } from "@clerk/nextjs";
import { LogOut } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/routes";
import { clearTemporaryEvidenceDrafts } from "@/lib/evidence/temporary-draft-cleanup";

export function SettingsSignOutAction() {
  const { signOut } = useClerk();
  const [isSigningOut, setIsSigningOut] = useState(false);

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
    <Button
      type="button"
      variant="outline"
      size="lg"
      aria-label="Sign out of ClassTrace"
      className="h-9 rounded-sm px-5 text-sm font-semibold"
      disabled={isSigningOut}
      onClick={() => void handleSignOut()}
    >
      <LogOut className="size-4" strokeWidth={1.75} />
      Sign out
    </Button>
  );
}

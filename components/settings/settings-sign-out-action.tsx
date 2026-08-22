"use client";

import { SignOutButton } from "@clerk/nextjs";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/routes";
import { clearSessionDrafts } from "@/lib/evidence/session-draft-storage";
import { clearAllPhotoDrafts } from "@/lib/evidence/photo-draft-storage";

export function SettingsSignOutAction() {
  function clearTemporaryDraftAccess(): void {
    try {
      clearSessionDrafts(window.sessionStorage);
    } catch {
      clearSessionDrafts(null);
    }
    void clearAllPhotoDrafts();
  }

  return (
    <SignOutButton redirectUrl={routes.root}>
      <Button
        type="button"
        variant="outline"
        size="lg"
        aria-label="Sign out of ClassTrace"
        className="h-9 rounded-lg px-5 text-sm font-semibold"
        onClick={clearTemporaryDraftAccess}
      >
        <LogOut className="size-4" strokeWidth={1.75} />
        Sign out
      </Button>
    </SignOutButton>
  );
}

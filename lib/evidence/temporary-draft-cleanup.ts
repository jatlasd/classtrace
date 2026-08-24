import { clearAllPhotoDrafts } from "@/lib/evidence/photo-draft-storage";
import { clearSessionDrafts } from "@/lib/evidence/session-draft-storage";

const CLEANUP_SIGNAL_KEY = "classtrace:temporary-draft-cleanup";

function clearCurrentTabSessionDrafts(): void {
  try {
    clearSessionDrafts(window.sessionStorage);
  } catch {
    clearSessionDrafts(null);
  }
}

function notifyOtherTabs(): void {
  try {
    window.localStorage.setItem(
      CLEANUP_SIGNAL_KEY,
      `${Date.now()}:${crypto.randomUUID()}`
    );
  } catch {
    // Current-tab cleanup still completes when cross-tab signaling is blocked.
  }
}

export async function clearTemporaryEvidenceDrafts(
  notifyTabs = true
): Promise<void> {
  clearCurrentTabSessionDrafts();
  if (notifyTabs) notifyOtherTabs();

  await clearAllPhotoDrafts();
}

export function subscribeToTemporaryDraftCleanup(): () => void {
  function handleStorage(event: StorageEvent): void {
    if (event.key !== CLEANUP_SIGNAL_KEY || !event.newValue) return;

    void clearTemporaryEvidenceDrafts(false);
  }

  window.addEventListener("storage", handleStorage);
  return () => window.removeEventListener("storage", handleStorage);
}

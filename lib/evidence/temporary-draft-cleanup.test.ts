// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  clearAllPhotoDrafts: vi.fn(),
  clearSessionDrafts: vi.fn(),
}));

vi.mock("@/lib/evidence/photo-draft-storage", () => ({
  clearAllPhotoDrafts: mocks.clearAllPhotoDrafts,
}));
vi.mock("@/lib/evidence/session-draft-storage", () => ({
  clearSessionDrafts: mocks.clearSessionDrafts,
}));

import {
  clearTemporaryEvidenceDrafts,
  subscribeToTemporaryDraftCleanup,
} from "./temporary-draft-cleanup";

describe("clearTemporaryEvidenceDrafts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
    mocks.clearAllPhotoDrafts.mockResolvedValue(undefined);
  });

  it("clears raw-note manifests and encrypted photo drafts before resolving", async () => {
    await clearTemporaryEvidenceDrafts();

    expect(mocks.clearSessionDrafts).toHaveBeenCalledWith(window.sessionStorage);
    expect(mocks.clearAllPhotoDrafts).toHaveBeenCalledOnce();
  });

  it("clears the current tab when another tab broadcasts sign-out", () => {
    const unsubscribe = subscribeToTemporaryDraftCleanup();

    window.dispatchEvent(
      new StorageEvent("storage", {
        key: "classtrace:temporary-draft-cleanup",
        newValue: "remote-sign-out",
      })
    );

    expect(mocks.clearSessionDrafts).toHaveBeenCalledWith(window.sessionStorage);
    expect(mocks.clearAllPhotoDrafts).toHaveBeenCalledOnce();
    unsubscribe();
  });
});

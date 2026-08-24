// @vitest-environment jsdom

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  clearTemporaryEvidenceDrafts: vi.fn(),
  signOut: vi.fn(),
  subscribeToTemporaryDraftCleanup: vi.fn(() => vi.fn()),
}));

vi.mock("@clerk/nextjs", () => ({
  useClerk: () => ({ signOut: mocks.signOut }),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/app/feed",
}));

vi.mock("@/lib/evidence/temporary-draft-cleanup", () => ({
  clearTemporaryEvidenceDrafts: mocks.clearTemporaryEvidenceDrafts,
  subscribeToTemporaryDraftCleanup: mocks.subscribeToTemporaryDraftCleanup,
}));

import { AppTopNav } from "./app-top-nav";

describe("AppTopNav", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.clearTemporaryEvidenceDrafts.mockResolvedValue(undefined);
    mocks.signOut.mockResolvedValue(undefined);
  });

  it("awaits temporary cleanup before signing out from both controls", async () => {
    const firstRender = render(<AppTopNav />);

    fireEvent.click(screen.getAllByRole("button", {
      name: "Sign out",
    })[0]);
    await waitFor(() => expect(mocks.signOut).toHaveBeenCalledTimes(1));
    firstRender.unmount();

    render(<AppTopNav />);
    fireEvent.click(screen.getAllByRole("button", { name: "Sign out" })[1]);
    await waitFor(() => expect(mocks.signOut).toHaveBeenCalledTimes(2));

    expect(mocks.clearTemporaryEvidenceDrafts).toHaveBeenCalledTimes(2);
    expect(mocks.signOut).toHaveBeenNthCalledWith(1, { redirectUrl: "/" });
    expect(mocks.subscribeToTemporaryDraftCleanup).toHaveBeenCalledTimes(2);
  });
});

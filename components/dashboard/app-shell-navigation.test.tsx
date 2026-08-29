// @vitest-environment jsdom

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  clearTemporaryEvidenceDrafts: vi.fn(),
  pathname: "/app/feed",
  signOut: vi.fn(),
  subscribeToTemporaryDraftCleanup: vi.fn(() => vi.fn()),
}));

vi.mock("@clerk/nextjs", () => ({
  useClerk: () => ({ signOut: mocks.signOut }),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => mocks.pathname,
}));

vi.mock("@/lib/evidence/temporary-draft-cleanup", () => ({
  clearTemporaryEvidenceDrafts: mocks.clearTemporaryEvidenceDrafts,
  subscribeToTemporaryDraftCleanup: mocks.subscribeToTemporaryDraftCleanup,
}));

import { AppShellNavigation } from "./app-shell-navigation";

afterEach(() => {
  cleanup();
  document.body.style.overflow = "";
});

describe("AppShellNavigation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.pathname = "/app/feed";
    mocks.clearTemporaryEvidenceDrafts.mockResolvedValue(undefined);
    mocks.signOut.mockResolvedValue(undefined);
  });

  it("renders only real primary destinations with the current route active", () => {
    render(<AppShellNavigation />);

    expect(
      screen.getAllByRole("link", { name: "Capture" })[0].getAttribute(
        "aria-current"
      )
    ).toBe("page");
    expect(
      screen.getAllByRole("link", { name: "Students" })[0].hasAttribute(
        "aria-current"
      )
    ).toBe(false);
    expect(screen.getAllByText("Evidence feed").length).toBeGreaterThan(0);
    expect(screen.queryByRole("link", { name: "Dashboard" })).toBeNull();
    expect(screen.queryByRole("link", { name: "Reports" })).toBeNull();
  });

  it("contains focus in the mobile drawer and restores focus on Escape", async () => {
    render(<AppShellNavigation />);

    const trigger = screen.getByRole("button", {
      name: "Open navigation menu",
    });
    fireEvent.click(trigger);

    const dialog = screen.getByRole("dialog", { name: "Navigation" });
    const closeButton = within(dialog).getByRole("button", {
      name: "Close navigation menu",
    });
    const signOutButton = within(dialog).getByRole("button", {
      name: "Sign out",
    });

    expect(document.body.style.overflow).toBe("hidden");
    await waitFor(() => expect(document.activeElement).toBe(closeButton));

    signOutButton.focus();
    fireEvent.keyDown(document, { key: "Tab" });
    expect(document.activeElement).toBe(closeButton);

    closeButton.focus();
    fireEvent.keyDown(document, { key: "Tab", shiftKey: true });
    expect(document.activeElement).toBe(signOutButton);

    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog", { name: "Navigation" })).toBeNull();
    expect(document.activeElement).toBe(trigger);
    expect(document.body.style.overflow).toBe("");
  });

  it("closes the drawer from the backdrop and exposes trust links", () => {
    render(<AppShellNavigation />);

    fireEvent.click(
      screen.getByRole("button", { name: "Open navigation menu" })
    );
    const dialog = screen.getByRole("dialog", { name: "Navigation" });

    expect(
      within(dialog).getByRole("navigation", { name: "Trust and support" })
    ).toBeTruthy();
    fireEvent.click(
      within(dialog).getByRole("button", {
        name: "Dismiss navigation menu",
      })
    );

    expect(screen.queryByRole("dialog", { name: "Navigation" })).toBeNull();
  });

  it("awaits temporary cleanup before signing out from desktop and mobile", async () => {
    const firstRender = render(<AppShellNavigation />);

    fireEvent.click(screen.getByRole("button", { name: "Sign out" }));
    await waitFor(() => expect(mocks.signOut).toHaveBeenCalledTimes(1));
    firstRender.unmount();

    render(<AppShellNavigation />);
    fireEvent.click(
      screen.getByRole("button", { name: "Open navigation menu" })
    );
    fireEvent.click(
      within(screen.getByRole("dialog", { name: "Navigation" })).getByRole(
        "button",
        { name: "Sign out" }
      )
    );
    await waitFor(() => expect(mocks.signOut).toHaveBeenCalledTimes(2));

    expect(mocks.clearTemporaryEvidenceDrafts).toHaveBeenCalledTimes(2);
    expect(mocks.signOut).toHaveBeenNthCalledWith(1, { redirectUrl: "/" });
    expect(mocks.subscribeToTemporaryDraftCleanup).toHaveBeenCalledTimes(2);
  });
});

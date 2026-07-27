// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getCurrentAppWorkspace: vi.fn(),
}));

vi.mock("@/components/dashboard/app-top-nav", () => ({
  AppTopNav: () => <header>Application navigation</header>,
}));
vi.mock("@/components/auth/class-trace-clerk-provider", () => ({
  ClassTraceClerkProvider: ({ children }: { children: React.ReactNode }) =>
    children,
}));
vi.mock("@/lib/auth/get-current-workspace", () => ({
  getCurrentAppWorkspace: mocks.getCurrentAppWorkspace,
}));

import AppLayout from "@/app/app/layout";

afterEach(cleanup);

describe("authenticated app layout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getCurrentAppWorkspace.mockResolvedValue({
      clerkUserId: "clerk_user_1",
      teacherProfileId: "teacher_1",
      workspaceId: "workspace_1",
    });
  });

  it("keeps the shared footer after a flexing main region", async () => {
    render(
      await AppLayout({
        children: <p>Page content</p>,
      })
    );

    const main = screen.getByRole("main");
    const footer = screen.getByRole("contentinfo");
    const shell = main.parentElement;

    expect(shell?.classList.contains("min-h-dvh")).toBe(true);
    expect(shell?.classList.contains("flex-col")).toBe(true);
    expect(main.classList.contains("flex-1")).toBe(true);
    expect(main.nextElementSibling).toBe(footer);
    expect(
      screen.getByRole("navigation", { name: "Footer" })
    ).toBeTruthy();
    expect(screen.queryByRole("link", { name: "Sign in" })).toBeNull();
    expect(mocks.getCurrentAppWorkspace).toHaveBeenCalledTimes(1);
  });
});

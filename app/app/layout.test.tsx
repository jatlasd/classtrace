// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/components/dashboard/app-top-nav", () => ({
  AppTopNav: () => <header>Application navigation</header>,
}));

import AppLayout from "@/app/app/layout";

afterEach(cleanup);

describe("authenticated app layout", () => {
  it("keeps the shared footer after a flexing main region", () => {
    render(
      <AppLayout>
        <p>Page content</p>
      </AppLayout>
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
  });
});

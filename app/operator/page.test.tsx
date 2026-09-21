// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireOperator: vi.fn(),
  listOperatorAccounts: vi.fn(),
  notFound: vi.fn(() => {
    throw new Error("not-found");
  }),
}));

vi.mock("next/navigation", () => ({ notFound: mocks.notFound }));
vi.mock("@/lib/operator/operator-auth", () => ({
  requireOperator: mocks.requireOperator,
}));
vi.mock("@/lib/operator/operator-accounts", () => ({
  listOperatorAccounts: mocks.listOperatorAccounts,
}));
vi.mock("@/components/operator/operator-console", () => ({
  OperatorConsole: () => <div>Authorized operator directory</div>,
}));
vi.mock("@/components/layout/site-footer", () => ({
  SiteFooter: () => <footer>Footer</footer>,
}));

import OperatorPage from "@/app/operator/page";

afterEach(cleanup);

describe("OperatorPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireOperator.mockResolvedValue({ clerkUserId: "owner_1" });
    mocks.listOperatorAccounts.mockResolvedValue({
      success: true,
      directory: { accounts: [] },
    });
  });

  it("does not load or serialize the directory when authorization fails", async () => {
    mocks.requireOperator.mockRejectedValue(new Error("not authorized"));

    await expect(OperatorPage()).rejects.toThrow("not-found");
    expect(mocks.listOperatorAccounts).not.toHaveBeenCalled();
  });

  it("loads the directory only with the independently authorized operator ID", async () => {
    render(await OperatorPage());

    expect(mocks.listOperatorAccounts).toHaveBeenCalledWith({
      operatorClerkUserId: "owner_1",
    });
    expect(screen.getByText("Authorized operator directory")).toBeTruthy();
  });
});

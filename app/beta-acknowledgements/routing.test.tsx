// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  redirect: vi.fn((href: string) => {
    throw new Error(`redirect:${href}`);
  }),
  getProvisionedCurrentWorkspace: vi.fn(),
  hasAcceptedCurrentBetaAgreement: vi.fn(),
}));

vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));
vi.mock("@/lib/auth/get-current-workspace", () => ({
  getProvisionedCurrentWorkspace: mocks.getProvisionedCurrentWorkspace,
}));
vi.mock("@/lib/beta-agreement/beta-agreement", () => ({
  hasAcceptedCurrentBetaAgreement: mocks.hasAcceptedCurrentBetaAgreement,
}));
vi.mock("@/components/auth/class-trace-clerk-provider", () => ({
  ClassTraceClerkProvider: ({ children }: { children: React.ReactNode }) =>
    children,
}));
vi.mock("@/components/beta-agreement/beta-acknowledgement-flow", () => ({
  BetaAcknowledgementFlow: () => <div>Agreement flow</div>,
}));

import BetaAcknowledgementsPage from "@/app/beta-acknowledgements/page";

afterEach(cleanup);

describe("beta acknowledgement routing", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getProvisionedCurrentWorkspace.mockResolvedValue({
      clerkUserId: "clerk_user_1",
      teacherProfileId: "teacher_1",
      workspaceId: "workspace_1",
    });
  });

  it("renders the flow for a signed-in teacher without current acceptance", async () => {
    mocks.hasAcceptedCurrentBetaAgreement.mockResolvedValue(false);

    render(await BetaAcknowledgementsPage());

    expect(screen.getByText("Agreement flow")).toBeTruthy();
    expect(mocks.hasAcceptedCurrentBetaAgreement).toHaveBeenCalledWith(
      "teacher_1"
    );
  });

  it("redirects a teacher who already accepted the current agreement", async () => {
    mocks.hasAcceptedCurrentBetaAgreement.mockResolvedValue(true);

    await expect(BetaAcknowledgementsPage()).rejects.toThrow("redirect:/app");
    expect(mocks.redirect).toHaveBeenCalledWith("/app");
  });
});

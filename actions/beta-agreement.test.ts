import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  redirect: vi.fn((href: string) => {
    throw new Error(`redirect:${href}`);
  }),
  getProvisionedCurrentWorkspace: vi.fn(),
  acceptCurrentBetaAgreement: vi.fn(),
  getReleaseIdentifier: vi.fn(),
}));

vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));
vi.mock("@/lib/auth/get-current-workspace", () => ({
  getProvisionedCurrentWorkspace: mocks.getProvisionedCurrentWorkspace,
}));
vi.mock("@/lib/beta-agreement/beta-agreement", () => ({
  acceptCurrentBetaAgreement: mocks.acceptCurrentBetaAgreement,
}));
vi.mock("@/lib/release", () => ({
  getReleaseIdentifier: mocks.getReleaseIdentifier,
}));

import { acceptCurrentBetaAgreementAction } from "@/actions/beta-agreement";
import { BETA_AGREEMENT_STEP_IDS } from "@/lib/beta-agreement/beta-agreement-steps";

describe("acceptCurrentBetaAgreementAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-27T15:00:00.000Z"));
    mocks.getProvisionedCurrentWorkspace.mockResolvedValue({
      clerkUserId: "clerk_user_1",
      teacherProfileId: "teacher_1",
      workspaceId: "workspace_1",
    });
    mocks.getReleaseIdentifier.mockReturnValue("release_1");
  });

  it("records the server-owned teacher, time, and release before redirecting", async () => {
    mocks.acceptCurrentBetaAgreement.mockResolvedValue({
      success: true,
      acceptedAt: new Date("2026-07-27T15:00:00.000Z"),
    });

    await expect(
      acceptCurrentBetaAgreementAction({
        acknowledgedStepIds: [...BETA_AGREEMENT_STEP_IDS],
      })
    ).rejects.toThrow("redirect:/app");

    expect(mocks.acceptCurrentBetaAgreement).toHaveBeenCalledWith({
      teacherProfileId: "teacher_1",
      acknowledgedStepIds: [...BETA_AGREEMENT_STEP_IDS],
      acceptedAt: new Date("2026-07-27T15:00:00.000Z"),
      appRelease: "release_1",
    });
    expect(mocks.redirect).toHaveBeenCalledWith("/app");
  });

  it("returns domain validation errors without redirecting", async () => {
    mocks.acceptCurrentBetaAgreement.mockResolvedValue({
      success: false,
      error: "Check each acknowledgement before entering ClassTrace.",
    });

    await expect(
      acceptCurrentBetaAgreementAction({ acknowledgedStepIds: [] })
    ).resolves.toEqual({
      success: false,
      error: "Check each acknowledgement before entering ClassTrace.",
    });
    expect(mocks.redirect).not.toHaveBeenCalled();
  });

  it("fails closed with safe copy and a fixed log prefix", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    mocks.getProvisionedCurrentWorkspace.mockRejectedValue(
      new Error("sensitive authentication failure")
    );

    await expect(
      acceptCurrentBetaAgreementAction({
        acknowledgedStepIds: [...BETA_AGREEMENT_STEP_IDS],
      })
    ).resolves.toEqual({
      success: false,
      error: "The beta agreement could not be saved. Try again.",
    });
    expect(mocks.acceptCurrentBetaAgreement).not.toHaveBeenCalled();
    expect(consoleError).toHaveBeenCalledWith(
      "[actions/beta-agreement/acceptCurrentBetaAgreementAction] failed"
    );
    consoleError.mockRestore();
  });
});

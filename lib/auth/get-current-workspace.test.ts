import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  redirect: vi.fn((href: string) => {
    throw new Error(`redirect:${href}`);
  }),
  hasAcceptedCurrentBetaAgreement: vi.fn(),
  teacherProfileUpsert: vi.fn(),
  workspaceUpsert: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@clerk/nextjs/server", () => ({ auth: mocks.auth }));
vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));
vi.mock("@/lib/beta-agreement/beta-agreement", () => ({
  hasAcceptedCurrentBetaAgreement: mocks.hasAcceptedCurrentBetaAgreement,
}));
vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    teacherProfile: { upsert: mocks.teacherProfileUpsert },
    workspace: { upsert: mocks.workspaceUpsert },
  },
}));

import {
  CurrentWorkspaceError,
  getCurrentAppWorkspace,
  getCurrentWorkspace,
  getProvisionedCurrentWorkspace,
} from "@/lib/auth/get-current-workspace";

describe("getCurrentWorkspace", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.hasAcceptedCurrentBetaAgreement.mockResolvedValue(true);
  });

  it("rejects unauthenticated access before touching app data", async () => {
    mocks.auth.mockResolvedValue({ userId: null });

    await expect(getCurrentWorkspace()).rejects.toMatchObject({
      name: "CurrentWorkspaceError",
      code: "AUTH_REQUIRED",
    } satisfies Partial<CurrentWorkspaceError>);
    expect(mocks.teacherProfileUpsert).not.toHaveBeenCalled();
    expect(mocks.workspaceUpsert).not.toHaveBeenCalled();
    expect(mocks.hasAcceptedCurrentBetaAgreement).not.toHaveBeenCalled();
  });

  it("resolves one app-owned teacher profile and personal workspace", async () => {
    mocks.auth.mockResolvedValue({ userId: "clerk_user_1" });
    mocks.teacherProfileUpsert.mockResolvedValue({ id: "teacher_1" });
    mocks.workspaceUpsert.mockResolvedValue({ id: "workspace_1" });

    const workspace = await getCurrentWorkspace();

    expect(mocks.teacherProfileUpsert).toHaveBeenCalledWith({
      where: { clerkUserId: "clerk_user_1" },
      update: {},
      create: { clerkUserId: "clerk_user_1", displayName: "Teacher" },
      select: { id: true },
    });
    expect(mocks.workspaceUpsert).toHaveBeenCalledWith({
      where: { teacherProfileId: "teacher_1" },
      update: {},
      create: { teacherProfileId: "teacher_1" },
      select: { id: true },
    });
    expect(workspace).toEqual({
      clerkUserId: "clerk_user_1",
      teacherProfileId: "teacher_1",
      workspaceId: "workspace_1",
    });
    expect(mocks.hasAcceptedCurrentBetaAgreement).toHaveBeenCalledWith(
      "teacher_1"
    );
  });

  it("does not conceal database failures as authentication errors", async () => {
    mocks.auth.mockResolvedValue({ userId: "clerk_user_1" });
    mocks.teacherProfileUpsert.mockRejectedValue(new Error("database unavailable"));

    await expect(getCurrentWorkspace()).rejects.toThrow("database unavailable");
    expect(mocks.teacherProfileUpsert).toHaveBeenCalledTimes(1);
  });

  it("retries provisioning when another request creates the teacher profile", async () => {
    mocks.auth.mockResolvedValue({ userId: "clerk_user_1" });
    mocks.teacherProfileUpsert
      .mockRejectedValueOnce({ code: "P2002" })
      .mockResolvedValueOnce({ id: "teacher_1" });
    mocks.workspaceUpsert.mockResolvedValue({ id: "workspace_1" });

    await expect(getCurrentWorkspace()).resolves.toEqual({
      clerkUserId: "clerk_user_1",
      teacherProfileId: "teacher_1",
      workspaceId: "workspace_1",
    });
    expect(mocks.teacherProfileUpsert).toHaveBeenCalledTimes(2);
    expect(mocks.workspaceUpsert).toHaveBeenCalledTimes(1);
  });

  it("retries the full sequence when another request creates the workspace", async () => {
    mocks.auth.mockResolvedValue({ userId: "clerk_user_1" });
    mocks.teacherProfileUpsert.mockResolvedValue({ id: "teacher_1" });
    mocks.workspaceUpsert
      .mockRejectedValueOnce({ code: "P2002" })
      .mockResolvedValueOnce({ id: "workspace_1" });

    await expect(getCurrentWorkspace()).resolves.toEqual({
      clerkUserId: "clerk_user_1",
      teacherProfileId: "teacher_1",
      workspaceId: "workspace_1",
    });
    expect(mocks.teacherProfileUpsert).toHaveBeenCalledTimes(2);
    expect(mocks.workspaceUpsert).toHaveBeenCalledTimes(2);
  });

  it("stops after one retry when the unique constraint failure continues", async () => {
    mocks.auth.mockResolvedValue({ userId: "clerk_user_1" });
    mocks.teacherProfileUpsert.mockRejectedValue({ code: "P2002" });

    await expect(getCurrentWorkspace()).rejects.toMatchObject({ code: "P2002" });
    expect(mocks.teacherProfileUpsert).toHaveBeenCalledTimes(2);
    expect(mocks.workspaceUpsert).not.toHaveBeenCalled();
  });

  it("allows the acknowledgement boundary to provision without prior acceptance", async () => {
    mocks.auth.mockResolvedValue({ userId: "clerk_user_1" });
    mocks.teacherProfileUpsert.mockResolvedValue({ id: "teacher_1" });
    mocks.workspaceUpsert.mockResolvedValue({ id: "workspace_1" });
    mocks.hasAcceptedCurrentBetaAgreement.mockResolvedValue(false);

    await expect(getProvisionedCurrentWorkspace()).resolves.toEqual({
      clerkUserId: "clerk_user_1",
      teacherProfileId: "teacher_1",
      workspaceId: "workspace_1",
    });
    expect(mocks.hasAcceptedCurrentBetaAgreement).not.toHaveBeenCalled();
  });

  it("rejects teacher-product access without the current agreement", async () => {
    mocks.auth.mockResolvedValue({ userId: "clerk_user_1" });
    mocks.teacherProfileUpsert.mockResolvedValue({ id: "teacher_1" });
    mocks.workspaceUpsert.mockResolvedValue({ id: "workspace_1" });
    mocks.hasAcceptedCurrentBetaAgreement.mockResolvedValue(false);

    await expect(getCurrentWorkspace()).rejects.toMatchObject({
      name: "CurrentWorkspaceError",
      code: "BETA_AGREEMENT_REQUIRED",
    } satisfies Partial<CurrentWorkspaceError>);
  });

  it("redirects app routes to the acknowledgement flow when acceptance is missing", async () => {
    mocks.auth.mockResolvedValue({ userId: "clerk_user_1" });
    mocks.teacherProfileUpsert.mockResolvedValue({ id: "teacher_1" });
    mocks.workspaceUpsert.mockResolvedValue({ id: "workspace_1" });
    mocks.hasAcceptedCurrentBetaAgreement.mockResolvedValue(false);

    await expect(getCurrentAppWorkspace()).rejects.toThrow(
      "redirect:/beta-acknowledgements"
    );
    expect(mocks.redirect).toHaveBeenCalledWith("/beta-acknowledgements");
  });
});

import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireOperator: vi.fn(),
  searchOperatorAccount: vi.fn(),
  deleteOperatorWorkspaceData: vi.fn(),
  deleteOperatorClerkUser: vi.fn(),
  revalidatePath: vi.fn(),
}));

vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock("@/lib/operator/operator-auth", () => ({
  requireOperator: mocks.requireOperator,
}));
vi.mock("@/lib/operator/operator-accounts", () => ({
  searchOperatorAccount: mocks.searchOperatorAccount,
  deleteOperatorWorkspaceData: mocks.deleteOperatorWorkspaceData,
  deleteOperatorClerkUser: mocks.deleteOperatorClerkUser,
}));

import {
  deleteOperatorClerkUserAction,
  deleteOperatorWorkspaceDataAction,
  searchOperatorAccountAction,
} from "@/actions/operator";

describe("operator actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireOperator.mockResolvedValue({ clerkUserId: "owner_1" });
  });

  it("reauthorizes and delegates exact account search", async () => {
    mocks.searchOperatorAccount.mockResolvedValue({
      success: false,
      error: "No account.",
    });

    await searchOperatorAccountAction({ email: "stacy@example.com" });

    expect(mocks.requireOperator).toHaveBeenCalledTimes(1);
    expect(mocks.searchOperatorAccount).toHaveBeenCalledWith({
      operatorClerkUserId: "owner_1",
      email: "stacy@example.com",
    });
  });

  it("reauthorizes workspace deletion and revalidates only after success", async () => {
    mocks.deleteOperatorWorkspaceData.mockResolvedValue({
      success: true,
      deletedCounts: {
        classGroups: 1,
        rosterStudents: 2,
        evidenceRecords: 3,
      },
    });

    await deleteOperatorWorkspaceDataAction({
      targetClerkUserId: "target_1",
      confirmationEmail: "stacy@example.com",
    });

    expect(mocks.requireOperator).toHaveBeenCalledTimes(1);
    expect(mocks.deleteOperatorWorkspaceData).toHaveBeenCalledWith({
      operatorClerkUserId: "owner_1",
      targetClerkUserId: "target_1",
      confirmationEmail: "stacy@example.com",
    });
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/operator");
  });

  it("does not revalidate after a rejected workspace deletion", async () => {
    mocks.deleteOperatorWorkspaceData.mockResolvedValue({
      success: false,
      error: "ClassTrace data could not be deleted.",
    });

    await deleteOperatorWorkspaceDataAction({
      targetClerkUserId: "target_1",
      confirmationEmail: "stacy@example.com",
    });

    expect(mocks.deleteOperatorWorkspaceData).toHaveBeenCalledWith({
      operatorClerkUserId: "owner_1",
      targetClerkUserId: "target_1",
      confirmationEmail: "stacy@example.com",
    });
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });

  it("reauthorizes Clerk deletion independently", async () => {
    mocks.deleteOperatorClerkUser.mockResolvedValue({ success: true });

    await deleteOperatorClerkUserAction({
      targetClerkUserId: "target_1",
      confirmationEmail: "stacy@example.com",
    });

    expect(mocks.requireOperator).toHaveBeenCalledTimes(1);
    expect(mocks.deleteOperatorClerkUser).toHaveBeenCalledWith({
      operatorClerkUserId: "owner_1",
      targetClerkUserId: "target_1",
      confirmationEmail: "stacy@example.com",
    });
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/operator");
  });

  it("does not revalidate after a rejected Clerk deletion", async () => {
    mocks.deleteOperatorClerkUser.mockResolvedValue({
      success: false,
      error: "The Clerk user could not be deleted.",
    });

    await deleteOperatorClerkUserAction({
      targetClerkUserId: "target_1",
      confirmationEmail: "stacy@example.com",
    });

    expect(mocks.deleteOperatorClerkUser).toHaveBeenCalledWith({
      operatorClerkUserId: "owner_1",
      targetClerkUserId: "target_1",
      confirmationEmail: "stacy@example.com",
    });
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });

  it("fails closed when action-level authorization fails", async () => {
    const authorizationError = new Error("not authorized");
    mocks.requireOperator.mockRejectedValue(authorizationError);
    const error = vi.spyOn(console, "error").mockImplementation(() => {});

    await expect(
      deleteOperatorClerkUserAction({
        targetClerkUserId: "target_1",
        confirmationEmail: "stacy@example.com",
      })
    ).resolves.toEqual({
      success: false,
      error: "The Clerk user could not be deleted.",
    });
    expect(mocks.deleteOperatorClerkUser).not.toHaveBeenCalled();
    expect(error).toHaveBeenCalledWith(
      "[monitoring/capture-operational-error] unexpected",
      {
        operation: "operator.clerk-user-delete",
        errorName: "Error",
        operationStage: "operation.execute",
        errorSource: "javascript",
        errorType: "Error",
        failureKind: "application.unexpected",
      }
    );

    error.mockRestore();
  });
});

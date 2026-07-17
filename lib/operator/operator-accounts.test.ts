import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@clerk/nextjs/server", () => ({ clerkClient: vi.fn() }));
vi.mock("@/lib/db/prisma", () => ({ prisma: {} }));

import {
  deleteOperatorClerkUser,
  deleteOperatorWorkspaceData,
  searchOperatorAccount,
  type OperatorAccountDatabase,
  type OperatorIdentityDirectory,
} from "@/lib/operator/operator-accounts";

const targetUser = {
  id: "target_1",
  firstName: "Stacy",
  lastName: "Teacher",
  createdAt: Date.parse("2026-06-01T12:00:00.000Z"),
  lastSignInAt: Date.parse("2026-07-01T15:00:00.000Z"),
  primaryEmailAddressId: "email_1",
  emailAddresses: [
    { id: "email_1", emailAddress: "stacy@example.com" },
  ],
};

function createDependencies() {
  const directory: OperatorIdentityDirectory = {
    findUsersByEmail: vi.fn().mockResolvedValue([targetUser]),
    getUser: vi.fn().mockResolvedValue(targetUser),
    deleteUser: vi.fn().mockResolvedValue(undefined),
  };
  const database: OperatorAccountDatabase = {
    getAccountByClerkUserId: vi.fn().mockResolvedValue({
      id: "teacher_1",
      displayName: "Stacy",
      createdAt: new Date("2026-06-02T12:00:00.000Z"),
      workspace: {
        id: "workspace_1",
        name: "Personal workspace",
        createdAt: new Date("2026-06-02T12:05:00.000Z"),
        _count: {
          classGroups: 2,
          rosterStudents: 12,
          evidenceRecords: 48,
        },
      },
    }),
    deleteWorkspaceDataWithAudit: vi.fn().mockResolvedValue({
      classGroups: 2,
      rosterStudents: 12,
      evidenceRecords: 48,
    }),
    hasTeacherProfile: vi.fn().mockResolvedValue(false),
    createClerkDeletionAudit: vi.fn().mockResolvedValue("audit_1"),
    completeClerkDeletionAudit: vi.fn().mockResolvedValue(undefined),
  };
  return { directory, database };
}

describe("operator account search", () => {
  it("requires one complete bounded email before querying Clerk", async () => {
    const dependencies = createDependencies();

    await expect(
      searchOperatorAccount(
        { operatorClerkUserId: "owner_1", email: "stacy" },
        dependencies
      )
    ).resolves.toEqual({
      success: false,
      error: "Enter a complete email address.",
    });
    expect(dependencies.directory.findUsersByEmail).not.toHaveBeenCalled();
  });

  it("uses an exact case-insensitive match and returns safe metadata with counts", async () => {
    const dependencies = createDependencies();

    const result = await searchOperatorAccount(
      { operatorClerkUserId: "owner_1", email: " STACY@EXAMPLE.COM " },
      dependencies
    );

    expect(dependencies.directory.findUsersByEmail).toHaveBeenCalledWith(
      "stacy@example.com"
    );
    expect(dependencies.database.getAccountByClerkUserId).toHaveBeenCalledWith(
      "target_1"
    );
    expect(result).toEqual({
      success: true,
      account: {
        clerkUserId: "target_1",
        email: "stacy@example.com",
        displayName: "Stacy Teacher",
        clerkCreatedAt: "2026-06-01T12:00:00.000Z",
        lastSignInAt: "2026-07-01T15:00:00.000Z",
        isCurrentOperator: false,
        classTrace: {
          teacherProfileId: "teacher_1",
          teacherDisplayName: "Stacy",
          teacherCreatedAt: "2026-06-02T12:00:00.000Z",
          workspaceId: "workspace_1",
          workspaceName: "Personal workspace",
          workspaceCreatedAt: "2026-06-02T12:05:00.000Z",
          counts: {
            classGroups: 2,
            rosterStudents: 12,
            evidenceRecords: 48,
          },
        },
      },
    });
    expect(JSON.stringify(result)).not.toMatch(/evidenceNote|studentName|rawNote/);
  });

  it("does not select a non-exact directory result", async () => {
    const dependencies = createDependencies();
    vi.mocked(dependencies.directory.findUsersByEmail).mockResolvedValue([
      {
        ...targetUser,
        emailAddresses: [
          { id: "email_1", emailAddress: "stacy+other@example.com" },
        ],
      },
    ]);

    await expect(
      searchOperatorAccount(
        { operatorClerkUserId: "owner_1", email: "stacy@example.com" },
        dependencies
      )
    ).resolves.toEqual({
      success: false,
      error: "No Clerk account matches that exact email address.",
    });
    expect(dependencies.database.getAccountByClerkUserId).not.toHaveBeenCalled();
  });
});

describe("operator destructive actions", () => {
  let dependencies: ReturnType<typeof createDependencies>;

  beforeEach(() => {
    dependencies = createDependencies();
  });

  it("requires the exact target email before workspace deletion", async () => {
    await expect(
      deleteOperatorWorkspaceData(
        {
          operatorClerkUserId: "owner_1",
          targetClerkUserId: "target_1",
          confirmationEmail: "wrong@example.com",
        },
        dependencies
      )
    ).resolves.toEqual({
      success: false,
      error: "The confirmation email did not match.",
    });
    expect(dependencies.database.deleteWorkspaceDataWithAudit).not.toHaveBeenCalled();
  });

  it("passes only trusted identifiers to atomic workspace deletion", async () => {
    const result = await deleteOperatorWorkspaceData(
      {
        operatorClerkUserId: "owner_1",
        targetClerkUserId: "target_1",
        confirmationEmail: "stacy@example.com",
      },
      dependencies
    );

    expect(dependencies.database.deleteWorkspaceDataWithAudit).toHaveBeenCalledWith({
      operatorClerkUserId: "owner_1",
      targetClerkUserId: "target_1",
    });
    expect(result).toEqual({
      success: true,
      deletedCounts: {
        classGroups: 2,
        rosterStudents: 12,
        evidenceRecords: 48,
      },
    });
  });

  it("blocks operator self-deletion", async () => {
    vi.mocked(dependencies.directory.getUser).mockResolvedValue({
      ...targetUser,
      id: "owner_1",
    });

    const result = await deleteOperatorClerkUser(
      {
        operatorClerkUserId: "owner_1",
        targetClerkUserId: "owner_1",
        confirmationEmail: "stacy@example.com",
      },
      dependencies
    );

    expect(result).toEqual({
      success: false,
      error: "The operator account cannot delete itself.",
    });
    expect(dependencies.directory.deleteUser).not.toHaveBeenCalled();
  });

  it("requires ClassTrace data deletion before Clerk deletion", async () => {
    vi.mocked(dependencies.database.hasTeacherProfile).mockResolvedValue(true);

    const result = await deleteOperatorClerkUser(
      {
        operatorClerkUserId: "owner_1",
        targetClerkUserId: "target_1",
        confirmationEmail: "stacy@example.com",
      },
      dependencies
    );

    expect(result).toEqual({
      success: false,
      error: "Delete the account's ClassTrace data before deleting its Clerk user.",
    });
    expect(dependencies.database.createClerkDeletionAudit).not.toHaveBeenCalled();
    expect(dependencies.directory.deleteUser).not.toHaveBeenCalled();
  });

  it("records a successful Clerk deletion outcome", async () => {
    const result = await deleteOperatorClerkUser(
      {
        operatorClerkUserId: "owner_1",
        targetClerkUserId: "target_1",
        confirmationEmail: "stacy@example.com",
      },
      dependencies
    );

    expect(dependencies.database.createClerkDeletionAudit).toHaveBeenCalledBefore(
      vi.mocked(dependencies.directory.deleteUser)
    );
    expect(dependencies.database.completeClerkDeletionAudit).toHaveBeenCalledWith({
      auditId: "audit_1",
      outcome: "SUCCEEDED",
    });
    expect(result).toEqual({ success: true });
  });

  it("records a failed Clerk deletion without exposing the directory error", async () => {
    vi.mocked(dependencies.directory.deleteUser).mockRejectedValue(
      new Error("provider response with account details")
    );

    const result = await deleteOperatorClerkUser(
      {
        operatorClerkUserId: "owner_1",
        targetClerkUserId: "target_1",
        confirmationEmail: "stacy@example.com",
      },
      dependencies
    );

    expect(dependencies.database.completeClerkDeletionAudit).toHaveBeenCalledWith({
      auditId: "audit_1",
      outcome: "FAILED",
    });
    expect(result).toEqual({
      success: false,
      error: "The Clerk user could not be deleted.",
    });
  });

  it("reports when Clerk deletion succeeds but the audit cannot be completed", async () => {
    vi.mocked(
      dependencies.database.completeClerkDeletionAudit
    ).mockRejectedValue(new Error("database unavailable"));

    const result = await deleteOperatorClerkUser(
      {
        operatorClerkUserId: "owner_1",
        targetClerkUserId: "target_1",
        confirmationEmail: "stacy@example.com",
      },
      dependencies
    );

    expect(dependencies.directory.deleteUser).toHaveBeenCalledWith("target_1");
    expect(result).toEqual({
      success: false,
      clerkUserDeleted: true,
      error: "The Clerk user was deleted, but the audit outcome was not updated.",
    });
  });
});

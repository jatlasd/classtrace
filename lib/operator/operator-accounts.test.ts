import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  captureOperationalError: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@clerk/nextjs/server", () => ({ clerkClient: vi.fn() }));
vi.mock("@/lib/db/prisma", () => ({ prisma: {} }));
vi.mock("@/lib/monitoring/capture-operational-error", () => ({
  captureOperationalError: mocks.captureOperationalError,
}));

import {
  deleteOperatorClerkUser,
  deleteOperatorWorkspaceData,
  listOperatorAccounts,
  seedOperatorDemoWorkspace,
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

beforeEach(() => {
  mocks.captureOperationalError.mockClear();
});

function createDependencies() {
  const directory: OperatorIdentityDirectory = {
    listUsers: vi.fn().mockResolvedValue({ data: [targetUser], totalCount: 1 }),
    findUsersByEmail: vi.fn().mockResolvedValue([targetUser]),
    getUser: vi.fn().mockResolvedValue(targetUser),
    deleteUser: vi.fn().mockResolvedValue(undefined),
  };
  const database: OperatorAccountDatabase = {
    getAccountByClerkUserId: vi.fn().mockResolvedValue({
      id: "teacher_1",
      clerkUserId: "target_1",
      displayName: "Stacy",
      createdAt: new Date("2026-06-02T12:00:00.000Z"),
      betaAgreementAcceptances: [{ teacherProfileId: "teacher_1" }],
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
    getAccountsByClerkUserIds: vi.fn().mockResolvedValue([
      {
        id: "teacher_1",
        clerkUserId: "target_1",
        displayName: "Stacy",
        createdAt: new Date("2026-06-02T12:00:00.000Z"),
        betaAgreementAcceptances: [{ teacherProfileId: "teacher_1" }],
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
      },
    ]),
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
          hasCurrentBetaAcknowledgement: true,
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

  it("reports unexpected directory or database failures", async () => {
    const dependencies = createDependencies();
    const error = new Error("provider details");
    vi.mocked(dependencies.directory.findUsersByEmail).mockRejectedValue(error);

    await expect(
      searchOperatorAccount(
        { operatorClerkUserId: "owner_1", email: "stacy@example.com" },
        dependencies
      )
    ).resolves.toEqual({
      success: false,
      error: "Account search failed. Try again.",
    });
    expect(mocks.captureOperationalError).toHaveBeenCalledWith(
      "operator.account-search",
      error
    );
  });
});

describe("operator account directory", () => {
  it("lists a bounded page with safe aggregate metadata", async () => {
    const dependencies = createDependencies();

    const result = await listOperatorAccounts(
      { operatorClerkUserId: "owner_1", offset: 0 },
      dependencies
    );

    expect(dependencies.directory.listUsers).toHaveBeenCalledWith({
      limit: 20,
      offset: 0,
    });
    expect(dependencies.database.getAccountsByClerkUserIds).toHaveBeenCalledWith([
      "target_1",
    ]);
    expect(result).toMatchObject({
      success: true,
      directory: {
        totalCount: 1,
        hasNextPage: false,
        accounts: [
          {
            email: "stacy@example.com",
            classTrace: {
              counts: {
                classGroups: 2,
                rosterStudents: 12,
                evidenceRecords: 48,
              },
            },
          },
        ],
      },
    });
    expect(JSON.stringify(result)).not.toMatch(
      /evidenceNote|studentName|displayName":"Jeremy|rawNote|imageData/
    );
  });

  it("passes a bounded optional filter and page offset to Clerk", async () => {
    const dependencies = createDependencies();
    vi.mocked(dependencies.directory.listUsers).mockResolvedValue({
      data: [targetUser],
      totalCount: 42,
    });

    const result = await listOperatorAccounts(
      {
        operatorClerkUserId: "owner_1",
        query: " stacy@example.com ",
        offset: 20,
      },
      dependencies
    );

    expect(dependencies.directory.listUsers).toHaveBeenCalledWith({
      limit: 20,
      offset: 20,
      query: "stacy@example.com",
    });
    expect(result).toMatchObject({
      success: true,
      directory: {
        query: "stacy@example.com",
        offset: 20,
        hasPreviousPage: true,
        hasNextPage: true,
      },
    });
  });

  it("reports an unavailable account directory", async () => {
    const dependencies = createDependencies();
    const error = new Error("directory unavailable");
    vi.mocked(dependencies.directory.listUsers).mockRejectedValue(error);

    await expect(
      listOperatorAccounts({ operatorClerkUserId: "owner_1" }, dependencies)
    ).resolves.toEqual({
      success: false,
      error: "The account directory is not available. Try again.",
    });
    expect(mocks.captureOperationalError).toHaveBeenCalledWith(
      "operator.account-directory",
      error
    );
  });
});

describe("operator demo seeding", () => {
  it("resolves one Clerk user and returns refreshed canonical counts", async () => {
    const dependencies = {
      ...createDependencies(),
      resetWorkspace: vi.fn().mockResolvedValue({
        classCount: 3,
        studentCount: 14,
        evidenceCount: 81,
        photoCount: 12,
      }),
    };

    const result = await seedOperatorDemoWorkspace(
      {
        operatorClerkUserId: "owner_1",
        targetClerkUserId: "target_1",
        confirmationEmail: "stacy@example.com",
      },
      dependencies
    );

    expect(dependencies.directory.getUser).toHaveBeenCalledWith("target_1");
    expect(dependencies.resetWorkspace).toHaveBeenCalledWith({
      clerkUserId: "target_1",
      targetEmail: "stacy@example.com",
      confirmationEmail: "stacy@example.com",
    });
    expect(result).toMatchObject({
      success: true,
      counts: {
        classGroups: 3,
        rosterStudents: 14,
        evidenceRecords: 81,
        photos: 12,
      },
    });
  });

  it("rejects a missing target before opening a reset", async () => {
    const dependencies = {
      ...createDependencies(),
      resetWorkspace: vi.fn(),
    };

    await expect(
      seedOperatorDemoWorkspace(
        {
          operatorClerkUserId: "owner_1",
          targetClerkUserId: "",
          confirmationEmail: "",
        },
        dependencies
      )
    ).resolves.toEqual({
      success: false,
      error: "Select one Clerk account first.",
    });
    expect(dependencies.resetWorkspace).not.toHaveBeenCalled();
    expect(mocks.captureOperationalError).not.toHaveBeenCalled();
  });

  it("returns a safe error when the selected Clerk account no longer resolves", async () => {
    const dependencies = {
      ...createDependencies(),
      resetWorkspace: vi.fn(),
    };
    vi.mocked(dependencies.directory.getUser).mockRejectedValue(
      new Error("provider details")
    );

    await expect(
      seedOperatorDemoWorkspace(
        {
          operatorClerkUserId: "owner_1",
          targetClerkUserId: "target_1",
          confirmationEmail: "",
        },
        dependencies
      )
    ).resolves.toEqual({
      success: false,
      error: "The selected Clerk account could not be resolved.",
    });
    expect(dependencies.resetWorkspace).not.toHaveBeenCalled();
    expect(mocks.captureOperationalError).toHaveBeenCalledWith(
      "operator.demo-seed",
      expect.any(Error)
    );
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

  it("reports an unexpected workspace deletion failure", async () => {
    const error = new Error("database unavailable");
    vi.mocked(
      dependencies.database.deleteWorkspaceDataWithAudit
    ).mockRejectedValue(error);

    await expect(
      deleteOperatorWorkspaceData(
        {
          operatorClerkUserId: "owner_1",
          targetClerkUserId: "target_1",
          confirmationEmail: "stacy@example.com",
        },
        dependencies
      )
    ).resolves.toEqual({
      success: false,
      error: "ClassTrace data could not be deleted.",
    });
    expect(mocks.captureOperationalError).toHaveBeenCalledWith(
      "operator.workspace-delete",
      error
    );
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
    expect(mocks.captureOperationalError).toHaveBeenCalledWith(
      "operator.clerk-user-delete",
      expect.any(Error)
    );
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
    expect(mocks.captureOperationalError).toHaveBeenCalledWith(
      "operator.clerk-user-delete",
      expect.any(Error)
    );
  });
});

import "server-only";

import { clerkClient } from "@clerk/nextjs/server";
import { CURRENT_BETA_AGREEMENT } from "@/lib/beta-agreement/beta-agreement-versions";
import { DEMO_DATASET } from "@/lib/demo/demo-data";
import {
  OperatorDemoResetError,
  resetOperatorDemoWorkspace,
} from "@/lib/demo/demo-workspace-reset";
import { scopeDemoDatasetForClerkUser } from "@/lib/demo/scope-demo-dataset";
import { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/db/prisma";
import { withSerializableTransactionRetry } from "@/lib/db/serializable-transaction";
import { captureOperationalError } from "@/lib/monitoring/capture-operational-error";
import { INPUT_LIMITS } from "@/lib/validation/input-limits";

const WORKSPACE_DELETE_ACTION = "WORKSPACE_DATA_DELETE";
const CLERK_DELETE_ACTION = "CLERK_USER_DELETE";
export const OPERATOR_DIRECTORY_PAGE_SIZE = 20;
const MAX_DIRECTORY_OFFSET = 10_000;

type DirectoryUser = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  createdAt: number;
  lastSignInAt: number | null;
  primaryEmailAddressId: string | null;
  emailAddresses: Array<{
    id: string;
    emailAddress: string;
  }>;
};

export type OperatorIdentityDirectory = {
  listUsers(input: {
    limit: number;
    offset: number;
    query?: string;
  }): Promise<{ data: DirectoryUser[]; totalCount: number }>;
  findUsersByEmail(email: string): Promise<DirectoryUser[]>;
  getUser(userId: string): Promise<DirectoryUser>;
  deleteUser(userId: string): Promise<void>;
};

type WorkspaceCounts = {
  classGroups: number;
  rosterStudents: number;
  evidenceRecords: number;
};

type DatabaseAccount = {
  id: string;
  clerkUserId: string;
  displayName: string;
  createdAt: Date;
  betaAgreementAcceptances: Array<{ teacherProfileId: string }>;
  workspace: {
    id: string;
    name: string;
    createdAt: Date;
    _count: WorkspaceCounts;
  } | null;
};

export type OperatorAccountDatabase = {
  getAccountByClerkUserId(clerkUserId: string): Promise<DatabaseAccount | null>;
  getAccountsByClerkUserIds(clerkUserIds: string[]): Promise<DatabaseAccount[]>;
  deleteWorkspaceDataWithAudit(input: {
    operatorClerkUserId: string;
    targetClerkUserId: string;
  }): Promise<WorkspaceCounts | null>;
  hasTeacherProfile(clerkUserId: string): Promise<boolean>;
  createClerkDeletionAudit(input: {
    operatorClerkUserId: string;
    targetClerkUserId: string;
  }): Promise<string>;
  completeClerkDeletionAudit(input: {
    auditId: string;
    outcome: "SUCCEEDED" | "FAILED";
  }): Promise<void>;
};

export type OperatorAccount = {
  clerkUserId: string;
  email: string;
  displayName: string;
  clerkCreatedAt: string;
  lastSignInAt: string | null;
  isCurrentOperator: boolean;
  classTrace: {
    teacherProfileId: string;
    teacherDisplayName: string;
    teacherCreatedAt: string;
    workspaceId: string | null;
    workspaceName: string | null;
    workspaceCreatedAt: string | null;
    hasCurrentBetaAcknowledgement: boolean;
    counts: WorkspaceCounts;
  } | null;
};

export type SearchOperatorAccountResult =
  | { success: true; account: OperatorAccount }
  | { success: false; error: string };

export type DeleteWorkspaceDataResult =
  | { success: true; deletedCounts: WorkspaceCounts }
  | { success: false; error: string };

export type DeleteClerkUserResult =
  | { success: true }
  | { success: false; error: string; clerkUserDeleted?: boolean };

export type OperatorDirectoryPage = {
  accounts: OperatorAccount[];
  query: string;
  offset: number;
  limit: number;
  totalCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
};

export type ListOperatorAccountsResult =
  | { success: true; directory: OperatorDirectoryPage }
  | { success: false; error: string };

export type SeedDemoWorkspaceResult =
  | {
      success: true;
      account: OperatorAccount;
      counts: WorkspaceCounts & { photos: number };
    }
  | { success: false; error: string };

const operatorIdentityDirectory: OperatorIdentityDirectory = {
  async listUsers(input) {
    const client = await clerkClient();
    const response = await client.users.getUserList({
      limit: input.limit,
      offset: input.offset,
      orderBy: "-created_at",
      ...(input.query ? { query: input.query } : {}),
    });
    return { data: response.data, totalCount: response.totalCount };
  },
  async findUsersByEmail(email) {
    const client = await clerkClient();
    const response = await client.users.getUserList({
      emailAddress: [email],
      limit: 10,
    });
    return response.data;
  },
  async getUser(userId) {
    const client = await clerkClient();
    return client.users.getUser(userId);
  },
  async deleteUser(userId) {
    const client = await clerkClient();
    await client.users.deleteUser(userId);
  },
};

const operatorAccountDatabase: OperatorAccountDatabase = {
  getAccountByClerkUserId: (clerkUserId) =>
    prisma.teacherProfile.findUnique({
      where: { clerkUserId },
      select: {
        id: true,
        clerkUserId: true,
        displayName: true,
        createdAt: true,
        betaAgreementAcceptances: {
          where: {
            agreementVersion: CURRENT_BETA_AGREEMENT.agreementVersion,
          },
          select: { teacherProfileId: true },
        },
        workspace: {
          select: {
            id: true,
            name: true,
            createdAt: true,
            _count: {
              select: {
                classGroups: true,
                rosterStudents: true,
                evidenceRecords: true,
              },
            },
          },
        },
      },
    }),
  getAccountsByClerkUserIds: (clerkUserIds) =>
    clerkUserIds.length === 0
      ? Promise.resolve([])
      : prisma.teacherProfile.findMany({
          where: { clerkUserId: { in: clerkUserIds } },
          select: {
            id: true,
            clerkUserId: true,
            displayName: true,
            createdAt: true,
            betaAgreementAcceptances: {
              where: {
                agreementVersion: CURRENT_BETA_AGREEMENT.agreementVersion,
              },
              select: { teacherProfileId: true },
            },
            workspace: {
              select: {
                id: true,
                name: true,
                createdAt: true,
                _count: {
                  select: {
                    classGroups: true,
                    rosterStudents: true,
                    evidenceRecords: true,
                  },
                },
              },
            },
          },
        }),
  deleteWorkspaceDataWithAudit: (input) =>
    withSerializableTransactionRetry(() =>
      prisma.$transaction(
        async (transaction) => {
          const profile = await transaction.teacherProfile.findUnique({
            where: { clerkUserId: input.targetClerkUserId },
            select: {
              id: true,
              workspace: {
                select: {
                  _count: {
                    select: {
                      classGroups: true,
                      rosterStudents: true,
                      evidenceRecords: true,
                    },
                  },
                },
              },
            },
          });

          if (!profile) return null;

          const counts = profile.workspace?._count ?? {
            classGroups: 0,
            rosterStudents: 0,
            evidenceRecords: 0,
          };

          await transaction.operatorActionAudit.create({
            data: {
              operatorClerkUserId: input.operatorClerkUserId,
              targetClerkUserId: input.targetClerkUserId,
              action: WORKSPACE_DELETE_ACTION,
              outcome: "SUCCEEDED",
              classGroupCount: counts.classGroups,
              rosterStudentCount: counts.rosterStudents,
              evidenceRecordCount: counts.evidenceRecords,
              completedAt: new Date(),
            },
          });
          await transaction.teacherProfile.delete({ where: { id: profile.id } });

          return counts;
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
      )
    ),
  async hasTeacherProfile(clerkUserId) {
    const profile = await prisma.teacherProfile.findUnique({
      where: { clerkUserId },
      select: { id: true },
    });
    return Boolean(profile);
  },
  async createClerkDeletionAudit(input) {
    const audit = await prisma.operatorActionAudit.create({
      data: {
        operatorClerkUserId: input.operatorClerkUserId,
        targetClerkUserId: input.targetClerkUserId,
        action: CLERK_DELETE_ACTION,
        outcome: "STARTED",
      },
      select: { id: true },
    });
    return audit.id;
  },
  async completeClerkDeletionAudit(input) {
    await prisma.operatorActionAudit.update({
      where: { id: input.auditId },
      data: {
        outcome: input.outcome,
        completedAt: new Date(),
      },
    });
  },
};

function normalizeEmail(value: unknown): string {
  if (typeof value !== "string") return "";
  const email = value.trim().toLowerCase();
  if (!email || email.length > INPUT_LIMITS.accountEmail) return "";
  if (/\s/.test(email)) return "";

  const separatorIndex = email.indexOf("@");
  if (
    separatorIndex <= 0 ||
    separatorIndex !== email.lastIndexOf("@") ||
    separatorIndex === email.length - 1
  ) {
    return "";
  }

  return email;
}

function normalizeIdentifier(value: unknown): string {
  if (typeof value !== "string") return "";
  const identifier = value.trim();
  return identifier.length <= INPUT_LIMITS.identifier ? identifier : "";
}

function normalizeDirectoryQuery(value: unknown): string | null {
  if (typeof value !== "string") return "";
  const query = value.trim();
  return query.length <= INPUT_LIMITS.operatorDirectoryQuery ? query : null;
}

function normalizeDirectoryOffset(value: unknown): number {
  return typeof value === "number" &&
    Number.isInteger(value) &&
    value >= 0 &&
    value <= MAX_DIRECTORY_OFFSET
    ? value
    : 0;
}

function getUserEmail(user: DirectoryUser, email: string): string | null {
  const match = user.emailAddresses.find(
    (address) => address.emailAddress.trim().toLowerCase() === email
  );
  return match?.emailAddress.trim() ?? null;
}

function getDirectoryEmail(user: DirectoryUser): string | null {
  const primary = user.emailAddresses.find(
    (address) => address.id === user.primaryEmailAddressId
  );
  return (primary ?? user.emailAddresses[0])?.emailAddress.trim() || null;
}

function getDisplayName(user: DirectoryUser): string {
  const name = [user.firstName?.trim(), user.lastName?.trim()]
    .filter(Boolean)
    .join(" ");
  return name || "Name unavailable";
}

function buildOperatorAccount(
  user: DirectoryUser,
  account: DatabaseAccount | null,
  operatorClerkUserId: string,
  preferredEmail?: string
): OperatorAccount | null {
  const email = preferredEmail ?? getDirectoryEmail(user);
  if (!email) return null;

  return {
    clerkUserId: user.id,
    email,
    displayName: getDisplayName(user),
    clerkCreatedAt: new Date(user.createdAt).toISOString(),
    lastSignInAt:
      user.lastSignInAt === null
        ? null
        : new Date(user.lastSignInAt).toISOString(),
    isCurrentOperator: user.id === operatorClerkUserId,
    classTrace: account
      ? {
          teacherProfileId: account.id,
          teacherDisplayName: account.displayName,
          teacherCreatedAt: account.createdAt.toISOString(),
          workspaceId: account.workspace?.id ?? null,
          workspaceName: account.workspace?.name ?? null,
          workspaceCreatedAt: account.workspace?.createdAt.toISOString() ?? null,
          hasCurrentBetaAcknowledgement:
            account.betaAgreementAcceptances.length === 1,
          counts: account.workspace?._count ?? {
            classGroups: 0,
            rosterStudents: 0,
            evidenceRecords: 0,
          },
        }
      : null,
  };
}

export async function listOperatorAccounts(
  input: {
    operatorClerkUserId: string;
    query?: unknown;
    offset?: unknown;
  },
  dependencies: {
    directory: OperatorIdentityDirectory;
    database: OperatorAccountDatabase;
  } = {
    directory: operatorIdentityDirectory,
    database: operatorAccountDatabase,
  }
): Promise<ListOperatorAccountsResult> {
  const query = normalizeDirectoryQuery(input.query);
  const offset = normalizeDirectoryOffset(input.offset);
  if (query === null) {
    return {
      success: false,
      error: "The directory filter is too long.",
    };
  }

  try {
    const page = await dependencies.directory.listUsers({
      limit: OPERATOR_DIRECTORY_PAGE_SIZE,
      offset,
      ...(query ? { query } : {}),
    });
    const databaseAccounts = await dependencies.database.getAccountsByClerkUserIds(
      page.data.map((user) => user.id)
    );
    const databaseAccountsByClerkId = new Map(
      databaseAccounts.map((account) => [account.clerkUserId, account])
    );
    const accounts = page.data.flatMap((user) => {
      const account = buildOperatorAccount(
        user,
        databaseAccountsByClerkId.get(user.id) ?? null,
        input.operatorClerkUserId
      );
      return account ? [account] : [];
    });

    return {
      success: true,
      directory: {
        accounts,
        query,
        offset,
        limit: OPERATOR_DIRECTORY_PAGE_SIZE,
        totalCount: page.totalCount,
        hasPreviousPage: offset > 0,
        hasNextPage: offset + page.data.length < page.totalCount,
      },
    };
  } catch (error) {
    captureOperationalError("operator.account-directory", error);
    return {
      success: false,
      error: "The account directory is not available. Try again.",
    };
  }
}

async function resolveConfirmedTarget(
  targetClerkUserId: unknown,
  confirmationEmail: unknown,
  directory: OperatorIdentityDirectory,
  operation: "operator.workspace-delete" | "operator.clerk-user-delete"
): Promise<{ userId: string; email: string } | null> {
  const userId = normalizeIdentifier(targetClerkUserId);
  const email = normalizeEmail(confirmationEmail);
  if (!userId || !email) return null;

  try {
    const user = await directory.getUser(userId);
    if (!getUserEmail(user, email)) return null;
    return { userId: user.id, email };
  } catch (error) {
    captureOperationalError(operation, error);
    return null;
  }
}

export async function searchOperatorAccount(
  input: {
    operatorClerkUserId: string;
    email: unknown;
  },
  dependencies: {
    directory: OperatorIdentityDirectory;
    database: OperatorAccountDatabase;
  } = {
    directory: operatorIdentityDirectory,
    database: operatorAccountDatabase,
  }
): Promise<SearchOperatorAccountResult> {
  const email = normalizeEmail(input.email);
  if (!email) {
    return { success: false, error: "Enter a complete email address." };
  }

  try {
    const users = await dependencies.directory.findUsersByEmail(email);
    const exactMatches = users.filter((user) => getUserEmail(user, email));

    if (exactMatches.length === 0) {
      return {
        success: false,
        error: "No Clerk account matches that exact email address.",
      };
    }

    if (exactMatches.length !== 1) {
      return {
        success: false,
        error: "More than one Clerk account matched. No account was selected.",
      };
    }

    const user = exactMatches[0];
    const account = await dependencies.database.getAccountByClerkUserId(user.id);

    const operatorAccount = buildOperatorAccount(
      user,
      account,
      input.operatorClerkUserId,
      getUserEmail(user, email) ?? email
    );
    if (!operatorAccount) {
      return { success: false, error: "The Clerk account has no email address." };
    }

    return { success: true, account: operatorAccount };
  } catch (error) {
    captureOperationalError("operator.account-search", error);
    return { success: false, error: "Account search failed. Try again." };
  }
}

async function seedDemoWorkspaceWithDatabase(input: {
  clerkUserId: string;
  targetEmail: string;
  confirmationEmail: string;
}) {
  return resetOperatorDemoWorkspace({
    database: prisma,
    clerkUserId: input.clerkUserId,
    currentAgreementVersion: CURRENT_BETA_AGREEMENT.agreementVersion,
    confirmationEmail: input.confirmationEmail,
    targetEmail: input.targetEmail,
    dataset: scopeDemoDatasetForClerkUser(DEMO_DATASET, input.clerkUserId),
  });
}

export async function seedOperatorDemoWorkspace(
  input: {
    operatorClerkUserId: string;
    targetClerkUserId: unknown;
    confirmationEmail: unknown;
  },
  dependencies: {
    directory: OperatorIdentityDirectory;
    database: OperatorAccountDatabase;
    resetWorkspace: typeof seedDemoWorkspaceWithDatabase;
  } = {
    directory: operatorIdentityDirectory,
    database: operatorAccountDatabase,
    resetWorkspace: seedDemoWorkspaceWithDatabase,
  }
): Promise<SeedDemoWorkspaceResult> {
  const targetClerkUserId = normalizeIdentifier(input.targetClerkUserId);
  if (!targetClerkUserId) {
    return { success: false, error: "Select one Clerk account first." };
  }

  let user: DirectoryUser;
  try {
    user = await dependencies.directory.getUser(targetClerkUserId);
  } catch (error) {
    captureOperationalError("operator.demo-seed", error);
    return {
      success: false,
      error: "The selected Clerk account could not be resolved.",
    };
  }

  try {
    if (user.id !== targetClerkUserId) {
      return { success: false, error: "The selected Clerk account was not found." };
    }
    const targetEmail = getDirectoryEmail(user)?.toLowerCase();
    if (!targetEmail) {
      return { success: false, error: "The selected Clerk account has no email address." };
    }

    const confirmationEmail = normalizeEmail(input.confirmationEmail);
    const summary = await dependencies.resetWorkspace({
      clerkUserId: user.id,
      targetEmail,
      confirmationEmail,
    });
    const databaseAccount = await dependencies.database.getAccountByClerkUserId(
      user.id
    );
    const account = buildOperatorAccount(
      user,
      databaseAccount,
      input.operatorClerkUserId,
      getDirectoryEmail(user) ?? targetEmail
    );
    if (!account?.classTrace?.workspaceId) {
      captureOperationalError(
        "operator.demo-seed",
        new Error("Demo reset completed without refreshed workspace metadata.")
      );
      return {
        success: false,
        error: "The demo workspace was loaded, but refreshed counts are unavailable.",
      };
    }

    return {
      success: true,
      account,
      counts: {
        classGroups: summary.classCount,
        rosterStudents: summary.studentCount,
        evidenceRecords: summary.evidenceCount,
        photos: summary.photoCount,
      },
    };
  } catch (error) {
    if (error instanceof OperatorDemoResetError) {
      if (error.code === "RESET_FAILED") {
        captureOperationalError("operator.demo-seed", error);
      }
      return { success: false, error: error.message };
    }
    captureOperationalError("operator.demo-seed", error);
    return {
      success: false,
      error: "The selected workspace could not be replaced with demo data.",
    };
  }
}

export async function deleteOperatorWorkspaceData(
  input: {
    operatorClerkUserId: string;
    targetClerkUserId: unknown;
    confirmationEmail: unknown;
  },
  dependencies: {
    directory: OperatorIdentityDirectory;
    database: OperatorAccountDatabase;
  } = {
    directory: operatorIdentityDirectory,
    database: operatorAccountDatabase,
  }
): Promise<DeleteWorkspaceDataResult> {
  const target = await resolveConfirmedTarget(
    input.targetClerkUserId,
    input.confirmationEmail,
    dependencies.directory,
    "operator.workspace-delete"
  );

  if (!target) {
    return { success: false, error: "The confirmation email did not match." };
  }

  if (target.userId === input.operatorClerkUserId) {
    return { success: false, error: "The operator account cannot delete itself." };
  }

  try {
    const deletedCounts = await dependencies.database.deleteWorkspaceDataWithAudit({
      operatorClerkUserId: input.operatorClerkUserId,
      targetClerkUserId: target.userId,
    });

    if (!deletedCounts) {
      return { success: false, error: "No ClassTrace data remains for this account." };
    }

    return { success: true, deletedCounts };
  } catch (error) {
    captureOperationalError("operator.workspace-delete", error);
    return { success: false, error: "ClassTrace data could not be deleted." };
  }
}

export async function deleteOperatorClerkUser(
  input: {
    operatorClerkUserId: string;
    targetClerkUserId: unknown;
    confirmationEmail: unknown;
  },
  dependencies: {
    directory: OperatorIdentityDirectory;
    database: OperatorAccountDatabase;
  } = {
    directory: operatorIdentityDirectory,
    database: operatorAccountDatabase,
  }
): Promise<DeleteClerkUserResult> {
  const target = await resolveConfirmedTarget(
    input.targetClerkUserId,
    input.confirmationEmail,
    dependencies.directory,
    "operator.clerk-user-delete"
  );

  if (!target) {
    return { success: false, error: "The confirmation email did not match." };
  }

  if (target.userId === input.operatorClerkUserId) {
    return { success: false, error: "The operator account cannot delete itself." };
  }

  try {
    if (await dependencies.database.hasTeacherProfile(target.userId)) {
      return {
        success: false,
        error: "Delete the account's ClassTrace data before deleting its Clerk user.",
      };
    }

    const auditId = await dependencies.database.createClerkDeletionAudit({
      operatorClerkUserId: input.operatorClerkUserId,
      targetClerkUserId: target.userId,
    });

    try {
      await dependencies.directory.deleteUser(target.userId);
    } catch (error) {
      captureOperationalError("operator.clerk-user-delete", error);
      try {
        await dependencies.database.completeClerkDeletionAudit({
          auditId,
          outcome: "FAILED",
        });
      } catch (auditError) {
        captureOperationalError("operator.clerk-user-delete", auditError);
      }
      return { success: false, error: "The Clerk user could not be deleted." };
    }

    try {
      await dependencies.database.completeClerkDeletionAudit({
        auditId,
        outcome: "SUCCEEDED",
      });
    } catch (error) {
      captureOperationalError("operator.clerk-user-delete", error);
      return {
        success: false,
        clerkUserDeleted: true,
        error: "The Clerk user was deleted, but the audit outcome was not updated.",
      };
    }

    return { success: true };
  } catch (error) {
    captureOperationalError("operator.clerk-user-delete", error);
    return { success: false, error: "The Clerk user could not be deleted." };
  }
}

import "server-only";

import { clerkClient } from "@clerk/nextjs/server";
import { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/db/prisma";
import { withSerializableTransactionRetry } from "@/lib/db/serializable-transaction";
import { INPUT_LIMITS } from "@/lib/validation/input-limits";

const WORKSPACE_DELETE_ACTION = "WORKSPACE_DATA_DELETE";
const CLERK_DELETE_ACTION = "CLERK_USER_DELETE";

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
  displayName: string;
  createdAt: Date;
  workspace: {
    id: string;
    name: string;
    createdAt: Date;
    _count: WorkspaceCounts;
  } | null;
};

export type OperatorAccountDatabase = {
  getAccountByClerkUserId(clerkUserId: string): Promise<DatabaseAccount | null>;
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

const operatorIdentityDirectory: OperatorIdentityDirectory = {
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
        displayName: true,
        createdAt: true,
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

function getUserEmail(user: DirectoryUser, email: string): string | null {
  const match = user.emailAddresses.find(
    (address) => address.emailAddress.trim().toLowerCase() === email
  );
  return match?.emailAddress.trim() ?? null;
}

function getDisplayName(user: DirectoryUser): string {
  const name = [user.firstName?.trim(), user.lastName?.trim()]
    .filter(Boolean)
    .join(" ");
  return name || "Name unavailable";
}

async function resolveConfirmedTarget(
  targetClerkUserId: unknown,
  confirmationEmail: unknown,
  directory: OperatorIdentityDirectory
): Promise<{ userId: string; email: string } | null> {
  const userId = normalizeIdentifier(targetClerkUserId);
  const email = normalizeEmail(confirmationEmail);
  if (!userId || !email) return null;

  try {
    const user = await directory.getUser(userId);
    if (!getUserEmail(user, email)) return null;
    return { userId: user.id, email };
  } catch {
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

    return {
      success: true,
      account: {
        clerkUserId: user.id,
        email: getUserEmail(user, email) ?? email,
        displayName: getDisplayName(user),
        clerkCreatedAt: new Date(user.createdAt).toISOString(),
        lastSignInAt:
          user.lastSignInAt === null
            ? null
            : new Date(user.lastSignInAt).toISOString(),
        isCurrentOperator: user.id === input.operatorClerkUserId,
        classTrace: account
          ? {
              teacherProfileId: account.id,
              teacherDisplayName: account.displayName,
              teacherCreatedAt: account.createdAt.toISOString(),
              workspaceId: account.workspace?.id ?? null,
              workspaceName: account.workspace?.name ?? null,
              workspaceCreatedAt:
                account.workspace?.createdAt.toISOString() ?? null,
              counts: account.workspace?._count ?? {
                classGroups: 0,
                rosterStudents: 0,
                evidenceRecords: 0,
              },
            }
          : null,
      },
    };
  } catch {
    return { success: false, error: "Account search failed. Try again." };
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
    dependencies.directory
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
  } catch {
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
    dependencies.directory
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
    } catch {
      try {
        await dependencies.database.completeClerkDeletionAudit({
          auditId,
          outcome: "FAILED",
        });
      } catch {
        // The action result remains explicit without exposing target data in logs.
      }
      return { success: false, error: "The Clerk user could not be deleted." };
    }

    try {
      await dependencies.database.completeClerkDeletionAudit({
        auditId,
        outcome: "SUCCEEDED",
      });
    } catch {
      return {
        success: false,
        clerkUserDeleted: true,
        error: "The Clerk user was deleted, but the audit outcome was not updated.",
      };
    }

    return { success: true };
  } catch {
    return { success: false, error: "The Clerk user could not be deleted." };
  }
}

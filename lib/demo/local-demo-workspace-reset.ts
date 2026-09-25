import "server-only";

import type { PrismaClient } from "../generated/prisma/client.ts";
import {
  DEMO_DATABASE_IDENTITY,
  DEMO_DATASET,
  type DemoDatabaseIdentity,
  type DemoDatasetSummary,
} from "./demo-data.ts";
import {
  readDemoDatabaseIdentity,
  resetDemoWorkspace,
} from "./demo-workspace-reset.ts";
import { scopeDemoDatasetForClerkUser } from "./scope-demo-dataset.ts";

type DevelopmentTarget =
  | { kind: "clerkUserId"; value: string }
  | { kind: "email"; value: string };

type DevelopmentDirectoryUser = {
  id: string;
  emailAddresses?: Array<{ emailAddress?: string }>;
};

export type DevelopmentIdentityDirectory = {
  getUser(userId: string): Promise<DevelopmentDirectoryUser>;
  findUsersByEmail(email: string): Promise<DevelopmentDirectoryUser[]>;
};

type LocalDemoWorkspaceDatabase = Pick<
  PrismaClient,
  "$queryRawUnsafe" | "$transaction"
>;

export class LocalDemoResetError extends Error {}

export const scopeDemoDatasetForDevelopment = scopeDemoDatasetForClerkUser;

function exactEmailForUser(
  user: DevelopmentDirectoryUser,
  email: string
): boolean {
  return Boolean(
    user.emailAddresses?.some(
      (address) => address.emailAddress?.trim().toLowerCase() === email
    )
  );
}

export async function resolveDevelopmentClerkUserId(
  target: DevelopmentTarget,
  directory: DevelopmentIdentityDirectory
): Promise<string> {
  try {
    if (target.kind === "clerkUserId") {
      const user = await directory.getUser(target.value);
      if (user.id !== target.value) throw new Error("mismatch");
      return user.id;
    }

    const users = await directory.findUsersByEmail(target.value);
    const exactMatches = users.filter((user) =>
      exactEmailForUser(user, target.value)
    );
    if (exactMatches.length !== 1) throw new Error("ambiguous");
    return exactMatches[0].id;
  } catch {
    throw new LocalDemoResetError(
      "The requested account was not found uniquely in the Clerk development instance."
    );
  }
}

export async function verifyLocalDevelopmentDatabase(
  database: Pick<PrismaClient, "$queryRawUnsafe">
): Promise<DemoDatabaseIdentity> {
  const identity = await readDemoDatabaseIdentity(database);

  if (
    !identity.projectId ||
    !identity.branchId ||
    identity.databaseName !== "classtrace_dev" ||
    identity.projectId === DEMO_DATABASE_IDENTITY.projectId ||
    identity.branchId === DEMO_DATABASE_IDENTITY.branchId ||
    identity.databaseName === DEMO_DATABASE_IDENTITY.databaseName
  ) {
    throw new LocalDemoResetError(
      "The connected database is not the configured non-production ClassTrace development database."
    );
  }

  return identity;
}

export async function resetLocalDemoWorkspace(input: {
  database: LocalDemoWorkspaceDatabase;
  target: DevelopmentTarget;
  directory: DevelopmentIdentityDirectory;
  resetWorkspace?: typeof resetDemoWorkspace;
}): Promise<DemoDatasetSummary> {
  const expectedDatabaseIdentity = await verifyLocalDevelopmentDatabase(
    input.database
  );
  const clerkUserId = await resolveDevelopmentClerkUserId(
    input.target,
    input.directory
  );
  const dataset = scopeDemoDatasetForDevelopment(DEMO_DATASET, clerkUserId);

  return (input.resetWorkspace ?? resetDemoWorkspace)({
    database: input.database,
    clerkUserId,
    dataset,
    expectedDatabaseIdentity,
  });
}

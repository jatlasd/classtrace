import { createHash } from "node:crypto";
import { pathToFileURL } from "node:url";
import { createClerkClient } from "@clerk/backend";
import { PrismaPg } from "@prisma/adapter-pg";
import { config as loadEnv } from "dotenv";
import { DEMO_DATABASE_IDENTITY, DEMO_DATASET } from "./demo-data.mjs";
import {
  buildLocalDemoResetConfig,
  LocalDemoResetConfigError,
} from "./local-demo-reset-guard.mjs";
import {
  DemoResetError,
  resetDemoWorkspace,
} from "./reset-demo-workspace.mjs";

export class LocalDemoResetError extends Error {}

export function scopeDemoDatasetForDevelopment(dataset, clerkUserId) {
  const scope = createHash("sha256")
    .update(clerkUserId)
    .digest("hex")
    .slice(0, 12);
  const scopedId = (id) => `${id}_local_${scope}`;
  const classIds = new Map(
    dataset.classes.map((classGroup) => [classGroup.id, scopedId(classGroup.id)])
  );
  const studentIds = new Map(
    dataset.students.map((student) => [student.id, scopedId(student.id)])
  );
  const evidenceIds = new Map(
    dataset.evidence.map((record) => [record.id, scopedId(record.id)])
  );

  return {
    ...dataset,
    classes: dataset.classes.map((classGroup) => ({
      ...classGroup,
      id: classIds.get(classGroup.id),
    })),
    students: dataset.students.map((student) => ({
      ...student,
      id: studentIds.get(student.id),
      classId: classIds.get(student.classId),
    })),
    evidence: dataset.evidence.map((record) => ({
      ...record,
      id: evidenceIds.get(record.id),
      studentId: studentIds.get(record.studentId),
      classId: classIds.get(record.classId),
    })),
    photos: dataset.photos.map((photo) => ({
      ...photo,
      id: scopedId(photo.id),
      evidenceId: evidenceIds.get(photo.evidenceId),
    })),
  };
}

function exactEmailForUser(user, email) {
  return user.emailAddresses?.some(
    (address) => address.emailAddress?.trim().toLowerCase() === email
  );
}

export async function resolveDevelopmentClerkUserId(target, directory) {
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

export async function verifyLocalDevelopmentDatabase(client) {
  const result = await client.query(
    `SELECT
       current_setting('neon.project_id', true) AS "projectId",
       current_setting('neon.branch_id', true) AS "branchId",
       current_database() AS "databaseName"`
  );
  const identity = result.rows[0];

  if (
    result.rows.length !== 1 ||
    !identity?.projectId ||
    !identity?.branchId ||
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

export async function resetLocalDemoWorkspace({
  client,
  target,
  directory,
  resetWorkspace = resetDemoWorkspace,
}) {
  const expectedDatabaseIdentity = await verifyLocalDevelopmentDatabase(client);
  const clerkUserId = await resolveDevelopmentClerkUserId(target, directory);
  const dataset = scopeDemoDatasetForDevelopment(DEMO_DATASET, clerkUserId);

  return resetWorkspace({
    client,
    clerkUserId,
    dataset,
    expectedDatabaseIdentity,
  });
}

async function main() {
  loadEnv({ path: ".env.local", quiet: true });

  let adapter;
  let databaseClient;
  let summary;
  let failureMessage = "";

  try {
    const resetConfig = buildLocalDemoResetConfig({
      env: process.env,
      argv: process.argv.slice(2),
    });
    const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
    const directory = {
      getUser: (userId) => clerk.users.getUser(userId),
      async findUsersByEmail(email) {
        const response = await clerk.users.getUserList({
          emailAddress: [email],
          limit: 10,
        });
        return response.data;
      },
    };

    adapter = await new PrismaPg(resetConfig.databaseUrl).connect();
    databaseClient = await adapter.underlyingDriver().connect();
    summary = await resetLocalDemoWorkspace({
      client: databaseClient,
      target: resetConfig.target,
      directory,
    });
  } catch (error) {
    failureMessage =
      error instanceof LocalDemoResetConfigError ||
      error instanceof LocalDemoResetError ||
      error instanceof DemoResetError
        ? error.message
        : "The guarded local demo reset could not connect or complete.";
  } finally {
    databaseClient?.release();
    try {
      await adapter?.dispose();
    } catch {
      failureMessage ||= "The development database connection did not close cleanly.";
    }
  }

  if (failureMessage || !summary) {
    console.error(
      `Local demo reset failed: ${failureMessage || "The guarded local demo reset failed."}`
    );
    process.exitCode = 1;
    return;
  }

  console.log(`Demo dataset: ${summary.version}`);
  console.log("Local development workspace reset complete.");
  console.log(
    `Counts: ${summary.classCount} classes, ${summary.studentCount} students, ${summary.evidenceCount} evidence records, ${summary.photoCount} evidence photos.`
  );
  console.log(
    `Evidence dates: ${summary.earliestEvidenceDate.slice(0, 10)} through ${summary.latestEvidenceDate.slice(0, 10)}.`
  );
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}

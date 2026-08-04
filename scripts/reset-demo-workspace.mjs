import { pathToFileURL } from "node:url";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  DEMO_DATABASE_IDENTITY,
  DEMO_DATASET,
  validateDemoDataset,
} from "./demo-data.mjs";
import {
  buildDemoResetConfig,
  DemoResetConfigError,
} from "./demo-reset-guard.mjs";

const MAX_SERIALIZATION_ATTEMPTS = 3;

export class DemoResetError extends Error {}

function isSerializationFailure(error) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "40001"
  );
}

async function verifyCanonicalDatabase(client, expectedDatabaseIdentity) {
  const result = await client.query(
    `SELECT
       current_setting('neon.project_id', true) AS "projectId",
       current_setting('neon.branch_id', true) AS "branchId",
       current_database() AS "databaseName"`
  );
  const identity = result.rows[0];

  if (
    result.rows.length !== 1 ||
    identity.projectId !== expectedDatabaseIdentity.projectId ||
    identity.branchId !== expectedDatabaseIdentity.branchId ||
    identity.databaseName !== expectedDatabaseIdentity.databaseName
  ) {
    throw new DemoResetError(
      "The connected database is not the canonical ClassTrace production target."
    );
  }
}

async function resolveCanonicalWorkspace(client, clerkUserId) {
  const result = await client.query(
    `SELECT
       tp.id AS "teacherProfileId",
       w.id AS "workspaceId",
       EXISTS (
         SELECT 1
         FROM "BetaAgreementAcceptance" ba
         WHERE ba."teacherProfileId" = tp.id
       ) AS "hasAgreementAcceptance"
     FROM "TeacherProfile" tp
     JOIN "Workspace" w ON w."teacherProfileId" = tp.id
     WHERE tp."clerkUserId" = $1
     FOR UPDATE OF tp, w`,
    [clerkUserId]
  );

  if (result.rows.length !== 1 || result.rows[0].hasAgreementAcceptance !== true) {
    throw new DemoResetError(
      "The canonical demo profile, workspace, and beta acceptance could not be verified."
    );
  }

  return result.rows[0].workspaceId;
}

async function deleteWorkspaceDemoRows(client, workspaceId) {
  await client.query('DELETE FROM "EvidenceRecord" WHERE "workspaceId" = $1', [
    workspaceId,
  ]);
  await client.query('DELETE FROM "RosterStudent" WHERE "workspaceId" = $1', [
    workspaceId,
  ]);
  await client.query('DELETE FROM "ClassGroup" WHERE "workspaceId" = $1', [
    workspaceId,
  ]);
}

async function insertClasses(client, workspaceId, dataset) {
  for (const classGroup of dataset.classes) {
    await client.query(
      `INSERT INTO "ClassGroup" (
         id, "workspaceId", name, "nameKey", "createdAt", "updatedAt", "archivedAt"
       ) VALUES ($1, $2, $3, $4, $5, $5, NULL)`,
      [
        classGroup.id,
        workspaceId,
        classGroup.name,
        classGroup.nameKey,
        classGroup.createdAt,
      ]
    );
  }
}

async function insertStudents(client, workspaceId, dataset) {
  for (const student of dataset.students) {
    await client.query(
      `INSERT INTO "RosterStudent" (
         id, "workspaceId", "classGroupId", "displayName", "mentionHandle",
         "schoolLocalId", "createdAt", "updatedAt", "archivedAt"
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $7, NULL)`,
      [
        student.id,
        workspaceId,
        student.classId,
        student.displayName,
        student.mentionHandle,
        student.schoolLocalId,
        student.createdAt,
      ]
    );
  }
}

async function insertEvidence(client, workspaceId, dataset) {
  for (const record of dataset.evidence) {
    await client.query(
      `INSERT INTO "EvidenceRecord" (
         id, "workspaceId", "rosterStudentId", "classGroupId", "evidenceDate",
         "evidenceNote", summary, "evidenceType", topic, "supportLevel", context,
         performance, communication, behavior, tags, "followUpNeeded",
         "followUpNotes", "validatedAt", "createdAt", "updatedAt", "archivedAt"
       ) VALUES (
         $1, $2, $3, $4, $5, $6, $7, $8, $9, NULL, NULL, $10, NULL, $11,
         $12, $13, $14, $15, $16, $17, NULL
       )`,
      [
        record.id,
        workspaceId,
        record.studentId,
        record.classId,
        record.evidenceDate,
        record.evidenceNote,
        record.summary,
        record.evidenceType,
        record.topic,
        record.performance,
        record.behavior.length > 0 ? record.behavior.join(", ") : null,
        [...record.tags],
        record.followUpNeeded,
        record.followUpNotes.length > 0
          ? record.followUpNotes.join("\n")
          : null,
        record.validatedAt,
        record.createdAt,
        record.updatedAt,
      ]
    );
  }
}

async function verifyResetInsideTransaction(client, workspaceId, expected) {
  const result = await client.query(
    `SELECT
       (SELECT COUNT(*)::int FROM "ClassGroup" WHERE "workspaceId" = $1) AS "classCount",
       (SELECT COUNT(*)::int FROM "RosterStudent" WHERE "workspaceId" = $1) AS "studentCount",
       (SELECT COUNT(*)::int FROM "EvidenceRecord" WHERE "workspaceId" = $1) AS "evidenceCount",
       (
         SELECT COUNT(*)::int
         FROM "RosterStudent" student
         LEFT JOIN "ClassGroup" class_group
           ON class_group."workspaceId" = student."workspaceId"
          AND class_group.id = student."classGroupId"
         WHERE student."workspaceId" = $1
           AND (
             student."classGroupId" IS NULL
             OR class_group.id IS NULL
             OR class_group."archivedAt" IS NOT NULL
           )
       ) AS "invalidStudentRelations",
       (
         SELECT COUNT(*)::int
         FROM "EvidenceRecord" evidence
         LEFT JOIN "RosterStudent" student
           ON student."workspaceId" = evidence."workspaceId"
          AND student.id = evidence."rosterStudentId"
         LEFT JOIN "ClassGroup" class_group
           ON class_group."workspaceId" = evidence."workspaceId"
          AND class_group.id = evidence."classGroupId"
         WHERE evidence."workspaceId" = $1
           AND (
             student.id IS NULL
             OR class_group.id IS NULL
             OR student."classGroupId" <> evidence."classGroupId"
           )
       ) AS "invalidEvidenceRelations"`,
    [workspaceId]
  );

  const counts = result.rows[0];
  if (
    counts?.classCount !== expected.classCount ||
    counts?.studentCount !== expected.studentCount ||
    counts?.evidenceCount !== expected.evidenceCount ||
    counts?.invalidStudentRelations !== 0 ||
    counts?.invalidEvidenceRelations !== 0
  ) {
    throw new DemoResetError(
      "The demo reset verification did not match the canonical dataset."
    );
  }
}

async function executeResetAttempt({
  client,
  clerkUserId,
  dataset,
  summary,
  expectedDatabaseIdentity,
}) {
  await client.query("BEGIN TRANSACTION ISOLATION LEVEL SERIALIZABLE");

  try {
    await verifyCanonicalDatabase(client, expectedDatabaseIdentity);
    const workspaceId = await resolveCanonicalWorkspace(client, clerkUserId);
    await deleteWorkspaceDemoRows(client, workspaceId);
    await insertClasses(client, workspaceId, dataset);
    await insertStudents(client, workspaceId, dataset);
    await insertEvidence(client, workspaceId, dataset);
    await verifyResetInsideTransaction(client, workspaceId, summary);
    await client.query("COMMIT");
    return summary;
  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch {
      throw new DemoResetError(
        "The demo reset failed and the database rollback could not be confirmed."
      );
    }
    throw error;
  }
}

export async function resetDemoWorkspace({
  client,
  clerkUserId,
  dataset = DEMO_DATASET,
  expectedDatabaseIdentity = DEMO_DATABASE_IDENTITY,
}) {
  const summary = validateDemoDataset(dataset);

  for (let attempt = 1; attempt <= MAX_SERIALIZATION_ATTEMPTS; attempt += 1) {
    try {
      return await executeResetAttempt({
        client,
        clerkUserId,
        dataset,
        summary,
        expectedDatabaseIdentity,
      });
    } catch (error) {
      if (isSerializationFailure(error) && attempt < MAX_SERIALIZATION_ATTEMPTS) {
        continue;
      }
      if (error instanceof DemoResetError) {
        throw error;
      }
      throw new DemoResetError("The database rejected the demo reset transaction.");
    }
  }

  throw new DemoResetError("The demo reset could not complete after bounded retries.");
}

async function main() {
  let adapter;
  let databaseClient;
  let summary;
  let failureMessage = "";

  try {
    const config = buildDemoResetConfig({
      env: process.env,
      argv: process.argv.slice(2),
    });
    adapter = await new PrismaPg(config.databaseUrl).connect();
    databaseClient = await adapter.underlyingDriver().connect();

    summary = await resetDemoWorkspace({
      client: databaseClient,
      clerkUserId: config.clerkUserId,
    });
  } catch (error) {
    failureMessage =
      error instanceof DemoResetConfigError || error instanceof DemoResetError
        ? error.message
        : "The guarded demo reset could not connect or complete.";
  } finally {
    databaseClient?.release();
    try {
      await adapter?.dispose();
    } catch {
      failureMessage ||= "The demo database connection did not close cleanly.";
    }
  }

  if (failureMessage || !summary) {
    console.error(`Demo reset failed: ${failureMessage || "The guarded demo reset failed."}`);
    process.exitCode = 1;
    return;
  }

  console.log(`Demo dataset: ${summary.version}`);
  console.log("Canonical demo workspace reset complete.");
  console.log(
    `Counts: ${summary.classCount} classes, ${summary.studentCount} students, ${summary.evidenceCount} evidence records.`
  );
  console.log(
    `Evidence dates: ${summary.earliestEvidenceDate.slice(0, 10)} through ${summary.latestEvidenceDate.slice(0, 10)}.`
  );
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  await main();
}

import "server-only";

import { readFile } from "node:fs/promises";
import {
  Prisma,
  type PrismaClient,
} from "../generated/prisma/client.ts";
import { withSerializableTransactionRetry } from "../db/serializable-transaction.ts";
import { INPUT_LIMITS } from "../validation/input-limits.ts";
import {
  DEMO_DATABASE_IDENTITY,
  DEMO_DATASET,
  type DemoDatabaseIdentity,
  type DemoDataset,
  type DemoDatasetSummary,
  validateDemoDataset,
} from "./demo-data.ts";

type DemoWorkspaceDatabase = Pick<PrismaClient, "$queryRawUnsafe" | "$transaction">;

type PreparedDemoPhoto = DemoDataset["photos"][number] & {
  imageData: Uint8Array<ArrayBuffer>;
};

type ResetMode =
  | {
      kind: "canonical";
      expectedDatabaseIdentity: DemoDatabaseIdentity;
    }
  | {
      kind: "operator";
      currentAgreementVersion: string;
      confirmationEmail: string;
      targetEmail: string;
    };

export class DemoResetError extends Error {}

export class OperatorDemoResetError extends DemoResetError {
  readonly code:
    | "TARGET_MISSING"
    | "BETA_REQUIRED"
    | "CONFIRMATION_REQUIRED"
    | "RESET_FAILED";

  constructor(
    code:
      | "TARGET_MISSING"
      | "BETA_REQUIRED"
      | "CONFIRMATION_REQUIRED"
      | "RESET_FAILED",
    message: string
  ) {
    super(message);
    this.code = code;
  }
}

export async function readDemoDatabaseIdentity(
  database: Pick<PrismaClient, "$queryRawUnsafe">
): Promise<DemoDatabaseIdentity> {
  const rows = await database.$queryRawUnsafe<DemoDatabaseIdentity[]>(
    `SELECT
       current_setting('neon.project_id', true) AS "projectId",
       current_setting('neon.branch_id', true) AS "branchId",
       current_database() AS "databaseName"`
  );

  if (rows.length !== 1) {
    throw new DemoResetError("The connected database identity is unavailable.");
  }

  return rows[0];
}

function matchesDatabaseIdentity(
  actual: DemoDatabaseIdentity,
  expected: DemoDatabaseIdentity
): boolean {
  return (
    actual.projectId === expected.projectId &&
    actual.branchId === expected.branchId &&
    actual.databaseName === expected.databaseName
  );
}

async function loadDemoPhotos(
  dataset: DemoDataset
): Promise<PreparedDemoPhoto[]> {
  return Promise.all(
    dataset.photos.map(async (photo) => {
      const imageData = await readFile(
        new URL(`../../scripts/demo-assets/${photo.assetFilename}`, import.meta.url)
      );
      if (
        imageData.length === 0 ||
        imageData.length > INPUT_LIMITS.evidencePhotoStoredBytes ||
        imageData.subarray(0, 4).toString("ascii") !== "RIFF" ||
        imageData.subarray(8, 12).toString("ascii") !== "WEBP"
      ) {
        throw new DemoResetError("A canonical demo photo asset is invalid.");
      }

      return { ...photo, imageData: Uint8Array.from(imageData) };
    })
  );
}

async function resolveWorkspace(
  transaction: Prisma.TransactionClient,
  clerkUserId: string,
  mode: ResetMode
): Promise<string> {
  const profile = await transaction.teacherProfile.findUnique({
    where: { clerkUserId },
    select: {
      betaAgreementAcceptances: {
        ...(mode.kind === "operator"
          ? { where: { agreementVersion: mode.currentAgreementVersion } }
          : {}),
        take: 1,
        select: { teacherProfileId: true },
      },
      workspace: {
        select: {
          id: true,
          _count: {
            select: {
              classGroups: true,
              rosterStudents: true,
              evidenceRecords: true,
              evidencePhotos: true,
            },
          },
        },
      },
    },
  });

  if (!profile?.workspace) {
    if (mode.kind === "operator") {
      throw new OperatorDemoResetError(
        "TARGET_MISSING",
        "The selected account does not have a ClassTrace profile and workspace."
      );
    }
    throw new DemoResetError(
      "The canonical demo profile, workspace, and beta acceptance could not be verified."
    );
  }

  if (profile.betaAgreementAcceptances.length !== 1) {
    if (mode.kind === "operator") {
      throw new OperatorDemoResetError(
        "BETA_REQUIRED",
        "The selected account has not completed the current beta acknowledgement."
      );
    }
    throw new DemoResetError(
      "The canonical demo profile, workspace, and beta acceptance could not be verified."
    );
  }

  if (mode.kind === "operator") {
    const counts = profile.workspace._count;
    const containsData =
      counts.classGroups > 0 ||
      counts.rosterStudents > 0 ||
      counts.evidenceRecords > 0 ||
      counts.evidencePhotos > 0;
    if (containsData && mode.confirmationEmail !== mode.targetEmail) {
      throw new OperatorDemoResetError(
        "CONFIRMATION_REQUIRED",
        "Enter the selected account email to replace its workspace."
      );
    }
  }

  return profile.workspace.id;
}

async function replaceWorkspaceInsideTransaction(
  transaction: Prisma.TransactionClient,
  input: {
    clerkUserId: string;
    dataset: DemoDataset;
    photos: PreparedDemoPhoto[];
    summary: DemoDatasetSummary;
    mode: ResetMode;
  }
): Promise<DemoDatasetSummary> {
  const actualIdentity = await readDemoDatabaseIdentity(transaction);
  const expectedIdentity =
    input.mode.kind === "canonical"
      ? input.mode.expectedDatabaseIdentity
      : DEMO_DATABASE_IDENTITY;
  if (!matchesDatabaseIdentity(actualIdentity, expectedIdentity)) {
    throw new DemoResetError(
      "The connected database is not the canonical ClassTrace production target."
    );
  }

  const workspaceId = await resolveWorkspace(
    transaction,
    input.clerkUserId,
    input.mode
  );

  await transaction.evidenceRecord.deleteMany({ where: { workspaceId } });
  await transaction.rosterStudent.deleteMany({ where: { workspaceId } });
  await transaction.classGroup.deleteMany({ where: { workspaceId } });

  const classResult = await transaction.classGroup.createMany({
    data: input.dataset.classes.map((classGroup) => ({
      id: classGroup.id,
      workspaceId,
      name: classGroup.name,
      nameKey: classGroup.nameKey,
      createdAt: new Date(classGroup.createdAt),
      updatedAt: new Date(classGroup.createdAt),
      archivedAt: null,
    })),
  });
  const studentResult = await transaction.rosterStudent.createMany({
    data: input.dataset.students.map((student) => ({
      id: student.id,
      workspaceId,
      classGroupId: student.classId,
      displayName: student.displayName,
      mentionHandle: student.mentionHandle,
      schoolLocalId: student.schoolLocalId,
      createdAt: new Date(student.createdAt),
      updatedAt: new Date(student.createdAt),
      archivedAt: null,
    })),
  });
  const evidenceResult = await transaction.evidenceRecord.createMany({
    data: input.dataset.evidence.map((record) => ({
      id: record.id,
      workspaceId,
      rosterStudentId: record.studentId,
      classGroupId: record.classId,
      evidenceDate: new Date(record.evidenceDate),
      evidenceNote: record.evidenceNote,
      summary: record.summary,
      evidenceType: record.evidenceType,
      topic: record.topic,
      supportLevel: null,
      context: null,
      performance: record.performance,
      communication: null,
      behavior: record.behavior.length > 0 ? record.behavior.join(", ") : null,
      tags: [...record.tags],
      followUpNeeded: record.followUpNeeded,
      followUpNotes:
        record.followUpNotes.length > 0
          ? record.followUpNotes.join("\n")
          : null,
      validatedAt: new Date(record.validatedAt),
      createdAt: new Date(record.createdAt),
      updatedAt: new Date(record.updatedAt),
      archivedAt: null,
    })),
  });
  const photoResult = await transaction.evidencePhoto.createMany({
    data: input.photos.map((photo) => {
      const evidence = input.dataset.evidence.find(
        (record) => record.id === photo.evidenceId
      );
      if (!evidence) {
        throw new DemoResetError("A canonical demo photo relation is invalid.");
      }
      return {
        id: photo.id,
        workspaceId,
        evidenceRecordId: photo.evidenceId,
        imageData: photo.imageData,
        contentType: photo.contentType,
        byteSize: photo.imageData.byteLength,
        width: photo.width,
        height: photo.height,
        createdAt: new Date(evidence.createdAt),
      };
    }),
  });

  if (
    classResult.count !== input.summary.classCount ||
    studentResult.count !== input.summary.studentCount ||
    evidenceResult.count !== input.summary.evidenceCount ||
    photoResult.count !== input.summary.photoCount
  ) {
    throw new DemoResetError(
      "The demo reset verification did not match the canonical dataset."
    );
  }

  return input.summary;
}

async function executeReset(input: {
  database: DemoWorkspaceDatabase;
  clerkUserId: string;
  dataset: DemoDataset;
  mode: ResetMode;
}): Promise<DemoDatasetSummary> {
  const summary = validateDemoDataset(input.dataset);
  const photos = await loadDemoPhotos(input.dataset);

  return withSerializableTransactionRetry(() =>
    input.database.$transaction(
      (transaction) =>
        replaceWorkspaceInsideTransaction(transaction, {
          clerkUserId: input.clerkUserId,
          dataset: input.dataset,
          photos,
          summary,
          mode: input.mode,
        }),
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
    )
  );
}

export async function resetOperatorDemoWorkspace(input: {
  database: DemoWorkspaceDatabase;
  clerkUserId: string;
  currentAgreementVersion: string;
  confirmationEmail: string;
  targetEmail: string;
  dataset: DemoDataset;
}): Promise<DemoDatasetSummary> {
  validateDemoDataset(input.dataset);
  try {
    return await executeReset({
      database: input.database,
      clerkUserId: input.clerkUserId,
      dataset: input.dataset,
      mode: {
        kind: "operator",
        currentAgreementVersion: input.currentAgreementVersion,
        confirmationEmail: input.confirmationEmail,
        targetEmail: input.targetEmail,
      },
    });
  } catch (error) {
    if (error instanceof OperatorDemoResetError) throw error;
    throw new OperatorDemoResetError(
      "RESET_FAILED",
      "The selected workspace could not be replaced with demo data."
    );
  }
}

export async function resetDemoWorkspace(input: {
  database: DemoWorkspaceDatabase;
  clerkUserId: string;
  dataset?: DemoDataset;
  expectedDatabaseIdentity?: DemoDatabaseIdentity;
}): Promise<DemoDatasetSummary> {
  const dataset = input.dataset ?? DEMO_DATASET;
  validateDemoDataset(dataset);
  try {
    return await executeReset({
      database: input.database,
      clerkUserId: input.clerkUserId,
      dataset,
      mode: {
        kind: "canonical",
        expectedDatabaseIdentity:
          input.expectedDatabaseIdentity ?? DEMO_DATABASE_IDENTITY,
      },
    });
  } catch (error) {
    if (error instanceof DemoResetError) throw error;
    throw new DemoResetError("The database rejected the demo reset transaction.");
  }
}

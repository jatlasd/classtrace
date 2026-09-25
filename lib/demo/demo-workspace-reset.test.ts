import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
  DEMO_CLERK_USER_ID,
  DEMO_DATABASE_IDENTITY,
  DEMO_DATASET,
} from "@/lib/demo/demo-data";
import {
  DemoResetError,
  OperatorDemoResetError,
  resetDemoWorkspace,
  resetOperatorDemoWorkspace,
} from "@/lib/demo/demo-workspace-reset";
import { scopeDemoDatasetForClerkUser } from "@/lib/demo/scope-demo-dataset";

const canonicalCounts = {
  classCount: DEMO_DATASET.classes.length,
  studentCount: DEMO_DATASET.students.length,
  evidenceCount: DEMO_DATASET.evidence.length,
  photoCount: DEMO_DATASET.photos.length,
};

function buildProfile(input?: {
  workspaceId?: string;
  accepted?: boolean;
  existingCounts?: Partial<{
    classGroups: number;
    rosterStudents: number;
    evidenceRecords: number;
    evidencePhotos: number;
  }>;
}) {
  return {
    betaAgreementAcceptances:
      input?.accepted === false ? [] : [{ teacherProfileId: "teacher_target" }],
    workspace: {
      id: input?.workspaceId ?? "workspace_target",
      _count: {
        classGroups: 0,
        rosterStudents: 0,
        evidenceRecords: 0,
        evidencePhotos: 0,
        ...input?.existingCounts,
      },
    },
  };
}

function createDatabase(options?: {
  identity?: typeof DEMO_DATABASE_IDENTITY;
  profile?: ReturnType<typeof buildProfile> | null;
  serializationFailures?: number;
  createdCounts?: Partial<typeof canonicalCounts>;
}) {
  const createdCounts = { ...canonicalCounts, ...options?.createdCounts };
  const calls = {
    deletedWorkspaceIds: [] as string[],
    classes: [] as unknown[],
    students: [] as unknown[],
    evidence: [] as unknown[],
    photos: [] as unknown[],
  };
  let serializationFailures = options?.serializationFailures ?? 0;
  const transaction = {
    $queryRawUnsafe: vi
      .fn()
      .mockResolvedValue([{ ...(options?.identity ?? DEMO_DATABASE_IDENTITY) }]),
    teacherProfile: {
      findUnique: vi
        .fn()
        .mockResolvedValue(
          options && "profile" in options ? options.profile : buildProfile()
        ),
    },
    classGroup: {
      deleteMany: vi.fn(async ({ where }) => {
        calls.deletedWorkspaceIds.push(where.workspaceId);
        return { count: 0 };
      }),
      createMany: vi.fn(async ({ data }) => {
        calls.classes.push(...data);
        return { count: createdCounts.classCount };
      }),
    },
    rosterStudent: {
      deleteMany: vi.fn(async ({ where }) => {
        calls.deletedWorkspaceIds.push(where.workspaceId);
        return { count: 0 };
      }),
      createMany: vi.fn(async ({ data }) => {
        calls.students.push(...data);
        return { count: createdCounts.studentCount };
      }),
    },
    evidenceRecord: {
      deleteMany: vi.fn(async ({ where }) => {
        calls.deletedWorkspaceIds.push(where.workspaceId);
        return { count: 0 };
      }),
      createMany: vi.fn(async ({ data }) => {
        calls.evidence.push(...data);
        return { count: createdCounts.evidenceCount };
      }),
    },
    evidencePhoto: {
      createMany: vi.fn(async ({ data }) => {
        calls.photos.push(...data);
        return { count: createdCounts.photoCount };
      }),
    },
  };
  const database = {
    $queryRawUnsafe: transaction.$queryRawUnsafe,
    $transaction: vi.fn(async (execute) => {
      if (serializationFailures > 0) {
        serializationFailures -= 1;
        throw Object.assign(new Error("serialization conflict"), { code: "P2034" });
      }
      return execute(transaction);
    }),
  };

  return { database, transaction, calls };
}

function operatorResetInput(
  database: ReturnType<typeof createDatabase>["database"],
  clerkUserId = "target_1"
) {
  return {
    database,
    clerkUserId,
    currentAgreementVersion: "2026-08-21",
    confirmationEmail: "stacy@example.com",
    targetEmail: "stacy@example.com",
    dataset: scopeDemoDatasetForClerkUser(DEMO_DATASET, clerkUserId),
  };
}

describe("demo workspace reset", () => {
  it("replaces only the resolved workspace with the complete canonical dataset", async () => {
    const { database, calls } = createDatabase({
      profile: buildProfile({ workspaceId: "workspace_demo" }),
    });

    await expect(
      resetDemoWorkspace({ database, clerkUserId: DEMO_CLERK_USER_ID })
    ).resolves.toMatchObject(canonicalCounts);

    expect(calls.deletedWorkspaceIds).toEqual([
      "workspace_demo",
      "workspace_demo",
      "workspace_demo",
    ]);
    expect(calls.classes).toHaveLength(canonicalCounts.classCount);
    expect(calls.students).toHaveLength(canonicalCounts.studentCount);
    expect(calls.evidence).toHaveLength(canonicalCounts.evidenceCount);
    expect(calls.photos).toHaveLength(canonicalCounts.photoCount);
    expect(
      [...calls.classes, ...calls.students, ...calls.evidence, ...calls.photos].every(
        (record) =>
          typeof record === "object" &&
          record !== null &&
          "workspaceId" in record &&
          record.workspaceId === "workspace_demo"
      )
    ).toBe(true);
  });

  it("rejects invalid data and the wrong database before destructive writes", async () => {
    const invalidDataset = structuredClone(DEMO_DATASET);
    invalidDataset.evidence[0].classId = "other_workspace_class";
    const invalid = createDatabase();

    await expect(
      resetDemoWorkspace({
        database: invalid.database,
        clerkUserId: DEMO_CLERK_USER_ID,
        dataset: invalidDataset,
      })
    ).rejects.toThrow(/ownership relation/);
    expect(invalid.database.$transaction).not.toHaveBeenCalled();

    const wrongDatabase = createDatabase({
      identity: { ...DEMO_DATABASE_IDENTITY, branchId: "br-not-production" },
    });
    await expect(
      resetDemoWorkspace({
        database: wrongDatabase.database,
        clerkUserId: DEMO_CLERK_USER_ID,
      })
    ).rejects.toThrow(DemoResetError);
    expect(wrongDatabase.calls.deletedWorkspaceIds).toEqual([]);
  });

  it("retries Prisma serialization conflicts with the shared bounded policy", async () => {
    const { database } = createDatabase({ serializationFailures: 2 });

    await expect(
      resetDemoWorkspace({ database, clerkUserId: DEMO_CLERK_USER_ID })
    ).resolves.toMatchObject(canonicalCounts);
    expect(database.$transaction).toHaveBeenCalledTimes(3);
  });

  it("fails the transaction when inserted counts do not match validation", async () => {
    const { database } = createDatabase({
      createdCounts: { evidenceCount: canonicalCounts.evidenceCount - 1 },
    });

    await expect(
      resetDemoWorkspace({ database, clerkUserId: DEMO_CLERK_USER_ID })
    ).rejects.toThrow(/verification/);
  });

  it("repeats the same scoped replacement inputs idempotently", async () => {
    const first = createDatabase();
    const second = createDatabase();

    await resetDemoWorkspace({
      database: first.database,
      clerkUserId: DEMO_CLERK_USER_ID,
    });
    await resetDemoWorkspace({
      database: second.database,
      clerkUserId: DEMO_CLERK_USER_ID,
    });

    expect(second.calls.classes).toEqual(first.calls.classes);
    expect(second.calls.students).toEqual(first.calls.students);
    expect(second.calls.evidence).toEqual(first.calls.evidence);
  });
});

describe("operator demo workspace reset", () => {
  it("requires a target workspace and current beta acceptance", async () => {
    const missing = createDatabase({ profile: null });
    await expect(
      resetOperatorDemoWorkspace(operatorResetInput(missing.database))
    ).rejects.toMatchObject({ code: "TARGET_MISSING" });
    expect(missing.calls.deletedWorkspaceIds).toEqual([]);

    const unaccepted = createDatabase({
      profile: buildProfile({ accepted: false }),
    });
    await expect(
      resetOperatorDemoWorkspace(operatorResetInput(unaccepted.database))
    ).rejects.toMatchObject({ code: "BETA_REQUIRED" });
    expect(unaccepted.calls.deletedWorkspaceIds).toEqual([]);
  });

  it("requires exact email confirmation before replacing non-empty data", async () => {
    const { database, calls } = createDatabase({
      profile: buildProfile({ existingCounts: { classGroups: 1 } }),
    });

    await expect(
      resetOperatorDemoWorkspace({
        ...operatorResetInput(database),
        confirmationEmail: "wrong@example.com",
      })
    ).rejects.toMatchObject({ code: "CONFIRMATION_REQUIRED" });
    expect(calls.deletedWorkspaceIds).toEqual([]);
  });

  it("maps unexpected reset failures without exposing database details", async () => {
    const { database } = createDatabase({
      createdCounts: { photoCount: canonicalCounts.photoCount - 1 },
    });

    await expect(
      resetOperatorDemoWorkspace(operatorResetInput(database))
    ).rejects.toEqual(
      new OperatorDemoResetError(
        "RESET_FAILED",
        "The selected workspace could not be replaced with demo data."
      )
    );
  });

  it("uses stable collision-free IDs for each selected Clerk user", () => {
    const first = scopeDemoDatasetForClerkUser(DEMO_DATASET, "target_1");
    const repeated = scopeDemoDatasetForClerkUser(DEMO_DATASET, "target_1");
    const second = scopeDemoDatasetForClerkUser(DEMO_DATASET, "target_2");

    expect(repeated).toEqual(first);
    const firstIds = new Set(
      [...first.classes, ...first.students, ...first.evidence, ...first.photos].map(
        (record) => record.id
      )
    );
    expect(
      [...second.classes, ...second.students, ...second.evidence, ...second.photos]
        .map((record) => record.id)
        .every((id) => !firstIds.has(id))
    ).toBe(true);
  });
});

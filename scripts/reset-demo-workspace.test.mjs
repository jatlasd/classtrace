import { describe, expect, it } from "vitest";
import {
  DEMO_CLERK_USER_ID,
  DEMO_DATABASE_IDENTITY,
  DEMO_DATASET,
} from "./demo-data.mjs";
import {
  DemoResetError,
  OperatorDemoResetError,
  resetDemoWorkspace,
  resetOperatorDemoWorkspace,
} from "./reset-demo-workspace.mjs";
import { scopeDemoDatasetForClerkUser } from "./scope-demo-dataset.mjs";

const canonicalCounts = {
  classCount: DEMO_DATASET.classes.length,
  studentCount: DEMO_DATASET.students.length,
  evidenceCount: DEMO_DATASET.evidence.length,
  photoCount: DEMO_DATASET.photos.length,
};
const insertCount = Object.values(canonicalCounts).reduce((sum, count) => sum + count, 0);

class FakeDatabaseClient {
  constructor({ targetRows, counts, serializationFailures = 0 } = {}) {
    this.calls = [];
    this.targetRows =
      targetRows ??
      [{ workspaceId: "workspace_demo", hasAgreementAcceptance: true }];
    this.counts =
      counts ??
      {
        ...canonicalCounts,
        invalidStudentRelations: 0,
        invalidEvidenceRelations: 0,
      };
    this.serializationFailures = serializationFailures;
  }

  async query(text, values = []) {
    this.calls.push({ text, values });

    if (text.includes("current_setting('neon.project_id'")) {
      return { rows: [{ ...DEMO_DATABASE_IDENTITY }] };
    }
    if (text.includes('FROM "TeacherProfile"')) {
      if (this.serializationFailures > 0) {
        this.serializationFailures -= 1;
        const error = new Error("serialization failure");
        error.code = "40001";
        throw error;
      }
      return { rows: this.targetRows };
    }
    if (text.includes('(SELECT COUNT(*)::int FROM "ClassGroup"')) {
      return { rows: [this.counts] };
    }
    return { rows: [], rowCount: 1 };
  }
}

describe("demo workspace reset transaction", () => {
  it("replaces only the resolved workspace and commits canonical counts", async () => {
    const client = new FakeDatabaseClient();

    await expect(
      resetDemoWorkspace({ client, clerkUserId: DEMO_CLERK_USER_ID })
    ).resolves.toMatchObject(canonicalCounts);

    const deleteCalls = client.calls.filter((call) =>
      call.text.startsWith("DELETE")
    );
    expect(deleteCalls).toHaveLength(3);
    expect(deleteCalls.every((call) => call.values[0] === "workspace_demo")).toBe(
      true
    );
    const insertCalls = client.calls.filter((call) => call.text.startsWith("INSERT"));
    expect(insertCalls).toHaveLength(insertCount);
    expect(insertCalls.every((call) => call.values[1] === "workspace_demo")).toBe(true);
    const evidenceCalls = insertCalls.filter((call) => call.text.includes('"EvidenceRecord"'));
    expect(evidenceCalls.map((call) => call.values.slice(0, 6))).toEqual(
      DEMO_DATASET.evidence.map((record) => [
        record.id, "workspace_demo", record.studentId, record.classId,
        record.evidenceDate, record.evidenceNote,
      ])
    );
    expect(client.calls.at(-1)?.text).toBe("COMMIT");
    expect(client.calls.some((call) => call.text === "ROLLBACK")).toBe(false);
  });

  it("rejects invalid dataset relations before opening a transaction", async () => {
    const client = new FakeDatabaseClient();
    const dataset = structuredClone(DEMO_DATASET);
    dataset.evidence[0].classId = "other_workspace_class";

    await expect(resetDemoWorkspace({
      client, clerkUserId: DEMO_CLERK_USER_ID, dataset,
    })).rejects.toThrow(/ownership relation/);
    expect(client.calls).toEqual([]);
  });

  it("rolls back before deletion when the canonical target is missing", async () => {
    const client = new FakeDatabaseClient({ targetRows: [] });

    await expect(
      resetDemoWorkspace({ client, clerkUserId: DEMO_CLERK_USER_ID })
    ).rejects.toThrow(DemoResetError);

    expect(client.calls.some((call) => call.text.startsWith("DELETE"))).toBe(false);
    expect(client.calls.at(-1)?.text).toBe("ROLLBACK");
  });

  it("rolls back before account lookup when the database identity differs", async () => {
    const client = new FakeDatabaseClient();
    const wrongIdentity = {
      ...DEMO_DATABASE_IDENTITY,
      branchId: "br-not-production",
    };

    await expect(
      resetDemoWorkspace({
        client,
        clerkUserId: DEMO_CLERK_USER_ID,
        expectedDatabaseIdentity: wrongIdentity,
      })
    ).rejects.toThrow(/production target/);

    expect(client.calls.some((call) => call.text.includes('FROM "TeacherProfile"'))).toBe(
      false
    );
    expect(client.calls.some((call) => call.text.startsWith("DELETE"))).toBe(false);
    expect(client.calls.at(-1)?.text).toBe("ROLLBACK");
  });

  it.each([
    { evidenceCount: canonicalCounts.evidenceCount - 1 },
    { invalidStudentRelations: 1 },
    { invalidEvidenceRelations: 1 },
  ])("rolls back when post-insert verification fails: %j", async (invalidCounts) => {
    const client = new FakeDatabaseClient({
      counts: {
        ...canonicalCounts,
        invalidStudentRelations: 0,
        invalidEvidenceRelations: 0,
        ...invalidCounts,
      },
    });

    await expect(
      resetDemoWorkspace({ client, clerkUserId: DEMO_CLERK_USER_ID })
    ).rejects.toThrow(/verification/);
    expect(client.calls.at(-1)?.text).toBe("ROLLBACK");
    expect(client.calls.some((call) => call.text === "COMMIT")).toBe(false);
  });

  it("retries serialization failures within the bounded transaction policy", async () => {
    const client = new FakeDatabaseClient({ serializationFailures: 2 });

    await expect(
      resetDemoWorkspace({ client, clerkUserId: DEMO_CLERK_USER_ID })
    ).resolves.toMatchObject({ evidenceCount: canonicalCounts.evidenceCount });

    expect(
      client.calls.filter(
        (call) => call.text === "BEGIN TRANSACTION ISOLATION LEVEL SERIALIZABLE"
      )
    ).toHaveLength(3);
    expect(client.calls.filter((call) => call.text === "ROLLBACK")).toHaveLength(2);
  });

  it(
    "replaces the same owned workspace idempotently on repeated resets",
    async () => {
      const client = new FakeDatabaseClient();

      const first = await resetDemoWorkspace({
        client,
        clerkUserId: DEMO_CLERK_USER_ID,
      });
      const firstInserts = client.calls.filter((call) =>
        call.text.startsWith("INSERT")
      );
      const second = await resetDemoWorkspace({
        client,
        clerkUserId: DEMO_CLERK_USER_ID,
      });

      expect(second).toEqual(first);
      expect(client.calls.filter((call) => call.text === "COMMIT")).toHaveLength(
        2
      );
      expect(
        client.calls.filter((call) => call.text.startsWith("DELETE"))
      ).toHaveLength(6);
      const allInserts = client.calls.filter((call) =>
        call.text.startsWith("INSERT")
      );
      expect(allInserts).toHaveLength(insertCount * 2);
      expect(allInserts.slice(insertCount)).toEqual(firstInserts);
    },
    15_000
  );
});

class FakeOperatorDatabaseClient {
  constructor({
    databaseIdentity = DEMO_DATABASE_IDENTITY,
    profileRows,
    workspaceRows,
    counts,
  } = {}) {
    this.calls = [];
    this.databaseIdentity = databaseIdentity;
    this.profileRows = profileRows ?? [{ id: "teacher_target" }];
    this.workspaceRows = workspaceRows ?? [
      {
        workspaceId: "workspace_target",
        hasCurrentAgreementAcceptance: true,
        classCount: 0,
        studentCount: 0,
        evidenceCount: 0,
        photoCount: 0,
      },
    ];
    this.counts = counts ?? {
      ...canonicalCounts,
      invalidStudentRelations: 0,
      invalidEvidenceRelations: 0,
    };
  }

  async query(text, values = []) {
    this.calls.push({ text, values });
    if (text.includes("current_setting('neon.project_id'")) {
      return { rows: [{ ...this.databaseIdentity }] };
    }
    if (text.includes('FROM "TeacherProfile"')) {
      return { rows: this.profileRows };
    }
    if (text.includes('FROM "Workspace" w')) {
      return { rows: this.workspaceRows };
    }
    if (text.includes('(SELECT COUNT(*)::int FROM "ClassGroup"')) {
      return { rows: [this.counts] };
    }
    return { rows: [], rowCount: 1 };
  }
}

function operatorResetInput(client, clerkUserId = "target_1") {
  return {
    client,
    clerkUserId,
    currentAgreementVersion: "2026-08-21",
    confirmationEmail: "stacy@example.com",
    targetEmail: "stacy@example.com",
    dataset: scopeDemoDatasetForClerkUser(DEMO_DATASET, clerkUserId),
  };
}

describe("operator demo workspace reset transaction", () => {
  it.each([
    { projectId: "project-not-production" },
    { branchId: "branch-not-production" },
    { databaseName: "database_not_production" },
  ])(
    "rolls back before target lookup when database identity differs: %j",
    async (identityOverride) => {
      const client = new FakeOperatorDatabaseClient({
        databaseIdentity: {
          ...DEMO_DATABASE_IDENTITY,
          ...identityOverride,
        },
      });

      await expect(
        resetOperatorDemoWorkspace(operatorResetInput(client))
      ).rejects.toMatchObject({ code: "RESET_FAILED" });

      expect(
        client.calls.some((call) =>
          call.text.includes("current_setting('neon.project_id'")
        )
      ).toBe(true);
      expect(
        client.calls.some((call) => call.text.includes('FROM "TeacherProfile"'))
      ).toBe(false);
      expect(
        client.calls.some((call) => call.text.includes('FROM "Workspace"'))
      ).toBe(false);
      expect(
        client.calls.some(
          (call) =>
            call.text.startsWith("DELETE") || call.text.startsWith("INSERT")
        )
      ).toBe(false);
      expect(client.calls.at(-1)?.text).toBe("ROLLBACK");
    }
  );

  it("rejects a missing profile or workspace before deletion", async () => {
    const missingProfile = new FakeOperatorDatabaseClient({ profileRows: [] });
    await expect(
      resetOperatorDemoWorkspace(operatorResetInput(missingProfile))
    ).rejects.toMatchObject({ code: "TARGET_MISSING" });
    expect(missingProfile.calls.some((call) => call.text.startsWith("DELETE"))).toBe(
      false
    );
    expect(missingProfile.calls.at(-1)?.text).toBe("ROLLBACK");

    const missingWorkspace = new FakeOperatorDatabaseClient({ workspaceRows: [] });
    await expect(
      resetOperatorDemoWorkspace(operatorResetInput(missingWorkspace))
    ).rejects.toBeInstanceOf(OperatorDemoResetError);
    expect(
      missingWorkspace.calls.some((call) => call.text.startsWith("DELETE"))
    ).toBe(false);
  });

  it("requires the current beta acknowledgement before deletion", async () => {
    const client = new FakeOperatorDatabaseClient({
      workspaceRows: [
        {
          workspaceId: "workspace_target",
          hasCurrentAgreementAcceptance: false,
          classCount: 0,
          studentCount: 0,
          evidenceCount: 0,
          photoCount: 0,
        },
      ],
    });

    await expect(
      resetOperatorDemoWorkspace(operatorResetInput(client))
    ).rejects.toMatchObject({ code: "BETA_REQUIRED" });
    expect(client.calls.some((call) => call.text.startsWith("DELETE"))).toBe(false);
  });

  it("requires the target email when the locked workspace contains data", async () => {
    const client = new FakeOperatorDatabaseClient({
      workspaceRows: [
        {
          workspaceId: "workspace_target",
          hasCurrentAgreementAcceptance: true,
          classCount: 1,
          studentCount: 0,
          evidenceCount: 0,
          photoCount: 0,
        },
      ],
    });

    await expect(
      resetOperatorDemoWorkspace({
        ...operatorResetInput(client),
        confirmationEmail: "wrong@example.com",
      })
    ).rejects.toMatchObject({ code: "CONFIRMATION_REQUIRED" });
    expect(client.calls.some((call) => call.text.startsWith("DELETE"))).toBe(false);
  });

  it("scopes every deletion and insertion to only the selected workspace", async () => {
    const client = new FakeOperatorDatabaseClient();

    await expect(
      resetOperatorDemoWorkspace(operatorResetInput(client))
    ).resolves.toMatchObject(canonicalCounts);

    const destructiveCalls = client.calls.filter(
      (call) => call.text.startsWith("DELETE") || call.text.startsWith("INSERT")
    );
    expect(destructiveCalls.length).toBeGreaterThan(0);
    expect(
      destructiveCalls.every((call) => call.values[1] === "workspace_target" || call.values[0] === "workspace_target")
    ).toBe(true);
    expect(client.calls.at(-1)?.text).toBe("COMMIT");
  });

  it("rolls back all changes when post-insert verification fails", async () => {
    const client = new FakeOperatorDatabaseClient({
      counts: {
        ...canonicalCounts,
        evidenceCount: canonicalCounts.evidenceCount - 1,
        invalidStudentRelations: 0,
        invalidEvidenceRelations: 0,
      },
    });

    await expect(
      resetOperatorDemoWorkspace(operatorResetInput(client))
    ).rejects.toMatchObject({ code: "RESET_FAILED" });
    expect(client.calls.at(-1)?.text).toBe("ROLLBACK");
    expect(client.calls.some((call) => call.text === "COMMIT")).toBe(false);
  });

  it("uses stable, collision-free IDs for two selected Clerk users", () => {
    const first = scopeDemoDatasetForClerkUser(DEMO_DATASET, "target_1");
    const repeated = scopeDemoDatasetForClerkUser(DEMO_DATASET, "target_1");
    const second = scopeDemoDatasetForClerkUser(DEMO_DATASET, "target_2");

    expect(repeated).toEqual(first);
    const firstIds = new Set(
      [...first.classes, ...first.students, ...first.evidence, ...first.photos].map(
        (record) => record.id
      )
    );
    const secondIds = [
      ...second.classes,
      ...second.students,
      ...second.evidence,
      ...second.photos,
    ].map((record) => record.id);
    expect(secondIds.every((id) => !firstIds.has(id))).toBe(true);
  });
});

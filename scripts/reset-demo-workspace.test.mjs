import { describe, expect, it } from "vitest";
import {
  DEMO_CLERK_USER_ID,
  DEMO_DATABASE_IDENTITY,
} from "./demo-data.mjs";
import {
  DemoResetError,
  resetDemoWorkspace,
} from "./reset-demo-workspace.mjs";

class FakeDatabaseClient {
  constructor({ targetRows, counts, serializationFailures = 0 } = {}) {
    this.calls = [];
    this.targetRows =
      targetRows ??
      [{ workspaceId: "workspace_demo", hasAgreementAcceptance: true }];
    this.counts =
      counts ??
      {
        classCount: 2,
        studentCount: 4,
        evidenceCount: 56,
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
    ).resolves.toMatchObject({
      classCount: 2,
      studentCount: 4,
      evidenceCount: 56,
    });

    const deleteCalls = client.calls.filter((call) =>
      call.text.startsWith("DELETE")
    );
    expect(deleteCalls).toHaveLength(3);
    expect(deleteCalls.every((call) => call.values[0] === "workspace_demo")).toBe(
      true
    );
    expect(client.calls.filter((call) => call.text.startsWith("INSERT"))).toHaveLength(
      62
    );
    expect(client.calls.at(-1)?.text).toBe("COMMIT");
    expect(client.calls.some((call) => call.text === "ROLLBACK")).toBe(false);
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

  it("rolls back when post-insert ownership verification fails", async () => {
    const client = new FakeDatabaseClient({
      counts: {
        classCount: 2,
        studentCount: 4,
        evidenceCount: 55,
        invalidStudentRelations: 0,
        invalidEvidenceRelations: 0,
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
    ).resolves.toMatchObject({ evidenceCount: 56 });

    expect(
      client.calls.filter(
        (call) => call.text === "BEGIN TRANSACTION ISOLATION LEVEL SERIALIZABLE"
      )
    ).toHaveLength(3);
    expect(client.calls.filter((call) => call.text === "ROLLBACK")).toHaveLength(2);
  });
});

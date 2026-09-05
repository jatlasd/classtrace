import { describe, expect, it, vi } from "vitest";
import { DEMO_DATABASE_IDENTITY } from "./demo-data.mjs";
import {
  LocalDemoResetError,
  resetLocalDemoWorkspace,
  resolveDevelopmentClerkUserId,
  scopeDemoDatasetForDevelopment,
  verifyLocalDevelopmentDatabase,
} from "./reset-local-demo-workspace.mjs";
import { DEMO_DATASET, validateDemoDataset } from "./demo-data.mjs";

const developmentIdentity = {
  projectId: "project_nonproduction",
  branchId: "branch_development",
  databaseName: "classtrace_dev",
};

function databaseClient(identity = developmentIdentity) {
  return {
    query: vi.fn().mockResolvedValue({ rows: [identity] }),
  };
}

const developmentUser = {
  id: "user_development",
  emailAddresses: [{ emailAddress: "jatlasdev2@gmail.com" }],
};

describe("local demo workspace reset", () => {
  it("uses stable development-scoped IDs without changing canonical content", () => {
    const first = scopeDemoDatasetForDevelopment(DEMO_DATASET, developmentUser.id);
    const second = scopeDemoDatasetForDevelopment(DEMO_DATASET, developmentUser.id);

    expect(first).toEqual(second);
    expect(first.classes[0].id).not.toBe(DEMO_DATASET.classes[0].id);
    expect(first.evidence[0].evidenceNote).toBe(
      DEMO_DATASET.evidence[0].evidenceNote
    );
    expect(first.photos.map((photo) => photo.assetFilename)).toEqual(
      DEMO_DATASET.photos.map((photo) => photo.assetFilename)
    );
    expect(validateDemoDataset(first).photoCount).toBe(4);
  });

  it("resolves only one exact Clerk development account", async () => {
    const directory = {
      getUser: vi.fn().mockResolvedValue(developmentUser),
      findUsersByEmail: vi.fn().mockResolvedValue([developmentUser]),
    };

    await expect(
      resolveDevelopmentClerkUserId(
        { kind: "email", value: "jatlasdev2@gmail.com" },
        directory
      )
    ).resolves.toBe("user_development");
    await expect(
      resolveDevelopmentClerkUserId(
        { kind: "clerkUserId", value: "user_development" },
        directory
      )
    ).resolves.toBe("user_development");

    directory.findUsersByEmail.mockResolvedValue([developmentUser, developmentUser]);
    await expect(
      resolveDevelopmentClerkUserId(
        { kind: "email", value: "jatlasdev2@gmail.com" },
        directory
      )
    ).rejects.toThrow(LocalDemoResetError);
  });

  it("refuses the canonical production identity and any non-development database", async () => {
    await expect(
      verifyLocalDevelopmentDatabase(databaseClient(DEMO_DATABASE_IDENTITY))
    ).rejects.toThrow(/non-production/);
    await expect(
      verifyLocalDevelopmentDatabase(
        databaseClient({ ...developmentIdentity, databaseName: "neondb" })
      )
    ).rejects.toThrow(/non-production/);
  });

  it("passes only the resolved owned account and verified development identity to the reset", async () => {
    const client = databaseClient();
    const resetWorkspace = vi.fn().mockResolvedValue({ version: "demo-v2" });
    const directory = {
      getUser: vi.fn(),
      findUsersByEmail: vi.fn().mockResolvedValue([developmentUser]),
    };

    await resetLocalDemoWorkspace({
      client,
      target: { kind: "email", value: "jatlasdev2@gmail.com" },
      directory,
      resetWorkspace,
    });

    expect(resetWorkspace).toHaveBeenCalledWith({
      client,
      clerkUserId: "user_development",
      dataset: expect.objectContaining({ version: DEMO_DATASET.version }),
      expectedDatabaseIdentity: developmentIdentity,
    });
  });

  it("repeats the same canonical reset inputs for idempotent local reloads", async () => {
    const client = databaseClient();
    const summary = {
      version: "2026-school-spring-v2",
      classCount: 2,
      studentCount: 4,
      evidenceCount: 56,
      photoCount: 4,
    };
    const resetWorkspace = vi.fn().mockResolvedValue(summary);
    const directory = {
      getUser: vi.fn().mockResolvedValue(developmentUser),
      findUsersByEmail: vi.fn(),
    };
    const input = {
      client,
      target: { kind: "clerkUserId", value: "user_development" },
      directory,
      resetWorkspace,
    };

    await expect(resetLocalDemoWorkspace(input)).resolves.toEqual(summary);
    await expect(resetLocalDemoWorkspace(input)).resolves.toEqual(summary);
    expect(resetWorkspace).toHaveBeenCalledTimes(2);
    expect(resetWorkspace.mock.calls[0][0]).toEqual(resetWorkspace.mock.calls[1][0]);
  });
});

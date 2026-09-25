import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
  DEMO_DATABASE_IDENTITY,
  DEMO_DATASET,
  validateDemoDataset,
} from "@/lib/demo/demo-data";
import {
  LocalDemoResetError,
  resetLocalDemoWorkspace,
  resolveDevelopmentClerkUserId,
  scopeDemoDatasetForDevelopment,
  verifyLocalDevelopmentDatabase,
} from "@/lib/demo/local-demo-workspace-reset";

const developmentIdentity = {
  projectId: "project_nonproduction",
  branchId: "branch_development",
  databaseName: "classtrace_dev",
};

function database(identity = developmentIdentity) {
  return {
    $queryRawUnsafe: vi.fn().mockResolvedValue([{ ...identity }]),
    $transaction: vi.fn(),
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
    expect(validateDemoDataset(first)).toEqual(validateDemoDataset());
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

    directory.findUsersByEmail.mockResolvedValue([
      developmentUser,
      developmentUser,
    ]);
    await expect(
      resolveDevelopmentClerkUserId(
        { kind: "email", value: "jatlasdev2@gmail.com" },
        directory
      )
    ).rejects.toThrow(LocalDemoResetError);
  });

  it("refuses production identity and any non-development database", async () => {
    await expect(
      verifyLocalDevelopmentDatabase(database(DEMO_DATABASE_IDENTITY))
    ).rejects.toThrow(/non-production/);
    await expect(
      verifyLocalDevelopmentDatabase(
        database({ ...developmentIdentity, databaseName: "neondb" })
      )
    ).rejects.toThrow(/non-production/);
  });

  it("passes only the resolved account and verified identity to reset", async () => {
    const demoDatabase = database();
    const resetWorkspace = vi.fn().mockResolvedValue(validateDemoDataset());
    const directory = {
      getUser: vi.fn(),
      findUsersByEmail: vi.fn().mockResolvedValue([developmentUser]),
    };

    await resetLocalDemoWorkspace({
      database: demoDatabase,
      target: { kind: "email", value: "jatlasdev2@gmail.com" },
      directory,
      resetWorkspace,
    });

    expect(resetWorkspace).toHaveBeenCalledWith({
      database: demoDatabase,
      clerkUserId: "user_development",
      dataset: expect.objectContaining({ version: DEMO_DATASET.version }),
      expectedDatabaseIdentity: developmentIdentity,
    });
  });
});

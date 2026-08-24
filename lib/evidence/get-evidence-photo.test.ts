import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/db/prisma", () => ({ prisma: {} }));

import {
  getEvidencePhotoForWorkspace,
  type EvidencePhotoReadDatabase,
} from "./get-evidence-photo";

describe("getEvidencePhotoForWorkspace", () => {
  it("queries by both evidence and workspace without selecting metadata", async () => {
    const calls: unknown[] = [];
    const database: EvidencePhotoReadDatabase = {
      evidencePhoto: {
        findFirst: async (args) => {
          calls.push(args);
          return {
            imageData: new Uint8Array([1, 2, 3]),
            contentType: "image/webp",
          };
        },
      },
    };

    await expect(
      getEvidencePhotoForWorkspace("workspace_1", "evidence_1", database)
    ).resolves.toMatchObject({ contentType: "image/webp" });
    expect(calls).toEqual([
      {
        where: {
          workspaceId: "workspace_1",
          evidenceRecordId: "evidence_1",
          evidenceRecord: { workspaceId: "workspace_1" },
        },
        select: { imageData: true, contentType: true },
      },
    ]);
  });

  it("rejects malformed identifiers before database access", async () => {
    const findFirst = vi.fn();
    const database = { evidencePhoto: { findFirst } } as EvidencePhotoReadDatabase;

    await expect(
      getEvidencePhotoForWorkspace("workspace_1", "", database)
    ).resolves.toBeNull();
    expect(findFirst).not.toHaveBeenCalled();
  });
});

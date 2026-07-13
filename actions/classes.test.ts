import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getCurrentWorkspace: vi.fn(),
  createClassGroupForWorkspace: vi.fn(),
  renameClassGroupForWorkspace: vi.fn(),
  archiveClassGroupForWorkspace: vi.fn(),
  revalidatePath: vi.fn(),
}));

vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock("@/lib/auth/get-current-workspace", () => ({
  getCurrentWorkspace: mocks.getCurrentWorkspace,
}));
vi.mock("@/lib/classes/class-groups", () => ({
  createClassGroupForWorkspace: mocks.createClassGroupForWorkspace,
  renameClassGroupForWorkspace: mocks.renameClassGroupForWorkspace,
  archiveClassGroupForWorkspace: mocks.archiveClassGroupForWorkspace,
}));

import {
  archiveClassGroup,
  createClassGroup,
  renameClassGroup,
} from "@/actions/classes";

describe("class group Server Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getCurrentWorkspace.mockResolvedValue({ workspaceId: "workspace_1" });
  });

  it("creates a class in the authenticated workspace and revalidates roster", async () => {
    mocks.createClassGroupForWorkspace.mockResolvedValue({
      success: true,
      classGroup: { id: "class_1", name: "Reading" },
    });

    const result = await createClassGroup({ name: "Reading" });

    expect(result.success).toBe(true);
    expect(mocks.createClassGroupForWorkspace).toHaveBeenCalledWith({
      workspaceId: "workspace_1",
      name: "Reading",
    });
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/app/roster");
  });

  it("renames and archives only by authenticated workspace plus class id", async () => {
    mocks.renameClassGroupForWorkspace.mockResolvedValue({
      success: true,
      classGroup: { id: "class_1", name: "Literacy" },
    });
    mocks.archiveClassGroupForWorkspace.mockResolvedValue({ success: true });

    await renameClassGroup({ classGroupId: "class_1", name: "Literacy" });
    await archiveClassGroup({ classGroupId: "class_1" });

    expect(mocks.renameClassGroupForWorkspace).toHaveBeenCalledWith({
      workspaceId: "workspace_1",
      classGroupId: "class_1",
      name: "Literacy",
    });
    expect(mocks.archiveClassGroupForWorkspace).toHaveBeenCalledWith({
      workspaceId: "workspace_1",
      classGroupId: "class_1",
    });
    expect(mocks.revalidatePath).toHaveBeenCalledTimes(2);
  });

  it("does not revalidate after an expected domain rejection", async () => {
    mocks.archiveClassGroupForWorkspace.mockResolvedValue({
      success: false,
      error: "Move active students before archiving this class.",
    });

    const result = await archiveClassGroup({ classGroupId: "class_1" });

    expect(result).toEqual({
      success: false,
      error: "Move active students before archiving this class.",
    });
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });

  it("maps unexpected failures to safe action-specific errors", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    mocks.getCurrentWorkspace.mockRejectedValue(new Error("database unavailable"));

    await expect(createClassGroup({ name: "Reading" })).resolves.toEqual({
      success: false,
      error: "Failed to save class.",
    });
    await expect(
      renameClassGroup({ classGroupId: "class_1", name: "Literacy" })
    ).resolves.toEqual({ success: false, error: "Failed to rename class." });
    await expect(
      archiveClassGroup({ classGroupId: "class_1" })
    ).resolves.toEqual({ success: false, error: "Failed to archive class." });

    expect(consoleError).toHaveBeenCalledTimes(3);
    consoleError.mockRestore();
  });
});

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const source = readFileSync(join(process.cwd(), "actions", "classes.ts"), "utf8");

describe("class group server actions", () => {
  it("creates classes through current workspace resolution", () => {
    expect(source).toContain('"use server"');
    expect(source).toContain("getCurrentWorkspace");
    expect(source).toContain("createClassGroupForWorkspace");
    expect(source).toContain("workspace.workspaceId");
    expect(source).not.toMatch(/input\.workspaceId|input\.teacherProfileId|input\.clerkUserId/);
  });

  it("renames classes through current workspace resolution", () => {
    expect(source).toContain("renameClassGroupForWorkspace");
    expect(source).toContain("RenameClassGroupActionInput");
    expect(source).toContain("workspace.workspaceId");
    const renameAction = source.match(
      /export async function renameClassGroup[\s\S]*?\n\}/
    );
    expect(renameAction?.[0]).toBeDefined();
    expect(renameAction?.[0]).not.toMatch(
      /input\.workspaceId|input\.teacherProfileId|input\.clerkUserId/
    );
  });

  it("archives classes through current workspace resolution", () => {
    expect(source).toContain("archiveClassGroupForWorkspace");
    expect(source).toContain("ArchiveClassGroupActionInput");
    expect(source).toContain("workspace.workspaceId");
    const archiveAction = source.match(
      /export async function archiveClassGroup[\s\S]*?\n\}/
    );
    expect(archiveAction?.[0]).toBeDefined();
    expect(archiveAction?.[0]).not.toMatch(
      /input\.workspaceId|input\.teacherProfileId|input\.clerkUserId/
    );
  });

  it("revalidates the roster route after successful class mutations", () => {
    expect(source).toContain("revalidatePath");
    expect(source).toContain("routes.roster");
  });
});

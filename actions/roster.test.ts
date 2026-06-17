import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const source = readFileSync(join(process.cwd(), "actions", "roster.ts"), "utf8");

describe("roster server actions", () => {
  it("creates roster students through current workspace resolution", () => {
    expect(source).toContain('"use server"');
    expect(source).toContain("getCurrentWorkspace");
    expect(source).toContain("createRosterStudentForWorkspace");
    expect(source).toContain("workspace.workspaceId");
    expect(source).not.toMatch(/input\.workspaceId|formData\.get\("workspaceId"\)/);
  });

  it("revalidates the roster route after successful create", () => {
    expect(source).toContain("revalidatePath");
    expect(source).toContain("routes.roster");
  });

  it("imports roster students through current workspace resolution", () => {
    expect(source).toContain("importRosterStudentsForWorkspace");
    expect(source).toContain("workspace.workspaceId");
    expect(source).not.toMatch(/input\.workspaceId|formData\.get\("workspaceId"\)/);
  });

  it("archives roster students through current workspace resolution", () => {
    expect(source).toContain("archiveRosterStudentForWorkspace");
    expect(source).toContain("ArchiveRosterStudentActionInput");
    expect(source).toContain("workspace.workspaceId");
    const archiveAction = source.match(
      /export async function archiveRosterStudent[\s\S]*?\n\}/
    );
    expect(archiveAction?.[0]).toBeDefined();
    expect(archiveAction?.[0]).not.toMatch(
      /input\.workspaceId|input\.teacherProfileId|input\.clerkUserId|input\.evidenceId/
    );
  });

  it("deletes roster students through current workspace resolution", () => {
    expect(source).toContain("deleteRosterStudentForWorkspace");
    expect(source).toContain("DeleteRosterStudentActionInput");
    expect(source).toContain("workspace.workspaceId");
    const deleteAction = source.match(
      /export async function deleteRosterStudent[\s\S]*?\n\}/
    );
    expect(deleteAction?.[0]).toBeDefined();
    expect(deleteAction?.[0]).not.toMatch(
      /input\.workspaceId|input\.teacherProfileId|input\.clerkUserId|input\.evidenceId/
    );
  });

  it("revalidates roster, feed, and affected student routes after student cleanup", () => {
    expect(source).toContain("routes.roster");
    expect(source).toContain("routes.feed");
    expect(source).toContain("routes.student(result.studentId)");
    expect(source).toContain("[actions/roster/archiveRosterStudent]");
    expect(source).toContain("[actions/roster/deleteRosterStudent]");
  });

  it("keeps raw draft text out of the roster action contract", () => {
    expect(source).not.toMatch(/rawNote|draftText|originalCapture|sourceText/i);
  });
});

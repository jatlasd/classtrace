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

  it("revalidates roster and feed routes after successful create", () => {
    const createAction = source.match(
      /export async function createRosterStudent[\s\S]*?\n\}/
    );

    expect(createAction?.[0]).toContain("revalidatePath(routes.roster)");
    expect(createAction?.[0]).toContain("revalidatePath(routes.feed)");
  });

  it("imports roster students through current workspace resolution", () => {
    expect(source).toContain("importRosterStudentsForWorkspace");
    expect(source).toContain("workspace.workspaceId");
    expect(source).not.toMatch(/input\.workspaceId|formData\.get\("workspaceId"\)/);
  });

  it("revalidates roster and feed routes after successful import", () => {
    const importAction = source.match(
      /export async function importRosterStudents[\s\S]*?\n\}/
    );

    expect(importAction?.[0]).toContain("revalidatePath(routes.roster)");
    expect(importAction?.[0]).toContain("revalidatePath(routes.feed)");
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

  it("updates roster students through current workspace resolution", () => {
    expect(source).toContain("updateRosterStudentForWorkspace");
    expect(source).toContain("UpdateRosterStudentActionInput");
    expect(source).toContain("workspace.workspaceId");
    const updateAction = source.match(
      /export async function updateRosterStudent[\s\S]*?\n\}/
    );
    expect(updateAction?.[0]).toBeDefined();
    expect(updateAction?.[0]).not.toMatch(
      /input\.workspaceId|input\.teacherProfileId|input\.clerkUserId/
    );
  });


  it("restores roster students through current workspace resolution", () => {
    expect(source).toContain("restoreRosterStudentForWorkspace");
    expect(source).toContain("RestoreRosterStudentActionInput");
    expect(source).toContain("workspace.workspaceId");
    const restoreAction = source.match(
      /export async function restoreRosterStudent[\s\S]*?\n\}/
    );
    expect(restoreAction?.[0]).toBeDefined();
    expect(restoreAction?.[0]).not.toMatch(
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
    expect(source).toContain("[actions/roster/restoreRosterStudent]");
  });

  it("keeps raw draft text out of the roster action contract", () => {
    expect(source).not.toMatch(/rawNote|draftText|originalCapture|sourceText/i);
  });
});

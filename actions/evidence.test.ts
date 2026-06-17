import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const source = readFileSync(
  join(process.cwd(), "actions", "evidence.ts"),
  "utf8"
);

describe("evidence server actions", () => {
  it("saves evidence through current workspace resolution", () => {
    expect(source).toContain('"use server"');
    expect(source).toContain("getCurrentWorkspace");
    expect(source).toContain("saveValidatedEvidenceForWorkspace");
    expect(source).toContain("workspace.workspaceId");
    expect(source).not.toMatch(/input\.workspaceId|input\.teacherProfileId|input\.clerkUserId/);
  });

  it("revalidates feed and student routes after successful save", () => {
    expect(source).toContain("revalidatePath");
    expect(source).toContain("routes.feed");
    expect(source).toContain("routes.student");
  });

  it("archives evidence through current workspace resolution", () => {
    expect(source).toContain("archiveEvidenceForWorkspace");
    expect(source).toContain("ArchiveEvidenceActionInput");
    expect(source).toContain("workspace.workspaceId");
    expect(source).not.toMatch(
      /input\.workspaceId|input\.teacherProfileId|input\.clerkUserId/
    );
  });

  it("revalidates feed and affected student route after archive succeeds", () => {
    expect(source).toContain("routes.feed");
    expect(source).toContain("routes.student(result.rosterStudentId)");
    expect(source).toContain("[actions/evidence/archiveEvidence]");
  });

  it("deletes evidence through current workspace resolution", () => {
    expect(source).toContain("deleteEvidenceForWorkspace");
    expect(source).toContain("DeleteEvidenceActionInput");
    expect(source).toContain("workspace.workspaceId");
    const deleteAction = source.match(
      /export async function deleteEvidence[\s\S]*?\n\}/
    );
    expect(deleteAction?.[0]).toBeDefined();
    expect(deleteAction?.[0]).not.toMatch(
      /input\.workspaceId|input\.teacherProfileId|input\.clerkUserId|input\.rosterStudentId/
    );
  });

  it("revalidates feed and affected student route after delete succeeds", () => {
    expect(source).toContain("routes.feed");
    expect(source).toContain("routes.student(result.rosterStudentId)");
    expect(source).toContain("[actions/evidence/deleteEvidence]");
  });

  it("keeps raw draft text out of the action contract", () => {
    expect(source).not.toMatch(/rawNote|draftText|originalCapture|sourceText/i);
  });
});

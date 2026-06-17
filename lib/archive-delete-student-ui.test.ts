import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const projectRoot = process.cwd();
const rosterPage = readFileSync(
  join(projectRoot, "app", "app", "roster", "page.tsx"),
  "utf8"
);
const rowActions = readFileSync(
  join(projectRoot, "components", "roster", "roster-student-row-actions.tsx"),
  "utf8"
);
const rosterAction = readFileSync(
  join(projectRoot, "actions", "roster.ts"),
  "utf8"
);
const schema = readFileSync(
  join(projectRoot, "prisma", "schema.prisma"),
  "utf8"
);

describe("Unit 20 archive/delete student UI", () => {
  it("adds roster row archive and destructive delete confirmation", () => {
    expect(rosterPage).toContain("RosterStudentRowActions");
    expect(rowActions).toContain("Archive student");
    expect(rowActions).toContain("Delete student");
    expect(rowActions).toContain(
      "Deleting this student will also permanently delete all evidence"
    );
    expect(rowActions).toContain("This cannot be undone.");
    expect(rowActions).toContain("variant=\"destructive\"");
    expect(rowActions).toContain("Cancel");
  });

  it("sends only the student id through workspace-resolving Server Actions", () => {
    expect(rowActions).toContain("archiveRosterStudent({ studentId })");
    expect(rowActions).toContain("deleteRosterStudent({ studentId })");
    expect(rowActions).not.toMatch(
      /workspaceId|teacherProfileId|clerkUserId|evidenceId/
    );
    expect(rosterAction).toContain("archiveRosterStudentForWorkspace");
    expect(rosterAction).toContain("deleteRosterStudentForWorkspace");
    expect(rosterAction).toContain("workspace.workspaceId");
  });

  it("revalidates roster, feed, and affected student routes after mutations", () => {
    expect(rosterAction).toContain("routes.roster");
    expect(rosterAction).toContain("routes.feed");
    expect(rosterAction).toContain("routes.student(result.studentId)");
    expect(rosterAction).toContain("[actions/roster/archiveRosterStudent]");
    expect(rosterAction).toContain("[actions/roster/deleteRosterStudent]");
  });

  it("does not add restore, bulk management, roster edit, export, or raw draft behavior", () => {
    const combined = `${rosterPage}\n${rowActions}\n${rosterAction}`;
    expect(combined).not.toMatch(
      /Restore student|Bulk delete|Bulk archive|Edit student|Export evidence|trash view|undo queue/i
    );
    expect(combined).not.toMatch(
      /rawNote|draftText|originalCapture|sourceText/i
    );
  });

  it("does not change the schema for student cleanup", () => {
    const rosterModel = schema.match(/model RosterStudent \{[\s\S]*?\n\}/);

    expect(rosterModel?.[0]).toContain("archivedAt");
    expect(rosterModel?.[0]).not.toMatch(
      /deletedAt|rawNote|draftText|originalCapture|sourceText/i
    );
  });
});

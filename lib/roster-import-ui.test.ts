import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const importFormSource = readFileSync(
  join(process.cwd(), "components", "roster", "roster-import-form.tsx"),
  "utf8"
);

const rosterPageSource = readFileSync(
  join(process.cwd(), "app", "app", "roster", "page.tsx"),
  "utf8"
);

describe("class-scoped roster import UI", () => {
  it("renders the paste-list import form inside the opened class workflow", () => {
    expect(rosterPageSource).toContain("RosterImportForm");
    expect(rosterPageSource).toContain("existingImportStudents");
    expect(rosterPageSource).toContain("listExistingRosterImportStudentsForWorkspace");
    expect(rosterPageSource).not.toContain("Paste-list import will move into this class view next");
    expect(importFormSource).toContain("Paste several students");
    expect(importFormSource).toContain("These students will be added to {className}");
    expect(importFormSource).toContain("Preview students before saving");
    expect(importFormSource).toContain("classGroupId: string;");
    expect(importFormSource).toContain("className: string;");
    expect(importFormSource).toContain("classGroupId,");
  });

  it("keeps the client form away from workspace IDs and database imports", () => {
    expect(importFormSource).toContain("importRosterStudents");
    expect(importFormSource).not.toMatch(/workspaceId|teacherProfileId|clerkUserId/);
    expect(importFormSource).not.toMatch(/prisma|lib\/db/);
  });

  it("keeps roster rows connected to database-backed student timelines", () => {
    expect(rosterPageSource).toContain("routes.student(student.id)");
    expect(rosterPageSource).toContain("Open ${student.displayName} timeline");
    expect(rosterPageSource).toContain("RosterStudentRowActions");
    expect(rosterPageSource).not.toMatch(/\bExport\b/);
  });
});

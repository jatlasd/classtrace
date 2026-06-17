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

describe("Unit 09 roster import UI", () => {
  it("replaces the import placeholder with a paste-list import form", () => {
    expect(rosterPageSource).toContain("RosterImportForm");
    expect(rosterPageSource).not.toContain("Import planned");
    expect(importFormSource).toContain("Paste several students");
    expect(importFormSource).toContain("Preview students before saving");
  });

  it("keeps the client form away from workspace IDs and database imports", () => {
    expect(importFormSource).toContain("importRosterStudents");
    expect(importFormSource).not.toMatch(/workspaceId|teacherProfileId|clerkUserId/);
    expect(importFormSource).not.toMatch(/prisma|lib\/db/);
  });

  it("keeps roster rows connected to database-backed student timelines", () => {
    expect(rosterPageSource).toContain("routes.student(student.id)");
    expect(rosterPageSource).toContain("Open ${student.displayName} timeline");
    expect(rosterPageSource).not.toMatch(/\b(Archive|Delete|Export)\b/);
  });
});

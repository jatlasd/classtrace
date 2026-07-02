import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const rosterPage = readFileSync(
  join(process.cwd(), "app", "app", "roster", "page.tsx"),
  "utf8"
);

describe("Unit 07 roster database bridge", () => {
  it("resolves the current workspace and reads active database roster students", () => {
    expect(rosterPage).toContain("getCurrentWorkspace");
    expect(rosterPage).toContain("listActiveRosterStudentsForWorkspace");
  });

  it("uses a class-first roster surface without returning to local storage", () => {
    expect(rosterPage).toContain("Classes in your roster");
    expect(rosterPage).toContain("ClassList");
    expect(rosterPage).toContain("OpenClassView");
    expect(rosterPage).toContain("ManualStudentEntryForm");
    expect(rosterPage).not.toContain("RosterImportForm");
    expect(rosterPage).not.toContain("Manual entry connects next");
    expect(rosterPage).not.toContain("Import planned");
    expect(rosterPage).not.toMatch(/localStorage|addStudent|updateStudent|deleteStudent/);
  });

  it("links active database roster rows to database-backed student timelines", () => {
    expect(rosterPage).toContain("routes.student(student.id)");
    expect(rosterPage).toContain("Open ${student.displayName} timeline");
    expect(rosterPage).toContain("Open timeline");
  });

  it("shows feed continuation only after class-ready roster setup has started", () => {
    expect(rosterPage).toContain("readyForCapture");
    expect(rosterPage).toContain("activeStudentsWithoutActiveClassCount === 0");
    expect(rosterPage).toContain("Continue to evidence feed");
    expect(rosterPage).toContain("routes.feed");
    expect(rosterPage).not.toContain("Roster setup started.");
  });
});

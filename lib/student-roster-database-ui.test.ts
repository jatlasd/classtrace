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

  it("connects manual entry while keeping imports deferred", () => {
    expect(rosterPage).toContain("ManualStudentEntryForm");
    expect(rosterPage).not.toContain("Manual entry connects next");
    expect(rosterPage).toContain("Import a basic list later");
    expect(rosterPage).not.toMatch(/localStorage|addStudent|updateStudent|deleteStudent/);
  });

  it("does not link database roster rows to the localStorage student profile route", () => {
    expect(rosterPage).not.toContain("routes.student");
  });
});

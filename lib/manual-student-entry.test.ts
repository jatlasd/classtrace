import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const formSource = readFileSync(
  join(process.cwd(), "components", "roster", "manual-student-entry-form.tsx"),
  "utf8"
);

const rosterPageSource = readFileSync(
  join(process.cwd(), "app", "app", "roster", "page.tsx"),
  "utf8"
);

describe("Unit 08 manual student entry UI", () => {
  it("renders the required manual entry labels", () => {
    expect(formSource).toContain("Student name");
    expect(formSource).toContain("Mention handle");
    expect(formSource).toContain("School/local ID");
  });

  it("calls the workspace-scoped roster server action without client workspace ids", () => {
    expect(formSource).toContain("createRosterStudent");
    expect(formSource).not.toMatch(/workspaceId|teacherProfileId|clerkUserId/);
  });

  it("derives handles until the teacher edits the handle field", () => {
    expect(formSource).toContain("deriveMentionHandle");
    expect(formSource).toContain("handleWasEdited");
    expect(formSource).toContain("setHandleWasEdited(true)");
  });

  it("removes the Unit 07 transition copy from the roster page", () => {
    expect(rosterPageSource).toContain("ManualStudentEntryForm");
    expect(rosterPageSource).not.toContain("Manual entry connects next");
  });

  it("keeps class/group work deferred while import moves to Unit 09", () => {
    expect(rosterPageSource).toContain("RosterImportForm");
    expect(formSource).toContain("Class/group setup stays deferred");
  });
});

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
});

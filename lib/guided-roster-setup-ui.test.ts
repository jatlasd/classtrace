import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const projectRoot = process.cwd();
const rosterPagePath = join(projectRoot, "app", "app", "roster", "page.tsx");
const evidenceFeedPath = join(
  projectRoot,
  "components",
  "dashboard",
  "evidence-feed.tsx"
);

const rosterPage = readFileSync(rosterPagePath, "utf8");
const evidenceFeed = readFileSync(evidenceFeedPath, "utf8");

describe("Unit 06 guided roster setup UI", () => {
  it("frames the empty roster page as the first setup step", () => {
    expect(rosterPage).toContain("Add your first student to start capturing evidence.");
    expect(rosterPage).toContain("Your roster is private to your ClassTrace workspace.");
    expect(rosterPage).toContain("Start with one student");
    expect(rosterPage).toContain("Import a basic list later");
    expect(rosterPage).not.toMatch(/\b(SIS|district)\b/i);
  });

  it("keeps Unit 06 out of database and server mutation scope", () => {
    expect(rosterPage).not.toMatch(/@\/lib\/db|@\/actions|@\/app\/api/);
    expect(evidenceFeed).not.toMatch(/@\/lib\/db|@\/actions|@\/app\/api/);
  });

  it("shows feed guidance when roster setup is still needed", () => {
    expect(evidenceFeed).toContain("Add one student before capturing evidence.");
    expect(evidenceFeed).toContain("Captures need one student from your roster.");
    expect(evidenceFeed).toContain("routes.roster");
    expect(evidenceFeed).toContain("getAllStudents");
    expect(evidenceFeed).toContain("items.length === 0 && rosterSetupNeeded");
    expect(evidenceFeed).toContain(
      "Your evidence inbox will start here after roster setup."
    );
  });
});

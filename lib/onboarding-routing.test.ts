import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const projectRoot = process.cwd();
const appEntryPage = readFileSync(
  join(projectRoot, "app", "app", "page.tsx"),
  "utf8"
);
const feedPage = readFileSync(
  join(projectRoot, "app", "app", "feed", "page.tsx"),
  "utf8"
);
const rosterPage = readFileSync(
  join(projectRoot, "app", "app", "roster", "page.tsx"),
  "utf8"
);

describe("Unit 10 onboarding routing", () => {
  it("routes app entry by active database roster state", () => {
    expect(appEntryPage).toContain("getCurrentWorkspace");
    expect(appEntryPage).toContain("hasActiveRosterStudentsForWorkspace");
    expect(appEntryPage).toContain("workspace.workspaceId");
    expect(appEntryPage).toContain("routes.feed : routes.roster");
    expect(appEntryPage).not.toContain("redirect(routes.feed)");
    expect(appEntryPage).not.toMatch(/localStorage|getAllStudents/);
  });

  it("guards the feed behind active database roster setup", () => {
    expect(feedPage).toContain("getCurrentWorkspace");
    expect(feedPage).toContain("listActiveRosterStudentsForWorkspace");
    expect(feedPage).toContain("workspace.workspaceId");
    expect(feedPage).toContain("rosterStudents.length === 0");
    expect(feedPage).toContain("redirect(routes.roster)");
    expect(feedPage).toContain("rosterStudents={rosterStudents}");
    expect(feedPage).toContain("initialEvidenceRecords={evidenceRecords}");
    expect(feedPage).not.toMatch(/localStorage|getAllStudents/);
  });

  it("keeps roster setup accessible with a feed continuation action", () => {
    expect(rosterPage).toContain("Students in your roster");
    expect(rosterPage).toContain("ready");
    expect(rosterPage).toContain("Continue to evidence feed");
    expect(rosterPage).not.toContain("Roster setup started.");
    expect(rosterPage).not.toContain("Back to evidence feed");
    expect(rosterPage).toContain("ManualStudentEntryForm");
    expect(rosterPage).toContain("RosterImportForm");
    expect(rosterPage).not.toContain("routes.student");
    expect(rosterPage).not.toMatch(/\b(SIS|district|AI-powered|FERPA-compliant)\b/i);
  });
});

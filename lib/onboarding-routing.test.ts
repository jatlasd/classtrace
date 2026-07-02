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
  it("routes app entry by class-first roster readiness", () => {
    expect(appEntryPage).toContain("getCurrentWorkspace");
    expect(appEntryPage).toContain("getClassRosterReadinessForWorkspace");
    expect(appEntryPage).toContain("readyForClassFirstRoster");
    expect(appEntryPage).toContain("workspace.workspaceId");
    expect(appEntryPage).toContain("routes.feed : routes.roster");
    expect(appEntryPage).not.toContain("redirect(routes.feed)");
    expect(appEntryPage).not.toContain("hasActiveRosterStudentsForWorkspace");
    expect(appEntryPage).not.toMatch(/localStorage|getAllStudents/);
  });

  it("guards the feed behind class-first roster readiness", () => {
    expect(feedPage).toContain("getCurrentWorkspace");
    expect(feedPage).toContain("getClassRosterReadinessForWorkspace");
    expect(feedPage).toContain("listActiveRosterStudentsForWorkspace");
    expect(feedPage).toContain("workspace.workspaceId");
    expect(feedPage).toContain("!classRosterReadiness.readyForClassFirstRoster");
    expect(feedPage).toContain("redirect(routes.roster)");
    expect(feedPage).toContain("rosterStudents={rosterStudents}");
    expect(feedPage).toContain("initialEvidenceRecords={evidenceRecords}");
    expect(feedPage).not.toMatch(/localStorage|getAllStudents/);
  });

  it("keeps roster setup accessible with a feed continuation action", () => {
    expect(rosterPage).toContain("Classes in your roster");
    expect(rosterPage).toContain("getClassRosterReadinessForWorkspace");
    expect(rosterPage).toContain("Continue to evidence feed");
    expect(rosterPage).not.toContain("Roster setup started.");
    expect(rosterPage).not.toContain("Back to evidence feed");
    expect(rosterPage).toContain("Class setup");
    expect(rosterPage).toContain("ManualStudentEntryForm");
    expect(rosterPage).toContain("RosterImportForm");
    expect(rosterPage).toContain("routes.student(student.id)");
    expect(rosterPage).not.toMatch(/\b(SIS|district|AI-powered|FERPA-compliant)\b/i);
  });
});

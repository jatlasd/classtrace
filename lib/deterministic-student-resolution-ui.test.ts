import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const projectRoot = process.cwd();
const feedPage = readFileSync(
  join(projectRoot, "app", "app", "feed", "page.tsx"),
  "utf8"
);
const evidenceFeed = readFileSync(
  join(projectRoot, "components", "dashboard", "evidence-feed.tsx"),
  "utf8"
);
const quickCaptureCard = readFileSync(
  join(projectRoot, "components", "dashboard", "quick-capture-card.tsx"),
  "utf8"
);
const evidenceCaptureCard = readFileSync(
  join(projectRoot, "components", "dashboard", "evidence-capture-card.tsx"),
  "utf8"
);
const captureValidation = readFileSync(
  join(projectRoot, "lib", "evidence", "capture-validation.ts"),
  "utf8"
);

describe("Unit 12 deterministic student resolution wiring", () => {
  it("passes active database roster students into the client feed", () => {
    expect(feedPage).toContain("listActiveRosterStudentsForWorkspace");
    expect(feedPage).toContain("workspace.workspaceId");
    expect(feedPage).toContain("rosterStudents={rosterStudents}");
    expect(feedPage).toContain("return <EvidenceFeed rosterStudents={rosterStudents} />");
    expect(feedPage).not.toMatch(/getAllStudents|localStorage/);
  });

  it("uses the passed roster snapshot for composer suggestions and capture blocking", () => {
    expect(quickCaptureCard).toContain("rosterStudents");
    expect(quickCaptureCard).toContain("resolveCaptureStudents");
    expect(quickCaptureCard).toContain("parseRawNote");
    expect(quickCaptureCard).toContain("Mention one student from your roster before capturing.");
    expect(quickCaptureCard).toContain("This student is not on your roster yet.");
    expect(quickCaptureCard).toContain("Choose one student for this V1 capture.");
    expect(quickCaptureCard).toContain("Ready to capture for");
    expect(quickCaptureCard).not.toContain("getAllStudents");
  });

  it("keeps feed capture and edit behavior behind the same student-resolution gate", () => {
    expect(evidenceFeed).toContain("rosterStudents");
    expect(evidenceFeed).toContain("resolveCaptureStudents");
    expect(evidenceFeed).toContain("handleInvalidCaptureEdit");
    expect(evidenceFeed).toContain("QuickCaptureCard");
    expect(evidenceFeed).toContain("rosterStudents={rosterStudents}");
    expect(evidenceFeed).toContain("resolveCaptureDisplay(");
    expect(evidenceFeed).not.toMatch(/workspaceId|teacherProfileId|clerk/i);
  });

  it("uses the database roster snapshot for capture row display", () => {
    expect(captureValidation).toContain("roster-display-bridge");
    expect(captureValidation).toContain("resolveStudentNamesFromRoster");
    expect(evidenceCaptureCard).toContain("rosterStudents");
    expect(evidenceCaptureCard).toContain("resolveCaptureDisplay(draft, validation, rosterStudents)");
    expect(evidenceCaptureCard).toContain("draftToDisplay(draft, rosterStudents)");
  });

  it("does not expand product scope in student-resolution copy", () => {
    const combined = `${feedPage}\n${evidenceFeed}\n${quickCaptureCard}`;
    expect(combined).not.toMatch(/\b(AI-powered|FERPA-compliant|district-approved)\b/i);
    expect(combined).not.toMatch(/\b(SIS sync|gradebook|IEP|parent communication|admin dashboard)\b/i);
    expect(combined).not.toMatch(/\b(Photo|Upload|Audio|Attachment|PDF)\b/i);
  });
});

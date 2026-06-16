import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const projectRoot = process.cwd();
const reviewPanel = readFileSync(
  join(projectRoot, "components", "dashboard", "interpretation-review-panel.tsx"),
  "utf8"
);
const captureCard = readFileSync(
  join(projectRoot, "components", "dashboard", "evidence-capture-card.tsx"),
  "utf8"
);
const evidenceFeed = readFileSync(
  join(projectRoot, "components", "dashboard", "evidence-feed.tsx"),
  "utf8"
);
const captureValidation = readFileSync(
  join(projectRoot, "lib", "evidence", "capture-validation.ts"),
  "utf8"
);
const schema = readFileSync(join(projectRoot, "prisma", "schema.prisma"), "utf8");

describe("Unit 14 save validated evidence UI bridge", () => {
  it("uses the evidence save action from the local review bridge", () => {
    expect(evidenceFeed).toContain("saveValidatedEvidence");
    expect(evidenceFeed).toContain("@/actions/evidence");
    expect(reviewPanel).toContain("Save validated evidence");
    expect(reviewPanel).toContain("Saving evidence");
    expect(reviewPanel).toContain("Validated evidence saved.");
  });

  it("passes a roster student id and structured summary instead of raw draft text", () => {
    const combined = `${reviewPanel}\n${captureCard}\n${evidenceFeed}\n${captureValidation}`;
    expect(combined).toContain("rosterStudentId");
    expect(combined).toContain("buildValidatedEvidenceSummary");
    expect(combined).not.toMatch(/summary:\s*draft\.parsed\.rawNote/);
    expect(evidenceFeed).not.toMatch(/saveValidatedEvidence\([^)]*rawNote/s);
  });

  it("tracks server save metadata separately from local validation", () => {
    expect(captureValidation).toContain("savedEvidenceId");
    expect(captureValidation).toContain("savedAt");
    expect(captureCard).toContain("Saved to evidence records");
  });

  it("keeps the review panel visible long enough to show the saved state", () => {
    expect(captureCard).toContain("showReviewPanel");
    expect(captureCard).not.toMatch(
      /if \(result\.success\) \{\s*setReviewOpen\(false\);/s
    );
    expect(reviewPanel).toContain("setSavedEvidenceId(result.evidenceId)");
  });

  it("does not add raw draft storage to the schema", () => {
    const evidenceModel = schema.slice(
      schema.indexOf("model EvidenceRecord"),
      schema.indexOf("@@index([classGroupId])")
    );

    expect(evidenceModel).not.toMatch(/rawNote|draftText|originalCapture|sourceText/i);
  });

  it("does not expand product scope in save copy", () => {
    const combined = `${reviewPanel}\n${captureCard}\n${evidenceFeed}`;
    expect(combined).not.toMatch(/\b(AI|inference|FERPA|compliance|district-approved)\b/i);
    expect(combined).not.toMatch(/\b(SIS|gradebook|IEP|parent|admin|upload|file|billing|analytics)\b/i);
  });
});

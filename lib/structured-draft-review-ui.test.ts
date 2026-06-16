import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const projectRoot = process.cwd();
const reviewPanel = readFileSync(
  join(projectRoot, "components", "dashboard", "interpretation-review-panel.tsx"),
  "utf8"
);
const evidenceCaptureCard = readFileSync(
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

describe("Unit 13 structured draft review UI", () => {
  it("uses teacher-controlled draft interpretation language", () => {
    expect(reviewPanel).toContain("ClassTrace read this as");
    expect(reviewPanel).toContain("Review before saving");
    expect(reviewPanel).toContain(
      "Adjust anything that looks off before this becomes validated evidence."
    );
    expect(reviewPanel).toContain("Save validated evidence");
    expect(reviewPanel).toContain("Dismiss for now");
    expect(evidenceCaptureCard).toContain("Review before saving");
  });

  it("anchors validation to one roster student instead of exposing student editing", () => {
    expect(captureValidation).toContain("validateSingleStudentForInterpretation");
    expect(captureValidation).toContain("valid_one_student");
    expect(captureValidation).toContain("no_student");
    expect(captureValidation).toContain("unresolved_student");
    expect(captureValidation).toContain("multiple_students");
    expect(reviewPanel).toContain("validateSingleStudentForInterpretation(display)");
    expect(reviewPanel).toContain("students: [studentName]");
    expect(reviewPanel).not.toContain('id="review-students"');
    expect(reviewPanel).not.toContain('aria-label="Students"');
  });

  it("keeps validation teacher-controlled at the save boundary", () => {
    const combined = `${reviewPanel}\n${evidenceCaptureCard}\n${evidenceFeed}`;
    expect(combined).toContain("Save validated evidence");
    expect(combined).toContain("validation:");
    expect(combined).toContain("savedEvidenceId");
    expect(combined).not.toMatch(/createValidatedEvidence/);
    expect(combined).not.toMatch(/from "@\/lib\/db|from "@\/lib\/auth/);
  });

  it("does not expand product scope in review copy", () => {
    const combined = `${reviewPanel}\n${evidenceCaptureCard}`;
    expect(combined).not.toMatch(/\b(AI|inference|FERPA|compliance|district-approved)\b/i);
    expect(combined).not.toMatch(/\b(SIS|gradebook|IEP|parent|admin|upload|file)\b/i);
  });
});

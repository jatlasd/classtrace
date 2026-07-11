import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const projectRoot = process.cwd();
const read = (...parts: string[]) =>
  readFileSync(join(projectRoot, ...parts), "utf8");

const reviewPanel = read(
  "components",
  "dashboard",
  "interpretation-review-panel.tsx"
);
const evidenceFeed = read("components", "dashboard", "evidence-feed.tsx");
const quickCapture = read(
  "components",
  "dashboard",
  "quick-capture-card.tsx"
);
const timeline = read(
  "components",
  "students",
  "student-timeline-page.tsx"
);
const report = read(
  "components",
  "students",
  "student-report-page.tsx"
);
const landing = [
  read("components", "landing", "landing-hero.tsx"),
  read("components", "landing", "landing-closing-cta.tsx"),
].join("\n");

describe("first-use payoff path", () => {
  it("shows a transient first-save panel with the three approved next actions", () => {
    expect(reviewPanel).toContain("isFirstWorkspaceEvidence");
    expect(reviewPanel).toContain("Saved to {studentValidation.studentName}");
    expect(reviewPanel).toContain("View {studentValidation.studentName}");
    expect(reviewPanel).toContain("Preview report");
    expect(reviewPanel).toContain("Capture another note");
    expect(reviewPanel).toContain("routes.student(studentValidation.studentId)");
    expect(reviewPanel).toContain("routes.studentReport(studentValidation.studentId)");
    expect(reviewPanel).toContain("Validated evidence saved.");
    expect(reviewPanel).not.toMatch(/localStorage|sessionStorage|seenAt|dismissedAt/);
  });

  it("returns focus to the existing composer instead of creating another flow", () => {
    expect(evidenceFeed).toContain("composerFocusRequestKey");
    expect(evidenceFeed).toContain("onCaptureAnother");
    expect(quickCapture).toContain("inputRef.current?.focus()");
    expect(quickCapture).toContain("focusRequestKey");
  });

  it("frames timeline accumulation at one, two through four, and five records", () => {
    expect(timeline).toContain("evidenceCount === 1");
    expect(timeline).toContain("evidenceCount >= 2");
    expect(timeline).toContain("evidenceCount >= 5");
    expect(timeline).toContain("This is the start of");
    expect(timeline).toContain("validated evidence records saved for");
    expect(timeline).toContain("meetings, progress reviews, and documentation conversations");
    expect(timeline).toContain("No validated evidence yet.");
  });

  it("adds early report guidance only for one through four displayed records", () => {
    expect(report).toContain("evidenceCount >= 1 && evidenceCount <= 4");
    expect(report).toContain("This report gets more useful as you capture more evidence.");
    expect(report).toContain("evidenceRecords.length");
  });

  it("shifts public calls to action toward evidence retrieval", () => {
    expect(landing.match(/Start an evidence trail/g)).toHaveLength(2);
    expect(landing).toContain("documentation memory");
    expect(landing).toContain("does not start from memory");
    expect(landing).not.toContain("Capture your first note");
  });
});

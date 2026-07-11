import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const evidenceFeed = readFileSync(
  join(process.cwd(), "components", "dashboard", "evidence-feed.tsx"),
  "utf8"
);
const savedEvidenceRow = readFileSync(
  join(process.cwd(), "components", "dashboard", "saved-evidence-row.tsx"),
  "utf8"
);
const appTopNav = readFileSync(
  join(process.cwd(), "components", "dashboard", "app-top-nav.tsx"),
  "utf8"
);

describe("Phase 2 feed and shell polish", () => {
  it("exposes filter selection programmatically", () => {
    expect(evidenceFeed).toContain("aria-pressed={filter === option.value}");
  });

  it("renders capture boundaries as explanatory steps instead of controls", () => {
    expect(evidenceFeed).toContain('aria-label="Capture steps"');
    expect(evidenceFeed).toContain("one student");
    expect(evidenceFeed).toContain("the draft");
    expect(evidenceFeed).toContain("approved evidence");
  });

  it("keeps evidence management collapsed behind one accessible control", () => {
    expect(savedEvidenceRow).toContain("Manage evidence");
    expect(savedEvidenceRow).toContain("aria-expanded={isManaging}");
    expect(savedEvidenceRow).toContain("aria-controls={managementId}");
    expect(savedEvidenceRow).toContain("isManaging ? (");
  });

  it("uses one hydration-stable account label across app routes", () => {
    expect(appTopNav).toContain('const ACCOUNT_LABEL = "Account"');
    expect(appTopNav).not.toContain("useUser");
    expect(appTopNav).not.toContain("fullName");
    expect(appTopNav).not.toContain("primaryEmailAddress");
  });
});

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const projectRoot = process.cwd();
const appLayout = readFileSync(
  join(projectRoot, "app", "app", "layout.tsx"),
  "utf8"
);
const appTopNav = readFileSync(
  join(projectRoot, "components", "dashboard", "app-top-nav.tsx"),
  "utf8"
);
const quickCaptureCard = readFileSync(
  join(projectRoot, "components", "dashboard", "quick-capture-card.tsx"),
  "utf8"
);
const evidenceFeed = readFileSync(
  join(projectRoot, "components", "dashboard", "evidence-feed.tsx"),
  "utf8"
);
const evidenceFeedHeader = readFileSync(
  join(projectRoot, "components", "dashboard", "evidence-feed-header.tsx"),
  "utf8"
);
const noticedPanel = readFileSync(
  join(projectRoot, "components", "dashboard", "classtrace-noticed-panel.tsx"),
  "utf8"
);

describe("Unit 11 production evidence feed UI pass", () => {
  it("uses the new light top navigation shell for authenticated app routes", () => {
    expect(appLayout).toContain("AppTopNav");
    expect(appLayout).not.toContain("AppSidebar");
    expect(appLayout).not.toContain("MobileNav");
    expect(appTopNav).toContain("Capture");
    expect(appTopNav).toContain("Students");
    expect(appTopNav).toContain("SignOutButton");
    expect(appTopNav).toContain("useUser");
    expect(appTopNav).toContain("Sign out");
    expect(appTopNav).toContain("overflow-visible");
    expect(appTopNav).not.toContain("overflow-x-auto");
    expect(appTopNav).not.toContain("@/lib/mock-data");
    expect(appTopNav).not.toContain("Teacher");
    expect(appTopNav).not.toContain("Notifications");
    expect(appTopNav).not.toContain("Bell");
    expect(appTopNav).not.toContain("Review\", href: routes.feed");
    expect(appTopNav).not.toContain("Search\", href: routes.feed");
  });

  it("keeps the composer text-only and capture-first", () => {
    expect(quickCaptureCard).toContain("What happened?");
    expect(quickCaptureCard).toContain("Capture Note");
    expect(quickCaptureCard).toContain("@student");
    expect(quickCaptureCard).toContain("#tag");
    expect(quickCaptureCard).not.toContain("type=\"button\"\n              title");
    expect(quickCaptureCard).not.toMatch(/\b(Camera|Video|Mic|Paperclip)\b/);
    expect(quickCaptureCard).not.toMatch(/\b(Photo|Upload|Audio|Attachment)\b/i);
  });

  it("renders the reference-direction feed labels without expanding product scope", () => {
    expect(evidenceFeedHeader).toContain("Recent captures");
    expect(evidenceFeed).toContain("No validated evidence yet.");
    expect(evidenceFeed).toContain("SavedEvidenceRow");
    expect(evidenceFeed).not.toContain("Browser-local utilities");
    expect(noticedPanel).toContain("Patterns");
    expect(noticedPanel).toContain("Follow-ups");
    expect(noticedPanel).not.toContain("View all");
    expect(noticedPanel).not.toContain("New follow-up");

    const combined = `${appTopNav}\n${quickCaptureCard}\n${evidenceFeed}\n${noticedPanel}`;
    expect(combined).not.toMatch(/\b(AI-powered|FERPA-compliant|district-approved)\b/i);
    expect(combined).not.toMatch(/\b(SIS sync|gradebook|IEP|parent communication|admin dashboard)\b/i);
  });
});

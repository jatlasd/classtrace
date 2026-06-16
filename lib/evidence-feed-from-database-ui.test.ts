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
const savedEvidenceRow = readFileSync(
  join(projectRoot, "components", "dashboard", "saved-evidence-row.tsx"),
  "utf8"
);
const noticedPanel = readFileSync(
  join(projectRoot, "components", "dashboard", "classtrace-noticed-panel.tsx"),
  "utf8"
);
const prismaSchema = readFileSync(
  join(projectRoot, "prisma", "schema.prisma"),
  "utf8"
);

describe("Unit 15 database-backed evidence feed", () => {
  it("loads roster and evidence records server-side for the feed", () => {
    expect(feedPage).toContain("getCurrentWorkspace");
    expect(feedPage).toContain("Promise.all");
    expect(feedPage).toContain("listActiveRosterStudentsForWorkspace");
    expect(feedPage).toContain("listEvidenceFeedRecordsForWorkspace");
    expect(feedPage).toContain("initialEvidenceRecords={evidenceRecords}");
  });

  it("keeps database helpers out of the client feed and removes local POC feed utilities", () => {
    expect(evidenceFeed).not.toMatch(/@\/lib\/db|@\/app\/api/);
    expect(evidenceFeed).not.toContain("@/lib/poc-storage");
    expect(evidenceFeed).not.toContain("@/lib/demo-data");
    expect(evidenceFeed).not.toContain("Browser-local utilities");
    expect(evidenceFeed).not.toContain("Export JSON");
    expect(evidenceFeed).not.toContain("classtrace-poc-export");
    expect(evidenceFeed).toContain("initialEvidenceRecords");
    expect(evidenceFeed).toContain("SavedEvidenceRow");
    expect(evidenceFeed).toContain("evidenceRecords={initialEvidenceRecords}");
    expect(evidenceFeed).toContain("router.refresh()");
  });

  it("renders saved evidence as validated structured records without raw draft storage", () => {
    expect(savedEvidenceRow).toContain("Saved evidence record");
    expect(savedEvidenceRow).toContain("Validated");
    expect(savedEvidenceRow).toContain("record.summary");
    expect(savedEvidenceRow).not.toMatch(/rawNote|draftText|originalCapture|sourceText/);
    expect(evidenceFeed).toContain("No validated evidence yet.");
    expect(evidenceFeed).toContain("Capture a student-specific note");
    expect(prismaSchema).not.toMatch(/rawNote|draftText|originalCapture|sourceText/);

    const combined = `${evidenceFeed}\n${savedEvidenceRow}`;
    expect(combined).not.toMatch(/\b(AI-powered|FERPA-compliant|district-approved)\b/i);
    expect(combined).not.toMatch(
      /\b(SIS sync|gradebook|IEP|parent communication|admin dashboard|upload|file attachment|billing)\b/i
    );
  });

  it("includes saved database evidence in the deterministic right rail summaries", () => {
    expect(noticedPanel).toContain("evidenceRecords: EvidenceFeedRecord[]");
    expect(noticedPanel).toContain("record.studentDisplayName");
    expect(noticedPanel).toContain("record.tags");
    expect(noticedPanel).toContain("record.followUpNotes");
    expect(noticedPanel).toContain("recent evidence record");
    expect(noticedPanel).not.toMatch(/\b(AI-powered|analytics|reminders)\b/i);
  });
});

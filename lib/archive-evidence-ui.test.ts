import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const projectRoot = process.cwd();
const savedEvidenceRow = readFileSync(
  join(projectRoot, "components", "dashboard", "saved-evidence-row.tsx"),
  "utf8"
);
const evidenceFeed = readFileSync(
  join(projectRoot, "components", "dashboard", "evidence-feed.tsx"),
  "utf8"
);
const schema = readFileSync(
  join(projectRoot, "prisma", "schema.prisma"),
  "utf8"
);

describe("Unit 18 archive evidence UI", () => {
  it("adds a calm archive affordance to saved evidence rows", () => {
    expect(savedEvidenceRow).toContain('"use client"');
    expect(savedEvidenceRow).toContain("archiveEvidence");
    expect(savedEvidenceRow).toContain("Archive evidence");
    expect(savedEvidenceRow).toContain("Hide this from default evidence views?");
    expect(savedEvidenceRow).toContain("variant=\"ghost\"");
    expect(savedEvidenceRow).toContain("variant=\"outline\"");
  });

  it("archives by evidence id only and never accepts client ownership ids", () => {
    expect(savedEvidenceRow).toContain("evidenceId: record.id");
    expect(savedEvidenceRow).not.toMatch(
      /workspaceId|teacherProfileId|clerkUserId/
    );
  });

  it("keeps archived evidence out of the feed through existing database records", () => {
    expect(evidenceFeed).toContain("initialEvidenceRecords");
    expect(evidenceFeed).toContain("<SavedEvidenceRow");
    expect(evidenceFeed).not.toMatch(/archived evidence|restore evidence/i);
  });

  it("does not add restore, export, bulk archive, or raw draft behavior", () => {
    const combined = `${savedEvidenceRow}\n${evidenceFeed}`;
    expect(combined).not.toMatch(
      /Restore evidence|Export evidence|Bulk archive|Delete student/i
    );
    expect(savedEvidenceRow).not.toMatch(
      /rawNote|draftText|originalCapture|sourceText/i
    );
  });

  it("does not change the evidence schema for archive", () => {
    const evidenceModel = schema.match(/model EvidenceRecord \{[\s\S]*?\n\}/);

    expect(evidenceModel?.[0]).toContain("archivedAt");
    expect(evidenceModel?.[0]).not.toMatch(
      /rawNote|draftText|originalCapture|sourceText/i
    );
  });
});

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
const evidenceAction = readFileSync(
  join(projectRoot, "actions", "evidence.ts"),
  "utf8"
);
const schema = readFileSync(
  join(projectRoot, "prisma", "schema.prisma"),
  "utf8"
);

describe("Unit 19 delete evidence UI", () => {
  it("adds destructive delete confirmation without removing archive", () => {
    expect(savedEvidenceRow).toContain("Archive evidence");
    expect(savedEvidenceRow).toContain("Delete evidence");
    expect(savedEvidenceRow).toContain(
      "Permanently delete this evidence record? This cannot be undone."
    );
    expect(savedEvidenceRow).toContain("variant=\"destructive\"");
    expect(savedEvidenceRow).toContain("Cancel");
    expect(savedEvidenceRow).toContain("deleteEvidence");
  });

  it("deletes by evidence id only and never accepts client ownership ids", () => {
    expect(savedEvidenceRow).toContain("deleteEvidence({ evidenceId: record.id })");
    expect(savedEvidenceRow).not.toMatch(
      /workspaceId|teacherProfileId|clerkUserId|rosterStudentId:/
    );
  });

  it("keeps delete wired through a workspace-resolving Server Action", () => {
    expect(evidenceAction).toContain("deleteEvidenceForWorkspace");
    expect(evidenceAction).toContain("workspace.workspaceId");
    expect(evidenceAction).toContain("routes.student(result.rosterStudentId)");
    expect(evidenceAction).toContain("[actions/evidence/deleteEvidence]");
  });

  it("does not add restore, bulk delete, student delete, export, or raw draft behavior", () => {
    expect(savedEvidenceRow).not.toMatch(
      /Restore evidence|Bulk delete|Delete student|Export evidence|trash view|undo queue/i
    );
    const combined = `${savedEvidenceRow}\n${evidenceAction}`;
    expect(combined).not.toMatch(
      /rawNote|draftText|originalCapture|sourceText/i
    );
  });

  it("does not change the evidence schema for delete", () => {
    const evidenceModel = schema.match(/model EvidenceRecord \{[\s\S]*?\n\}/);

    expect(evidenceModel?.[0]).toContain("id");
    expect(evidenceModel?.[0]).not.toMatch(
      /deletedAt|rawNote|draftText|originalCapture|sourceText/i
    );
  });

  it("keeps same-session validated drafts hidden after saved evidence is deleted", () => {
    expect(savedEvidenceRow).toContain("onDeleted?.(record.id)");
    expect(evidenceFeed).toContain("hiddenSavedEvidenceIds");
    expect(evidenceFeed).toContain("hiddenSavedEvidenceIds.has");
    expect(evidenceFeed).toContain("onDeleted={handleSavedEvidenceHidden}");
  });
});

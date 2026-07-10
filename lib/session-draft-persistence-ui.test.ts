import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const feedPage = readFileSync("app/app/feed/page.tsx", "utf8");
const evidenceFeed = readFileSync(
  "components/dashboard/evidence-feed.tsx",
  "utf8"
);
const storageHelper = readFileSync(
  "lib/evidence/session-draft-storage.ts",
  "utf8"
);
const prismaSchema = readFileSync("prisma/schema.prisma", "utf8");

describe("UIP-09 session draft persistence UI bridge", () => {
  it("passes only the current opaque workspace id into the client feed boundary", () => {
    expect(feedPage).toContain("workspaceId={workspace.workspaceId}");
    expect(evidenceFeed).toContain("workspaceId: string;");
    expect(evidenceFeed).not.toMatch(/clerkUserId|teacherProfileId|userEmail/);
  });

  it("hydrates captured drafts after mount and rebuilds deterministic drafts", () => {
    expect(evidenceFeed).toContain("useEffect(() => {");
    expect(evidenceFeed).toContain(
      "const restored = loadSessionDrafts(storage, workspaceId);"
    );
    expect(evidenceFeed).toContain("buildNoteDraft(sessionDraft.rawNote)");
    expect(evidenceFeed).toContain("hydratedWorkspaceId");
    expect(evidenceFeed).toContain(
      "const sessionDraftsReady = hydratedWorkspaceId === workspaceId"
    );
    expect(evidenceFeed).not.toMatch(
      /useState<FeedItem\[\]>\(\(\)\s*=>[\s\S]*sessionStorage/
    );
  });

  it("synchronizes capture edits, successful saves, deletion, and midnight expiry", () => {
    expect(evidenceFeed).toContain("saveSessionDrafts(");
    expect(evidenceFeed).toContain("upsertSessionDraft(");
    expect(evidenceFeed).toContain(
      "rawNote: item.draft.parsed.rawNote"
    );
    expect(evidenceFeed).toContain(
      "removeSessionDraft(sessionStorageRef.current, workspaceId, id);"
    );
    expect(evidenceFeed).toContain("nextLocalMidnight(now)");
    expect(evidenceFeed).toContain('window.addEventListener("focus"');
    expect(evidenceFeed).toContain(
      'document.addEventListener("visibilitychange"'
    );
  });

  it("uses the approved teacher-facing persistence copy", () => {
    expect(evidenceFeed).toContain(
      "Drafts stay in this tab until you save or delete them, and are cleared at midnight. Saved evidence stays in your evidence records."
    );
    expect(evidenceFeed).not.toContain(
      "Drafts and saved evidence will stay in this chronological feed."
    );
  });

  it("keeps the stored shape minimal and the durable evidence schema raw-note free", () => {
    expect(storageHelper).toContain(
      'export const SESSION_DRAFT_STORAGE_KEY = "classtrace:session-drafts:v1"'
    );
    expect(storageHelper).not.toMatch(/EvidenceFeedRecord|CaptureValidation/);
    expect(prismaSchema).not.toMatch(
      /\b(rawNote|draftText|originalCapture|sourceText)\b/i
    );
    expect(evidenceFeed).not.toMatch(
      /saveValidatedEvidence\([^)]*rawNote/s
    );
  });

  it("does not persist unfinished composer or review-form state", () => {
    const quickCaptureCard = readFileSync(
      "components/dashboard/quick-capture-card.tsx",
      "utf8"
    );
    const reviewPanel = readFileSync(
      "components/dashboard/interpretation-review-panel.tsx",
      "utf8"
    );

    expect(quickCaptureCard).not.toContain("sessionStorage");
    expect(reviewPanel).not.toContain("sessionStorage");
    expect(reviewPanel).not.toContain("saveSessionDrafts");
  });
});

import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { EvidenceFeedRecord } from "@/lib/evidence/evidence-feed-records";
import { buildNoteDraft } from "@/lib/note-processing/build-note-draft";
import { ClassTraceNoticedPanel } from "./classtrace-noticed-panel";

const roster = [
  {
    id: "student_mary",
    displayName: "Mary",
    mentionHandle: "mary",
    classGroupName: "Reading",
  },
];

const savedEvidence: EvidenceFeedRecord = {
  id: "evidence_1",
  rosterStudentId: "student_mary",
  studentDisplayName: "Mary",
  studentMentionHandle: "mary",
  evidenceDate: "2026-07-11T14:00:00.000Z",
  evidenceNote: "used a reading strategy independently",
  summary: "Mary used a reading strategy independently.",
  evidenceType: "Academic check-in",
  tags: ["reading"],
  followUpNeeded: false,
  validatedAt: "2026-07-11T14:05:00.000Z",
  createdAt: "2026-07-11T14:05:00.000Z",
};

describe("ClassTraceNoticedPanel", () => {
  it("labels combined saved evidence and current draft counts truthfully", () => {
    const markup = renderToStaticMarkup(
      <ClassTraceNoticedPanel
        items={[{ draft: buildNoteDraft("@Mary used a reading strategy #reading") }]}
        rosterStudents={roster}
        evidenceRecords={[savedEvidence]}
      />
    );

    expect(markup).toContain("Mary appears most often");
    expect(markup).toContain("2 items across saved evidence and current drafts");
    expect(markup).toContain("2 uses across saved evidence and current drafts");
    expect(markup).not.toContain("recent evidence record");
  });

  it("does not call an all-history saved record recent", () => {
    const markup = renderToStaticMarkup(
      <ClassTraceNoticedPanel
        items={[]}
        rosterStudents={roster}
        evidenceRecords={[savedEvidence]}
      />
    );

    expect(markup).toContain("1 saved evidence record");
    expect(markup).not.toContain("recent evidence record");
  });
});

import { describe, expect, it } from "vitest";
import {
  captureMatchesSearch,
  evidenceRecordMatchesSearch,
  type FeedItem,
} from "@/lib/evidence/evidence-feed-filtering";
import { buildNoteDraft } from "@/lib/note-processing/build-note-draft";

const roster = [
  {
    id: "student_mary",
    displayName: "Mary",
    mentionHandle: "mary",
    classGroupName: "Reading",
  },
];

const draftItem: FeedItem = {
  id: "draft_1",
  draft: buildNoteDraft("@Mary used a reading strategy #reading"),
  timestamp: "Just now",
  timestampMs: Date.now(),
};

const savedRecord = {
  id: "evidence_1",
  rosterStudentId: "student_mary",
  studentDisplayName: "Mary",
  studentMentionHandle: "mary",
  classGroupName: "Reading",
  evidenceDate: "2026-06-16T14:00:00.000Z",
  evidenceNote: "Used a reading strategy after one prompt.",
  summary: "Mary - reading - Academic check-in",
  evidenceType: "Academic check-in",
  topic: "reading",
  tags: ["reading"],
  followUpNeeded: false,
  validatedAt: "2026-06-16T14:05:00.000Z",
  createdAt: "2026-06-16T14:06:00.000Z",
};

describe("evidence feed filtering", () => {
  it("matches draft searches by roster mention, tag, and interpreted content", () => {
    expect(captureMatchesSearch(draftItem, "@mary", roster)).toBe(true);
    expect(captureMatchesSearch(draftItem, "#reading", roster)).toBe(true);
    expect(captureMatchesSearch(draftItem, "strategy", roster)).toBe(true);
    expect(captureMatchesSearch(draftItem, "algebra", roster)).toBe(false);
  });

  it("matches saved evidence by student, tag, class, and Evidence note", () => {
    expect(evidenceRecordMatchesSearch(savedRecord, "@mary")).toBe(true);
    expect(evidenceRecordMatchesSearch(savedRecord, "#reading")).toBe(true);
    expect(evidenceRecordMatchesSearch(savedRecord, "Reading")).toBe(true);
    expect(evidenceRecordMatchesSearch(savedRecord, "one prompt")).toBe(true);
    expect(evidenceRecordMatchesSearch(savedRecord, "algebra")).toBe(false);
  });
});

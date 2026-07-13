import type { CaptureValidation } from "@/lib/evidence/capture-validation";
import { resolveCaptureDisplay } from "@/lib/evidence/capture-validation";
import type { EvidenceFeedRecord } from "@/lib/evidence/evidence-feed-records";
import { normalizeTag } from "@/lib/format-tag";
import type { NoteDraft } from "@/lib/note-processing/types";
import { mentionDisplayLabel } from "@/lib/students/student-mention-display";
import type { CaptureRosterStudent } from "@/lib/students/resolve-capture-students";

export type FeedItem = {
  id: string;
  draft: NoteDraft;
  timestamp: string;
  timestampMs: number;
  validation?: CaptureValidation;
};

export function isValidated(item: FeedItem): boolean {
  return item.validation?.status === "validated";
}

export function needsReview(
  item: FeedItem,
  rosterStudents: CaptureRosterStudent[]
): boolean {
  if (isValidated(item)) return false;
  return resolveCaptureDisplay(item.draft, item.validation, rosterStudents)
    .needsReview;
}

function stripMentionPrefix(mention: string): string {
  return mention.replace(/^@/, "");
}

function buildCaptureSearchHaystacks(
  item: FeedItem,
  rosterStudents: CaptureRosterStudent[]
) {
  const display = resolveCaptureDisplay(
    item.draft,
    item.validation,
    rosterStudents
  );
  const rawNote = item.draft.parsed.rawNote;

  const studentParts: string[] = [];
  for (const ref of display.studentMentions) {
    studentParts.push(mentionDisplayLabel(ref));
    if (ref.status === "resolved") {
      studentParts.push(
        ref.student.displayName,
        ref.student.handle,
        ref.student.id
      );
    } else {
      studentParts.push(ref.mention);
    }
  }
  for (const mention of item.draft.parsed.mentions) {
    studentParts.push(stripMentionPrefix(mention));
  }
  const studentHaystack = studentParts.join(" ").toLowerCase();

  const tagSet = new Set<string>();
  for (const tag of display.tags) {
    tagSet.add(normalizeTag(tag).toLowerCase());
  }
  for (const tag of item.draft.parsed.tags) {
    tagSet.add(normalizeTag(tag).toLowerCase());
  }
  const tagHaystack = [...tagSet].join(" ");

  const generalParts: string[] = [
    rawNote,
    studentHaystack,
    tagHaystack,
    display.evidenceType,
    display.summaryLine,
  ];
  if (display.topic) generalParts.push(display.topic);
  if (display.performance) generalParts.push(display.performance);
  if (display.behavior) generalParts.push(...display.behavior);
  if (display.followUps.length > 0) generalParts.push(...display.followUps);

  return {
    rawNote,
    studentHaystack,
    tagHaystack,
    generalHaystack: generalParts.join(" ").toLowerCase(),
  };
}

export function captureMatchesSearch(
  item: FeedItem,
  rawQuery: string,
  rosterStudents: CaptureRosterStudent[]
): boolean {
  const trimmed = rawQuery.trim();
  if (!trimmed) return true;

  const { rawNote, studentHaystack, tagHaystack, generalHaystack } =
    buildCaptureSearchHaystacks(item, rosterStudents);

  if (trimmed.startsWith("@")) {
    const needle = stripMentionPrefix(trimmed).toLowerCase();
    return !needle || studentHaystack.includes(needle) || generalHaystack.includes(needle);
  }

  if (trimmed.startsWith("#")) {
    const needle = normalizeTag(trimmed).toLowerCase();
    return (
      !needle ||
      tagHaystack.includes(needle) ||
      rawNote.toLowerCase().includes(`#${needle}`) ||
      generalHaystack.includes(needle)
    );
  }

  return generalHaystack.includes(trimmed.toLowerCase());
}

export function evidenceRecordMatchesSearch(
  record: EvidenceFeedRecord,
  rawQuery: string
): boolean {
  const trimmed = rawQuery.trim();
  if (!trimmed) return true;

  const tagHaystack = record.tags
    .map((tag) => normalizeTag(tag).toLowerCase())
    .join(" ");
  const studentHaystack = [
    record.studentDisplayName,
    record.studentMentionHandle,
    record.rosterStudentId,
  ]
    .join(" ")
    .toLowerCase();

  if (trimmed.startsWith("@")) {
    const needle = stripMentionPrefix(trimmed).toLowerCase();
    return !needle || studentHaystack.includes(needle);
  }

  if (trimmed.startsWith("#")) {
    const needle = normalizeTag(trimmed).toLowerCase();
    return !needle || tagHaystack.includes(needle);
  }

  return [
    record.evidenceNote,
    record.summary,
    record.studentDisplayName,
    record.studentMentionHandle,
    record.classGroupName,
    record.evidenceType,
    record.topic,
    record.performance,
    record.behavior,
    record.followUpNotes,
    tagHaystack,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
    .includes(trimmed.toLowerCase());
}

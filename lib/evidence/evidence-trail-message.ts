export function getEvidenceTrailMessage(
  studentName: string,
  evidenceCount: number
): string {
  if (evidenceCount === 1) {
    return `This is the start of ${studentName}'s evidence trail. Each small moment you save makes the record easier to use later.`;
  }

  if (evidenceCount >= 5) {
    return "You are building a usable record for meetings, progress reviews, and documentation conversations.";
  }

  if (evidenceCount >= 2) {
    return `${evidenceCount} validated evidence records saved for ${studentName}. Each observation strengthens the record you can return to later.`;
  }

  return "No validated evidence has been saved for this student yet.";
}

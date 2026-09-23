export const SAVED_EVIDENCE_CLASSIFICATIONS = [
  { parserKey: "academic_check_in", label: "Academic check-in" },
  { parserKey: "behavior_observation", label: "Behavior observation" },
  { parserKey: "communication_log", label: "Communication log" },
  { parserKey: "accommodation_log", label: "Accommodation log" },
  { parserKey: "assessment_observation", label: "Assessment observation" },
  { parserKey: "progress_monitoring", label: "Progress monitoring" },
  { parserKey: "general_observation", label: "General observation" },
] as const;

export type SavedEvidenceClassification =
  (typeof SAVED_EVIDENCE_CLASSIFICATIONS)[number];

export type SavedEvidenceClassificationLabel =
  SavedEvidenceClassification["label"];

export const SAVED_EVIDENCE_CLASSIFICATION_LABELS =
  SAVED_EVIDENCE_CLASSIFICATIONS.map(({ label }) => label);

export function getSavedEvidenceClassificationByLabel(
  label: string
): SavedEvidenceClassification | undefined {
  return SAVED_EVIDENCE_CLASSIFICATIONS.find(
    (classification) => classification.label === label
  );
}

export function getSavedEvidenceClassificationByParserKey(
  parserKey: string
): SavedEvidenceClassification | undefined {
  return SAVED_EVIDENCE_CLASSIFICATIONS.find(
    (classification) => classification.parserKey === parserKey
  );
}

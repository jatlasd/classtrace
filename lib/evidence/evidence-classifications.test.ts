import { describe, expect, it } from "vitest";
import {
  getSavedEvidenceClassificationByLabel,
  getSavedEvidenceClassificationByParserKey,
  SAVED_EVIDENCE_CLASSIFICATION_LABELS,
} from "./evidence-classifications";

describe("saved evidence classifications", () => {
  it("exposes only the seven durable saved labels", () => {
    expect(SAVED_EVIDENCE_CLASSIFICATION_LABELS).toEqual([
      "Academic check-in",
      "Behavior observation",
      "Communication log",
      "Accommodation log",
      "Assessment observation",
      "Progress monitoring",
      "General observation",
    ]);
    expect(SAVED_EVIDENCE_CLASSIFICATION_LABELS).not.toContain("Unclear");
  });

  it("maps parser keys and saved labels without accepting legacy strings", () => {
    expect(
      getSavedEvidenceClassificationByParserKey("progress_monitoring")?.label
    ).toBe("Progress monitoring");
    expect(
      getSavedEvidenceClassificationByLabel("Academic check-in")?.parserKey
    ).toBe("academic_check_in");
    expect(getSavedEvidenceClassificationByLabel("Legacy observation")).toBe(
      undefined
    );
  });
});

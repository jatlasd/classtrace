import { describe, expect, it } from "vitest";
import { getEvidenceTrailMessage } from "@/lib/evidence/evidence-trail-message";

describe("getEvidenceTrailMessage", () => {
  it("describes the evidence trail at useful accumulation points", () => {
    expect(getEvidenceTrailMessage("Mary", 0)).toContain("No validated evidence");
    expect(getEvidenceTrailMessage("Mary", 1)).toContain("start of Mary's evidence trail");
    expect(getEvidenceTrailMessage("Mary", 3)).toContain("3 validated evidence records");
    expect(getEvidenceTrailMessage("Mary", 5)).toContain("meetings, progress reviews");
  });
});

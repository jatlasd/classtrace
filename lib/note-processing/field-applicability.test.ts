import { describe, expect, it } from "vitest";
import { buildNoteDraft } from "./build-note-draft";
import { getApplicableFields } from "./field-applicability";
import type { MatchResult } from "./types";

function match(value: string): MatchResult {
  return { value, confidence: "high", sources: [] };
}

describe("getApplicableFields", () => {
  it("excludes skill and performance for behavior_observation", () => {
    const applicable = getApplicableFields(
      match("behavior_observation"),
      match("math")
    );
    expect(applicable.has("behavior")).toBe(true);
    expect(applicable.has("severity")).toBe(true);
    expect(applicable.has("skill")).toBe(false);
    expect(applicable.has("performance")).toBe(false);
    expect(applicable.has("communication")).toBe(false);
  });

  it("includes skill and performance for general_observation with math domain", () => {
    const applicable = getApplicableFields(
      match("general_observation"),
      match("math")
    );
    expect(applicable.has("skill")).toBe(true);
    expect(applicable.has("performance")).toBe(true);
    expect(applicable.has("behavior")).toBe(false);
  });

  it("includes communication and severity for communication_log", () => {
    const applicable = getApplicableFields(
      match("communication_log"),
      match("unclear")
    );
    expect(applicable.has("communication")).toBe(true);
    expect(applicable.has("severity")).toBe(true);
    expect(applicable.has("skill")).toBe(false);
    expect(applicable.has("performance")).toBe(false);
    expect(applicable.has("behavior")).toBe(false);
  });
});

describe("buildNoteDraft", () => {
  const behaviorNote =
    "@Jeremy was off-task during multiplying fractions review but got started after a verbal redirect. #behavior #fractions";

  it("marks skill and performance not_applicable for behavior notes", () => {
    const draft = buildNoteDraft(behaviorNote);
    expect(draft.noteType.value).toBe("behavior_observation");
    expect(draft.applicableFields).not.toContain("skill");
    expect(draft.applicableFields).not.toContain("performance");
    expect(draft.skill.value).toBe("not_applicable");
    expect(draft.performance.value).toBe("not_applicable");
  });

  it("includes academic fields for struggling fractions note", () => {
    const draft = buildNoteDraft(
      "@Jeremy struggling with multiplying fractions #math"
    );
    expect(draft.applicableFields).toContain("skill");
    expect(draft.applicableFields).toContain("performance");
    expect(draft.applicableFields).not.toContain("behavior");
  });

  it("excludes academic fields for communication notes", () => {
    const draft = buildNoteDraft("Called home about missing work");
    expect(draft.applicableFields).toContain("communication");
    expect(draft.skill.value).toBe("not_applicable");
    expect(draft.performance.value).toBe("not_applicable");
  });
});

import { describe, expect, it } from "vitest";
import { buildNoteDraft } from "@/lib/note-processing/build-note-draft";
import {
  parseStudentNames,
  parseTags,
  resolveCaptureDisplay,
} from "./capture-validation";

describe("resolveCaptureDisplay", () => {
  it("keeps parser needsReview when validation is pending", () => {
    const draft = buildNoteDraft(
      "@Jeremy still struggling on multiplying fractions review #fractions #review #checkin"
    );
    const display = resolveCaptureDisplay(draft);

    expect(display.validationStatus).toBe("pending");
    expect(display.needsReview).toBe(true);
    expect(display.students).toContain("Jeremy");
  });

  it("overrides display and clears needsReview when validated", () => {
    const draft = buildNoteDraft(
      "@Jeremy still struggling on multiplying fractions review #fractions #review #checkin"
    );
    const display = resolveCaptureDisplay(draft, {
      status: "validated",
      fields: {
        students: ["Jeremy", "Mary"],
        evidenceType: "Academic check-in",
        topic: "fractions",
        performance: "struggling",
        tags: ["#fractions", "#review"],
        followUpNotes: ["Consider reteach"],
      },
    });

    expect(display.validationStatus).toBe("validated");
    expect(display.needsReview).toBe(false);
    expect(display.students).toEqual(["Jeremy", "Mary"]);
    expect(display.followUps).toEqual(["Consider reteach"]);
  });
});

describe("field parsers", () => {
  it("strips @ from student names", () => {
    expect(parseStudentNames("@Jeremy, @Mary")).toEqual(["Jeremy", "Mary"]);
  });

  it("normalizes tags with hash prefix", () => {
    expect(parseTags("fractions, #review")).toEqual(["#fractions", "#review"]);
  });
});

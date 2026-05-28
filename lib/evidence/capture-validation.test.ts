import { beforeEach, describe, expect, it } from "vitest";
import { buildNoteDraft } from "@/lib/note-processing/build-note-draft";
import { addStudent, resetTeacherRosterForTests } from "@/lib/students";
import {
  parseStudentNames,
  parseTags,
  resolveCaptureDisplay,
} from "./capture-validation";

describe("resolveCaptureDisplay", () => {
  beforeEach(() => {
    resetTeacherRosterForTests();
    addStudent({ displayName: "Jeremy", handle: "Jeremy" });
    addStudent({ displayName: "Mary", handle: "Mary" });
  });
  it("keeps parser needsReview when validation is pending", () => {
    const draft = buildNoteDraft(
      "@Jeremy still struggling on multiplying fractions review #fractions #review #checkin"
    );
    const display = resolveCaptureDisplay(draft);

    expect(display.validationStatus).toBe("pending");
    expect(display.needsReview).toBe(true);
    expect(display.studentMentions).toEqual([
      {
        status: "resolved",
        student: expect.objectContaining({ id: "jeremy", displayName: "Jeremy" }),
      },
    ]);
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
        tags: ["fractions", "review"],
        followUpNotes: ["Consider reteach"],
      },
    });

    expect(display.validationStatus).toBe("validated");
    expect(display.needsReview).toBe(false);
    expect(display.studentMentions).toEqual([
      {
        status: "resolved",
        student: expect.objectContaining({ id: "jeremy" }),
      },
      {
        status: "resolved",
        student: expect.objectContaining({ id: "mary" }),
      },
    ]);
    expect(display.followUps).toEqual(["Consider reteach"]);
  });

  it("flags unresolved validated student names for review", () => {
    const draft = buildNoteDraft("@Jeremy needs help #fractions");
    const display = resolveCaptureDisplay(draft, {
      status: "validated",
      fields: {
        students: ["Unknown"],
        evidenceType: "Academic check-in",
        tags: ["fractions"],
        followUpNotes: [],
      },
    });

    expect(display.needsReview).toBe(true);
    expect(display.studentMentions).toEqual([
      { status: "unresolved", mention: "Unknown" },
    ]);
  });

  it("marks unresolved mentions as needing review when pending", () => {
    const draft = buildNoteDraft("@Unknown was confused #fractions");
    const display = resolveCaptureDisplay(draft);

    expect(display.needsReview).toBe(true);
    expect(display.studentMentions).toEqual([
      { status: "unresolved", mention: "Unknown" },
    ]);
  });
});

describe("field parsers", () => {
  it("strips @ from student names", () => {
    expect(parseStudentNames("@Jeremy, @Mary")).toEqual(["Jeremy", "Mary"]);
  });

  it("normalizes tags without hash prefix", () => {
    expect(parseTags("fractions, #review")).toEqual(["fractions", "review"]);
  });
});

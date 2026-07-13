import { describe, expect, it } from "vitest";
import { buildNoteDraft } from "@/lib/note-processing/build-note-draft";
import {
  parseStudentNames,
  parseTags,
  resolveCaptureDisplay,
  validateSingleStudentForInterpretation,
} from "./capture-validation";

const roster = [
  {
    id: "jeremy",
    displayName: "Jeremy",
    mentionHandle: "jeremy",
    classGroupName: "Reading",
  },
  {
    id: "mary",
    displayName: "Mary",
    mentionHandle: "mary",
    classGroupName: "Reading",
  },
];

describe("resolveCaptureDisplay", () => {
  it("keeps parser needsReview when validation is pending", () => {
    const draft = buildNoteDraft(
      "@Jeremy still struggling on multiplying fractions review #fractions #review #checkin"
    );
    const display = resolveCaptureDisplay(draft, undefined, roster);

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
    const display = resolveCaptureDisplay(
      draft,
      {
        status: "validated",
        fields: {
          students: ["Jeremy", "Mary"],
          evidenceType: "Academic check-in",
          topic: "fractions",
          performance: "struggling",
          tags: ["fractions", "review"],
          followUpNotes: ["Consider reteach"],
        },
      },
      roster
    );

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
    const display = resolveCaptureDisplay(
      draft,
      {
        status: "validated",
        fields: {
          students: ["Unknown"],
          evidenceType: "Academic check-in",
          tags: ["fractions"],
          followUpNotes: [],
        },
      },
      roster
    );

    expect(display.needsReview).toBe(true);
    expect(display.studentMentions).toEqual([
      { status: "unresolved", mention: "Unknown" },
    ]);
  });

  it("marks unresolved mentions as needing review when pending", () => {
    const draft = buildNoteDraft("@Unknown was confused #fractions");
    const display = resolveCaptureDisplay(draft, undefined, roster);

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

describe("Evidence note prefill", () => {
  it("keeps safe tag wording in the note and the tag in structured metadata", () => {
    const display = resolveCaptureDisplay(
      buildNoteDraft("@Mary worked on #reading"),
      undefined,
      roster
    );

    expect(display.cleanText).toBe("worked on reading");
    expect(display.tags).toEqual(["reading"]);
  });
});

describe("validateSingleStudentForInterpretation", () => {
  it("allows exactly one resolved student", () => {
    const display = resolveCaptureDisplay(
      buildNoteDraft("@Mary worked through the reading passage #reading"),
      undefined,
      roster
    );

    expect(validateSingleStudentForInterpretation(display)).toEqual({
      status: "valid_one_student",
      studentId: "mary",
      studentName: "Mary",
    });
  });

  it("allows repeated mentions of the same resolved roster student", () => {
    const repeatedMentionRoster = [
      {
        id: "student_mary",
        displayName: "Mary",
        mentionHandle: "mary",
        classGroupName: "Reading",
      },
    ];
    const display = resolveCaptureDisplay(
      buildNoteDraft("@Mary checked her work after @Mary used a strategy #reading"),
      undefined,
      repeatedMentionRoster
    );

    expect(display.studentMentions).toHaveLength(1);
    expect(validateSingleStudentForInterpretation(display)).toEqual({
      status: "valid_one_student",
      studentId: "student_mary",
      studentName: "Mary",
    });
  });

  it("blocks review validation with no student", () => {
    const display = resolveCaptureDisplay(
      buildNoteDraft("Worked through the reading passage #reading"),
      undefined,
      roster
    );

    expect(validateSingleStudentForInterpretation(display)).toEqual({
      status: "no_student",
    });
  });

  it("blocks review validation with unresolved students", () => {
    const display = resolveCaptureDisplay(
      buildNoteDraft("@Unknown worked through the reading passage #reading"),
      undefined,
      roster
    );

    expect(validateSingleStudentForInterpretation(display)).toEqual({
      status: "unresolved_student",
      studentNames: ["Unknown"],
    });
  });

  it("blocks review validation with multiple students", () => {
    const display = resolveCaptureDisplay(
      buildNoteDraft("@Mary and @Jeremy worked through the passage #reading"),
      undefined,
      roster
    );

    expect(validateSingleStudentForInterpretation(display)).toEqual({
      status: "multiple_students",
      studentNames: ["Mary", "Jeremy"],
    });
  });
});

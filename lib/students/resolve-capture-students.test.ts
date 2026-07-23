import { describe, expect, it } from "vitest";
import { resolveCaptureStudents } from "@/lib/students/resolve-capture-students";

const roster = [
  {
    id: "student_1",
    displayName: "Mary",
    mentionHandle: "Mary",
    classGroupName: "Reading",
  },
  {
    id: "student_2",
    displayName: "Jeremy",
    mentionHandle: "Jeremy",
    classGroupName: null,
  },
];

describe("resolveCaptureStudents", () => {
  it("blocks captures with no student mentions", () => {
    expect(resolveCaptureStudents([], roster)).toEqual({
      status: "no_student_mentioned",
    });
  });

  it("resolves one student by roster handle", () => {
    expect(resolveCaptureStudents(["Mary"], roster)).toEqual({
      status: "resolved_one_student",
      student: roster[0],
    });
  });

  it("matches roster handles case-insensitively with optional at prefix", () => {
    expect(resolveCaptureStudents(["@mArY"], roster)).toEqual({
      status: "resolved_one_student",
      student: roster[0],
    });
  });

  it("identifies one unresolved student mention", () => {
    expect(resolveCaptureStudents(["Stacy"], roster)).toEqual({
      status: "unresolved_student",
      unresolvedMentions: ["Stacy"],
    });
  });

  it("blocks multiple resolved students", () => {
    expect(resolveCaptureStudents(["Mary", "Jeremy"], roster)).toEqual({
      status: "multiple_students",
      students: [roster[0], roster[1]],
    });
  });

  it("blocks mixed resolved and unresolved handles as multiple students", () => {
    expect(resolveCaptureStudents(["Mary", "Stacy"], roster)).toEqual({
      status: "multiple_students",
      students: [roster[0]],
    });
  });

  it("deduplicates repeated mentions of the same resolved student", () => {
    expect(resolveCaptureStudents(["Mary", "@mary", "MARY"], roster)).toEqual({
      status: "resolved_one_student",
      student: roster[0],
    });
  });

  it("deduplicates repeated mentions of the same unresolved handle", () => {
    expect(resolveCaptureStudents(["Stacy", "@stacy", "STACY"], roster)).toEqual({
      status: "unresolved_student",
      unresolvedMentions: ["Stacy"],
    });
  });

  it("only resolves students present in the active roster snapshot", () => {
    expect(resolveCaptureStudents(["Stacy"], roster)).toEqual({
      status: "unresolved_student",
      unresolvedMentions: ["Stacy"],
    });
  });
});

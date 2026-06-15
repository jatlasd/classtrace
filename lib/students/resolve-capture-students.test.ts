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

  it("blocks unresolved student mentions", () => {
    expect(resolveCaptureStudents(["Unknown"], roster)).toEqual({
      status: "unresolved_student",
      unresolvedMentions: ["Unknown"],
    });
  });

  it("blocks multiple resolved students", () => {
    expect(resolveCaptureStudents(["Mary", "Jeremy"], roster)).toEqual({
      status: "multiple_students",
      students: [roster[0], roster[1]],
    });
  });

  it("blocks mixed resolved and unresolved mentions as unresolved", () => {
    expect(resolveCaptureStudents(["Mary", "Unknown"], roster)).toEqual({
      status: "unresolved_student",
      unresolvedMentions: ["Unknown"],
    });
  });
});

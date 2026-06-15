import { describe, expect, it } from "vitest";
import {
  resolveStudentMentionsFromRoster,
  resolveStudentNamesFromRoster,
} from "@/lib/students/roster-display-bridge";

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

describe("roster display bridge", () => {
  it("resolves parsed mentions against the database roster snapshot", () => {
    expect(resolveStudentMentionsFromRoster(["@Mary"], roster)).toEqual([
      {
        status: "resolved",
        student: expect.objectContaining({
          id: "student_1",
          displayName: "Mary",
          handle: "Mary",
        }),
      },
    ]);
  });

  it("marks unknown mentions as unresolved", () => {
    expect(resolveStudentMentionsFromRoster(["Unknown"], roster)).toEqual([
      { status: "unresolved", mention: "Unknown" },
    ]);
  });

  it("resolves validated student names by handle or display name", () => {
    expect(resolveStudentNamesFromRoster(["Mary", "Jeremy"], roster)).toEqual([
      {
        status: "resolved",
        student: expect.objectContaining({ id: "student_1" }),
      },
      {
        status: "resolved",
        student: expect.objectContaining({ id: "student_2" }),
      },
    ]);
  });
});

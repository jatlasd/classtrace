import { beforeEach, describe, expect, it } from "vitest";
import { getCapturesForStudent } from "@/lib/evidence/student-captures";
import {
  addStudent,
  getAllStudents,
  getStudentByHandle,
  getStudentById,
  resetTeacherRosterForTests,
  resolveStudentMention,
  resolveStudentMentions,
} from "./students";

describe("student roster", () => {
  beforeEach(() => {
    resetTeacherRosterForTests();
  });

  it("looks up students by id", () => {
    expect(getStudentById("jeremy")?.displayName).toBe("Jeremy");
    expect(getStudentById("unknown")).toBeUndefined();
  });

  it("looks up students by handle case-insensitively", () => {
    expect(getStudentByHandle("jeremy")?.id).toBe("jeremy");
    expect(getStudentByHandle("MARY")?.displayName).toBe("Mary");
  });

  it("resolves mentions with or without @ and mixed case", () => {
    expect(resolveStudentMention("@Jeremy")?.id).toBe("jeremy");
    expect(resolveStudentMention("jeremy")?.id).toBe("jeremy");
    expect(resolveStudentMention("Unknown")).toBeUndefined();
  });

  it("maps mentions to resolved and unresolved refs", () => {
    const refs = resolveStudentMentions(["Jeremy", "Unknown"]);
    expect(refs[0]).toEqual({
      status: "resolved",
      student: expect.objectContaining({ id: "jeremy" }),
    });
    expect(refs[1]).toEqual({ status: "unresolved", mention: "Unknown" });
  });

  it("filters captures for a student including multi-student notes", () => {
    const jeremyCaptures = getCapturesForStudent("jeremy");
    expect(jeremyCaptures.map((c) => c.id)).toEqual(["1", "4"]);

    const maryCaptures = getCapturesForStudent("mary");
    expect(maryCaptures.map((c) => c.id)).toEqual(["4"]);
  });

  it("adds a student to the teacher roster", () => {
    const result = addStudent({
      displayName: "Alex Rivera",
      handle: "AlexR",
      grade: "4th Grade",
      group: "Period 1",
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.student).toMatchObject({
      id: "alexr",
      displayName: "Alex Rivera",
      handle: "AlexR",
      grade: "4th Grade",
      group: "Period 1",
      initials: "AR",
    });

    expect(getAllStudents()).toHaveLength(5);
    expect(getStudentById("alexr")?.displayName).toBe("Alex Rivera");
  });

  it("resolves mentions for newly added students", () => {
    addStudent({
      displayName: "Alex Rivera",
      handle: "AlexR",
    });

    expect(resolveStudentMention("@AlexR")?.id).toBe("alexr");
    expect(resolveStudentMention("alexr")?.displayName).toBe("Alex Rivera");
  });

  it("rejects duplicate handles", () => {
    addStudent({
      displayName: "Alex Rivera",
      handle: "AlexR",
    });

    const duplicate = addStudent({
      displayName: "Alex R",
      handle: "AlexR",
    });

    expect(duplicate).toEqual({
      ok: false,
      error: "A student with this handle already exists on your roster.",
    });
    expect(getAllStudents()).toHaveLength(5);
  });
});

import { beforeEach, describe, expect, it, vi } from "vitest";
import { getCapturesForStudent } from "@/lib/evidence/student-captures";
import {
  addStudent,
  deleteStudent,
  getAllStudents,
  getStudentByHandle,
  getStudentById,
  resetTeacherRosterForTests,
  resolveStudentMention,
  resolveStudentMentions,
  updateStudent,
} from "./students";

function seedDemoRoster(): void {
  addStudent({
    displayName: "Jeremy",
    handle: "Jeremy",
    grade: "5th Grade",
    group: "Period 2",
  });
  addStudent({
    displayName: "Stacy",
    handle: "Stacy",
    grade: "5th Grade",
    group: "Period 2",
  });
  addStudent({
    displayName: "Jeff",
    handle: "Jeff",
    grade: "5th Grade",
    group: "Period 3",
  });
  addStudent({
    displayName: "Mary",
    handle: "Mary",
    grade: "5th Grade",
    group: "Period 2",
  });
}

describe("student roster", () => {
  beforeEach(() => {
    resetTeacherRosterForTests();
  });

  it("looks up students by id", () => {
    seedDemoRoster();
    expect(getStudentById("jeremy")?.displayName).toBe("Jeremy");
    expect(getStudentById("unknown")).toBeUndefined();
  });

  it("looks up students by handle case-insensitively", () => {
    seedDemoRoster();
    expect(getStudentByHandle("jeremy")?.id).toBe("jeremy");
    expect(getStudentByHandle("MARY")?.displayName).toBe("Mary");
  });

  it("resolves mentions with or without @ and mixed case", () => {
    seedDemoRoster();
    expect(resolveStudentMention("@Jeremy")?.id).toBe("jeremy");
    expect(resolveStudentMention("jeremy")?.id).toBe("jeremy");
    expect(resolveStudentMention("Unknown")).toBeUndefined();
  });

  it("maps mentions to resolved and unresolved refs", () => {
    seedDemoRoster();
    const refs = resolveStudentMentions(["Jeremy", "Unknown"]);
    expect(refs[0]).toEqual({
      status: "resolved",
      student: expect.objectContaining({ id: "jeremy" }),
    });
    expect(refs[1]).toEqual({ status: "unresolved", mention: "Unknown" });
  });

  it("returns no captures when nothing is stored", () => {
    seedDemoRoster();
    expect(getCapturesForStudent("jeremy")).toEqual([]);
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

    expect(getAllStudents()).toHaveLength(1);
    expect(getStudentById("alexr")?.displayName).toBe("Alex Rivera");
  });

  it("strips legacy demo students from stored roster on hydrate", () => {
    const store: Record<string, string> = {
      "classtrace.poc.roster.v1": JSON.stringify([
        {
          id: "jeremy",
          displayName: "Jeremy",
          handle: "Jeremy",
          initials: "JE",
          colorClass: "bg-sky-500",
        },
        {
          id: "anthony",
          displayName: "Anthony",
          handle: "Anthony",
          initials: "AN",
          colorClass: "bg-teal-500",
        },
      ]),
    };

    vi.stubGlobal("window", globalThis);
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => store[key] ?? null,
      setItem: (key: string, value: string) => {
        store[key] = value;
      },
      removeItem: (key: string) => {
        delete store[key];
      },
    });

    resetTeacherRosterForTests();
    expect(getAllStudents().map((student) => student.id)).toEqual(["anthony"]);

    vi.unstubAllGlobals();
  });

  it("resolves mentions for newly added students", () => {
    addStudent({
      displayName: "Alex Rivera",
      handle: "AlexR",
    });

    expect(resolveStudentMention("@AlexR")?.id).toBe("alexr");
    expect(resolveStudentMention("alexr")?.displayName).toBe("Alex Rivera");
    expect(resolveStudentMention("Alex Rivera")?.id).toBe("alexr");
  });

  it("accepts handles with a leading @", () => {
    const result = addStudent({
      displayName: "Alex Rivera",
      handle: "@AlexR",
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.student.handle).toBe("AlexR");
    expect(resolveStudentMention("@AlexR")?.id).toBe("alexr");
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
    expect(getAllStudents()).toHaveLength(1);
  });

  it("updates a student on the roster", () => {
    addStudent({
      displayName: "Anthony Smith",
      handle: "Anthony",
      grade: "5th Grade",
      group: "Period 2",
    });

    const result = updateStudent("anthony", {
      displayName: "Anthony S.",
      handle: "@Tony",
      grade: "6th Grade",
      group: "Period 3",
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(getStudentById("anthony")).toMatchObject({
      id: "anthony",
      displayName: "Anthony S.",
      handle: "Tony",
      grade: "6th Grade",
      group: "Period 3",
      initials: "AS",
    });
    expect(resolveStudentMention("@Tony")?.id).toBe("anthony");
  });

  it("rejects duplicate handles when updating", () => {
    addStudent({ displayName: "Anthony", handle: "Anthony" });
    addStudent({ displayName: "Mary", handle: "Mary" });

    const result = updateStudent("mary", {
      displayName: "Mary",
      handle: "Anthony",
    });

    expect(result).toEqual({
      ok: false,
      error: "A student with this handle already exists on your roster.",
    });
  });

  it("deletes a student from the roster", () => {
    addStudent({ displayName: "Anthony", handle: "Anthony" });
    addStudent({ displayName: "Mary", handle: "Mary" });

    expect(deleteStudent("anthony")).toEqual({ ok: true });
    expect(getAllStudents()).toHaveLength(1);
    expect(getStudentById("anthony")).toBeUndefined();
    expect(getStudentById("mary")?.displayName).toBe("Mary");
  });
});

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
      displayName: "Jeff",
      handle: "Jeff",
      grade: "4th Grade",
      group: "Period 1",
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.student).toMatchObject({
      id: "jeff",
      displayName: "Jeff",
      handle: "Jeff",
      grade: "4th Grade",
      group: "Period 1",
      initials: "JE",
    });

    expect(getAllStudents()).toHaveLength(1);
    expect(getStudentById("jeff")?.displayName).toBe("Jeff");
  });

  it("hydrates approved fictional students from stored roster", () => {
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
          id: "stacy",
          displayName: "Stacy",
          handle: "Stacy",
          initials: "ST",
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
    expect(getAllStudents().map((student) => student.id)).toEqual([
      "jeremy",
      "stacy",
    ]);
    expect(store["classtrace.poc.roster.v1"]).toBeDefined();

    vi.unstubAllGlobals();
  });

  it("resolves mentions for newly added students", () => {
    addStudent({
      displayName: "Jeff",
      handle: "Jeff",
    });

    expect(resolveStudentMention("@Jeff")?.id).toBe("jeff");
    expect(resolveStudentMention("jeff")?.displayName).toBe("Jeff");
    expect(resolveStudentMention("Jeff")?.id).toBe("jeff");
  });

  it("accepts handles with a leading @", () => {
    const result = addStudent({
      displayName: "Jeff",
      handle: "@Jeff",
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.student.handle).toBe("Jeff");
    expect(resolveStudentMention("@Jeff")?.id).toBe("jeff");
  });

  it("rejects duplicate handles", () => {
    addStudent({
      displayName: "Jeff",
      handle: "Jeff",
    });

    const duplicate = addStudent({
      displayName: "Jeremy",
      handle: "Jeff",
    });

    expect(duplicate).toEqual({
      ok: false,
      error: "A student with this handle already exists on your roster.",
    });
    expect(getAllStudents()).toHaveLength(1);
  });

  it("updates a student on the roster", () => {
    addStudent({
      displayName: "Jeremy",
      handle: "Jeremy",
      grade: "5th Grade",
      group: "Period 2",
    });

    const result = updateStudent("jeremy", {
      displayName: "Stacy",
      handle: "@Stacy",
      grade: "6th Grade",
      group: "Period 3",
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(getStudentById("jeremy")).toMatchObject({
      id: "jeremy",
      displayName: "Stacy",
      handle: "Stacy",
      grade: "6th Grade",
      group: "Period 3",
      initials: "ST",
    });
    expect(resolveStudentMention("@Stacy")?.id).toBe("jeremy");
  });

  it("rejects duplicate handles when updating", () => {
    addStudent({ displayName: "Jeff", handle: "Jeff" });
    addStudent({ displayName: "Mary", handle: "Mary" });

    const result = updateStudent("mary", {
      displayName: "Mary",
      handle: "Jeff",
    });

    expect(result).toEqual({
      ok: false,
      error: "A student with this handle already exists on your roster.",
    });
  });

  it("deletes a student from the roster", () => {
    addStudent({ displayName: "Jeff", handle: "Jeff" });
    addStudent({ displayName: "Mary", handle: "Mary" });

    expect(deleteStudent("jeff")).toEqual({ ok: true });
    expect(getAllStudents()).toHaveLength(1);
    expect(getStudentById("jeff")).toBeUndefined();
    expect(getStudentById("mary")?.displayName).toBe("Mary");
  });
});

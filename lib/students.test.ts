import { describe, expect, it } from "vitest";
import { getCapturesForStudent } from "@/lib/evidence/student-captures";
import {
  getStudentByHandle,
  getStudentById,
  resolveStudentMention,
  resolveStudentMentions,
} from "./students";

describe("student roster", () => {
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
});

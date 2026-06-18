import { beforeEach, describe, expect, it, vi } from "vitest";
import { getCapturesForStudent } from "@/lib/evidence/student-captures";
import { readStoredCaptures } from "@/lib/poc-storage";
import {
  getWideDemoClassroomData,
  loadWideDemoClassroom,
} from "./load-wide-demo-classroom";
import {
  resetTeacherRosterForTests,
  resolveStudentMention,
} from "@/lib/students";

function stubLocalStorage() {
  const store: Record<string, string> = {};

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

  return store;
}

describe("wide demo classroom", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
    resetTeacherRosterForTests();
  });

  it("provides a roster of approved fictional students", () => {
    const { roster } = getWideDemoClassroomData();
    expect(roster).toHaveLength(4);
    expect(roster.map((student) => student.id)).toEqual([
      "mary",
      "jeff",
      "stacy",
      "jeremy",
    ]);
  });

  it("normalizes demo captures into stored capture shape", () => {
    const { captures } = getWideDemoClassroomData();
    expect(captures.length).toBeGreaterThan(0);

    for (const capture of captures) {
      expect(capture.id).toEqual(expect.any(String));
      expect(capture.rawNote).toEqual(expect.any(String));
      expect(capture.timestampMs).toEqual(expect.any(Number));
    }
  });

  it("replaces existing captures when loading the demo", () => {
    const store = stubLocalStorage();
    store["classtrace.poc.captures.v1"] = JSON.stringify([
      {
        id: "old-capture",
        rawNote: "@Jeremy was on task",
        timestampMs: 1,
      },
    ]);

    const loaded = loadWideDemoClassroom();
    const stored = readStoredCaptures();

    expect(loaded).toHaveLength(63);
    expect(stored).toHaveLength(63);
    expect(stored.some((capture) => capture.id === "old-capture")).toBe(false);
  });

  it("resolves student mentions immediately after loading demo", () => {
    stubLocalStorage();
    loadWideDemoClassroom();

    expect(resolveStudentMention("@Mary")?.id).toBe("mary");
    expect(resolveStudentMention("jeff")?.displayName).toBe("Jeff");
  });

  it("keeps the approved demo roster available after hydration", () => {
    stubLocalStorage();
    loadWideDemoClassroom();

    resetTeacherRosterForTests();

    expect(resolveStudentMention("@Mary")?.id).toBe("mary");
    expect(resolveStudentMention("@Jeremy")?.displayName).toBe("Jeremy");
  });

  it("finds captures for a demo student after loading", () => {
    stubLocalStorage();
    loadWideDemoClassroom();

    const captures = getCapturesForStudent("mary");
    expect(captures.length).toBeGreaterThan(0);
    expect(captures.every((capture) => capture.note.includes("@Mary"))).toBe(
      true
    );
  });
});

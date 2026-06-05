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

  it("provides a roster of five students", () => {
    const { roster } = getWideDemoClassroomData();
    expect(roster).toHaveLength(5);
    expect(roster.map((student) => student.id)).toEqual([
      "maya",
      "jalen",
      "brielle",
      "mateo",
      "noah",
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
        rawNote: "@Anthony was on task",
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

    expect(resolveStudentMention("@Maya")?.id).toBe("maya");
    expect(resolveStudentMention("jalen")?.displayName).toBe("Jalen");
  });

  it("finds captures for a demo student after loading", () => {
    stubLocalStorage();
    loadWideDemoClassroom();

    const captures = getCapturesForStudent("maya");
    expect(captures.length).toBeGreaterThan(0);
    expect(captures.every((capture) => capture.note.includes("@Maya"))).toBe(
      true
    );
  });
});

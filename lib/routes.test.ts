import { describe, expect, it } from "vitest";
import { isStudentProfilePath, routes } from "@/lib/routes";

describe("routes", () => {
  it("defines the canonical Unit 02 route map", () => {
    expect(routes.root).toBe("/");
    expect(routes.feed).toBe("/app/feed");
    expect(routes.roster).toBe("/app/roster");
    expect(routes.studentsPrefix).toBe("/app/students");
    expect(routes.student("jeremy")).toBe("/app/students/jeremy");
    expect(routes.settings).toBe("/app/settings");
    expect(routes.signIn).toBe("/sign-in");
    expect(routes.signUp).toBe("/sign-up");
  });

  it("detects student profile paths from the shared prefix", () => {
    expect(isStudentProfilePath("/app/students/jeremy")).toBe(true);
    expect(isStudentProfilePath("/app/roster")).toBe(false);
    expect(isStudentProfilePath("/app/students")).toBe(false);
  });
});

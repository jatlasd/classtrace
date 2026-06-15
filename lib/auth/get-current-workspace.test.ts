import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const source = readFileSync(
  join(process.cwd(), "lib", "auth", "get-current-workspace.ts"),
  "utf8"
);

describe("getCurrentWorkspace", () => {
  it("uses Clerk server identity and never accepts a client user id", () => {
    expect(source).toContain("@clerk/nextjs/server");
    expect(source).toContain("auth()");
    expect(source).toContain("userId");
    expect(source).not.toMatch(/clientUserId|inputUserId|paramsUserId/);
  });

  it("creates or finds the app-owned teacher profile and personal workspace", () => {
    expect(source).toContain("teacherProfile.upsert");
    expect(source).toContain("workspace.upsert");
    expect(source).toContain("clerkUserId");
    expect(source).toContain("teacherProfileId");
  });

  it("does not introduce organization, district, or admin ownership fields", () => {
    expect(source).not.toMatch(/organization|district|admin|membership|role/i);
  });
});

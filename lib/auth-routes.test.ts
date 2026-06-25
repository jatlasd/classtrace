import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  clerkAfterSignInUrl,
  clerkAfterSignUpUrl,
  clerkSignInUrl,
  clerkSignUpUrl,
  isProtectedAppPath,
} from "@/lib/auth-routes";

const projectRoot = process.cwd();

describe("auth route boundaries", () => {
  it("protects the app route and all nested app routes", () => {
    expect(isProtectedAppPath("/app")).toBe(true);
    expect(isProtectedAppPath("/app/feed")).toBe(true);
    expect(isProtectedAppPath("/app/students/jeremy")).toBe(true);
  });

  it("keeps the landing page and auth routes public", () => {
    expect(isProtectedAppPath("/")).toBe(false);
    expect(isProtectedAppPath("/sign-in")).toBe(false);
    expect(isProtectedAppPath("/sign-up")).toBe(false);
    expect(isProtectedAppPath("/students/jeremy")).toBe(false);
  });

  it("defines Clerk redirect urls from the shared route map", () => {
    expect(clerkSignInUrl).toBe("/sign-in");
    expect(clerkSignUpUrl).toBe("/sign-up");
    expect(clerkAfterSignInUrl).toBe("/app");
    expect(clerkAfterSignUpUrl).toBe("/app");
  });

  it("redirects signed-in users away from auth pages", () => {
    const signInPage = readFileSync(
      join(projectRoot, "app", "sign-in", "[[...sign-in]]", "page.tsx"),
      "utf8"
    );
    const signUpPage = readFileSync(
      join(projectRoot, "app", "sign-up", "[[...sign-up]]", "page.tsx"),
      "utf8"
    );

    for (const source of [signInPage, signUpPage]) {
      expect(source).toContain("auth()");
      expect(source).toContain("redirect(routes.app)");
    }
  });
});

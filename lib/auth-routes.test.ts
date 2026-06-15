import { describe, expect, it } from "vitest";
import {
  clerkAfterSignInUrl,
  clerkAfterSignUpUrl,
  clerkSignInUrl,
  clerkSignUpUrl,
  isProtectedAppPath,
} from "@/lib/auth-routes";

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
});

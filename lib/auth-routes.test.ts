import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  redirect: vi.fn((href: string) => {
    throw new Error(`redirect:${href}`);
  }),
}));

vi.mock("@clerk/nextjs/server", () => ({ auth: mocks.auth }));
vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));
vi.mock("@clerk/nextjs", () => ({ SignIn: () => null, SignUp: () => null }));
import {
  clerkAfterSignInUrl,
  clerkAfterSignUpUrl,
  clerkSignInUrl,
  clerkSignUpUrl,
  isProtectedAppPath,
  protectedRoutePatterns,
} from "@/lib/auth-routes";
import SignInPage from "@/app/sign-in/[[...sign-in]]/page";
import SignUpPage from "@/app/sign-up/[[...sign-up]]/page";

describe("auth route boundaries", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it("protects the app route and all nested app routes", () => {
    expect(isProtectedAppPath("/app")).toBe(true);
    expect(isProtectedAppPath("/app/feed")).toBe(true);
    expect(isProtectedAppPath("/app/students/jeremy")).toBe(true);
  });

  it("keeps the landing page and auth routes public", () => {
    expect(isProtectedAppPath("/")).toBe(false);
    expect(isProtectedAppPath("/privacy")).toBe(false);
    expect(isProtectedAppPath("/terms")).toBe(false);
    expect(isProtectedAppPath("/support")).toBe(false);
    expect(isProtectedAppPath("/data-deletion")).toBe(false);
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

  it("protects the direct-url operator console through Clerk", () => {
    expect(protectedRoutePatterns).toContain("/operator");
    expect(protectedRoutePatterns).toContain("/operator/(.*)");
  });

  it("protects the acknowledgement flow without treating it as an app route", () => {
    expect(protectedRoutePatterns).toContain("/beta-acknowledgements");
    expect(isProtectedAppPath("/beta-acknowledgements")).toBe(false);
  });

  it("redirects signed-in users away from auth pages at runtime", async () => {
    mocks.auth.mockResolvedValue({ userId: "clerk_user_1" });

    for (const renderPage of [SignInPage, SignUpPage]) {
      await expect(renderPage()).rejects.toThrow("redirect:/app");
    }
    expect(mocks.auth).toHaveBeenCalledTimes(2);
    expect(mocks.redirect).toHaveBeenNthCalledWith(1, "/app");
    expect(mocks.redirect).toHaveBeenNthCalledWith(2, "/app");
  });
});

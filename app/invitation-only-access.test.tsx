// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  redirect: vi.fn((href: string) => {
    throw new Error(`redirect:${href}`);
  }),
}));

vi.mock("@clerk/nextjs/server", () => ({ auth: mocks.auth }));
vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));
vi.mock("@clerk/nextjs", () => ({
  ClerkProvider: ({ children }: { children: React.ReactNode }) => children,
  SignUp: (props: { path: string; signInUrl: string }) => (
    <div
      data-testid="clerk-sign-up"
      data-path={props.path}
      data-sign-in-url={props.signInUrl}
    />
  ),
}));

import Home, { metadata as homeMetadata } from "@/app/page";
import SignUpPage, {
  metadata as signUpMetadata,
} from "@/app/sign-up/[[...sign-up]]/page";
import { routes } from "@/lib/routes";

afterEach(cleanup);

function signUpProps(
  step: string[] | undefined,
  query: Record<string, string>,
) {
  return {
    params: Promise.resolve({ "sign-up": step }),
    searchParams: Promise.resolve(query),
  };
}

describe("invitation-only access", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.auth.mockResolvedValue({ userId: null });
  });

  it("makes the public beta posture and invited sign-up action clear", () => {
    const page = document.createElement("div");
    page.innerHTML = renderToStaticMarkup(<Home />);

    expect(page.textContent).toMatch(/invitation-only beta/i);

    const invitedLinks = Array.from(page.querySelectorAll("a")).filter((link) =>
      /complete sign-up|complete invited sign-up|invited sign-up/i.test(
        link.textContent ?? "",
      ),
    );

    expect(invitedLinks.length).toBeGreaterThan(0);
    for (const link of invitedLinks) {
      expect(link.getAttribute("href")).toBe(routes.signUp);
    }

    expect(page.textContent).not.toMatch(/create account/i);
    expect(homeMetadata.description).toContain("Invitation-only beta");
  });

  it("keeps the Clerk sign-up route rendered for valid invitation links", async () => {
    render(
      await SignUpPage(
        signUpProps([], { __clerk_ticket: "ticket", __clerk_status: "sign_up" }),
      ),
    );

    expect(
      screen.getByRole("heading", {
        name: "Complete your ClassTrace sign-up",
      }),
    ).toBeTruthy();

    const clerkSignUp = screen.getByTestId("clerk-sign-up");
    expect(clerkSignUp.getAttribute("data-path")).toBe(routes.signUp);
    expect(clerkSignUp.getAttribute("data-sign-in-url")).toBe(routes.signIn);
    expect(signUpMetadata.title).toBe("Invitation sign-up | ClassTrace");
    expect(signUpMetadata.description).toContain("invitation-only");
    expect(
      screen.getByRole("navigation", { name: "Footer" })
    ).toBeTruthy();
  });

  it("keeps later Clerk sign-up steps rendered without the ticket", async () => {
    render(await SignUpPage(signUpProps(["verify-email-address"], {})));

    expect(screen.getByTestId("clerk-sign-up")).toBeTruthy();
  });

  it("explains invitation-only access instead of Clerk's disabled sign-up", async () => {
    render(await SignUpPage(signUpProps(undefined, {})));

    expect(
      screen.getByRole("heading", {
        name: "ClassTrace is invitation-only right now",
      }),
    ).toBeTruthy();
    expect(screen.queryByTestId("clerk-sign-up")).toBeNull();
    expect(
      screen
        .getByRole("link", { name: "Watch the 80-second overview" })
        .getAttribute("href"),
    ).toBe(routes.demo);
    expect(
      screen.getByRole("link", { name: "Sign in" }).getAttribute("href"),
    ).toBe(routes.signIn);
    expect(
      screen.getByRole("link", { name: "ClassTrace" }).getAttribute("href"),
    ).toBe(routes.root);
  });
});

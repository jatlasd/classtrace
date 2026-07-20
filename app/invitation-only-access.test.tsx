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

describe("invitation-only access", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.auth.mockResolvedValue({ userId: null });
  });

  it("makes the public beta posture and invited sign-up action clear", () => {
    const page = document.createElement("div");
    page.innerHTML = renderToStaticMarkup(<Home />);

    expect(page.textContent).toMatch(
      /ClassTrace is currently an invitation-only beta/i,
    );

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
    render(await SignUpPage());

    expect(
      screen.getByRole("heading", {
        name: "Complete your ClassTrace sign-up",
      }),
    ).toBeTruthy();
    expect(screen.getByText("Invitation-only beta")).toBeTruthy();

    const clerkSignUp = screen.getByTestId("clerk-sign-up");
    expect(clerkSignUp.getAttribute("data-path")).toBe(routes.signUp);
    expect(clerkSignUp.getAttribute("data-sign-in-url")).toBe(routes.signIn);
    expect(signUpMetadata.title).toBe("Invitation sign-up — ClassTrace");
    expect(signUpMetadata.description).toContain("invitation-only");
  });
});

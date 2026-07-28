// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/actions/beta-agreement", () => ({
  acceptCurrentBetaAgreementAction: vi.fn(),
}));

import { BetaAcknowledgementFlow } from "@/components/beta-agreement/beta-acknowledgement-flow";
import { BETA_AGREEMENT_STEP_IDS } from "@/lib/beta-agreement/beta-agreement-steps";

afterEach(cleanup);

describe("BetaAcknowledgementFlow", () => {
  it("shows one acknowledgement at a time and requires its checkbox", () => {
    render(<BetaAcknowledgementFlow />);

    expect(
      screen.getByRole("heading", {
        name: "1 of 6: This is an independent project",
      })
    ).toBeTruthy();
    expect(
      screen.queryByRole("heading", {
        name: "2 of 6: An invitation is not district approval",
      })
    ).toBeNull();

    const continueButton = screen.getByRole("button", { name: "Continue" });
    expect((continueButton as HTMLButtonElement).disabled).toBe(true);

    fireEvent.click(
      screen.getByRole("checkbox", {
        name: /ClassTrace is an independent project/,
      })
    );
    expect((continueButton as HTMLButtonElement).disabled).toBe(false);
    fireEvent.click(continueButton);

    expect(
      screen.getByRole("heading", {
        name: "2 of 6: An invitation is not district approval",
      })
    ).toBeTruthy();
    expect(
      (screen.getByRole("button", { name: "Continue" }) as HTMLButtonElement)
        .disabled
    ).toBe(true);
  });

  it("presents all exact steps in order and submits only after the sixth", async () => {
    const acceptanceAction = vi.fn().mockResolvedValue({
      success: false,
      error: "Example failure.",
    });
    const expectedHeadings = [
      "This is an independent project",
      "An invitation is not district approval",
      "Please do not use real student information",
      "Things may break",
      "This is not an official school record system",
      "Final agreement",
    ];

    render(
      <BetaAcknowledgementFlow acceptanceAction={acceptanceAction} />
    );

    for (let index = 0; index < expectedHeadings.length; index += 1) {
      expect(
        screen.getByRole("heading", {
          name: `${index + 1} of 6: ${expectedHeadings[index]}`,
        })
      ).toBeTruthy();

      fireEvent.click(screen.getByRole("checkbox"));
      const actionLabel =
        index === expectedHeadings.length - 1
          ? "Agree and enter ClassTrace"
          : "Continue";
      fireEvent.click(screen.getByRole("button", { name: actionLabel }));
    }

    await waitFor(() => expect(acceptanceAction).toHaveBeenCalledTimes(1));
    expect(acceptanceAction).toHaveBeenCalledWith({
      acknowledgedStepIds: [...BETA_AGREEMENT_STEP_IDS],
    });
    expect(
      screen
        .getByRole("link", { name: "ClassTrace Beta Terms" })
        .getAttribute("href")
    ).toBe("/terms");
    expect(
      screen
        .getByRole("link", { name: "ClassTrace Privacy Notice" })
        .getAttribute("href")
    ).toBe("/privacy");
    expect((await screen.findByRole("alert")).textContent).toContain(
      "Example failure."
    );
  });
});

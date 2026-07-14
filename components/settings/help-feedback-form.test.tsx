// @vitest-environment jsdom

import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  submitFeedbackAction: vi.fn(),
  usePathname: vi.fn(),
}));

vi.mock("@/actions/feedback", () => ({
  submitFeedbackAction: mocks.submitFeedbackAction,
}));
vi.mock("next/navigation", () => ({
  usePathname: mocks.usePathname,
}));

import { HelpFeedbackForm } from "@/components/settings/help-feedback-form";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("HelpFeedbackForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.usePathname.mockReturnValue("/app/settings");
    mocks.submitFeedbackAction.mockResolvedValue({ success: true });
    Object.defineProperty(window.navigator, "userAgent", {
      configurable: true,
      value: "Example Browser on Example OS",
    });
  });

  it("submits the approved fields and diagnostic context, then resets safely", async () => {
    render(<HelpFeedbackForm initialReplyEmail="stacy@example.test" />);

    const type = screen.getByLabelText("What can we help with?");
    const description = screen.getByLabelText("Description");
    const replyEmail = screen.getByLabelText("Reply email");

    expect(screen.getAllByRole("option")).toHaveLength(5);
    expect((replyEmail as HTMLInputElement).value).toBe("stacy@example.test");
    expect(screen.getByText(/do not include student names/i)).toBeTruthy();

    fireEvent.change(type, { target: { value: "CONFUSING" } });
    fireEvent.change(description, {
      target: { value: "I could not tell which action saved my change." },
    });
    fireEvent.submit(type.closest("form") as HTMLFormElement);

    expect(
      await screen.findByText(
        "Feedback sent. Thank you for helping improve ClassTrace."
      )
    ).toBeTruthy();
    expect(mocks.submitFeedbackAction).toHaveBeenCalledWith({
      type: "CONFUSING",
      description: "I could not tell which action saved my change.",
      replyEmail: "stacy@example.test",
      currentRoute: "/app/settings",
      browserAndDevice: "Example Browser on Example OS",
    });
    expect((type as HTMLSelectElement).value).toBe("");
    expect((description as HTMLTextAreaElement).value).toBe("");
    expect((replyEmail as HTMLInputElement).value).toBe("stacy@example.test");
  });

  it("preserves values, marks fields, and focuses the error summary", async () => {
    mocks.submitFeedbackAction.mockResolvedValue({
      success: false,
      error: "Check the highlighted fields and try again.",
      fieldErrors: {
        type: "Choose what you need help with.",
        replyEmail: "Enter a valid reply email.",
      },
    });
    render(<HelpFeedbackForm initialReplyEmail="bad-email" />);

    const description = screen.getByLabelText("Description");
    fireEvent.change(description, { target: { value: "Please help." } });
    fireEvent.click(screen.getByRole("button", { name: "Send feedback" }));

    const alert = await screen.findByRole("alert");
    expect(alert.textContent).toBe("Check the highlighted fields and try again.");
    await waitFor(() => expect(document.activeElement).toBe(alert));
    expect(screen.getByLabelText("What can we help with?").getAttribute("aria-invalid")).toBe("true");
    expect(screen.getByLabelText("Reply email").getAttribute("aria-invalid")).toBe("true");
    expect((description as HTMLTextAreaElement).value).toBe("Please help.");
    expect((screen.getByLabelText("Reply email") as HTMLInputElement).value).toBe("bad-email");
  });

  it("disables duplicate submission while the action is pending", async () => {
    let resolveSubmission: ((value: { success: true }) => void) | undefined;
    mocks.submitFeedbackAction.mockReturnValue(
      new Promise((resolve) => {
        resolveSubmission = resolve;
      })
    );
    render(<HelpFeedbackForm initialReplyEmail="mary@example.test" />);

    fireEvent.change(screen.getByLabelText("What can we help with?"), {
      target: { value: "FEATURE_IDEA" },
    });
    fireEvent.change(screen.getByLabelText("Description"), {
      target: { value: "Add a calmer empty state." },
    });
    fireEvent.click(screen.getByRole("button", { name: "Send feedback" }));

    const pendingButton = await screen.findByRole("button", {
      name: "Sending feedback…",
    });
    expect((pendingButton as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(pendingButton);
    expect(mocks.submitFeedbackAction).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolveSubmission?.({ success: true });
    });
  });

  it("preserves the form when the action request rejects", async () => {
    mocks.submitFeedbackAction.mockRejectedValue(new Error("network failed"));
    render(<HelpFeedbackForm initialReplyEmail="jeff@example.test" />);

    fireEvent.change(screen.getByLabelText("What can we help with?"), {
      target: { value: "ACCOUNT_OR_DATA" },
    });
    fireEvent.change(screen.getByLabelText("Description"), {
      target: { value: "I need help with my account." },
    });
    fireEvent.click(screen.getByRole("button", { name: "Send feedback" }));

    expect((await screen.findByRole("alert")).textContent).toBe(
      "Feedback is not available right now. Try again."
    );
    expect((screen.getByLabelText("Description") as HTMLTextAreaElement).value).toBe(
      "I need help with my account."
    );
  });
});

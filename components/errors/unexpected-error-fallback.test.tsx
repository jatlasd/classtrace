// @vitest-environment jsdom

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  captureException: vi.fn(),
  registerUnexpectedErrorReference: vi.fn(),
}));

vi.mock("@sentry/nextjs", () => ({
  captureException: mocks.captureException,
}));

vi.mock("@/actions/error-reporting", () => ({
  registerUnexpectedErrorReference: mocks.registerUnexpectedErrorReference,
}));

import { UnexpectedErrorFallback } from "@/components/errors/unexpected-error-fallback";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("UnexpectedErrorFallback", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.registerUnexpectedErrorReference.mockResolvedValue({ success: true });
  });

  it("shows safe recovery copy and registers the displayed server reference", async () => {
    render(
      <UnexpectedErrorFallback
        error={Object.assign(new Error("SENTINEL_ERROR"), {
          digest: "digest_123",
        })}
        unstable_retry={vi.fn()}
        boundary="app"
      />
    );

    expect(
      screen.getByRole("heading", { name: "Something went wrong" })
    ).toBeTruthy();
    expect(
      screen.getByText(/can.t confirm whether your latest work was saved/i)
    ).toBeTruthy();
    expect(screen.queryByText("SENTINEL_ERROR")).toBeNull();
    expect(screen.getByText("CT-S-digest_123").className).toContain(
      "select-all"
    );
    expect(
      screen
        .getByRole("link", { name: "Report this problem" })
        .getAttribute("href")
    ).toBe("/app/settings?errorReference=CT-S-digest_123");

    await waitFor(() =>
      expect(mocks.registerUnexpectedErrorReference).toHaveBeenCalledWith({
        referenceId: "CT-S-digest_123",
        boundary: "app",
      })
    );
    expect(mocks.captureException).not.toHaveBeenCalled();
  });

  it("prevents duplicate retry clicks while recovery is in progress", () => {
    const retry = vi.fn();
    render(
      <UnexpectedErrorFallback
        error={Object.assign(new Error("failed"), { digest: "digest_123" })}
        unstable_retry={retry}
        boundary="app"
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Retry" }));
    const pendingButton = screen.getByRole("button", { name: "Retrying…" });
    fireEvent.click(pendingButton);

    expect((pendingButton as HTMLButtonElement).disabled).toBe(true);
    expect(retry).toHaveBeenCalledTimes(1);
  });

  it("keeps a generated client reference visible when registration fails", async () => {
    vi.spyOn(globalThis.crypto, "randomUUID").mockReturnValue(
      "123e4567-e89b-12d3-a456-426614174000"
    );
    mocks.registerUnexpectedErrorReference.mockRejectedValue(
      new Error("registration unavailable")
    );

    render(
      <UnexpectedErrorFallback
        error={new Error("SENTINEL_CLIENT_ERROR")}
        unstable_retry={vi.fn()}
        boundary="global"
      />
    );

    expect(
      screen.getByText("CT-C-123e4567-e89b-12d3-a456-426614174000")
    ).toBeTruthy();
    await waitFor(() =>
      expect(mocks.registerUnexpectedErrorReference).toHaveBeenCalledTimes(1)
    );
    expect(mocks.captureException).toHaveBeenCalledWith(
      expect.objectContaining({ message: "SENTINEL_CLIENT_ERROR" }),
      {
        tags: {
          "classtrace.boundary": "global",
          "classtrace.error_reference":
            "CT-C-123e4567-e89b-12d3-a456-426614174000",
        },
      }
    );
    expect(screen.queryByRole("alert")).toBeNull();
  });
});

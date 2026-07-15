import { afterEach, describe, expect, it, vi } from "vitest";
import { registerUnexpectedErrorReference } from "@/actions/error-reporting";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("registerUnexpectedErrorReference", () => {
  it.each([
    ["app", "CT-S-digest_123"],
    ["global", "CT-C-123e4567-e89b-12d3-a456-426614174000"],
  ])("logs one safe %s boundary reference", async (boundary, referenceId) => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

    await expect(
      registerUnexpectedErrorReference({ boundary, referenceId })
    ).resolves.toEqual({ success: true });

    expect(consoleError).toHaveBeenCalledWith(
      "[actions/error-reporting/registerUnexpectedErrorReference] unexpected",
      { boundary, referenceId }
    );
    expect(consoleError).toHaveBeenCalledTimes(1);
  });

  it.each([
    { boundary: "settings", referenceId: "CT-S-digest_123" },
    { boundary: "app", referenceId: "not-a-reference" },
    { boundary: "global", referenceId: `CT-S-${"x".repeat(65)}` },
  ])("rejects malformed input without logging", async (input) => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

    await expect(registerUnexpectedErrorReference(input)).resolves.toEqual({
      success: false,
    });
    expect(consoleError).not.toHaveBeenCalled();
  });
});

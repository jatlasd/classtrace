import { afterEach, describe, expect, it, vi } from "vitest";

const sentry = vi.hoisted(() => ({
  captureException: vi.fn(),
  setTag: vi.fn(),
  withScope: vi.fn(
    (callback: (scope: { setTag: typeof sentry.setTag }) => void) =>
      callback({ setTag: sentry.setTag })
  ),
}));

vi.mock("@sentry/nextjs", () => sentry);

import { captureOperationalError } from "@/lib/monitoring/capture-operational-error";

afterEach(() => {
  vi.restoreAllMocks();
  vi.clearAllMocks();
});

describe("captureOperationalError", () => {
  it("captures the exception with a safe operation and a classified log", () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    const error = new TypeError("SENTINEL_STUDENT_NOTE");

    captureOperationalError("evidence.save", error);

    expect(sentry.setTag).toHaveBeenCalledWith(
      "classtrace.operation",
      "evidence.save"
    );
    expect(sentry.captureException).toHaveBeenCalledWith(error);
    expect(consoleError).toHaveBeenCalledWith(
      "[monitoring/capture-operational-error] unexpected",
      {
        operation: "evidence.save",
        errorName: "TypeError",
      }
    );
    expect(JSON.stringify(consoleError.mock.calls)).not.toContain(
      "SENTINEL_STUDENT_NOTE"
    );
  });

  it("does not pass a non-error value to Sentry or the console", () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

    captureOperationalError("roster.import", {
      note: "SENTINEL_STUDENT_NOTE",
    });

    expect(sentry.captureException).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Error",
        message: "Non-Error thrown",
      })
    );
    expect(consoleError).toHaveBeenCalledWith(
      "[monitoring/capture-operational-error] unexpected",
      {
        operation: "roster.import",
        errorName: "UnknownError",
      }
    );
    expect(JSON.stringify(consoleError.mock.calls)).not.toContain(
      "SENTINEL_STUDENT_NOTE"
    );
  });

  it("classifies a custom error name without logging it", () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    const error = new Error("Unexpected failure");
    error.name = "SENTINEL_STUDENT_NOTE";

    captureOperationalError("evidence.save", error);

    expect(sentry.captureException).toHaveBeenCalledWith(error);
    expect(consoleError).toHaveBeenCalledWith(
      "[monitoring/capture-operational-error] unexpected",
      {
        operation: "evidence.save",
        errorName: "UnknownError",
      }
    );
    expect(JSON.stringify(consoleError.mock.calls)).not.toContain(
      "SENTINEL_STUDENT_NOTE"
    );
  });
});

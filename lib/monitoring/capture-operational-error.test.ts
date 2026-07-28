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
    expect(sentry.setTag).toHaveBeenCalledWith(
      "classtrace.operation_stage",
      "operation.execute"
    );
    expect(sentry.captureException).toHaveBeenCalledWith(error);
    expect(consoleError).toHaveBeenCalledWith(
      "[monitoring/capture-operational-error] unexpected",
      {
        operation: "evidence.save",
        operationStage: "operation.execute",
        errorName: "TypeError",
        errorSource: "javascript",
        errorType: "TypeError",
        failureKind: "application.value-type-invalid",
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
        operationStage: "operation.execute",
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
        operationStage: "operation.execute",
        errorName: "UnknownError",
      }
    );
    expect(JSON.stringify(consoleError.mock.calls)).not.toContain(
      "SENTINEL_STUDENT_NOTE"
    );
  });

  it("logs only safe structured Prisma diagnostics", () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    const error = Object.assign(new Error("SENTINEL_STUDENT_NOTE"), {
      name: "PrismaClientKnownRequestError",
      code: "P2021",
      clientVersion: "7.8.0",
      meta: {
        table: "public.BetaAgreementAcceptance",
        value: "SENTINEL_DATABASE_VALUE",
      },
    });

    captureOperationalError("evidence.save", error);

    expect(consoleError).toHaveBeenCalledWith(
      "[monitoring/capture-operational-error] unexpected",
      {
        operation: "evidence.save",
        operationStage: "operation.execute",
        errorName: "UnknownError",
        errorSource: "prisma",
        errorType: "PrismaClientKnownRequestError",
        errorCode: "P2021",
        failureKind: "database.table-missing",
        databaseObject: "BetaAgreementAcceptance",
      }
    );
    expect(JSON.stringify(consoleError.mock.calls)).not.toContain("SENTINEL");
  });

  it("does not let a throwing error-name getter interrupt failure handling", () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    const error = new Error("SENTINEL_STUDENT_NOTE");
    Object.defineProperty(error, "name", {
      get() {
        throw new Error("SENTINEL_NAME_GETTER");
      },
    });

    expect(() => captureOperationalError("evidence.save", error)).not.toThrow();
    expect(sentry.captureException.mock.calls[0]?.[0]).toBe(error);
    expect(consoleError).toHaveBeenCalledWith(
      "[monitoring/capture-operational-error] unexpected",
      {
        operation: "evidence.save",
        operationStage: "operation.execute",
        errorName: "UnknownError",
      }
    );
    expect(JSON.stringify(consoleError.mock.calls)).not.toContain("SENTINEL");
  });
});

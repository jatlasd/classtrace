import { describe, expect, it } from "vitest";
import {
  formatSafeErrorMessage,
  getSafeErrorDiagnostic,
  getSafeOperationStage,
  markSafeOperationStage,
} from "@/lib/monitoring/safe-error-diagnostic";

describe("safe error diagnostics", () => {
  it("finds a PostgreSQL failure in a bounded error cause chain", () => {
    class DatabaseError extends Error {
      readonly name = "error";
      readonly code = "42P01";
      readonly table = "public.BetaAgreementAcceptance";
      readonly detail = "SENTINEL_STUDENT_NOTE";
    }

    const databaseError = new DatabaseError("SENTINEL_DATABASE_VALUE");
    const wrappedError = new Error("SENTINEL_WRAPPER", {
      cause: databaseError,
    });

    const diagnostic = getSafeErrorDiagnostic(wrappedError);

    expect(diagnostic).toEqual({
      source: "postgresql",
      errorType: "DatabaseError",
      code: "42P01",
      failureKind: "database.table-missing",
      summary: "Database setup is missing a required table",
      databaseObject: "BetaAgreementAcceptance",
    });
    expect(
      formatSafeErrorMessage(diagnostic, "evidence.save")
    ).toBe(
      "Database setup is missing a required table: BetaAgreementAcceptance (PostgreSQL 42P01) while running evidence.save"
    );
    expect(JSON.stringify(diagnostic)).not.toContain("SENTINEL");
  });

  it("omits schema names outside the static ClassTrace allowlist", () => {
    const error = Object.assign(new Error("SENTINEL_STUDENT_NOTE"), {
      name: "PrismaClientKnownRequestError",
      code: "P2021",
      meta: {
        table: "public.SENTINEL_PRIVATE_TABLE",
      },
    });

    const diagnostic = getSafeErrorDiagnostic(error);

    expect(diagnostic).toMatchObject({
      source: "prisma",
      code: "P2021",
      failureKind: "database.table-missing",
    });
    expect(diagnostic?.databaseObject).toBeUndefined();
    expect(JSON.stringify(diagnostic)).not.toContain("SENTINEL");
  });

  it("falls back to the existing opaque message for non-error values", () => {
    expect(
      getSafeErrorDiagnostic({ note: "SENTINEL_STUDENT_NOTE" })
    ).toBeUndefined();
    expect(formatSafeErrorMessage(undefined, "roster.import")).toBe(
      "ClassTrace operation failed: roster.import"
    );
    expect(formatSafeErrorMessage(undefined, undefined)).toBe(
      "Unexpected application error"
    );
  });

  it("stores only a non-enumerable allowlisted operation stage", () => {
    const error = new Error("SENTINEL_STUDENT_NOTE");

    markSafeOperationStage(error, "workspace.resolve");

    expect(getSafeOperationStage(error)).toBe("workspace.resolve");
    expect(JSON.stringify(error)).not.toContain("workspace.resolve");
    expect(
      formatSafeErrorMessage(
        getSafeErrorDiagnostic(error),
        "evidence.save",
        getSafeOperationStage(error)
      )
    ).toBe(
      "An unexpected application operation failed (JavaScript Error) while resolving the current workspace for evidence.save"
    );
  });

  it("fails closed when thrown values have hostile accessors or proxy traps", () => {
    const hostileError = Object.create(Error.prototype);
    Object.defineProperties(hostileError, {
      name: {
        get() {
          throw new Error("SENTINEL_NAME_GETTER");
        },
      },
      constructor: {
        get() {
          throw new Error("SENTINEL_CONSTRUCTOR_GETTER");
        },
      },
      cause: {
        get() {
          throw new Error("SENTINEL_CAUSE_GETTER");
        },
      },
      meta: {
        get() {
          throw new Error("SENTINEL_META_GETTER");
        },
      },
    });
    const hostileProxy = new Proxy(
      {},
      {
        defineProperty() {
          throw new Error("SENTINEL_DEFINE_PROPERTY_TRAP");
        },
        get() {
          throw new Error("SENTINEL_GET_TRAP");
        },
        getPrototypeOf() {
          throw new Error("SENTINEL_PROTOTYPE_TRAP");
        },
      }
    );

    expect(() => getSafeErrorDiagnostic(hostileError)).not.toThrow();
    expect(getSafeErrorDiagnostic(hostileError)).toBeUndefined();
    expect(() =>
      markSafeOperationStage(hostileProxy, "workspace.resolve")
    ).not.toThrow();
    expect(getSafeOperationStage(hostileProxy)).toBeUndefined();
    expect(getSafeErrorDiagnostic(hostileProxy)).toBeUndefined();
  });
});

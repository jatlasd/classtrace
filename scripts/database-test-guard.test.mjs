import { describe, expect, it } from "vitest";
import { assertDisposableTestDatabase } from "./database-test-guard.mjs";

describe("database integration reset guard", () => {
  it("accepts a clearly named disposable test database", () => {
    expect(() =>
      assertDisposableTestDatabase({
        testDatabaseUrl:
          "postgresql://user:secret@localhost:5432/classtrace_test?schema=public",
        applicationDatabaseUrl:
          "postgresql://user:secret@localhost:5432/classtrace?sslmode=require",
      })
    ).not.toThrow();
  });

  it("rejects equivalent URLs despite query, credential, and default-port differences", () => {
    expect(() =>
      assertDisposableTestDatabase({
        testDatabaseUrl:
          "postgres://other:password@LOCALHOST/classtrace_test?schema=one",
        applicationDatabaseUrl:
          "postgresql://user:secret@localhost:5432/classtrace_test?schema=two",
      })
    ).toThrow(/different database/);
  });

  it("rejects invalid protocols and database names without a test marker", () => {
    expect(() =>
      assertDisposableTestDatabase({
        testDatabaseUrl: "https://localhost/classtrace_test",
      })
    ).toThrow(/PostgreSQL URL|postgres/);

    expect(() =>
      assertDisposableTestDatabase({
        testDatabaseUrl: "postgresql://localhost/classtrace",
      })
    ).toThrow(/test.*segment/i);
  });
});

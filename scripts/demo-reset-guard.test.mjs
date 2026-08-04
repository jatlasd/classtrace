import { describe, expect, it } from "vitest";
import { DEMO_CLERK_USER_ID } from "./demo-data.mjs";
import { buildDemoResetConfig } from "./demo-reset-guard.mjs";

const validEnvironment = {
  DEMO_DATABASE_URL:
    "postgresql://demo:secret@ep-demo.us-east-1.aws.neon.tech/neondb?sslmode=require",
  DEMO_CLERK_USER_ID,
  DEMO_RESET_ALLOWED: "1",
};

describe("demo reset guard", () => {
  it("requires all independent confirmations for the canonical account", () => {
    expect(
      buildDemoResetConfig({
        env: validEnvironment,
        argv: ["--confirm", DEMO_CLERK_USER_ID],
      })
    ).toEqual({
      databaseUrl: validEnvironment.DEMO_DATABASE_URL,
      clerkUserId: DEMO_CLERK_USER_ID,
    });
  });

  it("rejects a disabled reset or mismatched account identity", () => {
    expect(() =>
      buildDemoResetConfig({
        env: { ...validEnvironment, DEMO_RESET_ALLOWED: "0" },
        argv: ["--confirm", DEMO_CLERK_USER_ID],
      })
    ).toThrow(/DEMO_RESET_ALLOWED/);

    expect(() =>
      buildDemoResetConfig({
        env: { ...validEnvironment, DEMO_CLERK_USER_ID: "user_other" },
        argv: ["--confirm", DEMO_CLERK_USER_ID],
      })
    ).toThrow(/canonical demo account/);

    expect(() =>
      buildDemoResetConfig({
        env: validEnvironment,
        argv: ["--confirm", "user_other"],
      })
    ).toThrow(/confirmation/);
  });

  it("rejects a non-Neon or non-production database name", () => {
    expect(() =>
      buildDemoResetConfig({
        env: {
          ...validEnvironment,
          DEMO_DATABASE_URL: "postgresql://demo:secret@localhost/neondb",
        },
        argv: ["--confirm", DEMO_CLERK_USER_ID],
      })
    ).toThrow(/canonical Neon/);

    expect(() =>
      buildDemoResetConfig({
        env: {
          ...validEnvironment,
          DEMO_DATABASE_URL:
            "postgresql://demo:secret@ep-demo.us-east-1.aws.neon.tech/classtrace_dev",
        },
        argv: ["--confirm", DEMO_CLERK_USER_ID],
      })
    ).toThrow(/neondb/);
  });
});


import { describe, expect, it } from "vitest";
import { buildLocalDemoResetConfig } from "./local-demo-reset-guard.mjs";

const validEnvironment = {
  DATABASE_URL:
    "postgresql://dev:secret@ep-development.us-east-1.aws.neon.tech/classtrace_dev?sslmode=require",
  CLERK_SECRET_KEY: "sk_test_development",
  NODE_ENV: "development",
};

describe("local demo reset guard", () => {
  it("requires one exactly confirmed development Clerk target", () => {
    expect(
      buildLocalDemoResetConfig({
        env: validEnvironment,
        argv: ["--email", "JATLASDEV2@gmail.com", "--confirm"],
      })
    ).toEqual({
      databaseUrl: validEnvironment.DATABASE_URL,
      target: { kind: "email", value: "jatlasdev2@gmail.com" },
    });

    expect(
      buildLocalDemoResetConfig({
        env: validEnvironment,
        argv: ["--clerk-user-id", "user_development", "--confirm"],
      }).target
    ).toEqual({ kind: "clerkUserId", value: "user_development" });
  });

  it("rejects missing confirmation, ambiguous targets, or invalid targets", () => {
    expect(() =>
      buildLocalDemoResetConfig({
        env: validEnvironment,
        argv: ["--email", "jatlasdev2@gmail.com"],
      })
    ).toThrow(/--confirm/);

    expect(() =>
      buildLocalDemoResetConfig({
        env: validEnvironment,
        argv: [
          "--email",
          "jatlasdev2@gmail.com",
          "--clerk-user-id",
          "user_development",
          "--confirm",
        ],
      })
    ).toThrow(/one development Clerk target/);

    expect(() =>
      buildLocalDemoResetConfig({
        env: validEnvironment,
        argv: ["--email", "not-an-email", "--confirm"],
      })
    ).toThrow(/valid development/);
  });

  it("strictly rejects production-shaped databases, runtimes, and Clerk keys", () => {
    const targetArgs = [
      "--email",
      "jatlasdev2@gmail.com",
      "--confirm",
    ];

    for (const env of [
      {
        ...validEnvironment,
        DATABASE_URL:
          "postgresql://prod:secret@ep-production.us-east-1.aws.neon.tech/neondb?sslmode=require",
      },
      { ...validEnvironment, NODE_ENV: "production" },
      { ...validEnvironment, VERCEL_ENV: "development" },
      { ...validEnvironment, CLERK_SECRET_KEY: "sk_live_production" },
    ]) {
      expect(() =>
        buildLocalDemoResetConfig({ env, argv: targetArgs })
      ).toThrow();
    }
  });
});

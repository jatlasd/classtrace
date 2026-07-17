import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@clerk/nextjs/server", () => ({ auth: vi.fn() }));

import {
  OperatorAuthorizationError,
  parseOperatorUserIds,
  requireOperator,
} from "@/lib/operator/operator-auth";

describe("operator authorization", () => {
  it("parses a server-side allowlist without empty entries", () => {
    expect([...parseOperatorUserIds(" owner_1,owner_2, ,owner_1 ")]).toEqual([
      "owner_1",
      "owner_2",
    ]);
  });

  it("rejects unauthenticated requests", async () => {
    await expect(
      requireOperator({
        getAuth: vi.fn().mockResolvedValue({ userId: null }),
        configuredUserIds: new Set(["owner_1"]),
      })
    ).rejects.toMatchObject({
      code: "AUTH_REQUIRED",
    } satisfies Partial<OperatorAuthorizationError>);
  });

  it("rejects a signed-in teacher who is not configured as an operator", async () => {
    await expect(
      requireOperator({
        getAuth: vi.fn().mockResolvedValue({ userId: "teacher_1" }),
        configuredUserIds: new Set(["owner_1"]),
      })
    ).rejects.toMatchObject({
      code: "NOT_AUTHORIZED",
    } satisfies Partial<OperatorAuthorizationError>);
  });

  it("returns the trusted Clerk ID for a configured operator", async () => {
    await expect(
      requireOperator({
        getAuth: vi.fn().mockResolvedValue({ userId: "owner_1" }),
        configuredUserIds: new Set(["owner_1"]),
      })
    ).resolves.toEqual({ clerkUserId: "owner_1" });
  });
});

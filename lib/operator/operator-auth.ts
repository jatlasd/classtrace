import "server-only";

import { auth } from "@clerk/nextjs/server";

const OPERATOR_USER_IDS_ENV = "CLASSTRACE_OPERATOR_CLERK_USER_IDS";

export class OperatorAuthorizationError extends Error {
  constructor(public readonly code: "AUTH_REQUIRED" | "NOT_AUTHORIZED") {
    super(
      code === "AUTH_REQUIRED"
        ? "Authentication is required."
        : "Operator access is not available."
    );
    this.name = "OperatorAuthorizationError";
  }
}

export type OperatorSession = {
  clerkUserId: string;
};

export function parseOperatorUserIds(value: string | undefined): Set<string> {
  return new Set(
    (value ?? "")
      .split(",")
      .map((candidate) => candidate.trim())
      .filter(Boolean)
  );
}

export async function requireOperator(
  dependencies: {
    getAuth: typeof auth;
    configuredUserIds: Set<string>;
  } = {
    getAuth: auth,
    configuredUserIds: parseOperatorUserIds(
      process.env[OPERATOR_USER_IDS_ENV]
    ),
  }
): Promise<OperatorSession> {
  const { userId } = await dependencies.getAuth();

  if (!userId) {
    throw new OperatorAuthorizationError("AUTH_REQUIRED");
  }

  if (!dependencies.configuredUserIds.has(userId)) {
    throw new OperatorAuthorizationError("NOT_AUTHORIZED");
  }

  return { clerkUserId: userId };
}

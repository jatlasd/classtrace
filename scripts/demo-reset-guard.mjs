import { DEMO_CLERK_USER_ID } from "./demo-data.mjs";

const POSTGRES_PROTOCOLS = new Set(["postgres:", "postgresql:"]);

export class DemoResetConfigError extends Error {}

function readConfirmation(argv) {
  const confirmationIndex = argv.indexOf("--confirm");
  if (confirmationIndex === -1 || !argv[confirmationIndex + 1]) {
    throw new DemoResetConfigError(
      "Pass --confirm followed by the canonical demo Clerk user ID."
    );
  }
  if (argv.length !== confirmationIndex + 2) {
    throw new DemoResetConfigError(
      "The demo reset command accepts only one confirmation value."
    );
  }
  return argv[confirmationIndex + 1];
}

function assertDemoDatabaseUrl(value) {
  if (!value) {
    throw new DemoResetConfigError("DEMO_DATABASE_URL is required.");
  }

  let url;
  try {
    url = new URL(value);
  } catch {
    throw new DemoResetConfigError(
      "DEMO_DATABASE_URL must be a valid PostgreSQL URL."
    );
  }

  if (!POSTGRES_PROTOCOLS.has(url.protocol)) {
    throw new DemoResetConfigError(
      "DEMO_DATABASE_URL must use the PostgreSQL protocol."
    );
  }

  const hostname = url.hostname.toLowerCase();
  const databaseName = decodeURIComponent(url.pathname.replace(/^\/+/, ""));
  if (!hostname.endsWith(".neon.tech") || databaseName !== "neondb") {
    throw new DemoResetConfigError(
      "DEMO_DATABASE_URL must target the canonical Neon neondb database."
    );
  }

  return value;
}

export function buildDemoResetConfig({ env = process.env, argv = [] } = {}) {
  if (env.DEMO_RESET_ALLOWED !== "1") {
    throw new DemoResetConfigError(
      "Set DEMO_RESET_ALLOWED=1 to enable the guarded demo reset."
    );
  }
  if (env.DEMO_CLERK_USER_ID !== DEMO_CLERK_USER_ID) {
    throw new DemoResetConfigError(
      "DEMO_CLERK_USER_ID does not match the canonical demo account."
    );
  }

  const confirmation = readConfirmation(argv);
  if (confirmation !== DEMO_CLERK_USER_ID) {
    throw new DemoResetConfigError(
      "The demo reset confirmation does not match the canonical account."
    );
  }

  return {
    databaseUrl: assertDemoDatabaseUrl(env.DEMO_DATABASE_URL),
    clerkUserId: DEMO_CLERK_USER_ID,
  };
}

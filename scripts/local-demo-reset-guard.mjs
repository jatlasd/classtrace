const POSTGRES_PROTOCOLS = new Set(["postgres:", "postgresql:"]);
const DEVELOPMENT_DATABASE_NAME = "classtrace_dev";

export class LocalDemoResetConfigError extends Error {}

function normalizeEmail(value) {
  if (typeof value !== "string") return "";
  const email = value.trim().toLowerCase();
  const atIndex = email.indexOf("@");
  return email.length <= 320 &&
    atIndex > 0 &&
    atIndex === email.lastIndexOf("@") &&
    atIndex < email.length - 1 &&
    !/\s/.test(email)
    ? email
    : "";
}

function normalizeClerkUserId(value) {
  if (typeof value !== "string") return "";
  const userId = value.trim();
  return /^user_[A-Za-z0-9_-]{1,120}$/.test(userId) ? userId : "";
}

function readTarget(argv) {
  const [targetFlag, rawTarget, confirmationFlag] = argv;
  if (
    argv.length !== 3 ||
    !["--clerk-user-id", "--email"].includes(targetFlag) ||
    confirmationFlag !== "--confirm"
  ) {
    throw new LocalDemoResetConfigError(
      "Pass one development Clerk target followed by --confirm."
    );
  }

  const isUserId = targetFlag === "--clerk-user-id";
  const kind = isUserId ? "clerkUserId" : "email";
  const normalize = isUserId ? normalizeClerkUserId : normalizeEmail;
  const value = normalize(rawTarget);
  if (!value) {
    throw new LocalDemoResetConfigError(
      "Provide a valid development Clerk user ID or email."
    );
  }

  return { kind, value };
}

function assertDevelopmentDatabaseUrl(value) {
  if (!value) {
    throw new LocalDemoResetConfigError(
      "DATABASE_URL must be configured in .env.local."
    );
  }

  let url;
  try {
    url = new URL(value);
  } catch {
    throw new LocalDemoResetConfigError(
      "DATABASE_URL must be a valid PostgreSQL URL."
    );
  }

  const databaseName = decodeURIComponent(url.pathname.replace(/^\/+/, ""));
  if (
    !POSTGRES_PROTOCOLS.has(url.protocol) ||
    !url.hostname.toLowerCase().endsWith(".neon.tech") ||
    databaseName.toLowerCase() !== DEVELOPMENT_DATABASE_NAME
  ) {
    throw new LocalDemoResetConfigError(
      "Local demo reset permits only the configured Neon classtrace_dev database and refuses production targets."
    );
  }

  return value;
}

export function buildLocalDemoResetConfig({ env = process.env, argv = [] } = {}) {
  if (env.NODE_ENV === "production" || env.VERCEL_ENV) {
    throw new LocalDemoResetConfigError(
      "Local demo reset cannot run in a production or Vercel environment."
    );
  }
  if (
    typeof env.CLERK_SECRET_KEY !== "string" ||
    !env.CLERK_SECRET_KEY.startsWith("sk_test_")
  ) {
    throw new LocalDemoResetConfigError(
      "Local demo reset requires the configured Clerk development secret key."
    );
  }

  return {
    databaseUrl: assertDevelopmentDatabaseUrl(env.DATABASE_URL),
    target: readTarget(argv),
  };
}

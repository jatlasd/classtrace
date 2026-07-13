const POSTGRES_PROTOCOLS = new Set(["postgres:", "postgresql:"]);
const TEST_DATABASE_NAME_PATTERN = /(^|[_-])test([_-]|$)/i;

function parseDatabaseIdentity(value, label) {
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`${label} must be a valid PostgreSQL URL.`);
  }

  if (!POSTGRES_PROTOCOLS.has(url.protocol)) {
    throw new Error(`${label} must use the postgres or postgresql protocol.`);
  }

  const databaseName = decodeURIComponent(url.pathname.replace(/^\/+/, ""));
  if (!url.hostname || !databaseName) {
    throw new Error(`${label} must include a host and database name.`);
  }

  return {
    hostname: url.hostname.toLowerCase(),
    port: url.port || "5432",
    databaseName: databaseName.toLowerCase(),
  };
}

export function assertDisposableTestDatabase({
  testDatabaseUrl,
  applicationDatabaseUrl,
}) {
  const testIdentity = parseDatabaseIdentity(
    testDatabaseUrl,
    "TEST_DATABASE_URL"
  );

  if (!TEST_DATABASE_NAME_PATTERN.test(testIdentity.databaseName)) {
    throw new Error(
      "TEST_DATABASE_URL database name must contain a separate 'test' segment."
    );
  }

  if (!applicationDatabaseUrl) {
    return;
  }

  const applicationIdentity = parseDatabaseIdentity(
    applicationDatabaseUrl,
    "DATABASE_URL"
  );

  const sameDatabase =
    testIdentity.hostname === applicationIdentity.hostname &&
    testIdentity.port === applicationIdentity.port &&
    testIdentity.databaseName === applicationIdentity.databaseName;

  if (
    sameDatabase ||
    testIdentity.databaseName === applicationIdentity.databaseName
  ) {
    throw new Error(
      "TEST_DATABASE_URL must identify a different database than DATABASE_URL."
    );
  }
}

import { spawnSync } from "node:child_process";
import { config } from "dotenv";
import { assertDisposableTestDatabase } from "./database-test-guard.mjs";

config({ path: ".env.local", quiet: true });
config({ path: ".env", quiet: true });

const testDatabaseUrl = process.env.TEST_DATABASE_URL;
const applicationDatabaseUrl = process.env.DATABASE_URL;

if (!testDatabaseUrl) {
  throw new Error("TEST_DATABASE_URL is required for npm run test:db.");
}

assertDisposableTestDatabase({ testDatabaseUrl, applicationDatabaseUrl });

if (process.env.TEST_DATABASE_RESET_ALLOWED !== "1") {
  throw new Error(
    "Set TEST_DATABASE_RESET_ALLOWED=1 only for a disposable database that may be reset."
  );
}

const environment = {
  ...process.env,
  DATABASE_URL: testDatabaseUrl,
};

function run(args) {
  const result = spawnSync(process.execPath, args, {
    cwd: process.cwd(),
    env: environment,
    stdio: "inherit",
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

run(["node_modules/prisma/build/index.js", "migrate", "reset", "--force"]);
run([
  "node_modules/vitest/vitest.mjs",
  "run",
  "--config",
  "vitest.database.config.ts",
]);

import { pathToFileURL } from "node:url";
import { createClerkClient } from "@clerk/backend";
import { PrismaPg } from "@prisma/adapter-pg";
import { config as loadEnv } from "dotenv";
import { PrismaClient } from "../lib/generated/prisma/client.ts";
import { DemoResetError } from "../lib/demo/demo-workspace-reset.ts";
import {
  LocalDemoResetError,
  resetLocalDemoWorkspace,
} from "../lib/demo/local-demo-workspace-reset.ts";
import {
  buildLocalDemoResetConfig,
  LocalDemoResetConfigError,
} from "./local-demo-reset-guard.mjs";

async function main() {
  loadEnv({ path: ".env.local", quiet: true });

  let database;
  let summary;
  let failureMessage = "";

  try {
    const resetConfig = buildLocalDemoResetConfig({
      env: process.env,
      argv: process.argv.slice(2),
    });
    const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
    const directory = {
      getUser: (userId) => clerk.users.getUser(userId),
      async findUsersByEmail(email) {
        const response = await clerk.users.getUserList({
          emailAddress: [email],
          limit: 10,
        });
        return response.data;
      },
    };

    database = new PrismaClient({
      adapter: new PrismaPg(resetConfig.databaseUrl),
    });
    summary = await resetLocalDemoWorkspace({
      database,
      target: resetConfig.target,
      directory,
    });
  } catch (error) {
    failureMessage =
      error instanceof LocalDemoResetConfigError ||
      error instanceof LocalDemoResetError ||
      error instanceof DemoResetError
        ? error.message
        : "The guarded local demo reset could not connect or complete.";
  } finally {
    try {
      await database?.$disconnect();
    } catch {
      failureMessage ||=
        "The development database connection did not close cleanly.";
    }
  }

  if (failureMessage || !summary) {
    console.error(
      `Local demo reset failed: ${failureMessage || "The guarded local demo reset failed."}`
    );
    process.exitCode = 1;
    return;
  }

  console.log(`Demo dataset: ${summary.version}`);
  console.log("Local development workspace reset complete.");
  console.log(
    `Counts: ${summary.classCount} classes, ${summary.studentCount} students, ${summary.evidenceCount} evidence records, ${summary.photoCount} evidence photos.`
  );
  console.log(
    `Evidence dates: ${summary.earliestEvidenceDate.slice(0, 10)} through ${summary.latestEvidenceDate.slice(0, 10)}.`
  );
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}

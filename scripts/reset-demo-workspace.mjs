import { pathToFileURL } from "node:url";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/generated/prisma/client.ts";
import {
  DemoResetError,
  resetDemoWorkspace,
} from "../lib/demo/demo-workspace-reset.ts";
import {
  buildDemoResetConfig,
  DemoResetConfigError,
} from "./demo-reset-guard.mjs";

async function main() {
  let database;
  let summary;
  let failureMessage = "";

  try {
    const config = buildDemoResetConfig({
      env: process.env,
      argv: process.argv.slice(2),
    });
    database = new PrismaClient({
      adapter: new PrismaPg(config.databaseUrl),
    });
    summary = await resetDemoWorkspace({
      database,
      clerkUserId: config.clerkUserId,
    });
  } catch (error) {
    failureMessage =
      error instanceof DemoResetConfigError || error instanceof DemoResetError
        ? error.message
        : "The guarded demo reset could not connect or complete.";
  } finally {
    try {
      await database?.$disconnect();
    } catch {
      failureMessage ||= "The demo database connection did not close cleanly.";
    }
  }

  if (failureMessage || !summary) {
    console.error(
      `Demo reset failed: ${failureMessage || "The guarded demo reset failed."}`
    );
    process.exitCode = 1;
    return;
  }

  console.log(`Demo dataset: ${summary.version}`);
  console.log("Canonical demo workspace reset complete.");
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

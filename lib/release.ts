import "server-only";

import packageJson from "@/package.json";

export function getReleaseIdentifier(): string {
  return (
    process.env.VERCEL_GIT_COMMIT_SHA?.trim() ||
    packageJson.version ||
    "unknown"
  );
}

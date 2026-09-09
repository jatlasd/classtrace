import path from "node:path";

export const authenticatedStorageStatePath = path.join(
  process.cwd(),
  "playwright",
  ".auth",
  "classtrace-user.json"
);

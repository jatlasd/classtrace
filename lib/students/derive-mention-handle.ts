export function deriveMentionHandle(displayName: string): string {
  const firstPart = displayName.trim().replace(/^@+/, "").trim().split(/\s+/)[0] ?? "";

  return firstPart
    .replace(/^@+/, "")
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "");
}

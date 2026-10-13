// Topics are free text, so options collapse case variants and keep the first spelling.
export function normalizeTopicOptions(topics: string[], limit: number): string[] {
  const byKey = new Map<string, string>();

  for (const topic of topics) {
    const trimmed = topic.trim();
    const key = trimmed.toLocaleLowerCase("en");
    if (trimmed && !byKey.has(key)) byKey.set(key, trimmed);
  }

  return [...byKey.values()]
    .sort((left, right) =>
      left.localeCompare(right, "en", { sensitivity: "base" })
    )
    .slice(0, limit);
}

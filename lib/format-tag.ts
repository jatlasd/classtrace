export function normalizeTag(tag: string): string {
  return tag.trim().replace(/^#/, "").trim();
}

export function formatTagLabel(tag: string): string {
  const normalized = normalizeTag(tag);
  return normalized ? `#${normalized}` : "";
}

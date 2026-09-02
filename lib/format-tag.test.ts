import { describe, expect, it } from "vitest";
import { formatTagLabel, normalizeTag } from "@/lib/format-tag";

describe("tag formatting", () => {
  it("removes one leading hash after surrounding whitespace", () => {
    expect(normalizeTag("  #reading  ")).toBe("reading");
  });

  it("keeps exact tag text rather than applying substring behavior", () => {
    expect(normalizeTag("#read")).toBe("read");
    expect(normalizeTag("#reading")).toBe("reading");
  });

  it("adds one display hash to normalized tags", () => {
    expect(formatTagLabel(" #independent ")).toBe("#independent");
  });
});

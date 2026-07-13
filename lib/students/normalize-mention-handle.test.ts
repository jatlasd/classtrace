import { describe, expect, it } from "vitest";
import { normalizeMentionHandle } from "@/lib/students/normalize-mention-handle";
import { INPUT_LIMITS } from "@/lib/validation/input-limits";

describe("normalizeMentionHandle", () => {
  it("stores handles without @, whitespace, or uppercase letters", () => {
    const result = normalizeMentionHandle("  @Jeremy  ");

    expect(result).toEqual({ success: true, mentionHandle: "jeremy" });
  });

  it("rejects empty handles", () => {
    const result = normalizeMentionHandle("  @  ");

    expect(result).toEqual({ success: false, error: "Handle is required." });
  });

  it("rejects handles without letters or numbers", () => {
    const result = normalizeMentionHandle("@---");

    expect(result).toEqual({
      success: false,
      error: "Handle must include at least one letter or number.",
    });
  });

  it("accepts only the characters the note parser can mention", () => {
    expect(normalizeMentionHandle("mary-smith_2")).toEqual({
      success: true,
      mentionHandle: "mary-smith_2",
    });
    expect(normalizeMentionHandle("Mary Smith")).toEqual({
      success: false,
      error: "Handle can use letters, numbers, hyphens, and underscores only.",
    });
    expect(normalizeMentionHandle("mary!")).toEqual({
      success: false,
      error: "Handle can use letters, numbers, hyphens, and underscores only.",
    });
  });

  it("rejects oversized handles", () => {
    expect(
      normalizeMentionHandle("a".repeat(INPUT_LIMITS.mentionHandle + 1))
    ).toEqual({
      success: false,
      error: `Handle must be ${INPUT_LIMITS.mentionHandle} characters or fewer.`,
    });
  });
});

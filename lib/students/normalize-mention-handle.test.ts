import { describe, expect, it } from "vitest";
import { normalizeMentionHandle } from "@/lib/students/normalize-mention-handle";

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
});

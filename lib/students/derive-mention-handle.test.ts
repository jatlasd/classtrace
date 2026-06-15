import { describe, expect, it } from "vitest";
import { deriveMentionHandle } from "@/lib/students/derive-mention-handle";

describe("deriveMentionHandle", () => {
  it("derives a lowercase handle from a one-part display name", () => {
    expect(deriveMentionHandle("Jeremy")).toBe("jeremy");
  });

  it("uses the first meaningful name part", () => {
    expect(deriveMentionHandle("Stacy Lee")).toBe("stacy");
  });

  it("strips a leading at sign", () => {
    expect(deriveMentionHandle("@Mary")).toBe("mary");
  });

  it("returns an empty suggestion for empty input", () => {
    expect(deriveMentionHandle("   ")).toBe("");
  });
});

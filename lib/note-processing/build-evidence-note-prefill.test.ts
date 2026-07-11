import { describe, expect, it } from "vitest";

import { buildEvidenceNotePrefill } from "./build-evidence-note-prefill";
import { parseRawNote } from "./parse-raw-note";

describe("buildEvidenceNotePrefill", () => {
  it("keeps an inline tag as natural wording without removing tag metadata", () => {
    const rawNote = "@jeremy worked on #reading";

    expect(buildEvidenceNotePrefill(rawNote)).toBe("worked on reading");
    expect(parseRawNote(rawNote).tags).toEqual(["reading"]);
  });

  it("preserves trailing hashtags when de-marking them would create a tag pile", () => {
    const rawNote =
      "@Mary used a new reading strategy. #reading #strategy";

    expect(buildEvidenceNotePrefill(rawNote)).toBe(
      "used a new reading strategy. #reading #strategy"
    );
    expect(parseRawNote(rawNote).tags).toEqual(["reading", "strategy"]);
  });

  it("preserves a hashtag in an uncertain grammatical position", () => {
    expect(buildEvidenceNotePrefill("@Stacy practiced #fluency")).toBe(
      "practiced #fluency"
    );
  });

  it("removes repeated mentions without inventing replacement wording", () => {
    expect(
      buildEvidenceNotePrefill(
        "@Mary checked her answer, @Mary explained the strategy. #math"
      )
    ).toBe("checked her answer, explained the strategy. #math");
  });

  it("cleans mention punctuation at the start of the note", () => {
    expect(
      buildEvidenceNotePrefill(
        "@stacy_reader, paused; then re-read the sentence. #reading-fluency"
      )
    ).toBe("paused; then re-read the sentence. #reading-fluency");
  });
});

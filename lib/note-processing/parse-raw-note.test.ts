import { describe, expect, it } from "vitest";

import { parseRawNote } from "./parse-raw-note";

describe("parseRawNote", () => {
  it("extracts mentions and tags while preserving the original raw note", () => {
    const rawNote =
      "@Jeremy used a reading strategy after one prompt. #reading #Prompt";

    expect(parseRawNote(rawNote)).toEqual({
      rawNote,
      mentions: ["Jeremy"],
      tags: ["reading", "Prompt"],
      cleanText: "used a reading strategy after one prompt.",
    });
  });

  it("keeps repeated mentions and tags deterministic for downstream gates", () => {
    const rawNote =
      "@Mary checked her answer, @Mary explained the strategy. #math #math";

    expect(parseRawNote(rawNote)).toEqual({
      rawNote,
      mentions: ["Mary", "Mary"],
      tags: ["math", "math"],
      cleanText: "checked her answer, explained the strategy.",
    });
  });

  it("handles punctuation, hyphenated handles, and extra spacing without inventing fields", () => {
    const rawNote =
      "  @stacy_reader, paused; then re-read the sentence.   #reading-fluency   ";

    expect(parseRawNote(rawNote)).toEqual({
      rawNote,
      mentions: ["stacy_reader"],
      tags: ["reading-fluency"],
      cleanText: ", paused; then re-read the sentence.",
    });
  });
});

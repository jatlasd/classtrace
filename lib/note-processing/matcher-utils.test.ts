import { describe, expect, it } from "vitest";
import { findPhraseHits, normalizeText } from "./matcher-utils";

function hitPhrases(text: string, phrases: string[]): string[] {
  return findPhraseHits(normalizeText(text), [], phrases).map((hit) => hit.phrase);
}

describe("findPhraseHits", () => {
  it("matches phrases at word boundaries", () => {
    expect(hitPhrases("completed the test after a break", ["test", "break"])).toEqual([
      "test",
      "break",
    ]);
  });

  it("prevents substring false positives inside longer words", () => {
    expect(
      hitPhrases("contest forgot breakfast apparent", ["test", "got", "break", "parent"])
    ).toEqual([]);
  });

  it("applies the same boundary rule to tags", () => {
    const hits = findPhraseHits("break breakfast", ["breakfast"], ["break"]);

    expect(hits).toEqual([
      {
        phrase: "break",
        fromTag: false,
        tag: undefined,
      },
    ]);
  });
});

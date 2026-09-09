import { describe, expect, it } from "vitest";
import { matchBehavior } from "./match-behavior";
import { matchPerformance } from "./match-performance";
import { parseRawNote } from "./parse-raw-note";

describe("negated phrase matching", () => {
  it("keeps ordinary positive phrase matches", () => {
    expect(
      matchBehavior(parseRawNote("@Mary was disruptive during class")).map(
        (result) => result.value
      )
    ).toContain("disruption");
    expect(
      matchPerformance(parseRawNote("@Mary is struggling with fractions")).value
    ).toBe("struggling");
  });

  it("suppresses ordinary negated behavior and performance phrases", () => {
    expect(
      matchBehavior(parseRawNote("@Mary was not disruptive during class")).map(
        (result) => result.value
      )
    ).not.toContain("disruption");
    expect(
      matchPerformance(
        parseRawNote("@Mary is no longer struggling with fractions")
      ).value
    ).toBe("unclear");
  });

  it("does not let an earlier negation hide a later positive clause", () => {
    expect(
      matchBehavior(
        parseRawNote(
          "@Mary was not disruptive at first, but became disruptive later"
        )
      ).map((result) => result.value)
    ).toContain("disruption");
  });

  it("does not mistake the ambiguous 'not only' construction for negation", () => {
    expect(
      matchBehavior(
        parseRawNote("@Mary was not only disruptive but also loud")
      ).map((result) => result.value)
    ).toContain("disruption");
  });
});

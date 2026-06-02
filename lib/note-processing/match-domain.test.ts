import { describe, expect, it } from "vitest";
import { parseRawNote } from "./parse-raw-note";
import { matchDomain } from "./match-domain";

describe("matchDomain", () => {
  it("matches math vocabulary", () => {
    const result = matchDomain(
      parseRawNote("@Jeremy struggled with place value regrouping #math")
    );
    expect(result.value).toBe("math");
    expect(result.confidence).not.toBe("low");
  });

  it("matches reading vocabulary", () => {
    const result = matchDomain(
      parseRawNote("@Stacy used context clues during guided reading")
    );
    expect(result.value).toBe("reading");
  });

  it("matches writing vocabulary", () => {
    const result = matchDomain(
      parseRawNote("@Jeff revised his narrative draft and fixed run on sentences")
    );
    expect(result.value).toBe("writing");
  });

  it("matches behavior and social emotional vocabulary", () => {
    const result = matchDomain(
      parseRawNote("@Mary dysregulated after peer conflict, used coping skills")
    );
    expect(result.value).toBe("behavior_social_emotional");
  });

  it("matches executive functioning vocabulary", () => {
    const result = matchDomain(
      parseRawNote("@Jeremy forgot materials and needed help with task initiation")
    );
    expect(result.value).toBe("executive_functioning");
  });

  it("matches communication vocabulary", () => {
    const result = matchDomain(
      parseRawNote("Parent teacher conference scheduled, emailed guardian follow up")
    );
    expect(result.value).toBe("communication");
  });

  it("returns unclear when no domain phrases match", () => {
    const result = matchDomain(parseRawNote("@Jeremy was here today"));
    expect(result.value).toBe("unclear");
  });
});

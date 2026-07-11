import { describe, expect, it } from "vitest";

import { buildCapturePlaceholder } from "./build-capture-placeholder";

describe("buildCapturePlaceholder", () => {
  it("uses a handle from the active roster snapshot", () => {
    expect(
      buildCapturePlaceholder([
        {
          id: "student_1",
          displayName: "Jeremy",
          mentionHandle: "jeremy",
          classGroupName: "Reading",
        },
      ])
    ).toContain("@jeremy");
  });

  it("uses a generic example when no roster handle is available", () => {
    expect(buildCapturePlaceholder([])).toContain("@student");
  });
});

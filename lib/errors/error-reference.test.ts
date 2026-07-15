import { describe, expect, it } from "vitest";
import {
  createClientErrorReference,
  getServerErrorReference,
  isErrorBoundaryName,
  normalizeErrorReference,
} from "@/lib/errors/error-reference";
import { INPUT_LIMITS } from "@/lib/validation/input-limits";

describe("error references", () => {
  it("formats only bounded opaque server digests", () => {
    expect(getServerErrorReference("1234567890")).toBe("CT-S-1234567890");
    expect(getServerErrorReference("digest_A-1")).toBe("CT-S-digest_A-1");
    expect(getServerErrorReference(123)).toBeNull();
    expect(getServerErrorReference("contains spaces")).toBeNull();
    expect(getServerErrorReference("x".repeat(65))).toBeNull();
  });

  it("creates the expected client UUID reference", () => {
    expect(
      createClientErrorReference(
        () => "123e4567-e89b-12d3-a456-426614174000"
      )
    ).toBe("CT-C-123e4567-e89b-12d3-a456-426614174000");

    expect(() => createClientErrorReference(() => "not-a-uuid")).toThrow(
      "A valid error reference could not be generated."
    );
  });

  it("normalizes only complete approved reference formats", () => {
    expect(normalizeErrorReference("CT-S-digest_A-1")).toBe(
      "CT-S-digest_A-1"
    );
    expect(
      normalizeErrorReference("CT-C-123e4567-e89b-12d3-a456-426614174000")
    ).toBe("CT-C-123e4567-e89b-12d3-a456-426614174000");
    expect(normalizeErrorReference(" CT-S-digest ")).toBeNull();
    expect(normalizeErrorReference("CT-C-not-a-uuid")).toBeNull();
    expect(normalizeErrorReference(["CT-S-one", "CT-S-two"])).toBeNull();
    expect(
      normalizeErrorReference("x".repeat(INPUT_LIMITS.errorReference + 1))
    ).toBeNull();
  });

  it("allows only the two planned boundary names", () => {
    expect(isErrorBoundaryName("app")).toBe(true);
    expect(isErrorBoundaryName("global")).toBe(true);
    expect(isErrorBoundaryName("settings")).toBe(false);
  });
});

import { describe, expect, it, vi } from "vitest";
import sharp from "sharp";

vi.mock("server-only", () => ({}));

import { validateAndNormalizeEvidencePhoto } from "./evidence-photo";
import { INPUT_LIMITS } from "@/lib/validation/input-limits";

async function onePixelPng(): Promise<Uint8Array> {
  return sharp({
    create: {
      width: 1,
      height: 1,
      channels: 3,
      background: "white",
    },
  })
    .png()
    .toBuffer();
}

describe("validateAndNormalizeEvidencePhoto", () => {
  it("re-encodes a supported still image as bounded WebP", async () => {
    const result = await validateAndNormalizeEvidencePhoto(await onePixelPng());

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.photo.contentType).toBe("image/webp");
    expect(result.photo.byteSize).toBeGreaterThan(0);
    expect(result.photo.byteSize).toBeLessThanOrEqual(
      INPUT_LIMITS.evidencePhotoStoredBytes
    );
    expect(result.photo.width).toBe(1);
    expect(result.photo.height).toBe(1);
  });

  it("rejects unsupported and oversized payloads safely", async () => {
    await expect(
      validateAndNormalizeEvidencePhoto(new Uint8Array([1, 2, 3]))
    ).resolves.toEqual({
      success: false,
      error: "Choose a supported still image.",
    });
    await expect(
      validateAndNormalizeEvidencePhoto(
        new Uint8Array(INPUT_LIMITS.evidencePhotoStoredBytes + 1)
      )
    ).resolves.toMatchObject({ success: false });
  });
});

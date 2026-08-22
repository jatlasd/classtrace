import "server-only";

import sharp from "sharp";
import { INPUT_LIMITS } from "@/lib/validation/input-limits";

const SUPPORTED_FORMATS = new Set(["jpeg", "png", "webp", "heif", "avif"]);
const WEBP_QUALITY_STEPS = [82, 72, 62, 52, 42];

export type ValidatedEvidencePhoto = {
  imageData: Uint8Array;
  contentType: "image/webp";
  byteSize: number;
  width: number;
  height: number;
};

export type ValidateEvidencePhotoResult =
  | { success: true; photo: ValidatedEvidencePhoto }
  | { success: false; error: string };

export async function validateAndNormalizeEvidencePhoto(
  bytes: Uint8Array
): Promise<ValidateEvidencePhotoResult> {
  if (bytes.byteLength === 0 || bytes.byteLength > INPUT_LIMITS.evidencePhotoStoredBytes) {
    return {
      success: false,
      error: "Choose a photo smaller than 1 MB after processing.",
    };
  }

  try {
    const image = sharp(bytes, {
      animated: false,
      failOn: "error",
      limitInputPixels: 50_000_000,
    });
    const metadata = await image.metadata();

    if (
      !metadata.format ||
      !SUPPORTED_FORMATS.has(metadata.format) ||
      !metadata.width ||
      !metadata.height ||
      (metadata.pages ?? 1) !== 1
    ) {
      return { success: false, error: "Choose a supported still image." };
    }

    for (const quality of WEBP_QUALITY_STEPS) {
      const normalized = await sharp(bytes, {
        animated: false,
        failOn: "error",
        limitInputPixels: 50_000_000,
      })
        .rotate()
        .resize({
          width: INPUT_LIMITS.evidencePhotoLongEdge,
          height: INPUT_LIMITS.evidencePhotoLongEdge,
          fit: "inside",
          withoutEnlargement: true,
        })
        .webp({ quality, alphaQuality: 80, effort: 4 })
        .toBuffer({ resolveWithObject: true });

      if (
        normalized.data.byteLength <= INPUT_LIMITS.evidencePhotoStoredBytes &&
        normalized.info.width > 0 &&
        normalized.info.height > 0
      ) {
        return {
          success: true,
          photo: {
            imageData: normalized.data,
            contentType: "image/webp",
            byteSize: normalized.data.byteLength,
            width: normalized.info.width,
            height: normalized.info.height,
          },
        };
      }
    }

    return {
      success: false,
      error: "This photo could not be reduced below the 1 MB storage limit.",
    };
  } catch {
    return { success: false, error: "Choose a supported still image." };
  }
}

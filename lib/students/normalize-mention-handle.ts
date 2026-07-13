import { INPUT_LIMITS } from "@/lib/validation/input-limits";

export type NormalizeMentionHandleResult =
  | { success: true; mentionHandle: string }
  | { success: false; error: string };

export function normalizeMentionHandle(input: string): NormalizeMentionHandleResult {
  const mentionHandle = input.trim().replace(/^@+/, "").trim().toLowerCase();

  if (!mentionHandle) {
    return { success: false, error: "Handle is required." };
  }

  if (mentionHandle.length > INPUT_LIMITS.mentionHandle) {
    return {
      success: false,
      error: `Handle must be ${INPUT_LIMITS.mentionHandle} characters or fewer.`,
    };
  }

  if (!/[a-z0-9]/.test(mentionHandle)) {
    return {
      success: false,
      error: "Handle must include at least one letter or number.",
    };
  }

  if (!/^[a-z0-9_-]+$/.test(mentionHandle)) {
    return {
      success: false,
      error: "Handle can use letters, numbers, hyphens, and underscores only.",
    };
  }

  return { success: true, mentionHandle };
}

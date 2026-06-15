export type NormalizeMentionHandleResult =
  | { success: true; mentionHandle: string }
  | { success: false; error: string };

export function normalizeMentionHandle(input: string): NormalizeMentionHandleResult {
  const mentionHandle = input.trim().replace(/^@+/, "").trim().toLowerCase();

  if (!mentionHandle) {
    return { success: false, error: "Handle is required." };
  }

  if (!/[a-z0-9]/.test(mentionHandle)) {
    return {
      success: false,
      error: "Handle must include at least one letter or number.",
    };
  }

  return { success: true, mentionHandle };
}

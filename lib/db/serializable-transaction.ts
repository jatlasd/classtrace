type PrismaConflictError = {
  code: "P2034";
};

function isPrismaConflictError(error: unknown): error is PrismaConflictError {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2034"
  );
}

export async function withSerializableTransactionRetry<T>(
  execute: () => Promise<T>,
  maxAttempts = 3
): Promise<T> {
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await execute();
    } catch (error) {
      if (!isPrismaConflictError(error) || attempt === maxAttempts) {
        throw error;
      }
    }
  }

  throw new Error("Serializable transaction retry exhausted.");
}

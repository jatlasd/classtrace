import { describe, expect, it, vi } from "vitest";
import { withSerializableTransactionRetry } from "./serializable-transaction";

describe("withSerializableTransactionRetry", () => {
  it("retries Prisma write conflicts and returns the committed result", async () => {
    const execute = vi
      .fn<() => Promise<string>>()
      .mockRejectedValueOnce({ code: "P2034" })
      .mockRejectedValueOnce({ code: "P2034" })
      .mockResolvedValue("committed");

    await expect(withSerializableTransactionRetry(execute)).resolves.toBe(
      "committed"
    );
    expect(execute).toHaveBeenCalledTimes(3);
  });

  it("does not retry unrelated failures", async () => {
    const failure = new Error("database unavailable");
    const execute = vi.fn<() => Promise<string>>().mockRejectedValue(failure);

    await expect(withSerializableTransactionRetry(execute)).rejects.toBe(failure);
    expect(execute).toHaveBeenCalledTimes(1);
  });

  it("stops after the configured conflict limit", async () => {
    const conflict = { code: "P2034" };
    const execute = vi.fn<() => Promise<string>>().mockRejectedValue(conflict);

    await expect(withSerializableTransactionRetry(execute, 2)).rejects.toBe(
      conflict
    );
    expect(execute).toHaveBeenCalledTimes(2);
  });
});

import { describe, expect, it, vi } from "vitest";

vi.mock("@/components/errors/unexpected-error-fallback", () => ({
  UnexpectedErrorFallback: () => null,
}));

import AppError from "@/app/app/error";
import GlobalError from "@/app/global-error";

describe("route error boundaries", () => {
  it("configures the authenticated app boundary", () => {
    const error = Object.assign(new Error("failed"), { digest: "digest_123" });
    const retry = vi.fn();
    const element = AppError({ error, unstable_retry: retry });

    expect(element.props).toMatchObject({
      error,
      unstable_retry: retry,
      boundary: "app",
    });
  });

  it("supplies a complete document for the global boundary", () => {
    const element = GlobalError({
      error: new Error("failed"),
      unstable_retry: vi.fn(),
    });

    expect(element.type).toBe("html");
    expect(element.props.lang).toBe("en");
    expect(element.props.children.type).toBe("body");
  });
});

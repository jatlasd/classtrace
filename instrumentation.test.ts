import { afterEach, describe, expect, it, vi } from "vitest";
import { onRequestError } from "@/instrumentation";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("onRequestError", () => {
  it("logs the digest-derived reference with framework route context only", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    const error = Object.assign(new Error("SENTINEL_MESSAGE"), {
      digest: "digest_123",
      stack: "SENTINEL_STACK",
    });

    await onRequestError(
      error,
      {
        path: "/app/students/SENTINEL_STUDENT?note=SENTINEL_NOTE",
        method: "GET",
        headers: { cookie: "SENTINEL_COOKIE" },
      },
      {
        routerKind: "App Router",
        routePath: "/app/students/[studentId]/page",
        routeType: "render",
        renderSource: "react-server-components",
        revalidateReason: undefined,
        renderType: "dynamic",
      }
    );

    expect(consoleError).toHaveBeenCalledWith(
      "[instrumentation/onRequestError] unexpected",
      {
        referenceId: "CT-S-digest_123",
        routePath: "/app/students/[studentId]/page",
        routeType: "render",
        renderSource: "react-server-components",
      }
    );
    expect(JSON.stringify(consoleError.mock.calls)).not.toContain("SENTINEL");
  });

  it("does not add an application log without a usable digest", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

    await onRequestError(
      new Error("SENTINEL_MESSAGE"),
      { path: "/", method: "GET", headers: {} },
      {
        routerKind: "App Router",
        routePath: "/page",
        routeType: "render",
        renderSource: "server-rendering",
        revalidateReason: undefined,
        renderType: "dynamic",
      }
    );

    expect(consoleError).not.toHaveBeenCalled();
  });
});

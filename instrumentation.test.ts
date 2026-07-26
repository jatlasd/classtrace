import { afterEach, describe, expect, it, vi } from "vitest";

const sentry = vi.hoisted(() => ({
  captureRouterTransitionStart: vi.fn(),
  captureRequestError: vi.fn(),
  init: vi.fn(),
  setTag: vi.fn(),
  setTags: vi.fn(),
  withScope: vi.fn(
    (callback: (scope: { setTag: typeof sentry.setTag; setTags: typeof sentry.setTags }) => void) =>
      callback({ setTag: sentry.setTag, setTags: sentry.setTags })
  ),
}));

vi.mock("@sentry/nextjs", () => sentry);

import { onRequestError } from "@/instrumentation";

afterEach(() => {
  vi.restoreAllMocks();
  vi.clearAllMocks();
  vi.resetModules();
  vi.unstubAllEnvs();
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
    expect(sentry.setTags).toHaveBeenCalledWith({
      "classtrace.http_method": "GET",
      "classtrace.render_source": "react-server-components",
      "classtrace.route_template": "/app/students/[studentId]/page",
      "classtrace.route_type": "render",
    });
    expect(sentry.setTag).toHaveBeenCalledWith(
      "classtrace.error_reference",
      "CT-S-digest_123"
    );
    expect(sentry.captureRequestError).toHaveBeenCalledWith(
      error,
      expect.any(Object),
      expect.objectContaining({
        routePath: "/app/students/[studentId]/page",
      })
    );
  });

  it("captures an error without a digest but does not add an application log", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    const error = new Error("SENTINEL_MESSAGE");
    const request = { path: "/", method: "GET", headers: {} };
    const context = {
      routerKind: "App Router" as const,
      routePath: "/page",
      routeType: "render" as const,
      renderSource: "server-rendering" as const,
      revalidateReason: undefined,
      renderType: "dynamic" as const,
    };

    await onRequestError(
      error,
      request,
      context
    );

    expect(consoleError).not.toHaveBeenCalled();
    expect(sentry.setTag).not.toHaveBeenCalled();
    expect(sentry.captureRequestError).toHaveBeenCalledWith(
      error,
      request,
      context
    );
  });
});

describe("Sentry deployment environment", () => {
  it.each([
    [
      "client",
      "NEXT_PUBLIC_VERCEL_ENV",
      () => import("@/instrumentation-client"),
    ],
    ["server", "VERCEL_ENV", () => import("@/sentry.server.config")],
    ["edge", "VERCEL_ENV", () => import("@/sentry.edge.config")],
  ])(
    "labels a Vercel Preview deployment in the %s configuration",
    async (_, vercelEnvironmentName, loadConfiguration) => {
      vi.stubEnv("NODE_ENV", "production");
      vi.stubEnv(vercelEnvironmentName, "preview");

      await loadConfiguration();

      expect(sentry.init).toHaveBeenCalledWith(
        expect.objectContaining({ environment: "preview" })
      );
    }
  );
});

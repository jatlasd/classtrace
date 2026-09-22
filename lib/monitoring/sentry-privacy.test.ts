import type { Event, SpanJSON } from "@sentry/core";
import { describe, expect, it } from "vitest";
import {
  sanitizeSentryEvent,
  sanitizeSentrySpan,
  sentryDataCollection,
  sentryPrivacyOptions,
} from "@/lib/monitoring/sentry-privacy";
import { markSafeOperationStage } from "@/lib/monitoring/safe-error-diagnostic";

describe("Sentry privacy boundary", () => {
  it("opts out of request, identity, body, query, database, and local data", () => {
    expect(sentryDataCollection).toMatchObject({
      userInfo: false,
      cookies: false,
      httpHeaders: { request: false, response: false },
      httpBodies: [],
      urlQueryParams: false,
      databaseQueryData: false,
      stackFrameVariables: false,
    });
    expect(sentryPrivacyOptions.beforeBreadcrumb()).toBeNull();
  });

  it("removes user-controlled event data while preserving a readable stack", () => {
    const event: Event = {
      message: "SENTINEL_MESSAGE",
      request: {
        url: "/app/students/SENTINEL_STUDENT?note=SENTINEL_NOTE",
        headers: { cookie: "SENTINEL_COOKIE" },
        data: "SENTINEL_BODY",
      },
      user: { email: "SENTINEL_EMAIL" },
      breadcrumbs: [{ message: "SENTINEL_BREADCRUMB" }],
      extra: { note: "SENTINEL_EXTRA" },
      tags: {
        "classtrace.http_method": "GET",
        "classtrace.route_template": "/app/students/[studentId]/page",
        unsafe: "SENTINEL_TAG",
      },
      contexts: {
        trace: { trace_id: "a".repeat(32), span_id: "b".repeat(16) },
        unsafe: { note: "SENTINEL_CONTEXT" },
      },
      exception: {
        values: [
          {
            type: "TypeError",
            value: "SENTINEL_EXCEPTION",
            stacktrace: {
              frames: [
                {
                  filename: "app/example.ts",
                  function: "example",
                  lineno: 12,
                  vars: { note: "SENTINEL_LOCAL" },
                },
              ],
            },
          },
        ],
      },
    };

    const sanitized = sanitizeSentryEvent(event);

    expect(JSON.stringify(sanitized)).not.toContain("SENTINEL");
    expect(sanitized).toMatchObject({
      message: "Unexpected application error",
      user: { ip_address: null },
      transaction: "GET /app/students/[studentId]",
      transaction_info: { source: "route" },
      tags: {
        "classtrace.http_method": "GET",
        "classtrace.route_template": "/app/students/[studentId]",
      },
      exception: {
        values: [
          {
            type: "TypeError",
            value: "Unexpected application error",
            stacktrace: {
              frames: [
                {
                  filename: "app/example.ts",
                  function: "example",
                  lineno: 12,
                },
              ],
            },
          },
        ],
      },
    });
  });

  it("keeps only an explicitly marked setup-verification message", () => {
    const verification = "CT-SENTRY-VERIFY-20260724T120000Z";
    const event: Event = {
      tags: { "classtrace.verification": verification },
      exception: { values: [{ type: "Error", value: verification }] },
    };

    expect(
      sanitizeSentryEvent(event).exception?.values?.[0]?.value
    ).toBe(verification);
  });

  it("keeps only trace identifiers needed for correlation", () => {
    const traceId = "a".repeat(32);
    const spanId = "b".repeat(16);
    const parentSpanId = "c".repeat(16);
    const event: Event = {
      contexts: {
        trace: {
          trace_id: traceId,
          span_id: spanId,
          parent_span_id: parentSpanId,
          data: { note: "SENTINEL_TRACE_DATA" },
          description: "SENTINEL_TRACE_DESCRIPTION",
          op: "SENTINEL_TRACE_OPERATION",
          origin: "manual",
        },
      },
    };

    const sanitized = sanitizeSentryEvent(event);

    expect(sanitized.contexts).toEqual({
      trace: {
        trace_id: traceId,
        span_id: spanId,
        parent_span_id: parentSpanId,
      },
    });
    expect(JSON.stringify(sanitized)).not.toContain("SENTINEL");
    expect(sanitizeSentryEvent({ contexts: {} }).contexts).toBeUndefined();
  });

  it("keeps normalized React hydration diagnostics and safe runtime context", () => {
    const release = "a".repeat(40);
    const error = new Error(
      "Minified React error #418; visit https://react.dev/errors/418?args[]=text&args[]=SENTINEL_RENDERED_TEXT for the full message or use the non-minified dev environment for full errors and additional helpful warnings."
    );
    const attachments = [
      {
        filename: "SENTINEL_SCREENSHOT.png",
        data: "SENTINEL_DOM_SCREENSHOT",
      },
    ];
    const event: Event = {
      message: error.message,
      environment: "production",
      release,
      transaction:
        "https://classtrace.example/app/students/SENTINEL_STUDENT_ID?note=SENTINEL_NOTE#SENTINEL_HASH",
      transaction_info: { source: "url" },
      request: {
        url: "https://classtrace.example/app/students/SENTINEL_STUDENT_ID?note=SENTINEL_NOTE",
      },
      contexts: {
        trace: { trace_id: "a".repeat(32), span_id: "b".repeat(16) },
        browser: {
          name: "Chrome",
          version: "126.0.6478.57",
          userAgent: "SENTINEL_USER_AGENT",
        },
        os: {
          name: "macOS",
          version: "14.5.1",
          build: "SENTINEL_OS_BUILD",
        },
        device: {
          device_type: "desktop",
          model: "SENTINEL_DEVICE_MODEL",
        },
      },
      extra: {
        componentStack: "at EvidenceFeed (student=SENTINEL_STUDENT_NAME)",
      },
      debug_meta: {
        images: [
          {
            type: "sourcemap",
            code_file:
              "https://classtrace.example/_next/static/chunks/app.js?student=SENTINEL_STUDENT_ID",
            debug_id: "12345678-1234-1234-1234-123456789abc",
          },
        ],
      },
      exception: {
        values: [
          {
            type: "Error",
            value: error.message,
            mechanism: {
              type: "auto.browser.global_handlers.onerror",
              handled: false,
              data: { target: "SENTINEL_DOM_TEXT" },
            },
            stacktrace: {
              frames: [
                {
                  filename:
                    "https://classtrace.example/_next/static/chunks/app.js?student=SENTINEL_STUDENT_ID",
                  function: "throwOnHydrationMismatch",
                  abs_path:
                    "https://classtrace.example/app/students/SENTINEL_STUDENT_ID",
                  vars: { note: "SENTINEL_EVIDENCE_NOTE" },
                },
              ],
            },
          },
        ],
      },
    };

    const sanitized = sanitizeSentryEvent(event, {
      originalException: error,
      attachments,
    });

    expect(sanitized).toMatchObject({
      message:
        "React detected a server/client hydration mismatch: text content differed (React 418)",
      environment: "production",
      release,
      transaction: "/app/students/[studentId]",
      transaction_info: { source: "route" },
      tags: {
        "classtrace.route_template": "/app/students/[studentId]",
        "classtrace.error_mechanism":
          "auto.browser.global_handlers.onerror",
        "classtrace.error_source": "react",
        "classtrace.error_type": "ReactInvariantError",
        "classtrace.error_code": "418",
        "classtrace.failure_kind": "framework.react.hydration-mismatch",
        "classtrace.hydration_mismatch": "text",
      },
      contexts: {
        trace: { trace_id: "a".repeat(32), span_id: "b".repeat(16) },
        browser: { name: "Chrome", version: "126" },
        os: { name: "macOS", version: "14" },
        device: { device_type: "desktop" },
      },
      exception: {
        values: [
          {
            type: "Error",
            value:
              "React detected a server/client hydration mismatch: text content differed (React 418)",
            mechanism: {
              type: "auto.browser.global_handlers.onerror",
              handled: false,
            },
            stacktrace: {
              frames: [
                {
                  filename: "/_next/static/chunks/app.js",
                  function: "throwOnHydrationMismatch",
                },
              ],
            },
          },
        ],
      },
      debug_meta: {
        images: [
          {
            type: "sourcemap",
            code_file: "/_next/static/chunks/app.js",
            debug_id: "12345678-1234-1234-1234-123456789abc",
          },
        ],
      },
    });
    expect(JSON.stringify(sanitized)).not.toContain("SENTINEL");
    expect(attachments).toEqual([]);
  });

  it("recovers a known static route from a URL-sourced global browser error", () => {
    const event: Event = {
      transaction:
        "https://classtrace.example/app/feed?student=SENTINEL_STUDENT_ID#SENTINEL_HASH",
      transaction_info: { source: "url" },
      exception: {
        values: [
          {
            type: "Error",
            value: "SENTINEL_STUDENT_NOTE",
            mechanism: {
              type: "auto.browser.global_handlers.onerror",
              handled: false,
            },
          },
        ],
      },
    };

    const sanitized = sanitizeSentryEvent(event);

    expect(sanitized.transaction).toBe("/app/feed");
    expect(sanitized.transaction_info).toEqual({ source: "route" });
    expect(sanitized.tags).toMatchObject({
      "classtrace.route_template": "/app/feed",
      "classtrace.error_mechanism": "auto.browser.global_handlers.onerror",
    });
    expect(JSON.stringify(sanitized)).not.toContain("SENTINEL");
  });

  it("keeps only parsed React component symbols from a Sentry component stack", () => {
    const event: Event = {
      extra: {
        componentStack:
          "at EvidenceFeed (student=SENTINEL_STUDENT_NAME, note=SENTINEL_NOTE)",
      },
      exception: {
        values: [
          {
            type: "React ErrorBoundary Error",
            value: "SENTINEL_STUDENT_NOTE",
            mechanism: {
              type: "chained",
              handled: true,
              source: "SENTINEL_PROP",
              exception_id: 1,
              parent_id: 0,
              data: { props: "SENTINEL_COMPONENT_PROPS" },
            },
            stacktrace: {
              frames: [
                {
                  filename: "components/dashboard/evidence-feed.tsx",
                  function: "EvidenceFeed",
                },
                {
                  filename:
                    "https://classtrace.example/app/students/SENTINEL_STUDENT_ID",
                  function: "SavedEvidenceRow student=SENTINEL_STUDENT_NAME",
                },
              ],
            },
          },
        ],
      },
    };

    const sanitized = sanitizeSentryEvent(event);

    expect(sanitized.exception?.values?.[0]).toMatchObject({
      type: "ReactComponentStack",
      value: "Unexpected application error",
      mechanism: {
        type: "chained",
        handled: true,
        exception_id: 1,
        parent_id: 0,
      },
      stacktrace: {
        frames: [
          {
            filename: "components/dashboard/evidence-feed.tsx",
            function: "EvidenceFeed",
          },
          { filename: undefined, function: undefined },
        ],
      },
    });
    expect(JSON.stringify(sanitized)).not.toContain("SENTINEL");
  });

  it("drops arbitrary routes, runtime labels, client metadata, and trace-like values", () => {
    const event: Event = {
      environment: "SENTINEL_ENVIRONMENT",
      release: "SENTINEL_RELEASE",
      transaction: "/app/arbitrary/SENTINEL_STUDENT_ID?note=SENTINEL_NOTE",
      request: {
        url: "/app/arbitrary/SENTINEL_STUDENT_ID?note=SENTINEL_NOTE",
      },
      contexts: {
        trace: {
          trace_id: "SENTINEL_TRACE_ID",
          span_id: "SENTINEL_SPAN_ID",
        },
        browser: { name: "SENTINEL_BROWSER", version: "1.2.3" },
        os: { name: "SENTINEL_OS", version: "1.2.3" },
        device: { device_type: "SENTINEL_DEVICE" },
      },
      exception: {
        values: [
          {
            type: "SENTINEL_STUDENT_NAME",
            value: "SENTINEL_STUDENT_NOTE",
            mechanism: {
              type: "SENTINEL_MECHANISM",
              data: { formValue: "SENTINEL_FORM_VALUE" },
            },
          },
        ],
      },
    };

    const sanitized = sanitizeSentryEvent(event);

    expect(sanitized.environment).toBeUndefined();
    expect(sanitized.release).toBeUndefined();
    expect(sanitized.transaction).toBeUndefined();
    expect(sanitized.contexts).toBeUndefined();
    expect(sanitized.exception?.values?.[0]?.mechanism).toBeUndefined();
    expect(JSON.stringify(sanitized)).not.toContain("SENTINEL");
  });

  it("turns an allowlisted operation into an actionable safe issue title", () => {
    const event: Event = {
      tags: {
        "classtrace.operation": "evidence.save",
        unsafe: "SENTINEL_TAG",
      },
      exception: {
        values: [{ type: "TypeError", value: "SENTINEL_STUDENT_NOTE" }],
      },
    };

    expect(sanitizeSentryEvent(event)).toMatchObject({
      tags: { "classtrace.operation": "evidence.save" },
      exception: {
        values: [
          {
            type: "TypeError",
            value: "ClassTrace operation failed: evidence.save",
          },
        ],
      },
    });
    expect(JSON.stringify(event)).not.toContain("SENTINEL");
  });

  it("explains a known missing-table failure without retaining raw Prisma data", () => {
    const error = Object.assign(
      new Error(
        "The table BetaAgreementAcceptance does not exist for SENTINEL_TEACHER"
      ),
      {
        name: "PrismaClientKnownRequestError",
        code: "P2021",
        clientVersion: "7.8.0",
        meta: {
          modelName: "BetaAgreementAcceptance",
          table: "public.BetaAgreementAcceptance",
          databaseValue: "SENTINEL_STUDENT_NOTE",
        },
      }
    );
    markSafeOperationStage(error, "workspace.resolve");
    const event: Event = {
      message: "SENTINEL_MESSAGE",
      tags: {
        "classtrace.operation": "evidence.save",
        unsafe: "SENTINEL_TAG",
      },
      extra: { error },
      exception: {
        values: [
          {
            type: "PrismaClientKnownRequestError",
            value: error.message,
          },
        ],
      },
    };

    const sanitized = sanitizeSentryEvent(event, {
      originalException: error,
    });

    expect(sanitized).toMatchObject({
      message:
        "Database setup is missing a required table: BetaAgreementAcceptance (Prisma P2021) while resolving the current workspace for evidence.save",
      tags: {
        "classtrace.operation": "evidence.save",
        "classtrace.operation_stage": "workspace.resolve",
        "classtrace.error_source": "prisma",
        "classtrace.error_type": "PrismaClientKnownRequestError",
        "classtrace.error_code": "P2021",
        "classtrace.failure_kind": "database.table-missing",
        "classtrace.database_object": "BetaAgreementAcceptance",
      },
      exception: {
        values: [
          {
            type: "PrismaClientKnownRequestError",
            value:
              "Database setup is missing a required table: BetaAgreementAcceptance (Prisma P2021) while resolving the current workspace for evidence.save",
          },
        ],
      },
    });
    expect(JSON.stringify(sanitized)).not.toContain("SENTINEL");
    expect(sanitized.extra).toBeUndefined();
  });

  it("does not retain unrecognized database metadata or arbitrary error codes", () => {
    const error = Object.assign(new Error("SENTINEL_STUDENT_NOTE"), {
      code: "P2021",
      meta: { table: "SENTINEL_PRIVATE_TABLE" },
    });
    const event: Event = {
      tags: { "classtrace.operation": "evidence.save" },
      exception: {
        values: [{ type: "Error", value: error.message }],
      },
    };

    const sanitized = sanitizeSentryEvent(event, {
      originalException: error,
    });

    expect(sanitized.tags).toEqual({
      "classtrace.operation": "evidence.save",
      "classtrace.error_source": "javascript",
      "classtrace.error_type": "Error",
      "classtrace.failure_kind": "application.unexpected",
    });
    expect(sanitized.exception?.values?.[0]?.value).toBe(
      "An unexpected application operation failed (JavaScript Error) while running evidence.save"
    );
    expect(JSON.stringify(sanitized)).not.toContain("SENTINEL");
    expect(JSON.stringify(sanitized)).not.toContain("P2021");
  });

  it("drops operation tags outside the static allowlist", () => {
    const event: Event = {
      tags: { "classtrace.operation": "student-name-from-input" },
      exception: {
        values: [{ type: "Error", value: "SENTINEL_STUDENT_NOTE" }],
      },
    };

    expect(sanitizeSentryEvent(event)).toMatchObject({
      exception: {
        values: [{ value: "Unexpected application error" }],
      },
    });
    expect(event.tags).toBeUndefined();
    expect(JSON.stringify(event)).not.toContain("SENTINEL");
  });

  it("strips span attributes and raw descriptions", () => {
    const span: SpanJSON = {
      data: {
        "http.url": "/students/SENTINEL_STUDENT?note=SENTINEL_NOTE",
        "db.query.text": "select SENTINEL_DATABASE_VALUE",
      },
      description: "/students/SENTINEL_STUDENT",
      op: "http.client",
      span_id: "a".repeat(16),
      trace_id: "b".repeat(32),
      start_timestamp: 1,
    };

    expect(sanitizeSentrySpan(span)).toMatchObject({
      data: {},
      description: "http.client",
      op: "http.client",
    });
    expect(JSON.stringify(span)).not.toContain("SENTINEL");
  });
});

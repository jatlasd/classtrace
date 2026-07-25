import type { Event, SpanJSON } from "@sentry/core";
import { describe, expect, it } from "vitest";
import {
  sanitizeSentryEvent,
  sanitizeSentrySpan,
  sentryDataCollection,
  sentryPrivacyOptions,
} from "@/lib/monitoring/sentry-privacy";

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
    expect(sentryPrivacyOptions.beforeBreadcrumb({})).toBeNull();
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
      transaction: "GET /app/students/[studentId]/page",
      transaction_info: { source: "route" },
      tags: {
        "classtrace.http_method": "GET",
        "classtrace.route_template": "/app/students/[studentId]/page",
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

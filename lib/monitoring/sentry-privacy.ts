import type {
  DataCollection,
  Event,
  EventHint,
  Primitive,
  SpanJSON,
  TraceContext,
} from "@sentry/core";
import {
  formatSafeErrorMessage,
  getSafeErrorDiagnostic,
  getSafeOperationStage,
} from "@/lib/monitoring/safe-error-diagnostic";

const SAFE_OPERATIONS = [
  "beta-agreement.accept",
  "class.archive",
  "class.create",
  "class.rename",
  "class.restore",
  "evidence.delete",
  "evidence.export",
  "evidence.explore",
  "evidence.explore.supporting",
  "evidence.photo-read",
  "evidence.save",
  "feedback.submit",
  "operator.account-directory",
  "operator.account-search",
  "operator.clerk-user-delete",
  "operator.demo-seed",
  "operator.workspace-delete",
  "roster.archive",
  "roster.create",
  "roster.delete",
  "roster.import",
  "roster.restore",
  "roster.update",
] as const;
const SAFE_TAG_KEYS = [
  "classtrace.boundary",
  "classtrace.error_reference",
  "classtrace.http_method",
  "classtrace.operation",
  "classtrace.operation_stage",
  "classtrace.render_source",
  "classtrace.route_template",
  "classtrace.route_type",
  "classtrace.verification",
] as const;
const SAFE_STATIC_ROUTE_TEMPLATES = new Set([
  "/",
  "/app",
  "/app/explore",
  "/app/feed",
  "/app/roster",
  "/app/settings",
  "/beta-acknowledgements",
  "/data-deletion",
  "/operator",
  "/privacy",
  "/students",
  "/support",
  "/terms",
]);
const SAFE_ERROR_MECHANISMS = new Set([
  "auto.browser.global_handlers.onerror",
  "auto.browser.global_handlers.onunhandledrejection",
  "auto.core.linked_errors",
  "auto.function.react.error_boundary",
  "auto.function.react.error_handler",
  "chained",
  "generic",
  "instrument",
  "onerror",
  "onunhandledrejection",
]);
const SAFE_EXCEPTION_TYPES = new Set([
  "AggregateError",
  "DatabaseError",
  "DOMException",
  "Error",
  "EvalError",
  "InvariantError",
  "PrismaClientInitializationError",
  "PrismaClientKnownRequestError",
  "PrismaClientRustError",
  "PrismaClientRustPanicError",
  "PrismaClientUnknownRequestError",
  "PrismaClientValidationError",
  "RangeError",
  "ReferenceError",
  "SyntaxError",
  "TypeError",
  "URIError",
  "UnhandledRejection",
]);
const SAFE_BROWSER_NAMES: Record<string, string> = {
  chrome: "Chrome",
  "chrome mobile": "Chrome Mobile",
  edge: "Edge",
  electron: "Electron",
  firefox: "Firefox",
  "firefox mobile": "Firefox Mobile",
  opera: "Opera",
  safari: "Safari",
  "mobile safari": "Mobile Safari",
  "samsung internet": "Samsung Internet",
};
const SAFE_OS_NAMES: Record<string, string> = {
  android: "Android",
  "chrome os": "Chrome OS",
  ios: "iOS",
  linux: "Linux",
  macos: "macOS",
  "mac os x": "macOS",
  windows: "Windows",
};

export type SentryOperation = (typeof SAFE_OPERATIONS)[number];

export const sentryDataCollection: DataCollection = {
  userInfo: false,
  cookies: false,
  httpHeaders: {
    request: false,
    response: false,
  },
  httpBodies: [],
  urlQueryParams: false,
  graphQL: {
    document: false,
    variables: false,
  },
  genAI: {
    inputs: false,
    outputs: false,
  },
  databaseQueryData: false,
  stackFrameVariables: false,
  frameContextLines: 3,
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getPathname(value: unknown): string | undefined {
  if (typeof value !== "string" || value.length === 0 || value.length > 2_048) {
    return undefined;
  }

  const withoutMethod = value.replace(
    /^(?:DELETE|GET|HEAD|OPTIONS|PATCH|POST|PUT)\s+/,
    ""
  );

  try {
    const pathname = new URL(withoutMethod, "https://classtrace.invalid").pathname;
    return pathname.length > 1 && pathname.endsWith("/")
      ? pathname.slice(0, -1)
      : pathname;
  } catch {
    return undefined;
  }
}

function getSafeRouteTemplate(value: unknown): string | undefined {
  const pathname = getPathname(value);
  if (!pathname) return undefined;

  const routePath = pathname.replace(/\/(?:page|route)$/, "");
  if (SAFE_STATIC_ROUTE_TEMPLATES.has(routePath)) return routePath;

  if (/^\/app\/students\/[^/]+\/report$/.test(routePath)) {
    return "/app/students/[studentId]/report";
  }
  if (/^\/app\/students\/[^/]+$/.test(routePath)) {
    return "/app/students/[studentId]";
  }
  if (/^\/app\/evidence\/[^/]+\/photo$/.test(routePath)) {
    return "/app/evidence/[evidenceId]/photo";
  }
  if (/^\/students\/[^/]+$/.test(routePath)) {
    return "/students/[studentId]";
  }
  if (/^\/sign-in(?:\/.*)?$/.test(routePath)) {
    return "/sign-in/[[...sign-in]]";
  }
  if (/^\/sign-up(?:\/.*)?$/.test(routePath)) {
    return "/sign-up/[[...sign-up]]";
  }

  return undefined;
}

function isSafeVerificationMessage(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^CT-SENTRY-VERIFY-[A-Z0-9-]{8,80}$/.test(value)
  );
}

function isSafeErrorReference(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^CT-[SC]-[A-Za-z0-9_-]{1,64}$/.test(value)
  );
}

function isSafeOperation(value: unknown): value is SentryOperation {
  return (
    typeof value === "string" &&
    (SAFE_OPERATIONS as readonly string[]).includes(value)
  );
}

function isSafeTag(key: (typeof SAFE_TAG_KEYS)[number], value: unknown) {
  switch (key) {
    case "classtrace.boundary":
      return value === "app" || value === "global";
    case "classtrace.error_reference":
      return isSafeErrorReference(value);
    case "classtrace.http_method":
      return (
        typeof value === "string" &&
        /^(DELETE|GET|HEAD|OPTIONS|PATCH|POST|PUT)$/.test(value)
      );
    case "classtrace.operation":
      return isSafeOperation(value);
    case "classtrace.operation_stage":
      return value === "operation.execute" || value === "workspace.resolve";
    case "classtrace.render_source":
      return (
        value === "react-server-components" ||
        value === "react-server-components-payload" ||
        value === "server-rendering"
      );
    case "classtrace.route_template":
      return getSafeRouteTemplate(value) !== undefined;
    case "classtrace.route_type":
      return (
        value === "action" ||
        value === "proxy" ||
        value === "render" ||
        value === "route"
      );
    case "classtrace.verification":
      return isSafeVerificationMessage(value);
  }
}

function getSafeTags(
  tags: Event["tags"]
): Record<string, Primitive> | undefined {
  if (!tags) return undefined;

  const safeTags: Record<string, Primitive> = {};

  for (const key of SAFE_TAG_KEYS) {
    const value = tags[key];
    if (isSafeTag(key, value)) {
      safeTags[key] =
        key === "classtrace.route_template"
          ? (getSafeRouteTemplate(value) as string)
          : value;
    }
  }

  return Object.keys(safeTags).length > 0 ? safeTags : undefined;
}

function getSafeTraceContext(
  trace: TraceContext | undefined
): TraceContext | undefined {
  if (
    !trace ||
    !/^[a-f0-9]{32}$/i.test(trace.trace_id) ||
    !/^[a-f0-9]{16}$/i.test(trace.span_id)
  ) {
    return undefined;
  }

  return {
    trace_id: trace.trace_id,
    span_id: trace.span_id,
    ...(trace.parent_span_id && /^[a-f0-9]{16}$/i.test(trace.parent_span_id)
      ? { parent_span_id: trace.parent_span_id }
      : undefined),
  };
}

function getSafeVersionMajor(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  return value.match(/^(\d{1,4})(?:\.|$)/)?.[1];
}

function getSafeNamedContext(
  value: unknown,
  names: Record<string, string>
): Record<string, string> | undefined {
  if (!isRecord(value) || typeof value.name !== "string") return undefined;

  const name = names[value.name.toLowerCase()];
  if (!name) return undefined;

  const version = getSafeVersionMajor(value.version);
  return { name, ...(version ? { version } : undefined) };
}

function getSafeDeviceContext(value: unknown): Record<string, string> | undefined {
  if (!isRecord(value)) return undefined;

  const rawDeviceType = value.device_type ?? value.type;
  if (typeof rawDeviceType !== "string") return undefined;

  const normalized = rawDeviceType.toLowerCase();
  const deviceType = ["desktop", "mobile", "tablet"].includes(normalized)
    ? normalized
    : undefined;
  return deviceType ? { device_type: deviceType } : undefined;
}

function getSafeContexts(contexts: Event["contexts"]): Event["contexts"] {
  if (!contexts) return undefined;

  const trace = getSafeTraceContext(contexts.trace);
  const browser = getSafeNamedContext(contexts.browser, SAFE_BROWSER_NAMES);
  const os = getSafeNamedContext(contexts.os, SAFE_OS_NAMES);
  const device = getSafeDeviceContext(contexts.device);
  const safeContexts = {
    ...(trace ? { trace } : undefined),
    ...(browser ? { browser } : undefined),
    ...(os ? { os } : undefined),
    ...(device ? { device } : undefined),
  };

  return Object.keys(safeContexts).length > 0 ? safeContexts : undefined;
}

function getSafeErrorMechanism(value: unknown): string | undefined {
  return typeof value === "string" && SAFE_ERROR_MECHANISMS.has(value)
    ? value
    : undefined;
}

function getSafeFrameFilename(value: unknown): string | undefined {
  if (typeof value !== "string" || value.length > 300) return undefined;

  const withoutQueryOrHash = value.split(/[?#]/, 1)[0];
  if (!withoutQueryOrHash) return undefined;

  if (
    /^(?:actions|app|components|lib)\//.test(withoutQueryOrHash) ||
    /^(?:instrumentation(?:-client)?|sentry\.(?:edge|server)\.config)\.[A-Za-z]+$/.test(
      withoutQueryOrHash
    )
  ) {
    return /^[A-Za-z0-9_./@()[\]-]+$/.test(withoutQueryOrHash)
      ? withoutQueryOrHash
      : undefined;
  }

  try {
    const pathname = new URL(withoutQueryOrHash).pathname;
    return /^\/_next\/static\/[A-Za-z0-9_./()-]+$/.test(pathname)
      ? pathname
      : undefined;
  } catch {
    return undefined;
  }
}

function getSafeFrameFunction(value: unknown): string | undefined {
  if (typeof value !== "string" || value.length > 120) return undefined;
  return /^(?:(?:async|new) )?[A-Za-z_$<][A-Za-z0-9_$./<>-]{0,119}$/.test(
    value
  )
    ? value
    : undefined;
}

function sanitizeStackFrames(event: Event): void {
  for (const exception of event.exception?.values ?? []) {
    const originalType = exception.type;
    const type =
      typeof originalType === "string" &&
      /^React ErrorBoundary [A-Za-z][A-Za-z0-9_.-]{0,79}$/.test(originalType)
        ? "ReactComponentStack"
        : typeof originalType === "string" && SAFE_EXCEPTION_TYPES.has(originalType)
          ? originalType
          : "Error";
    exception.type = type;

    const mechanismType = getSafeErrorMechanism(exception.mechanism?.type);
    exception.mechanism = mechanismType
      ? {
          type: mechanismType,
          ...(typeof exception.mechanism?.handled === "boolean"
            ? { handled: exception.mechanism.handled }
            : undefined),
          ...(typeof exception.mechanism?.exception_id === "number" &&
          exception.mechanism.exception_id >= 0 &&
          exception.mechanism.exception_id <= 20
            ? { exception_id: exception.mechanism.exception_id }
            : undefined),
          ...(typeof exception.mechanism?.parent_id === "number" &&
          exception.mechanism.parent_id >= 0 &&
          exception.mechanism.parent_id <= 20
            ? { parent_id: exception.mechanism.parent_id }
            : undefined),
        }
      : undefined;

    for (const frame of exception.stacktrace?.frames ?? []) {
      delete frame.vars;
      delete frame.abs_path;
      delete frame.module_metadata;
      const filename = getSafeFrameFilename(frame.filename);
      frame.filename = filename;
      frame.function =
        type === "ReactComponentStack" || filename
          ? getSafeFrameFunction(frame.function)
          : undefined;
    }
  }
}

function sanitizeDebugMeta(event: Event): void {
  const images = event.debug_meta?.images?.flatMap((image) => {
    if (
      image.type !== "sourcemap" ||
      !/^[a-f0-9-]{16,64}$/i.test(image.debug_id)
    ) {
      return [];
    }

    const codeFile = getSafeFrameFilename(image.code_file);
    return codeFile
      ? [{ type: "sourcemap" as const, code_file: codeFile, debug_id: image.debug_id }]
      : [];
  });

  event.debug_meta = images?.length ? { images } : undefined;
}

export function sanitizeSentrySpan(span: SpanJSON): SpanJSON {
  const routeDescription =
    span.data["sentry.source"] === "route"
      ? getSafeRouteTemplate(span.description)
      : undefined;
  const safeOperation =
    typeof span.op === "string" && /^[a-z0-9_.-]{1,80}$/i.test(span.op)
      ? span.op
      : "operation";

  span.description = routeDescription ?? safeOperation;
  span.data = {};

  return span;
}

export function sanitizeSentryEvent<T extends Event>(
  event: T,
  hint?: EventHint
): T {
  const originalTransaction = event.transaction;
  const requestUrl = event.request?.url;
  const allowlistedTags = getSafeTags(event.tags);
  const routeTemplate =
    getSafeRouteTemplate(allowlistedTags?.["classtrace.route_template"]) ??
    getSafeRouteTemplate(originalTransaction) ??
    getSafeRouteTemplate(requestUrl);
  const httpMethod = allowlistedTags?.["classtrace.http_method"];
  const verificationMessage = allowlistedTags?.["classtrace.verification"];
  const operation = allowlistedTags?.["classtrace.operation"];
  const operationStage = allowlistedTags?.["classtrace.operation_stage"];
  const safeOperationStage =
    operationStage === "operation.execute" ||
    operationStage === "workspace.resolve"
      ? operationStage
      : getSafeOperationStage(hint?.originalException);
  const diagnostic = verificationMessage
    ? undefined
    : getSafeErrorDiagnostic(
        hint?.originalException ??
          event.exception?.values?.[event.exception.values.length - 1]?.value ??
          event.message
      );
  const errorMechanism = getSafeErrorMechanism(
    event.exception?.values?.[event.exception.values.length - 1]?.mechanism?.type ??
      hint?.mechanism?.type
  );
  const safeTags: Record<string, Primitive> = {
    ...allowlistedTags,
    ...(routeTemplate
      ? { "classtrace.route_template": routeTemplate }
      : undefined),
    ...(errorMechanism
      ? { "classtrace.error_mechanism": errorMechanism }
      : undefined),
    ...(safeOperationStage
      ? { "classtrace.operation_stage": safeOperationStage }
      : undefined),
    ...(diagnostic
      ? {
          "classtrace.error_source": diagnostic.source,
          "classtrace.error_type": diagnostic.errorType,
          "classtrace.failure_kind": diagnostic.failureKind,
          ...(diagnostic.code
            ? { "classtrace.error_code": diagnostic.code }
            : undefined),
          ...(diagnostic.databaseObject
            ? {
                "classtrace.database_object": diagnostic.databaseObject,
              }
            : undefined),
          ...(diagnostic.hydrationMismatch
            ? {
                "classtrace.hydration_mismatch":
                  diagnostic.hydrationMismatch,
              }
            : undefined),
        }
      : undefined),
  };
  const safeErrorMessage = formatSafeErrorMessage(
    diagnostic,
    typeof operation === "string" ? operation : undefined,
    safeOperationStage
  );

  event.request = undefined;
  event.user = { ip_address: null };
  event.breadcrumbs = undefined;
  event.extra = undefined;
  event.fingerprint = undefined;
  event.logger = undefined;
  event.server_name = undefined;
  event.threads = undefined;
  event.sdkProcessingMetadata = undefined;
  event.environment =
    typeof event.environment === "string" &&
    ["development", "preview", "production", "staging", "test"].includes(
      event.environment
    )
      ? event.environment
      : undefined;
  event.release =
    typeof event.release === "string" && /^[a-f0-9]{7,64}$/i.test(event.release)
      ? event.release
      : undefined;
  event.dist = undefined;
  event.tags = Object.keys(safeTags).length > 0 ? safeTags : undefined;
  event.contexts = getSafeContexts(event.contexts);

  if (typeof routeTemplate === "string") {
    event.transaction = `${typeof httpMethod === "string" ? `${httpMethod} ` : ""}${routeTemplate}`;
    event.transaction_info = { source: "route" };
  } else {
    event.transaction = undefined;
    event.transaction_info = undefined;
  }

  if (event.message) {
    event.message =
      verificationMessage === event.message
        ? verificationMessage
        : safeErrorMessage;
  }

  if (event.logentry) {
    event.logentry = { message: safeErrorMessage };
  }

  for (const exception of event.exception?.values ?? []) {
    exception.value =
      verificationMessage === exception.value
        ? verificationMessage
        : safeErrorMessage;
  }

  sanitizeStackFrames(event);
  sanitizeDebugMeta(event);
  event.spans = event.spans?.map(sanitizeSentrySpan);
  if (hint?.attachments) {
    try {
      hint.attachments.length = 0;
    } catch {
      hint.attachments = [];
    }
  }

  return event;
}

export const sentryPrivacyOptions = {
  sendDefaultPii: false,
  dataCollection: sentryDataCollection,
  enableLogs: false,
  beforeBreadcrumb: () => null,
  beforeSendLog: () => null,
  beforeSend: sanitizeSentryEvent,
  beforeSendTransaction: sanitizeSentryEvent,
  beforeSendSpan: sanitizeSentrySpan,
};

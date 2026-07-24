import type {
  DataCollection,
  Event,
  Primitive,
  SpanJSON,
} from "@sentry/core";

const REDACTED_ERROR_MESSAGE = "Unexpected application error";
const SAFE_TAG_KEYS = [
  "classtrace.boundary",
  "classtrace.error_reference",
  "classtrace.http_method",
  "classtrace.render_source",
  "classtrace.route_template",
  "classtrace.route_type",
  "classtrace.verification",
] as const;

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

function isSafeRouteTemplate(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length <= 200 &&
    /^\/[A-Za-z0-9_./[\]()-]*$/.test(value)
  );
}

function isSafeTransactionName(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length <= 220 &&
    !value.includes("?") &&
    /^(?:[A-Z]+ )?\/[A-Za-z0-9_./[\]():-]*$/.test(value)
  );
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
    case "classtrace.render_source":
      return (
        value === "react-server-components" ||
        value === "react-server-components-payload" ||
        value === "server-rendering"
      );
    case "classtrace.route_template":
      return isSafeRouteTemplate(value);
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
      safeTags[key] = value;
    }
  }

  return Object.keys(safeTags).length > 0 ? safeTags : undefined;
}

function sanitizeStackFrames(event: Event): void {
  for (const exception of event.exception?.values ?? []) {
    const type =
      typeof exception.type === "string" &&
      /^[A-Za-z][A-Za-z0-9_.-]{0,79}$/.test(exception.type)
        ? exception.type
        : "Error";
    exception.type = type;

    for (const frame of exception.stacktrace?.frames ?? []) {
      delete frame.vars;
    }
  }
}

export function sanitizeSentrySpan(span: SpanJSON): SpanJSON {
  const routeDescription =
    span.data["sentry.source"] === "route" &&
    isSafeTransactionName(span.description)
      ? span.description
      : undefined;
  const safeOperation =
    typeof span.op === "string" && /^[a-z0-9_.-]{1,80}$/i.test(span.op)
      ? span.op
      : "operation";

  span.description = routeDescription ?? safeOperation;
  span.data = {};

  return span;
}

export function sanitizeSentryEvent<T extends Event>(event: T): T {
  const originalTransaction = event.transaction;
  const originalTransactionSource = event.transaction_info?.source;
  const safeTags = getSafeTags(event.tags);
  const routeTemplate = safeTags?.["classtrace.route_template"];
  const httpMethod = safeTags?.["classtrace.http_method"];
  const verificationMessage = safeTags?.["classtrace.verification"];

  event.request = undefined;
  event.user = { ip_address: null };
  event.breadcrumbs = undefined;
  event.extra = undefined;
  event.fingerprint = undefined;
  event.logger = undefined;
  event.server_name = undefined;
  event.threads = undefined;
  event.sdkProcessingMetadata = undefined;
  event.tags = safeTags;
  event.contexts = event.contexts?.trace
    ? { trace: event.contexts.trace }
    : undefined;

  if (typeof routeTemplate === "string") {
    event.transaction = `${typeof httpMethod === "string" ? `${httpMethod} ` : ""}${routeTemplate}`;
    event.transaction_info = { source: "route" };
  } else if (
    originalTransactionSource === "route" &&
    isSafeTransactionName(originalTransaction)
  ) {
    event.transaction = originalTransaction;
    event.transaction_info = { source: "route" };
  } else {
    event.transaction = undefined;
    event.transaction_info = undefined;
  }

  if (event.message) {
    event.message =
      verificationMessage === event.message
        ? verificationMessage
        : REDACTED_ERROR_MESSAGE;
  }

  if (event.logentry) {
    event.logentry = { message: REDACTED_ERROR_MESSAGE };
  }

  for (const exception of event.exception?.values ?? []) {
    exception.value =
      verificationMessage === exception.value
        ? verificationMessage
        : REDACTED_ERROR_MESSAGE;
  }

  sanitizeStackFrames(event);
  event.spans = event.spans?.map(sanitizeSentrySpan);

  return event;
}

export const sentryPrivacyOptions = {
  sendDefaultPii: false,
  dataCollection: sentryDataCollection,
  beforeBreadcrumb: () => null,
  beforeSend: sanitizeSentryEvent,
  beforeSendTransaction: sanitizeSentryEvent,
  beforeSendSpan: sanitizeSentrySpan,
};

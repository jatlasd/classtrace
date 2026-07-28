const SAFE_DATABASE_OBJECTS = [
  "BetaAgreementAcceptance",
  "ClassGroup",
  "EvidenceRecord",
  "OperatorActionAudit",
  "RosterStudent",
  "TeacherProfile",
  "Workspace",
] as const;

const PRISMA_ERROR_TYPES = new Set([
  "PrismaClientInitializationError",
  "PrismaClientKnownRequestError",
  "PrismaClientRustError",
  "PrismaClientRustPanicError",
  "PrismaClientUnknownRequestError",
  "PrismaClientValidationError",
]);

const JAVASCRIPT_FAILURES = {
  AggregateError: {
    kind: "application.multiple-failures",
    summary: "Several application operations failed together",
  },
  Error: {
    kind: "application.unexpected",
    summary: "An unexpected application operation failed",
  },
  EvalError: {
    kind: "application.code-evaluation-failed",
    summary: "Application code evaluation failed",
  },
  RangeError: {
    kind: "application.value-out-of-range",
    summary: "Application code received a value outside its supported range",
  },
  ReferenceError: {
    kind: "application.reference-missing",
    summary: "Application code referenced something unavailable",
  },
  SyntaxError: {
    kind: "application.syntax-invalid",
    summary: "The application could not parse code or structured data",
  },
  TypeError: {
    kind: "application.value-type-invalid",
    summary: "Application code used a value in an unexpected way",
  },
  URIError: {
    kind: "application.address-invalid",
    summary: "The application could not process an address",
  },
} as const;

type SafeErrorSource = "javascript" | "postgresql" | "prisma";
export type SafeOperationStage = "operation.execute" | "workspace.resolve";

const ERROR_STAGE = Symbol.for("classtrace.monitoring.operation-stage");

export type SafeErrorDiagnostic = {
  source: SafeErrorSource;
  errorType: string;
  code?: string;
  failureKind: string;
  summary: string;
  databaseObject?: (typeof SAFE_DATABASE_OBJECTS)[number];
};

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null;
}

function readProperty(value: unknown, key: PropertyKey): unknown {
  if (
    (typeof value !== "object" || value === null) &&
    typeof value !== "function"
  ) {
    return undefined;
  }

  try {
    return Reflect.get(value, key);
  } catch {
    return undefined;
  }
}

function getConstructorName(error: UnknownRecord): string | undefined {
  const constructorName = readProperty(
    readProperty(error, "constructor"),
    "name"
  );

  return typeof constructorName === "string" ? constructorName : undefined;
}

function getSafeDatabaseObject(
  error: UnknownRecord
): SafeErrorDiagnostic["databaseObject"] {
  const meta = readProperty(error, "meta");
  const sources = [error, ...(isRecord(meta) ? [meta] : [])];

  for (const source of sources) {
    for (const key of ["modelName", "table"]) {
      const value = readProperty(source, key);
      if (typeof value !== "string") continue;

      const match = SAFE_DATABASE_OBJECTS.find(
        (databaseObject) =>
          value === databaseObject ||
          value.endsWith(`.${databaseObject}`) ||
          value.includes(`"${databaseObject}"`)
      );
      if (match) return match;
    }
  }

  return undefined;
}

function getPrismaFailure(code: string | undefined): {
  failureKind: string;
  summary: string;
} {
  switch (code) {
    case "P1000":
      return {
        failureKind: "database.authentication-failed",
        summary: "The application could not authenticate with the database",
      };
    case "P1001":
    case "P1017":
      return {
        failureKind: "database.unavailable",
        summary: "The database was unavailable",
      };
    case "P1002":
    case "P1008":
    case "P2024":
      return {
        failureKind: "database.timeout",
        summary: "The database operation timed out",
      };
    case "P1014":
    case "P2021":
      return {
        failureKind: "database.table-missing",
        summary: "Database setup is missing a required table",
      };
    case "P2002":
      return {
        failureKind: "database.unique-conflict",
        summary: "The database rejected a duplicate value",
      };
    case "P2003":
    case "P2014":
      return {
        failureKind: "database.relation-conflict",
        summary: "The database rejected a conflicting relationship",
      };
    case "P2011":
      return {
        failureKind: "database.required-value-missing",
        summary: "The database was missing a required value",
      };
    case "P2022":
      return {
        failureKind: "database.column-missing",
        summary: "Database setup is missing a required column",
      };
    case "P2025":
      return {
        failureKind: "database.record-missing",
        summary: "A required database record could not be found",
      };
    case "P2034":
      return {
        failureKind: "database.write-conflict",
        summary: "A database write conflict remained after retries",
      };
    case "P2037":
      return {
        failureKind: "database.connection-limit",
        summary: "The database connection limit was reached",
      };
    default:
      return {
        failureKind: "database.request-failed",
        summary: "The database rejected the application operation",
      };
  }
}

function getPostgresFailure(code: string): {
  failureKind: string;
  summary: string;
} {
  switch (code) {
    case "23502":
      return {
        failureKind: "database.required-value-missing",
        summary: "The database was missing a required value",
      };
    case "23503":
      return {
        failureKind: "database.relation-conflict",
        summary: "The database rejected a conflicting relationship",
      };
    case "23505":
      return {
        failureKind: "database.unique-conflict",
        summary: "The database rejected a duplicate value",
      };
    case "40001":
    case "40P01":
      return {
        failureKind: "database.write-conflict",
        summary: "A database write conflict remained after retries",
      };
    case "42703":
      return {
        failureKind: "database.column-missing",
        summary: "Database setup is missing a required column",
      };
    case "42P01":
      return {
        failureKind: "database.table-missing",
        summary: "Database setup is missing a required table",
      };
    case "53300":
      return {
        failureKind: "database.connection-limit",
        summary: "The database connection limit was reached",
      };
    case "57014":
      return {
        failureKind: "database.timeout",
        summary: "The database operation timed out",
      };
    default:
      return {
        failureKind: "database.request-failed",
        summary: "The database rejected the application operation",
      };
  }
}

function diagnoseOneError(error: UnknownRecord): SafeErrorDiagnostic | undefined {
  const rawErrorName = readProperty(error, "name");
  const errorName =
    typeof rawErrorName === "string" ? rawErrorName : undefined;
  const constructorName = getConstructorName(error);
  const prismaErrorType = [errorName, constructorName].find(
    (errorType) => errorType && PRISMA_ERROR_TYPES.has(errorType)
  );

  if (prismaErrorType) {
    const directCode = readProperty(error, "code");
    const rawCode =
      typeof directCode === "string"
        ? directCode
        : readProperty(error, "errorCode");
    const code =
      typeof rawCode === "string" && /^P\d{4}$/.test(rawCode)
        ? rawCode
        : undefined;
    const failure = getPrismaFailure(code);

    return {
      source: "prisma",
      errorType: prismaErrorType,
      ...(code ? { code } : undefined),
      ...failure,
      ...(code === "P1014" || code === "P2021"
        ? { databaseObject: getSafeDatabaseObject(error) }
        : undefined),
    };
  }

  const postgresCode = readProperty(error, "code");
  if (
    constructorName === "DatabaseError" &&
    typeof postgresCode === "string" &&
    /^[0-9A-Z]{5}$/.test(postgresCode)
  ) {
    return {
      source: "postgresql",
      errorType: "DatabaseError",
      code: postgresCode,
      ...getPostgresFailure(postgresCode),
      ...(postgresCode === "42P01"
        ? { databaseObject: getSafeDatabaseObject(error) }
        : undefined),
    };
  }

  if (errorName && errorName in JAVASCRIPT_FAILURES) {
    const failure =
      JAVASCRIPT_FAILURES[errorName as keyof typeof JAVASCRIPT_FAILURES];
    return {
      source: "javascript",
      errorType: errorName,
      failureKind: failure.kind,
      summary: failure.summary,
    };
  }

  return undefined;
}

export function getSafeErrorDiagnostic(
  error: unknown
): SafeErrorDiagnostic | undefined {
  try {
    const seen = new Set<unknown>();
    let current = error;

    for (let depth = 0; depth < 4 && isRecord(current); depth += 1) {
      if (seen.has(current)) return undefined;
      seen.add(current);

      const diagnostic = diagnoseOneError(current);
      if (diagnostic && diagnostic.source !== "javascript") {
        return diagnostic;
      }

      const cause = readProperty(current, "cause");
      const causeDiagnostic = isRecord(cause)
        ? diagnoseOneError(cause)
        : undefined;
      if (causeDiagnostic && causeDiagnostic.source !== "javascript") {
        return causeDiagnostic;
      }

      if (!isRecord(cause)) {
        return diagnostic;
      }
      current = cause;
    }
  } catch {
    return undefined;
  }

  return undefined;
}

export function markSafeOperationStage<T>(
  error: T,
  stage: SafeOperationStage
): T {
  if (!isRecord(error) || readProperty(error, ERROR_STAGE) !== undefined) {
    return error;
  }

  try {
    Object.defineProperty(error, ERROR_STAGE, {
      configurable: false,
      enumerable: false,
      value: stage,
      writable: false,
    });
  } catch {
    // A frozen third-party error still retains its safe diagnostic code and type.
  }

  return error;
}

export function getSafeOperationStage(
  error: unknown
): SafeOperationStage | undefined {
  if (!isRecord(error)) return undefined;

  const stage = readProperty(error, ERROR_STAGE);
  return stage === "operation.execute" || stage === "workspace.resolve"
    ? stage
    : undefined;
}

export function formatSafeErrorMessage(
  diagnostic: SafeErrorDiagnostic | undefined,
  operation: string | undefined,
  stage?: SafeOperationStage
): string {
  if (!diagnostic) {
    if (stage === "workspace.resolve") {
      return operation
        ? `ClassTrace failed while resolving the current workspace for ${operation}`
        : "ClassTrace failed while resolving the current workspace";
    }

    return operation
      ? `ClassTrace operation failed: ${operation}`
      : "Unexpected application error";
  }

  const databaseObject = diagnostic.databaseObject
    ? `: ${diagnostic.databaseObject}`
    : "";
  const source =
    diagnostic.source === "prisma"
      ? "Prisma"
      : diagnostic.source === "postgresql"
        ? "PostgreSQL"
        : "JavaScript";
  const technicalDetail = diagnostic.code ?? diagnostic.errorType;
  const operationDetail =
    stage === "workspace.resolve"
      ? operation
        ? ` while resolving the current workspace for ${operation}`
        : " while resolving the current workspace"
      : operation
        ? ` while running ${operation}`
        : "";

  return `${diagnostic.summary}${databaseObject} (${source} ${technicalDetail})${operationDetail}`;
}

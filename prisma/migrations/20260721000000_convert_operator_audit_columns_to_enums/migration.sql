CREATE TYPE "OperatorAuditAction" AS ENUM (
    'WORKSPACE_DATA_DELETE',
    'CLERK_USER_DELETE'
);

CREATE TYPE "OperatorAuditOutcome" AS ENUM (
    'STARTED',
    'SUCCEEDED',
    'FAILED'
);

ALTER TABLE "OperatorActionAudit"
ALTER COLUMN "action" TYPE "OperatorAuditAction"
USING ("action"::"OperatorAuditAction"),
ALTER COLUMN "outcome" TYPE "OperatorAuditOutcome"
USING ("outcome"::"OperatorAuditOutcome");

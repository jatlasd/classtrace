-- This standalone audit table intentionally has no relation to deletable
-- teacher or workspace data. It stores identifiers, outcomes, and counts only.
CREATE TABLE "OperatorActionAudit" (
    "id" TEXT NOT NULL,
    "operatorClerkUserId" TEXT NOT NULL,
    "targetClerkUserId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "outcome" TEXT NOT NULL,
    "classGroupCount" INTEGER NOT NULL DEFAULT 0,
    "rosterStudentCount" INTEGER NOT NULL DEFAULT 0,
    "evidenceRecordCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "OperatorActionAudit_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "OperatorActionAudit_operatorClerkUserId_createdAt_idx"
ON "OperatorActionAudit"("operatorClerkUserId", "createdAt");

CREATE INDEX "OperatorActionAudit_targetClerkUserId_createdAt_idx"
ON "OperatorActionAudit"("targetClerkUserId", "createdAt");

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const projectRoot = process.cwd();
const schemaPath = join(projectRoot, "prisma", "schema.prisma");
const dbHelperPath = join(projectRoot, "lib", "db", "prisma.ts");
const envExamplePath = join(projectRoot, ".env.example");
const packageJsonPath = join(projectRoot, "package.json");
const evidenceNoteMigrationPath = join(
  projectRoot,
  "prisma",
  "migrations",
  "20260704000000_add_evidence_note_to_evidence_record",
  "migration.sql"
);
const workspaceIntegrityMigrationPath = join(
  projectRoot,
  "prisma",
  "migrations",
  "20260712000000_enforce_workspace_relation_integrity",
  "migration.sql"
);
const operatorAuditMigrationPath = join(
  projectRoot,
  "prisma",
  "migrations",
  "20260714000000_add_operator_action_audit",
  "migration.sql"
);

const schema = readFileSync(schemaPath, "utf8");
const envExample = readFileSync(envExamplePath, "utf8");
const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8")) as {
  scripts?: Record<string, string>;
};

function getPrismaModelFields(modelName: string): string[] {
  const model = schema.match(
    new RegExp(`model ${modelName} \\{([\\s\\S]*?)\\n\\}`)
  )?.[1];
  if (!model) return [];

  return model
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("@@"))
    .map((line) => line.split(/\s+/).slice(0, 2).join(" "));
}

function getMigrationColumns(migration: string): string[] {
  const table = migration.match(
    /CREATE TABLE "OperatorActionAudit" \(([\s\S]*?)\n\);/
  )?.[1];
  if (!table) return [];

  return table
    .split("\n")
    .map((line) => line.trim().replace(/,$/, ""))
    .filter((line) => line.startsWith('"'));
}

describe("Prisma database foundation", () => {
  it("defines V1 ownership models and relations", () => {
    expect(schema).toContain("model TeacherProfile");
    expect(schema).toContain("clerkUserId");
    expect(schema).toContain("model Workspace");
    expect(schema).toContain("model ClassGroup");
    expect(schema).toContain("model RosterStudent");
    expect(schema).toContain("model EvidenceRecord");
    expect(schema).toContain("workspaceId");
    expect(schema).toContain("rosterStudentId");
  });

  it("keeps permanent evidence structured and teacher validated", () => {
    expect(schema).toContain("summary");
    expect(schema).toContain("evidenceNote    String?");
    expect(schema).toContain("evidenceType");
    expect(schema).toContain("validatedAt");
    expect(schema).not.toMatch(/\b(rawNote|draftNote|originalText|prompt|aiSummary)\b/i);
  });

  it("adds nullable evidence notes without fabricating legacy note text", () => {
    expect(existsSync(evidenceNoteMigrationPath)).toBe(true);

    const migration = readFileSync(evidenceNoteMigrationPath, "utf8");

    expect(migration).toContain('ADD COLUMN "evidenceNote" TEXT');
    expect(migration).not.toMatch(/NOT NULL|UPDATE\s+"EvidenceRecord"|summary/i);
    expect(schema).not.toMatch(/\b(rawNote|draftText|originalCapture|sourceText|aiSummary)\b/i);
  });

  it("enforces same-workspace database relations without rewriting drifted data", () => {
    expect(existsSync(workspaceIntegrityMigrationPath)).toBe(true);

    const migration = readFileSync(workspaceIntegrityMigrationPath, "utf8");

    expect(schema).toContain("@@unique([workspaceId, id])");
    expect(schema).toContain(
      "@relation(fields: [workspaceId, rosterStudentId], references: [workspaceId, id], onDelete: Cascade)"
    );
    expect(schema).toContain(
      "@relation(fields: [workspaceId, classGroupId], references: [workspaceId, id], onDelete: SetNull)"
    );
    expect(migration).toContain(
      'FOREIGN KEY ("workspaceId", "rosterStudentId")'
    );
    expect(migration).toContain(
      'FOREIGN KEY ("workspaceId", "classGroupId")'
    );
    expect(migration).toContain('ON DELETE SET NULL ("classGroupId")');
    expect(migration).toContain("RAISE EXCEPTION");
    expect(migration).not.toMatch(/UPDATE\s+"(RosterStudent|EvidenceRecord)"/i);
  });
  it("does not add out-of-scope V1 models", () => {
    expect(schema).not.toMatch(/\b(model|enum)\s+(Organization|District|Admin|Membership|File|Attachment|Ai|AI|Embedding|Billing|Subscription|Sis|SIS)\b/);
  });

  it("defines the approved standalone operator audit without student data", () => {
    expect(existsSync(operatorAuditMigrationPath)).toBe(true);

    const migration = readFileSync(operatorAuditMigrationPath, "utf8");

    expect(getPrismaModelFields("OperatorActionAudit")).toEqual([
      "id String",
      "operatorClerkUserId String",
      "targetClerkUserId String",
      "action OperatorAuditAction",
      "outcome OperatorAuditOutcome",
      "classGroupCount Int",
      "rosterStudentCount Int",
      "evidenceRecordCount Int",
      "createdAt DateTime",
      "completedAt DateTime?",
    ]);
    expect(schema.match(/enum OperatorAuditAction \{([\s\S]*?)\n\}/)?.[1])
      .toMatch(/WORKSPACE_DATA_DELETE\s+CLERK_USER_DELETE/);
    expect(schema.match(/enum OperatorAuditOutcome \{([\s\S]*?)\n\}/)?.[1])
      .toMatch(/STARTED\s+SUCCEEDED\s+FAILED/);
    expect(migration).toContain('CREATE TABLE "OperatorActionAudit"');
    expect(getMigrationColumns(migration)).toEqual([
      '"id" TEXT NOT NULL',
      '"operatorClerkUserId" TEXT NOT NULL',
      '"targetClerkUserId" TEXT NOT NULL',
      '"action" "OperatorAuditAction" NOT NULL',
      '"outcome" "OperatorAuditOutcome" NOT NULL',
      '"classGroupCount" INTEGER NOT NULL DEFAULT 0',
      '"rosterStudentCount" INTEGER NOT NULL DEFAULT 0',
      '"evidenceRecordCount" INTEGER NOT NULL DEFAULT 0',
      '"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP',
      '"completedAt" TIMESTAMP(3)',
    ]);
    expect(migration).toContain(
      'CREATE TYPE "OperatorAuditAction" AS ENUM (\n' +
        "    'WORKSPACE_DATA_DELETE',\n" +
        "    'CLERK_USER_DELETE'\n" +
        ");"
    );
    expect(migration).toContain(
      'CREATE TYPE "OperatorAuditOutcome" AS ENUM (\n' +
        "    'STARTED',\n" +
        "    'SUCCEEDED',\n" +
        "    'FAILED'\n" +
        ");"
    );
    expect(migration).not.toMatch(/FOREIGN KEY|REFERENCES/i);
  });

  it("documents database environment variables and scripts", () => {
    expect(envExample).toContain("DATABASE_URL=");
    expect(envExample).not.toMatch(/^DIRECT_URL=/m);
    expect(packageJson.scripts?.postinstall).toBe("prisma generate");
    expect(packageJson.scripts?.prebuild).toBe("prisma generate");
    expect(packageJson.scripts?.pretest).toBe("prisma generate");
    expect(packageJson.scripts?.["db:generate"]).toBe("prisma generate");
    expect(packageJson.scripts?.["db:migrate"]).toBe("prisma migrate dev");
    expect(packageJson.scripts?.["db:migrate:deploy"]).toBe(
      "prisma migrate deploy"
    );
    expect(packageJson.scripts?.["db:studio"]).toBe("prisma studio");
  });

  it("has a server-only Prisma client helper", () => {
    expect(existsSync(dbHelperPath)).toBe(true);

    const dbHelper = readFileSync(dbHelperPath, "utf8");

    expect(dbHelper).toContain("server-only");
    expect(dbHelper).toContain("PrismaClient");
    expect(dbHelper).toContain("export const prisma");
  });
});

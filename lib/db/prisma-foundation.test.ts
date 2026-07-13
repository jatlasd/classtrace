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

const schema = readFileSync(schemaPath, "utf8");
const envExample = readFileSync(envExamplePath, "utf8");
const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8")) as {
  scripts?: Record<string, string>;
};

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

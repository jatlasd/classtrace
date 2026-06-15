import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const projectRoot = process.cwd();
const schemaPath = join(projectRoot, "prisma", "schema.prisma");
const dbHelperPath = join(projectRoot, "lib", "db", "prisma.ts");
const envExamplePath = join(projectRoot, ".env.example");
const packageJsonPath = join(projectRoot, "package.json");

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
    expect(schema).toContain("evidenceType");
    expect(schema).toContain("validatedAt");
    expect(schema).not.toMatch(/\b(rawNote|draftNote|originalText|prompt|aiSummary)\b/i);
  });

  it("does not add out-of-scope V1 models", () => {
    expect(schema).not.toMatch(/\b(model|enum)\s+(Organization|District|Admin|Membership|File|Attachment|Ai|AI|Embedding|Billing|Subscription|Sis|SIS)\b/);
  });

  it("documents database environment variables and scripts", () => {
    expect(envExample).toContain("DATABASE_URL=");
    expect(envExample).toContain("DIRECT_URL=");
    expect(packageJson.scripts?.postinstall).toBe("prisma generate");
    expect(packageJson.scripts?.prebuild).toBe("prisma generate");
    expect(packageJson.scripts?.pretest).toBe("prisma generate");
    expect(packageJson.scripts?.["db:generate"]).toBe("prisma generate");
    expect(packageJson.scripts?.["db:migrate"]).toBe("prisma migrate dev");
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

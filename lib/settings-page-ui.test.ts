import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const projectRoot = process.cwd();
const settingsPage = readFileSync(
  join(projectRoot, "app", "app", "settings", "page.tsx"),
  "utf8"
);
const signOutAction = readFileSync(
  join(projectRoot, "components", "settings", "settings-sign-out-action.tsx"),
  "utf8"
);
const settingsData = readFileSync(
  join(projectRoot, "lib", "settings", "settings-page-data.ts"),
  "utf8"
);
const prismaSchema = readFileSync(
  join(projectRoot, "prisma", "schema.prisma"),
  "utf8"
);

describe("Unit 22 settings page UI", () => {
  it("replaces the placeholder with account, workspace, and sign-out sections", () => {
    expect(settingsPage).toContain("getSettingsPageData");
    expect(settingsPage).toContain("Account and workspace");
    expect(settingsPage).toContain("Signed in as");
    expect(settingsPage).toContain("Email");
    expect(settingsPage).toContain("Workspace");
    expect(settingsPage).toContain("Teacher profile");
    expect(settingsPage).toContain("SettingsSignOutAction");
    expect(settingsPage).not.toContain("Settings coming soon");
  });

  it("keeps sign out as a small Clerk client boundary", () => {
    expect(signOutAction).toContain('"use client"');
    expect(signOutAction).toContain("SignOutButton");
    expect(signOutAction).toContain("redirectUrl={routes.root}");
    expect(signOutAction).toContain("aria-label=\"Sign out of ClassTrace\"");
    expect(signOutAction).toContain("Sign out");
  });

  it("keeps settings read-only and display-safe", () => {
    const combined = `${settingsPage}\n${signOutAction}\n${settingsData}`;

    expect(combined).not.toMatch(/<form|<input|textarea|contentEditable/);
    expect(combined).not.toMatch(/useActionState|useFormStatus|useState/);
    expect(settingsPage).not.toMatch(/workspaceId|teacherProfileId|clerkUserId/);
    expect(signOutAction).not.toMatch(/workspaceId|teacherProfileId|clerkUserId/);
    expect(prismaSchema).not.toMatch(/UserSetting|Preference|rawNote|draftText/);
  });

  it("does not introduce out-of-scope settings behavior or claims", () => {
    const combined = `${settingsPage}\n${signOutAction}`;

    expect(combined).not.toMatch(
      /\b(organization|district|admin|members|roles|billing|subscription|notifications|account deletion|delete account|workspace deletion|AI settings|FERPA-ready|compliance-ready|audit-ready|SIS|gradebook|IEP|parent communication|upload|integration)\b/i
    );
    expect(combined).not.toMatch(
      /Export evidence|all-student export|account export|data export/i
    );
  });
});

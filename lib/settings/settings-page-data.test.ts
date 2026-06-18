import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@clerk/nextjs/server", () => ({
  currentUser: vi.fn(),
}));
vi.mock("@/lib/auth/get-current-workspace", () => ({
  getCurrentWorkspace: vi.fn(),
}));
vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    teacherProfile: {
      findFirst: vi.fn(),
    },
    workspace: {
      findFirst: vi.fn(),
    },
  },
}));

import {
  getSettingsPageData,
  type SettingsPageDatabase,
} from "@/lib/settings/settings-page-data";

function buildDatabase() {
  const teacherProfileCalls: unknown[] = [];
  const workspaceCalls: unknown[] = [];
  const database = {
    teacherProfile: {
      findFirst: async (args) => {
        teacherProfileCalls.push(args);
        return { displayName: "Reading Teacher" };
      },
    },
    workspace: {
      findFirst: async (args) => {
        workspaceCalls.push(args);
        return { name: "Personal workspace" };
      },
    },
  } satisfies SettingsPageDatabase;

  return { database, teacherProfileCalls, workspaceCalls };
}

describe("getSettingsPageData", () => {
  it("reads settings display data through the trusted current workspace", async () => {
    const { database, teacherProfileCalls, workspaceCalls } = buildDatabase();

    const result = await getSettingsPageData({
      resolveWorkspace: async () => ({
        clerkUserId: "clerk_user_1",
        teacherProfileId: "teacher_profile_1",
        workspaceId: "workspace_1",
      }),
      getClerkUser: async () => ({
        fullName: "Mary Teacher",
        firstName: "Mary",
        lastName: "Teacher",
        primaryEmailAddress: {
          emailAddress: "mary@example.test",
        },
      }),
      database,
    });

    expect(teacherProfileCalls).toEqual([
      {
        where: {
          id: "teacher_profile_1",
        },
        select: {
          displayName: true,
        },
      },
    ]);
    expect(workspaceCalls).toEqual([
      {
        where: {
          id: "workspace_1",
          teacherProfileId: "teacher_profile_1",
        },
        select: {
          name: true,
        },
      },
    ]);
    expect(result).toEqual({
      accountName: "Mary Teacher",
      accountEmail: "mary@example.test",
      teacherDisplayName: "Reading Teacher",
      workspaceName: "Personal workspace",
    });
  });

  it("uses safe display fallbacks without exposing internal ids", async () => {
    const database = {
      teacherProfile: {
        findFirst: async () => null,
      },
      workspace: {
        findFirst: async () => null,
      },
    } satisfies SettingsPageDatabase;

    const result = await getSettingsPageData({
      resolveWorkspace: async () => ({
        clerkUserId: "clerk_user_1",
        teacherProfileId: "teacher_profile_1",
        workspaceId: "workspace_1",
      }),
      getClerkUser: async () => ({
        fullName: null,
        firstName: "  ",
        lastName: null,
        primaryEmailAddress: null,
      }),
      database,
    });

    expect(result).toEqual({
      accountName: "Name unavailable",
      accountEmail: "Email unavailable",
      teacherDisplayName: "Teacher",
      workspaceName: "Personal workspace",
    });
    expect(Object.values(result).join(" ")).not.toMatch(
      /workspace_1|teacher_profile_1|clerk_user_1/
    );
  });

  it("keeps settings data server-only and away from student evidence records", () => {
    const source = readFileSync(
      join(process.cwd(), "lib", "settings", "settings-page-data.ts"),
      "utf8"
    );

    expect(source).toContain('import "server-only"');
    expect(source).toContain("getCurrentWorkspace");
    expect(source).toContain("currentUser");
    expect(source).not.toMatch(/rosterStudent|evidenceRecord|rawNote|draftText/i);
    expect(source).not.toMatch(/create|update|delete|upsert|localStorage/);
  });
});

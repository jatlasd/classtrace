import "server-only";

import { currentUser } from "@clerk/nextjs/server";
import {
  getCurrentWorkspace,
  type CurrentWorkspace,
} from "@/lib/auth/get-current-workspace";
import { prisma } from "@/lib/db/prisma";

type TeacherProfileFindFirstArgs = {
  where: {
    id: string;
  };
  select: {
    displayName: true;
  };
};

type WorkspaceFindFirstArgs = {
  where: {
    id: string;
    teacherProfileId: string;
  };
  select: {
    name: true;
  };
};

type SettingsTeacherProfileFromDatabase = {
  displayName: string;
};

type SettingsWorkspaceFromDatabase = {
  name: string;
};

export type SettingsPageDatabase = {
  teacherProfile: {
    findFirst(
      args: TeacherProfileFindFirstArgs
    ): Promise<SettingsTeacherProfileFromDatabase | null>;
  };
  workspace: {
    findFirst(args: WorkspaceFindFirstArgs): Promise<SettingsWorkspaceFromDatabase | null>;
  };
};

type ClerkAccountUser = {
  fullName: string | null;
  firstName: string | null;
  lastName: string | null;
  primaryEmailAddress: {
    emailAddress: string;
  } | null;
};

type SettingsPageDependencies = {
  resolveWorkspace: () => Promise<CurrentWorkspace>;
  getClerkUser: () => Promise<ClerkAccountUser | null>;
  database: SettingsPageDatabase;
};

export type SettingsPageData = {
  accountName: string;
  accountEmail: string;
  teacherDisplayName: string;
  workspaceName: string;
};

const settingsPageDatabase: SettingsPageDatabase = {
  teacherProfile: {
    findFirst: (args) => prisma.teacherProfile.findFirst(args),
  },
  workspace: {
    findFirst: (args) => prisma.workspace.findFirst(args),
  },
};

function normalizedText(value: string | null | undefined): string {
  return value?.trim() ?? "";
}

function getAccountName(user: ClerkAccountUser | null): string {
  const fullName = normalizedText(user?.fullName);

  if (fullName) {
    return fullName;
  }

  const composedName = [
    normalizedText(user?.firstName),
    normalizedText(user?.lastName),
  ]
    .filter(Boolean)
    .join(" ");

  return composedName || "Name unavailable";
}

function getAccountEmail(user: ClerkAccountUser | null): string {
  return normalizedText(user?.primaryEmailAddress?.emailAddress) || "Email unavailable";
}

export async function getSettingsPageData(
  dependencies: SettingsPageDependencies = {
    resolveWorkspace: getCurrentWorkspace,
    getClerkUser: currentUser,
    database: settingsPageDatabase,
  }
): Promise<SettingsPageData> {
  const [workspace, user] = await Promise.all([
    dependencies.resolveWorkspace(),
    dependencies.getClerkUser(),
  ]);

  const [teacherProfile, personalWorkspace] = await Promise.all([
    dependencies.database.teacherProfile.findFirst({
      where: {
        id: workspace.teacherProfileId,
      },
      select: {
        displayName: true,
      },
    }),
    dependencies.database.workspace.findFirst({
      where: {
        id: workspace.workspaceId,
        teacherProfileId: workspace.teacherProfileId,
      },
      select: {
        name: true,
      },
    }),
  ]);

  return {
    accountName: getAccountName(user),
    accountEmail: getAccountEmail(user),
    teacherDisplayName:
      normalizedText(teacherProfile?.displayName) || "Teacher",
    workspaceName:
      normalizedText(personalWorkspace?.name) || "Personal workspace",
  };
}

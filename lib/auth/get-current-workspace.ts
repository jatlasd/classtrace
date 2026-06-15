import "server-only";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db/prisma";

export class CurrentWorkspaceError extends Error {
  constructor(
    public readonly code: "AUTH_REQUIRED",
    message: string
  ) {
    super(message);
    this.name = "CurrentWorkspaceError";
  }
}

export type CurrentWorkspace = {
  clerkUserId: string;
  teacherProfileId: string;
  workspaceId: string;
};

export async function getCurrentWorkspace(): Promise<CurrentWorkspace> {
  const { userId } = await auth();

  if (!userId) {
    throw new CurrentWorkspaceError(
      "AUTH_REQUIRED",
      "You must be signed in to access this workspace."
    );
  }

  const teacherProfile = await prisma.teacherProfile.upsert({
    where: { clerkUserId: userId },
    update: {},
    create: {
      clerkUserId: userId,
      displayName: "Teacher",
    },
    select: { id: true },
  });

  const workspace = await prisma.workspace.upsert({
    where: { teacherProfileId: teacherProfile.id },
    update: {},
    create: { teacherProfileId: teacherProfile.id },
    select: { id: true },
  });

  return {
    clerkUserId: userId,
    teacherProfileId: teacherProfile.id,
    workspaceId: workspace.id,
  };
}

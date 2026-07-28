import "server-only";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { hasAcceptedCurrentBetaAgreement } from "@/lib/beta-agreement/beta-agreement";
import { prisma } from "@/lib/db/prisma";
import { markSafeOperationStage } from "@/lib/monitoring/safe-error-diagnostic";
import { routes } from "@/lib/routes";

export class CurrentWorkspaceError extends Error {
  constructor(
    public readonly code: "AUTH_REQUIRED" | "BETA_AGREEMENT_REQUIRED",
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

type UniqueConstraintError = {
  code: "P2002";
};

function isUniqueConstraintError(
  error: unknown
): error is UniqueConstraintError {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2002"
  );
}

async function provisionCurrentWorkspace(
  clerkUserId: string
): Promise<CurrentWorkspace> {
  const teacherProfile = await prisma.teacherProfile.upsert({
    where: { clerkUserId },
    update: {},
    create: {
      clerkUserId,
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
    clerkUserId,
    teacherProfileId: teacherProfile.id,
    workspaceId: workspace.id,
  };
}

export async function getProvisionedCurrentWorkspace(): Promise<CurrentWorkspace> {
  const { userId } = await auth();

  if (!userId) {
    throw new CurrentWorkspaceError(
      "AUTH_REQUIRED",
      "You must be signed in to access this workspace."
    );
  }

  try {
    return await provisionCurrentWorkspace(userId);
  } catch (error) {
    if (!isUniqueConstraintError(error)) {
      throw error;
    }

    return provisionCurrentWorkspace(userId);
  }
}

export async function getCurrentWorkspace(): Promise<CurrentWorkspace> {
  try {
    const workspace = await getProvisionedCurrentWorkspace();
    const hasAccepted = await hasAcceptedCurrentBetaAgreement(
      workspace.teacherProfileId
    );

    if (!hasAccepted) {
      throw new CurrentWorkspaceError(
        "BETA_AGREEMENT_REQUIRED",
        "Complete the current beta agreement before accessing ClassTrace."
      );
    }

    return workspace;
  } catch (error) {
    throw markSafeOperationStage(error, "workspace.resolve");
  }
}

export async function getCurrentAppWorkspace(): Promise<CurrentWorkspace> {
  try {
    return await getCurrentWorkspace();
  } catch (error) {
    if (
      error instanceof CurrentWorkspaceError &&
      error.code === "BETA_AGREEMENT_REQUIRED"
    ) {
      redirect(routes.betaAcknowledgements);
    }

    throw error;
  }
}

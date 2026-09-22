"use server";

import { revalidatePath } from "next/cache";
import { captureOperationalError } from "@/lib/monitoring/capture-operational-error";
import { requireOperator } from "@/lib/operator/operator-auth";
import {
  deleteOperatorClerkUser,
  deleteOperatorWorkspaceData,
  listOperatorAccounts,
  seedOperatorDemoWorkspace,
  searchOperatorAccount,
  type DeleteClerkUserResult,
  type DeleteWorkspaceDataResult,
  type ListOperatorAccountsResult,
  type SeedDemoWorkspaceResult,
  type SearchOperatorAccountResult,
} from "@/lib/operator/operator-accounts";
import { routes } from "@/lib/routes";

export async function searchOperatorAccountAction(input: {
  email: string;
}): Promise<SearchOperatorAccountResult> {
  try {
    const operator = await requireOperator();
    return searchOperatorAccount({
      operatorClerkUserId: operator.clerkUserId,
      email: input.email,
    });
  } catch (error) {
    captureOperationalError("operator.account-search", error);
    return { success: false, error: "Account search is not available." };
  }
}

export async function listOperatorAccountsAction(input: {
  query?: string;
  offset?: number;
}): Promise<ListOperatorAccountsResult> {
  try {
    const operator = await requireOperator();
    return listOperatorAccounts({
      operatorClerkUserId: operator.clerkUserId,
      query: input.query,
      offset: input.offset,
    });
  } catch (error) {
    captureOperationalError("operator.account-directory", error);
    return { success: false, error: "The account directory is not available." };
  }
}

export async function seedOperatorDemoWorkspaceAction(input: {
  targetClerkUserId: string;
  confirmationEmail: string;
}): Promise<SeedDemoWorkspaceResult> {
  try {
    const operator = await requireOperator();
    const result = await seedOperatorDemoWorkspace({
      operatorClerkUserId: operator.clerkUserId,
      targetClerkUserId: input.targetClerkUserId,
      confirmationEmail: input.confirmationEmail,
    });

    if (result.success) revalidatePath(routes.operator);
    return result;
  } catch (error) {
    captureOperationalError("operator.demo-seed", error);
    return {
      success: false,
      error: "The selected workspace could not be replaced with demo data.",
    };
  }
}

export async function deleteOperatorWorkspaceDataAction(input: {
  targetClerkUserId: string;
  confirmationEmail: string;
}): Promise<DeleteWorkspaceDataResult> {
  try {
    const operator = await requireOperator();
    const result = await deleteOperatorWorkspaceData({
      operatorClerkUserId: operator.clerkUserId,
      targetClerkUserId: input.targetClerkUserId,
      confirmationEmail: input.confirmationEmail,
    });

    if (result.success) revalidatePath(routes.operator);
    return result;
  } catch (error) {
    captureOperationalError("operator.workspace-delete", error);
    return { success: false, error: "ClassTrace data could not be deleted." };
  }
}

export async function deleteOperatorClerkUserAction(input: {
  targetClerkUserId: string;
  confirmationEmail: string;
}): Promise<DeleteClerkUserResult> {
  try {
    const operator = await requireOperator();
    const result = await deleteOperatorClerkUser({
      operatorClerkUserId: operator.clerkUserId,
      targetClerkUserId: input.targetClerkUserId,
      confirmationEmail: input.confirmationEmail,
    });

    if (result.success || result.clerkUserDeleted) {
      revalidatePath(routes.operator);
    }
    return result;
  } catch (error) {
    captureOperationalError("operator.clerk-user-delete", error);
    return { success: false, error: "The Clerk user could not be deleted." };
  }
}

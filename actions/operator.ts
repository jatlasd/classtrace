"use server";

import { revalidatePath } from "next/cache";
import { requireOperator } from "@/lib/operator/operator-auth";
import {
  deleteOperatorClerkUser,
  deleteOperatorWorkspaceData,
  searchOperatorAccount,
  type DeleteClerkUserResult,
  type DeleteWorkspaceDataResult,
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
  } catch {
    console.error("[actions/operator/searchOperatorAccountAction] failed");
    return { success: false, error: "Account search is not available." };
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
  } catch {
    console.error("[actions/operator/deleteOperatorWorkspaceDataAction] failed");
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
  } catch {
    console.error("[actions/operator/deleteOperatorClerkUserAction] failed");
    return { success: false, error: "The Clerk user could not be deleted." };
  }
}

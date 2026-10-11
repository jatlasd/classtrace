"use server";

import { getCurrentWorkspace } from "@/lib/auth/get-current-workspace";
import type {
  ExploreQueryActionResult,
  ExploreQueryRequest,
  ExploreReportActionResult,
  ExploreReportRequest,
  ExploreSupportingEvidenceActionResult,
  ExploreSupportingEvidenceRequest,
} from "@/lib/evidence/explore-evidence-contract";
import {
  queryExploreEvidenceForWorkspace,
  queryExploreReportForWorkspace,
  queryExploreSupportingEvidenceForWorkspace,
} from "@/lib/evidence/explore-evidence";
import { captureOperationalError } from "@/lib/monitoring/capture-operational-error";

export async function runExploreEvidenceQuery(
  input: ExploreQueryRequest
): Promise<ExploreQueryActionResult> {
  try {
    const workspace = await getCurrentWorkspace();
    return await queryExploreEvidenceForWorkspace({
      workspaceId: workspace.workspaceId,
      input,
    });
  } catch (error) {
    captureOperationalError("evidence.explore", error);
    return {
      success: false,
      error: "We could not update these results. Try showing them again.",
    };
  }
}

export async function runExploreSupportingEvidenceQuery(
  input: ExploreSupportingEvidenceRequest
): Promise<ExploreSupportingEvidenceActionResult> {
  try {
    const workspace = await getCurrentWorkspace();
    return await queryExploreSupportingEvidenceForWorkspace({
      workspaceId: workspace.workspaceId,
      input,
    });
  } catch (error) {
    captureOperationalError("evidence.explore.supporting", error);
    return {
      success: false,
      error: "We could not load this supporting evidence. Try again.",
    };
  }
}

export async function runExploreReportQuery(
  input: ExploreReportRequest
): Promise<ExploreReportActionResult> {
  try {
    const workspace = await getCurrentWorkspace();
    return await queryExploreReportForWorkspace({
      workspaceId: workspace.workspaceId,
      input,
    });
  } catch (error) {
    captureOperationalError("evidence.explore.report", error);
    return {
      success: false,
      error: "We could not prepare this report. Try again.",
    };
  }
}

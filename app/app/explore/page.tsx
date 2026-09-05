import { ExploreEvidencePage } from "@/components/explore/explore-evidence-page";
import { getCurrentAppWorkspace } from "@/lib/auth/get-current-workspace";
import {
  DEFAULT_EXPLORE_QUERY,
  type ExploreDateExecutionContext,
} from "@/lib/evidence/explore-evidence-contract";
import {
  getExploreEvidenceOptionsForWorkspace,
  queryExploreEvidenceForWorkspace,
} from "@/lib/evidence/explore-evidence";

const INITIAL_DATE_CONTEXT: ExploreDateExecutionContext = {
  currentOffsetMinutes: 0,
  startOffsetMinutes: 0,
  endOffsetMinutes: 0,
};

export default async function ExplorePage() {
  const workspace = await getCurrentAppWorkspace();
  const [initialResponse, options] = await Promise.all([
    queryExploreEvidenceForWorkspace({
      workspaceId: workspace.workspaceId,
      input: {
        query: DEFAULT_EXPLORE_QUERY,
        page: 1,
        dateContext: INITIAL_DATE_CONTEXT,
      },
    }),
    getExploreEvidenceOptionsForWorkspace(workspace.workspaceId),
  ]);

  if (!initialResponse.success) {
    throw new Error("Explore Evidence could not load its initial results.");
  }

  return (
    <ExploreEvidencePage
      initialQuery={DEFAULT_EXPLORE_QUERY}
      initialResults={initialResponse.results}
      options={options}
    />
  );
}

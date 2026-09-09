export const EXPLORE_QUERY_VERSION = 1 as const;

export const EXPLORE_EVIDENCE_PAGE_SIZE = 25;
export const EXPLORE_STUDENT_PAGE_SIZE = 20;
export const EXPLORE_SUPPORTING_PAGE_SIZE = 10;
export const MAX_EXPLORE_PAGE = 10_000;

export type ExploreResultView = "evidence" | "students";
export type ExplorePhotoRule = "either" | "with" | "without";

export type ExploreDateCondition =
  | { rule: "all" }
  | { rule: "exact"; date: string }
  | { rule: "range"; startDate: string; endDate: string }
  | { rule: "last7" }
  | { rule: "last30" }
  | { rule: "thisMonth" };

export type ExploreEvidenceQuery = {
  version: typeof EXPLORE_QUERY_VERSION;
  resultView: ExploreResultView;
  studentIds: string[];
  tags: {
    includeAny: string[];
    includeAll: string[];
    exclude: string[];
  };
  date: ExploreDateCondition;
  classIds: string[];
  photo: ExplorePhotoRule;
};

export type ExploreDateExecutionContext = {
  currentOffsetMinutes: number;
  startOffsetMinutes: number;
  endOffsetMinutes: number;
};

export type ExploreQueryRequest = {
  query: ExploreEvidenceQuery;
  page: number;
  dateContext: ExploreDateExecutionContext;
};

export type ExploreSupportingEvidenceRequest = {
  query: ExploreEvidenceQuery;
  studentId: string;
  page: number;
  dateContext: ExploreDateExecutionContext;
};

export type ExploreEvidenceRecord = {
  id: string;
  rosterStudentId: string;
  studentDisplayName: string;
  studentMentionHandle: string;
  classGroupName?: string;
  evidenceDate: string;
  evidenceNote?: string;
  summary?: string;
  evidenceType?: string;
  hasPhoto: boolean;
  photoWidth?: number;
  photoHeight?: number;
  topic?: string;
  performance?: string;
  behavior?: string;
  tags: string[];
  followUpNeeded: boolean;
  followUpNotes?: string;
  validatedAt: string;
  createdAt: string;
};

export type ExploreResultCounts = {
  evidence: number;
  students: number;
};

export type ExploreEvidenceResults = {
  view: "evidence";
  counts: ExploreResultCounts;
  records: ExploreEvidenceRecord[];
  page: number;
  hasNewer: boolean;
  hasOlder: boolean;
};

export type ExploreStudentGroup = {
  id: string;
  displayName: string;
  mentionHandle: string;
  classGroupName?: string;
  matchingEvidenceCount: number;
};

export type ExploreStudentResults = {
  view: "students";
  counts: ExploreResultCounts;
  students: ExploreStudentGroup[];
  page: number;
  hasNewer: boolean;
  hasOlder: boolean;
};

export type ExploreQueryResults =
  | ExploreEvidenceResults
  | ExploreStudentResults;

export type ExploreQueryActionResult =
  | { success: true; results: ExploreQueryResults }
  | { success: false; error: string };

export type ExploreSupportingEvidenceActionResult =
  | {
      success: true;
      studentId: string;
      records: ExploreEvidenceRecord[];
      page: number;
      hasNewer: boolean;
      hasOlder: boolean;
    }
  | { success: false; error: string };

export type ExploreStudentOption = {
  id: string;
  label: string;
  description: string;
};

export type ExploreClassOption = {
  id: string;
  label: string;
  description?: string;
};

export type ExploreTagOption = {
  id: string;
  label: string;
};

export type ExploreEvidenceOptions = {
  students: ExploreStudentOption[];
  classes: ExploreClassOption[];
  tags: ExploreTagOption[];
};

export const DEFAULT_EXPLORE_QUERY: ExploreEvidenceQuery = {
  version: EXPLORE_QUERY_VERSION,
  resultView: "evidence",
  studentIds: [],
  tags: {
    includeAny: [],
    includeAll: [],
    exclude: [],
  },
  date: { rule: "all" },
  classIds: [],
  photo: "either",
};

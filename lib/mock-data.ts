export const teacher = {
  name: "Ms. Rivera",
  role: "5th Grade Math",
  initials: "MR",
};

export type Capture = {
  id: string;
  note: string;
  students: string[];
  tags: string[];
  evidenceType: string;
  timestamp: string;
  summary: string;
  followUp?: boolean;
  primaryStudent: string;
};

export const recentCaptures: Capture[] = [];

export const studentColors: Record<string, string> = {
  Jeremy: "bg-sky-500",
  Stacy: "bg-rose-400",
  Jeff: "bg-teal-500",
  Mary: "bg-violet-500",
};

export const featuredStudent = {
  name: "Jeremy",
  grade: "5th Grade Math",
  captureCount: 2,
  strengths:
    "Responds well to verbal prompts during fractions work; re-engages quickly once redirected.",
  milestones:
    "Beginning to multiply fractions with support; needs consistency on task initiation.",
  concerns:
    "Off-task during independent practice; may need chunked assignments or proximity checks.",
  recentTags: [
    { tag: "fractions", count: 2 },
    { tag: "behavior", count: 1 },
    { tag: "prompted", count: 1 },
    { tag: "smallgroup", count: 1 },
  ],
  upcoming: [
    {
      title: "Fractions unit check-in",
      date: "Thu, May 29",
      status: "Prepare",
    },
    {
      title: "Parent conference — progress notes",
      date: "Mon, Jun 2",
      status: "Draft",
    },
  ],
};

export const popularTags: string[] = [];

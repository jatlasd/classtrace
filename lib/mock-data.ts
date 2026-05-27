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
  attachment?: "notebook" | "photo";
  primaryStudent: string;
};

export const recentCaptures: Capture[] = [
  {
    id: "1",
    note: "@Jeremy was off-task during multiplying fractions review but got started after a verbal prompt. #behavior #fractions #prompted",
    students: ["Jeremy"],
    tags: ["behavior", "fractions", "prompted"],
    evidenceType: "Behavior",
    timestamp: "Today at 10:42 AM",
    summary:
      "Needed verbal prompt to engage with fractions review; responded positively once prompted.",
    followUp: true,
    primaryStudent: "Jeremy",
  },
  {
    id: "2",
    note: "@Stacy solved two-step word problems independently during small group. #math #problem-solving #independent",
    students: ["Stacy"],
    tags: ["math", "problem-solving", "independent"],
    evidenceType: "Academic",
    timestamp: "Today at 10:18 AM",
    summary:
      "Demonstrated independent problem-solving with two-step word problems in small group.",
    attachment: "notebook",
    primaryStudent: "Stacy",
  },
  {
    id: "3",
    note: "@Jeff needed reteaching on dividing fractions when the divisor was a mixed number. #fractions #reteach",
    students: ["Jeff"],
    tags: ["fractions", "reteach"],
    evidenceType: "Intervention",
    timestamp: "Today at 9:55 AM",
    summary:
      "Required one-on-one reteach for dividing fractions with mixed-number divisors.",
    followUp: true,
    primaryStudent: "Jeff",
  },
  {
    id: "4",
    note: "Small group with @Jeremy @Mary showed confusion converting mixed numbers before multiplying. #smallgroup #fractions #review",
    students: ["Jeremy", "Mary"],
    tags: ["smallgroup", "fractions", "review"],
    evidenceType: "Small Group",
    timestamp: "Today at 9:30 AM",
    summary:
      "Both students needed support converting mixed numbers prior to multiplication step.",
    primaryStudent: "Jeremy",
  },
];

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

export const popularTags = [
  "fractions",
  "behavior",
  "prompted",
  "smallgroup",
  "reteach",
  "independent",
];

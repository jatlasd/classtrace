import { INPUT_LIMITS } from "../lib/validation/input-limits.ts";

export const DEMO_CLERK_USER_ID = "user_3HQButQuO16dX0RvhZbZ7jtQb2m";
export const DEMO_DATASET_VERSION = "2026-27-school-fall-v3";
export const DEMO_DATABASE_IDENTITY = Object.freeze({
  projectId: "floral-forest-27181712",
  branchId: "br-wild-recipe-atxbdvko",
  databaseName: "neondb",
});

const ALLOWED_STUDENT_NAMES = new Set([
  "Jeremy", "Stacy", "Jeff", "Mary", "Nina", "Caleb", "Owen",
  "Tessa", "Jonah", "Iris", "Rowan", "Eli", "Lena", "Miles",
]);
const ALLOWED_EVIDENCE_TYPES = new Set([
  "Academic check-in",
  "General observation",
  "Behavior observation",
  "Assessment observation",
  "Accommodation log",
  "Progress monitoring",
  "Communication log",
]);
const DATASET_START = Date.parse("2026-08-31T00:00:00.000-04:00");
const DATASET_END = Date.parse("2026-09-15T23:59:59.999-04:00");
const LABOR_DAY = Date.UTC(2026, 8, 7);

const classes = [
  {
    id: "demo_class_math_support_2026",
    name: "6th Grade Math Support",
    nameKey: "6th grade math support",
    createdAt: "2026-08-31T11:30:00.000Z",
  },
  {
    id: "demo_class_ela_support_2026",
    name: "7th Grade ELA Support",
    nameKey: "7th grade ela support",
    createdAt: "2026-08-31T11:32:00.000Z",
  },
  {
    id: "demo_class_study_skills_2026",
    name: "8th Grade Study Skills",
    nameKey: "8th grade study skills",
    createdAt: "2026-08-31T11:35:00.000Z",
  },
];

const students = [
  {
    id: "demo_student_jeremy_2026",
    classId: "demo_class_math_support_2026",
    displayName: "Jeremy",
    mentionHandle: "jeremy",
    schoolLocalId: null,
    createdAt: "2026-08-31T11:40:00.000Z",
  },
  {
    id: "demo_student_stacy_2026",
    classId: "demo_class_math_support_2026",
    displayName: "Stacy",
    mentionHandle: "stacy",
    schoolLocalId: null,
    createdAt: "2026-08-31T11:41:00.000Z",
  },
  {
    id: "demo_student_jeff_2026",
    classId: "demo_class_ela_support_2026",
    displayName: "Jeff",
    mentionHandle: "jeff",
    schoolLocalId: null,
    createdAt: "2026-08-31T11:42:00.000Z",
  },
  {
    id: "demo_student_mary_2026",
    classId: "demo_class_ela_support_2026",
    displayName: "Mary",
    mentionHandle: "mary",
    schoolLocalId: null,
    createdAt: "2026-08-31T11:43:00.000Z",
  },
  {
    id: "demo_student_nina_2026",
    classId: "demo_class_math_support_2026",
    displayName: "Nina",
    mentionHandle: "nina",
    schoolLocalId: null,
    createdAt: "2026-08-31T11:44:00.000Z",
  },
  {
    id: "demo_student_caleb_2026",
    classId: "demo_class_math_support_2026",
    displayName: "Caleb",
    mentionHandle: "caleb",
    schoolLocalId: null,
    createdAt: "2026-08-31T11:45:00.000Z",
  },
  {
    id: "demo_student_owen_2026",
    classId: "demo_class_math_support_2026",
    displayName: "Owen",
    mentionHandle: "owen",
    schoolLocalId: null,
    createdAt: "2026-08-31T11:46:00.000Z",
  },
  {
    id: "demo_student_tessa_2026",
    classId: "demo_class_ela_support_2026",
    displayName: "Tessa",
    mentionHandle: "tessa",
    schoolLocalId: null,
    createdAt: "2026-08-31T11:47:00.000Z",
  },
  {
    id: "demo_student_jonah_2026",
    classId: "demo_class_ela_support_2026",
    displayName: "Jonah",
    mentionHandle: "jonah",
    schoolLocalId: null,
    createdAt: "2026-08-31T11:48:00.000Z",
  },
  {
    id: "demo_student_iris_2026",
    classId: "demo_class_ela_support_2026",
    displayName: "Iris",
    mentionHandle: "iris",
    schoolLocalId: null,
    createdAt: "2026-09-10T11:52:00.000Z",
  },
  {
    id: "demo_student_rowan_2026",
    classId: "demo_class_study_skills_2026",
    displayName: "Rowan",
    mentionHandle: "rowan",
    schoolLocalId: null,
    createdAt: "2026-08-31T11:49:00.000Z",
  },
  {
    id: "demo_student_eli_2026",
    classId: "demo_class_study_skills_2026",
    displayName: "Eli",
    mentionHandle: "eli",
    schoolLocalId: null,
    createdAt: "2026-08-31T11:50:00.000Z",
  },
  {
    id: "demo_student_lena_2026",
    classId: "demo_class_study_skills_2026",
    displayName: "Lena",
    mentionHandle: "lena",
    schoolLocalId: null,
    createdAt: "2026-08-31T11:51:00.000Z",
  },
  {
    id: "demo_student_miles_2026",
    classId: "demo_class_study_skills_2026",
    displayName: "Miles",
    mentionHandle: "miles",
    schoolLocalId: null,
    createdAt: "2026-09-08T11:48:00.000Z",
  },
];

const authoredEvidence = {
  jeremy: [
    {
      at: "2026-08-31T09:05:00.000-04:00",
      note: "had a really hard time staying focused today",
      type: "Academic check-in",
      topic: "decimal addition",
      performance: "struggling",
      behavior: ["attention"],
      tags: ["math","focus"],
      followUpNotes: ["Check in during tomorrow's warmup"],
    },
    {
      at: "2026-09-01T09:18:00.000-04:00",
      note: "needed three reminders to get back to the practice problems",
      type: "Behavior observation",
      topic: "independent work",
      behavior: ["off task","attention"],
      tags: ["focus","behavior"],
    },
    {
      at: "2026-09-01T09:31:00.000-04:00",
      note: "got 4 out of 10 on the decimal exit ticket and mixed up place values",
      type: "Assessment observation",
      topic: "decimal addition",
      performance: "incorrect",
      tags: ["math","assessment"],
      followUpNotes: ["Reteach place-value alignment in small group"],
    },
    {
      at: "2026-09-02T09:22:00.000-04:00",
      note: "worked one problem at a time after I covered the rest of the page",
      type: "Accommodation log",
      topic: "decimal addition",
      performance: "needed support",
      tags: ["math","support"],
    },
    {
      at: "2026-09-03T09:03:00.000-04:00",
      note: "forgot homework",
      type: "General observation",
      topic: "organization",
      behavior: ["organization"],
      tags: ["homework","organization"],
    },
    {
      at: "2026-09-03T15:42:00.000-04:00",
      note: "called home about the missing work. family is going to check the folder tonight",
      type: "Communication log",
      topic: "missing work",
      tags: ["homework","communication"],
    },
    {
      at: "2026-09-04T09:06:00.000-04:00",
      note: "remembered to ask for missing work when out",
      type: "Academic check-in",
      topic: "organization",
      performance: "improving",
      tags: ["self-advocacy","organization"],
    },
    {
      at: "2026-09-08T09:19:00.000-04:00",
      note: "refused to answer when called on and put his pencil down",
      type: "Behavior observation",
      topic: "variables",
      behavior: ["refusal"],
      tags: ["behavior","math"],
      followUpNotes: ["Offer a private check-in before the next discussion"],
    },
    {
      at: "2026-09-09T09:08:00.000-04:00",
      note: "apologized for getting an attitude and came back ready to work",
      type: "General observation",
      topic: "self-regulation",
      behavior: ["repair"],
      tags: ["behavior","progress"],
    },
    {
      at: "2026-09-09T09:34:00.000-04:00",
      note: "moved himself to another spot to focus and finished the last four equations",
      type: "Academic check-in",
      topic: "equations",
      performance: "independent",
      behavior: ["attention"],
      tags: ["focus","math"],
    },
    {
      at: "2026-09-10T09:26:00.000-04:00",
      note: "was finally able to explain variables in his own words",
      type: "Progress monitoring",
      topic: "equations",
      performance: "improving",
      tags: ["progress","math"],
    },
    {
      at: "2026-09-10T09:38:00.000-04:00",
      note: "got 6 out of 10 on equations. still subtracting when he needs to add",
      type: "Assessment observation",
      topic: "equations",
      performance: "needed support",
      tags: ["assessment","math"],
    },
    {
      at: "2026-09-11T09:16:00.000-04:00",
      note: "asked a really good question and sparked discussion",
      type: "Academic check-in",
      topic: "variables",
      performance: "independent",
      behavior: ["participation"],
      tags: ["participation","math"],
    },
    {
      at: "2026-09-14T09:11:00.000-04:00",
      note: "on point today - finished the warmup without a reminder",
      type: "General observation",
      topic: "equations",
      performance: "independent",
      tags: ["math","focus"],
    },
    {
      at: "2026-09-14T09:29:00.000-04:00",
      note: "decimal warmup was rough again. got started once the place-value chart was out",
      type: "Academic check-in",
      topic: "decimal addition",
      performance: "needed support",
      tags: ["math","support"],
      followUpNotes: ["Keep the chart in his math folder"],
    },
    {
      at: "2026-09-15T09:04:00.000-04:00",
      note: "found two finished math pages folded up in the back of his folder",
      type: "General observation",
      topic: "organization",
      behavior: ["organization"],
      tags: ["organization","homework"],
    },
    {
      at: "2026-09-15T09:12:00.000-04:00",
      note: "only the first two done today. checked in twice, rest of the page still blank",
      type: "Academic check-in",
      topic: "independent work",
      performance: "incomplete",
      tags: ["math","work-completion"],
      followUpNotes: ["Sit with him for the first word problem tomorrow"],
    },
  ],
  stacy: [
    {
      at: "2026-08-31T09:27:00.000-04:00",
      note: "struggling with decimal addition and kept lining the numbers up from the left",
      type: "Academic check-in",
      topic: "decimal addition",
      performance: "struggling",
      tags: ["math","decimal-addition"],
      followUpNotes: ["Review place-value alignment tomorrow"],
    },
    {
      at: "2026-09-01T09:14:00.000-04:00",
      note: "raised her hand to answer a question!",
      type: "General observation",
      topic: "decimal addition",
      behavior: ["participation"],
      tags: ["participation","math"],
    },
    {
      at: "2026-09-01T09:32:00.000-04:00",
      note: "used the place-value chart for every problem and did not need me to point to it",
      type: "Accommodation log",
      topic: "decimal addition",
      performance: "needed support",
      tags: ["math","support"],
    },
    {
      at: "2026-09-02T09:36:00.000-04:00",
      note: "got 6 out of 10 on the quiz. regrouping errors on three problems",
      type: "Assessment observation",
      topic: "decimal addition",
      performance: "incorrect",
      tags: ["assessment","math"],
      followUpNotes: ["Practice regrouping in the next small group"],
    },
    {
      at: "2026-09-03T09:21:00.000-04:00",
      note: "stared off into space for a while today and only finished half the practice",
      type: "Academic check-in",
      topic: "math practice",
      performance: "incomplete",
      behavior: ["attention"],
      tags: ["focus","math"],
    },
    {
      at: "2026-09-04T09:04:00.000-04:00",
      note: "had the quiz corrections done, just forgot to turn them in",
      type: "General observation",
      topic: "quiz corrections",
      tags: ["organization","assessment"],
    },
    {
      at: "2026-09-08T09:17:00.000-04:00",
      note: "asked what the question was really asking before she started the word problem",
      type: "General observation",
      topic: "word problems",
      behavior: ["self-advocacy"],
      tags: ["self-advocacy","math"],
    },
    {
      at: "2026-09-09T09:33:00.000-04:00",
      note: "completed all six decimal problems after one worked example",
      type: "Academic check-in",
      topic: "decimal addition",
      performance: "needed support",
      tags: ["math","support"],
    },
    {
      at: "2026-09-10T09:07:00.000-04:00",
      note: "borrowed a pencil, got going with everyone else",
      type: "General observation",
      tags: ["math"],
    },
    {
      at: "2026-09-11T09:35:00.000-04:00",
      note: "used extra time and checked her answers with the calculator",
      type: "Accommodation log",
      topic: "decimal operations",
      performance: "independent",
      tags: ["math","support"],
    },
    {
      at: "2026-09-11T09:38:00.000-04:00",
      note: "7 out of 10 this time. lined them up right but still missed the regrouping",
      type: "Assessment observation",
      topic: "decimal operations",
      performance: "needed support",
      tags: ["assessment","math"],
    },
    {
      at: "2026-09-14T09:24:00.000-04:00",
      note: "explained why the decimal points need to line up to her partner",
      type: "Progress monitoring",
      topic: "decimal addition",
      performance: "improving",
      tags: ["progress","math"],
    },
    {
      at: "2026-09-15T09:33:00.000-04:00",
      note: "picked addition for both word problems. we circled what each one was asking and she changed the second one",
      type: "Academic check-in",
      topic: "word problems",
      performance: "needed support",
      tags: ["math","support"],
      followUpNotes: ["Try another pair of word problems on Thursday"],
    },
  ],
  jeff: [
    {
      at: "2026-08-31T13:18:00.000-04:00",
      note: "really into this chapter of the read aloud",
      type: "General observation",
      topic: "comprehension",
      behavior: ["participation"],
      tags: ["reading","participation"],
    },
    {
      at: "2026-09-01T13:26:00.000-04:00",
      note: "head down for most of independent reading. read when I sat nearby",
      type: "General observation",
      topic: "independent reading",
      behavior: ["attention"],
      tags: ["focus","reading"],
      followUpNotes: ["Check in about the best time and place for reading"],
    },
    {
      at: "2026-09-02T13:32:00.000-04:00",
      note: "had a hard time finding the main idea even after rereading",
      type: "Academic check-in",
      topic: "main idea",
      performance: "struggling",
      tags: ["reading","comprehension"],
    },
    {
      at: "2026-09-03T13:34:00.000-04:00",
      note: "finished the written response when the directions were read aloud and chunked",
      type: "Accommodation log",
      topic: "written response",
      performance: "needed support",
      tags: ["writing","support"],
    },
    {
      at: "2026-09-04T13:11:00.000-04:00",
      note: "volunteered to read out loud",
      type: "General observation",
      topic: "oral reading",
      behavior: ["participation"],
      tags: ["reading","participation"],
    },
    {
      at: "2026-09-08T13:22:00.000-04:00",
      note: "sent to reset room after yelling across the room. came back for the last ten minutes",
      type: "Behavior observation",
      topic: "self-regulation",
      behavior: ["disruption"],
      tags: ["behavior","self-regulation"],
      followUpNotes: ["Check in before reading group tomorrow"],
    },
    {
      at: "2026-09-08T15:48:00.000-04:00",
      note: "called home after the reset room. shared what happened and that he came back to class",
      type: "Communication log",
      topic: "self-regulation",
      tags: ["behavior","communication"],
    },
    {
      at: "2026-09-09T13:28:00.000-04:00",
      note: "apologized for getting an attitude. read along with the group today",
      type: "General observation",
      tags: ["reading","participation"],
    },
    {
      at: "2026-09-10T13:19:00.000-04:00",
      note: "answered the inference question after I asked him to point to one clue",
      type: "Academic check-in",
      topic: "inference",
      performance: "needed support",
      tags: ["reading","support"],
    },
    {
      at: "2026-09-11T13:37:00.000-04:00",
      note: "underlined two clues in the passage. got 3 out of 5 on the exit ticket",
      type: "Assessment observation",
      topic: "supporting details",
      performance: "needed support",
      tags: ["assessment","reading"],
    },
    {
      at: "2026-09-14T13:16:00.000-04:00",
      note: "read the same short passage as last week. fewer stops, still skipping the endings on longer words",
      type: "Progress monitoring",
      topic: "oral reading",
      performance: "needed support",
      tags: ["reading","progress"],
    },
    {
      at: "2026-09-15T13:29:00.000-04:00",
      note: "talked through the answer with me but only wrote one sentence before time was up",
      type: "Academic check-in",
      topic: "written response",
      performance: "incomplete",
      tags: ["writing","work-completion"],
      followUpNotes: ["Leave a few minutes to finish the response tomorrow"],
    },
  ],
  mary: [
    {
      at: "2026-08-31T13:06:00.000-04:00",
      note: "on point today",
      type: "General observation",
      topic: "reading discussion",
      behavior: ["participation"],
      tags: ["reading","participation"],
    },
    {
      at: "2026-09-01T13:23:00.000-04:00",
      note: "asked a really good question about why the character went back",
      type: "Academic check-in",
      topic: "text evidence",
      performance: "independent",
      tags: ["reading","participation"],
    },
    {
      at: "2026-09-02T13:35:00.000-04:00",
      note: "included three details in the paragraph but did not have a clear topic sentence",
      type: "Assessment observation",
      topic: "paragraph organization",
      performance: "needed support",
      tags: ["assessment","writing"],
      followUpNotes: ["Conference on topic sentences during writing group"],
    },
    {
      at: "2026-09-03T13:17:00.000-04:00",
      note: "volunteered to read out loud",
      type: "Academic check-in",
      topic: "oral reading",
      performance: "independent",
      tags: ["reading","participation"],
    },
    {
      at: "2026-09-04T13:31:00.000-04:00",
      note: "erased the opening sentence three times. left it for now and wrote the middle",
      type: "Academic check-in",
      topic: "revision",
      tags: ["writing","support"],
      followUpNotes: ["Let her talk through the opening before she writes"],
      performance: "needed support",
    },
    {
      at: "2026-09-08T13:24:00.000-04:00",
      note: "book out, read quietly, finished the response",
      type: "General observation",
      tags: ["reading","work-completion"],
    },
    {
      at: "2026-09-09T13:33:00.000-04:00",
      note: "used the graphic organizer. moved one detail to a different box before writing",
      type: "Accommodation log",
      topic: "paragraph organization",
      performance: "needed support",
      tags: ["writing","support"],
    },
    {
      at: "2026-09-10T13:36:00.000-04:00",
      note: "topic sentence fits this paragraph better than the first one. still had to remind her to explain the last detail",
      type: "Progress monitoring",
      topic: "paragraph organization",
      performance: "needed support",
      tags: ["writing","progress"],
    },
    {
      at: "2026-09-14T13:08:00.000-04:00",
      note: "remembered to ask for missing work when out",
      type: "Academic check-in",
      topic: "organization",
      behavior: ["self-advocacy"],
      tags: ["self-advocacy","organization"],
    },
    {
      at: "2026-09-15T13:38:00.000-04:00",
      note: "good ideas in discussion, ran out of time on the written part",
      type: "Academic check-in",
      topic: "written response",
      performance: "incomplete",
      behavior: ["participation"],
      tags: ["writing","participation"],
    },
  ],
  nina: [
    {
      at: "2026-08-31T09:24:00.000-04:00",
      note: "finished the warmup before I got around to her table",
      type: "General observation",
      tags: ["math","work-completion"],
    },
    {
      at: "2026-09-03T09:28:00.000-04:00",
      note: "can do the subtraction until there is a zero in the top number. then gets stuck",
      type: "Academic check-in",
      topic: "decimal subtraction",
      performance: "struggling",
      tags: ["math","decimal-subtraction"],
      followUpNotes: ["Pull a couple examples with zeros for small group"],
    },
    {
      at: "2026-09-08T09:25:00.000-04:00",
      note: "used grid paper to keep the columns straight",
      type: "Accommodation log",
      topic: "decimal subtraction",
      performance: "needed support",
      tags: ["math","support"],
    },
    {
      at: "2026-09-11T09:36:00.000-04:00",
      note: "4 out of 6. both mistakes were regrouping across a zero",
      type: "Assessment observation",
      topic: "decimal subtraction",
      performance: "incorrect",
      tags: ["math","assessment"],
    },
    {
      at: "2026-09-14T09:23:00.000-04:00",
      note: "asked for grid paper again",
      type: "General observation",
      tags: ["support","self-advocacy"],
    },
  ],
  caleb: [
    {
      at: "2026-09-02T09:35:00.000-04:00",
      note: "got the answers right but no work on the page",
      type: "Academic check-in",
      topic: "decimal addition",
      performance: "correct",
      tags: ["math","work-completion"],
    },
    {
      at: "2026-09-11T09:06:00.000-04:00",
      note: "forgot homework. started the warmup while I found another copy",
      type: "General observation",
      topic: "organization",
      tags: ["homework","organization"],
    },
  ],
  owen: [
    {
      at: "2026-09-04T09:32:00.000-04:00",
      note: "quiet today, finished the practice and put it in the tray",
      type: "General observation",
      tags: ["math","work-completion"],
    },
  ],
  tessa: [
    {
      at: "2026-09-01T13:14:00.000-04:00",
      note: "had plenty to say to her partner, passed when it was her turn with the whole group",
      type: "General observation",
      topic: "class discussion",
      behavior: ["participation"],
      tags: ["reading","participation"],
    },
    {
      at: "2026-09-08T13:32:00.000-04:00",
      note: "copied a whole chunk of the passage for her answer. not sure which sentence she needs",
      type: "Academic check-in",
      topic: "text evidence",
      performance: "struggling",
      tags: ["reading","writing"],
      followUpNotes: ["Have her choose just one sentence with me"],
    },
    {
      at: "2026-09-10T13:38:00.000-04:00",
      note: "read the directions together. she wrote the first answer and wanted me to check it before going on",
      type: "Accommodation log",
      topic: "written response",
      performance: "needed support",
      tags: ["writing","support"],
    },
    {
      at: "2026-09-15T13:27:00.000-04:00",
      note: "same thing with text evidence today, copied most of the paragraph",
      type: "Academic check-in",
      topic: "text evidence",
      performance: "struggling",
      tags: ["reading","writing"],
    },
  ],
  jonah: [
    {
      at: "2026-09-02T13:09:00.000-04:00",
      note: "remembered exactly where we stopped in the book",
      type: "General observation",
      tags: ["reading"],
    },
    {
      at: "2026-09-09T13:13:00.000-04:00",
      note: "kept talking while his partner was reading. stopped after I moved closer",
      type: "Behavior observation",
      topic: "partner reading",
      behavior: ["redirection"],
      tags: ["reading","behavior"],
    },
    {
      at: "2026-09-14T13:22:00.000-04:00",
      note: "picked a detail that fits, explanation just repeats it",
      type: "Academic check-in",
      topic: "text evidence",
      performance: "needed support",
      tags: ["reading","writing"],
    },
  ],
  iris: [
    {
      at: "2026-09-11T13:07:00.000-04:00",
      note: "found the page with a little help and followed along",
      type: "General observation",
      tags: ["reading","support"],
    },
  ],
  rowan: [
    {
      at: "2026-08-31T14:12:00.000-04:00",
      note: "loose papers in every section of the binder",
      type: "General observation",
      topic: "organization",
      behavior: ["organization"],
      tags: ["organization"],
    },
    {
      at: "2026-09-02T14:19:00.000-04:00",
      note: "sorted the papers with me. two assignments were already done but never turned in",
      type: "Accommodation log",
      topic: "missing work",
      performance: "needed support",
      tags: ["organization","work-completion"],
    },
    {
      at: "2026-09-04T14:08:00.000-04:00",
      note: "planner still blank. copied the assignments when I pointed to the board",
      type: "Academic check-in",
      topic: "planner",
      performance: "needed support",
      tags: ["organization","homework"],
      followUpNotes: ["Check the planner before he leaves this week"],
    },
    {
      at: "2026-09-08T14:24:00.000-04:00",
      note: "finished the science questions here and put them straight in the turn-in folder",
      type: "General observation",
      tags: ["work-completion","organization"],
    },
    {
      at: "2026-09-08T15:56:00.000-04:00",
      note: "emailed home about the folder. asked them to send it back even if the work is unfinished",
      type: "Communication log",
      topic: "missing work",
      tags: ["organization","communication"],
    },
    {
      at: "2026-09-09T14:17:00.000-04:00",
      note: "folder made it back, planner did not",
      type: "General observation",
      topic: "organization",
      tags: ["organization","homework"],
    },
    {
      at: "2026-09-15T14:26:00.000-04:00",
      note: "started the science sheet, got through three questions. needs the book to finish and left it in the other room",
      type: "Academic check-in",
      topic: "independent work",
      performance: "incomplete",
      tags: ["organization","work-completion"],
    },
  ],
  eli: [
    {
      at: "2026-09-01T14:15:00.000-04:00",
      note: "spent most of the period looking for the assignment. it was in the front pocket",
      type: "General observation",
      topic: "organization",
      tags: ["organization","work-completion"],
    },
    {
      at: "2026-09-08T14:21:00.000-04:00",
      note: "set a ten minute timer and got the first section done",
      type: "Accommodation log",
      topic: "work initiation",
      performance: "needed support",
      tags: ["focus","support"],
    },
    {
      at: "2026-09-14T14:11:00.000-04:00",
      note: "needed a few reminders to close the game and open the assignment",
      type: "Behavior observation",
      topic: "work initiation",
      behavior: ["off task","redirection"],
      tags: ["focus","behavior"],
    },
  ],
  lena: [
    {
      at: "2026-09-03T14:18:00.000-04:00",
      note: "used the whole period to finish the history questions. nothing missing today",
      type: "General observation",
      tags: ["work-completion"],
    },
    {
      at: "2026-09-11T14:09:00.000-04:00",
      note: "asked if she could quiz herself with the vocabulary cards when her work was done",
      type: "General observation",
      tags: ["self-advocacy"],
    },
  ],
  miles: [
    {
      at: "2026-09-10T14:16:00.000-04:00",
      note: "brought his folder and got started without a check-in",
      type: "General observation",
      tags: ["organization","work-completion"],
    },
  ],
};

function addMinutes(isoTimestamp, minutes) {
  return new Date(Date.parse(isoTimestamp) + minutes * 60_000).toISOString();
}

function buildSummary(studentName, record) {
  return [
    studentName,
    record.topic,
    record.performance,
    record.behavior?.join(", "),
    record.type,
  ]
    .filter(Boolean)
    .join(" \u00b7 ");
}

const studentsByHandle = new Map(
  students.map((student) => [student.mentionHandle, student])
);

const evidence = Object.entries(authoredEvidence).flatMap(
  ([studentHandle, records]) => {
    const student = studentsByHandle.get(studentHandle);
    if (!student) {
      throw new Error("Demo evidence references an unknown student handle.");
    }

    return records.map((record, index) => {
      const validatedAt = addMinutes(record.at, 20);
      const followUpNotes = record.followUpNotes ?? [];

      return {
        id: `demo_evidence_${studentHandle}_${String(index + 1).padStart(2, "0")}`,
        studentId: student.id,
        classId: student.classId,
        evidenceDate: new Date(record.at).toISOString(),
        evidenceNote: record.note,
        summary: buildSummary(student.displayName, record),
        evidenceType: record.type,
        topic: record.topic ?? null,
        performance: record.performance ?? null,
        behavior: record.behavior ?? [],
        tags: record.tags,
        followUpNeeded: followUpNotes.length > 0,
        followUpNotes,
        validatedAt,
        createdAt: validatedAt,
        updatedAt: validatedAt,
      };
    });
  }
);

const photos = [
  {
    id: "demo_photo_stacy_decimal_2026",
    evidenceId: "demo_evidence_stacy_01",
    assetFilename: "decimal-place-value.webp",
    contentType: "image/webp",
    width: 1_000,
    height: 1_000,
  },
  {
    id: "demo_photo_jeremy_equations_2026",
    evidenceId: "demo_evidence_jeremy_10",
    assetFilename: "one-step-equations.webp",
    contentType: "image/webp",
    width: 1_000,
    height: 1_000,
  },
  {
    id: "demo_photo_jeff_reading_2026",
    evidenceId: "demo_evidence_jeff_10",
    assetFilename: "annotated-reading-passage.webp",
    contentType: "image/webp",
    width: 1_000,
    height: 1_000,
  },
  {
    id: "demo_photo_mary_planning_2026",
    evidenceId: "demo_evidence_mary_07",
    assetFilename: "paragraph-planning.webp",
    contentType: "image/webp",
    width: 1_000,
    height: 1_000,
  },
];

function freezeRecords(records) {
  return Object.freeze(
    records.map((record) =>
      Object.freeze({
        ...record,
        ...(record.behavior ? { behavior: Object.freeze([...record.behavior]) } : {}),
        ...(record.tags ? { tags: Object.freeze([...record.tags]) } : {}),
        ...(record.followUpNotes
          ? { followUpNotes: Object.freeze([...record.followUpNotes]) }
          : {}),
      })
    )
  );
}

export const DEMO_DATASET = Object.freeze({
  version: DEMO_DATASET_VERSION,
  classes: freezeRecords(classes),
  students: freezeRecords(students),
  evidence: freezeRecords(evidence),
  photos: freezeRecords(photos),
});

function assertText(value, label, maxLength) {
  if (typeof value !== "string" || !value.trim() || value.length > maxLength) {
    throw new Error(`${label} is missing or outside its allowed length.`);
  }
}

function assertUnique(records, field, label) {
  const values = records.map((record) => record[field]);
  if (new Set(values).size !== values.length) {
    throw new Error(`${label} values must be unique.`);
  }
}

function assertTimestamp(value, label) {
  const timestamp = Date.parse(value);
  if (
    !Number.isFinite(timestamp) ||
    new Date(timestamp).toISOString() !== value
  ) {
    throw new Error(`${label} must be a valid fixed timestamp.`);
  }
  return timestamp;
}

function assertSchoolDay(timestamp, label) {
  const localDate = new Date(timestamp - 4 * 60 * 60 * 1000);
  const weekday = localDate.getUTCDay();
  const dayStart = Date.UTC(
    localDate.getUTCFullYear(),
    localDate.getUTCMonth(),
    localDate.getUTCDate()
  );
  if (weekday === 0 || weekday === 6 || dayStart === LABOR_DAY) {
    throw new Error(`${label} must fall on a school day.`);
  }
}

export function validateDemoDataset(dataset = DEMO_DATASET) {
  if (dataset.version !== DEMO_DATASET_VERSION) {
    throw new Error("Demo dataset version does not match the canonical version.");
  }
  if (!Array.isArray(dataset.classes) || dataset.classes.length !== 3) {
    throw new Error("Demo dataset must contain exactly 3 classes.");
  }
  if (
    !Array.isArray(dataset.students) ||
    dataset.students.length < 12 ||
    dataset.students.length > 15
  ) {
    throw new Error("Demo dataset must contain 12–15 students.");
  }
  if (
    !Array.isArray(dataset.evidence) ||
    dataset.evidence.length < 70 ||
    dataset.evidence.length > 90
  ) {
    throw new Error("Demo dataset must contain 70–90 evidence records.");
  }
  if (
    !Array.isArray(dataset.photos) ||
    dataset.photos.length === 0 ||
    dataset.photos.length >= dataset.students.length
  ) {
    throw new Error("Demo dataset must contain occasional evidence photos.");
  }

  assertUnique(dataset.classes, "id", "Class IDs");
  assertUnique(dataset.classes, "nameKey", "Class name keys");
  assertUnique(dataset.students, "id", "Student IDs");
  assertUnique(dataset.students, "mentionHandle", "Student handles");
  assertUnique(dataset.evidence, "id", "Evidence IDs");
  assertUnique(dataset.photos, "id", "Photo IDs");
  assertUnique(dataset.photos, "evidenceId", "Photo evidence relations");
  assertUnique(dataset.photos, "assetFilename", "Photo assets");

  const classById = new Map(
    dataset.classes.map((classGroup) => [classGroup.id, classGroup])
  );
  for (const [index, classGroup] of dataset.classes.entries()) {
    assertText(classGroup.id, `Class ${index + 1} ID`, INPUT_LIMITS.identifier);
    assertText(classGroup.name, `Class ${index + 1} name`, INPUT_LIMITS.className);
    if (classGroup.nameKey !== classGroup.name.toLowerCase()) {
      throw new Error(`Class ${index + 1} name key is not normalized.`);
    }
    const createdAt = assertTimestamp(
      classGroup.createdAt,
      `Class ${index + 1} creation date`
    );
    if (createdAt < DATASET_START || createdAt > DATASET_END) {
      throw new Error(`Class ${index + 1} creation date is outside the school-year window.`);
    }
    assertSchoolDay(createdAt, `Class ${index + 1} creation date`);
  }

  const studentById = new Map();
  for (const [index, student] of dataset.students.entries()) {
    assertText(student.id, `Student ${index + 1} ID`, INPUT_LIMITS.identifier);
    assertText(
      student.displayName,
      `Student ${index + 1} name`,
      INPUT_LIMITS.displayName
    );
    assertText(
      student.mentionHandle,
      `Student ${index + 1} handle`,
      INPUT_LIMITS.mentionHandle
    );
    if (!ALLOWED_STUDENT_NAMES.has(student.displayName)) {
      throw new Error("Demo dataset contains a non-canonical student name.");
    }
    if (student.mentionHandle !== student.displayName.toLowerCase()) {
      throw new Error(`Student ${index + 1} handle is not canonical.`);
    }
    const classGroup = classById.get(student.classId);
    if (!classGroup || student.schoolLocalId !== null) {
      throw new Error(`Student ${index + 1} roster relation is invalid.`);
    }
    const createdAt = assertTimestamp(
      student.createdAt,
      `Student ${index + 1} creation date`
    );
    if (createdAt < Date.parse(classGroup.createdAt) || createdAt > DATASET_END) {
      throw new Error(`Student ${index + 1} creation date is inconsistent.`);
    }
    assertSchoolDay(createdAt, `Student ${index + 1} creation date`);
    studentById.set(student.id, student);
  }
  if ([...classById.keys()].some((id) =>
    !dataset.students.some((student) => student.classId === id)
  )) {
    throw new Error("Each demo class must have roster students.");
  }
  const evidenceTypes = new Set();
  const studentCounts = new Map();
  const distinctTags = new Set();
  let followUpCount = 0;

  for (const [index, record] of dataset.evidence.entries()) {
    const position = `Evidence ${index + 1}`;
    assertText(record.id, `${position} ID`, INPUT_LIMITS.identifier);
    assertText(record.evidenceNote, `${position} note`, INPUT_LIMITS.evidenceNote);
    assertText(record.summary, `${position} summary`, INPUT_LIMITS.evidenceSummary);
    assertText(record.evidenceType, `${position} type`, INPUT_LIMITS.evidenceType);

    if (
      ["rawNote", "sourceNote", "captureText"].some((field) =>
        Object.hasOwn(record, field)
      ) ||
      record.evidenceNote.includes("@")
    ) {
      throw new Error(`${position} contains a raw-capture field or mention.`);
    }

    const student = studentById.get(record.studentId);
    if (!student || record.classId !== student.classId) {
      throw new Error(`${position} ownership relation is invalid.`);
    }
    if (!ALLOWED_EVIDENCE_TYPES.has(record.evidenceType)) {
      throw new Error(`${position} uses a non-canonical evidence type.`);
    }

    if (record.topic !== null) {
      assertText(record.topic, `${position} topic`, INPUT_LIMITS.evidenceField);
    }
    if (record.performance !== null) {
      assertText(
        record.performance,
        `${position} performance`,
        INPUT_LIMITS.evidenceField
      );
    }
    if (
      !Array.isArray(record.behavior) ||
      record.behavior.length > INPUT_LIMITS.behaviorItemsPerEvidence
    ) {
      throw new Error(`${position} behavior entries are invalid.`);
    }
    for (const behavior of record.behavior) {
      assertText(behavior, `${position} behavior`, INPUT_LIMITS.behaviorItem);
    }
    const expectedSummary = [
      student.displayName,
      record.topic,
      record.performance,
      record.behavior.length > 0 ? record.behavior.join(", ") : null,
      record.evidenceType,
    ]
      .filter(Boolean)
      .join(" \u00b7 ");
    if (record.summary !== expectedSummary) {
      throw new Error(`${position} summary does not match its structured fields.`);
    }

    if (
      !Array.isArray(record.tags) ||
      record.tags.length < 1 ||
      record.tags.length > INPUT_LIMITS.tagsPerEvidence ||
      new Set(record.tags).size !== record.tags.length
    ) {
      throw new Error(`${position} tags are invalid.`);
    }
    for (const tag of record.tags) {
      assertText(tag, `${position} tag`, INPUT_LIMITS.tag);
      if (tag !== tag.toLowerCase() || !/^[a-z0-9][a-z0-9-]*$/.test(tag)) {
        throw new Error(`${position} tags must be normalized lowercase values.`);
      }
      distinctTags.add(tag);
    }

    if (
      !Array.isArray(record.followUpNotes) ||
      record.followUpNotes.length > INPUT_LIMITS.followUpItemsPerEvidence ||
      record.followUpNeeded !== (record.followUpNotes.length > 0)
    ) {
      throw new Error(`${position} follow-up state is invalid.`);
    }
    let followUpTotal = 0;
    for (const followUp of record.followUpNotes) {
      assertText(followUp, `${position} follow-up`, INPUT_LIMITS.followUpItem);
      followUpTotal += followUp.length;
    }
    if (followUpTotal > INPUT_LIMITS.followUpTotal) {
      throw new Error(`${position} follow-up notes exceed the allowed total.`);
    }
    if (record.followUpNeeded) followUpCount += 1;

    const evidenceDate = assertTimestamp(record.evidenceDate, `${position} date`);
    const validatedAt = assertTimestamp(
      record.validatedAt,
      `${position} validation date`
    );
    const createdAt = assertTimestamp(record.createdAt, `${position} creation date`);
    const updatedAt = assertTimestamp(record.updatedAt, `${position} update date`);
    if (
      evidenceDate < DATASET_START ||
      evidenceDate > DATASET_END ||
      evidenceDate < Date.parse(student.createdAt) ||
      validatedAt < evidenceDate ||
      validatedAt > DATASET_END ||
      createdAt !== validatedAt ||
      updatedAt !== validatedAt
    ) {
      throw new Error(`${position} fixed timestamps are inconsistent.`);
    }
    assertSchoolDay(evidenceDate, `${position} evidence date`);
    assertSchoolDay(validatedAt, `${position} validation date`);
    assertSchoolDay(createdAt, `${position} creation date`);
    assertSchoolDay(updatedAt, `${position} update date`);

    evidenceTypes.add(record.evidenceType);
    studentCounts.set(record.studentId, (studentCounts.get(record.studentId) ?? 0) + 1);
  }

  for (const type of ALLOWED_EVIDENCE_TYPES) {
    if (!evidenceTypes.has(type)) {
      throw new Error(`Demo dataset evidence-type coverage is invalid for ${type}.`);
    }
  }

  const evidenceIds = new Set(dataset.evidence.map((record) => record.id));
  for (const [index, photo] of dataset.photos.entries()) {
    const position = `Photo ${index + 1}`;
    assertText(photo.id, `${position} ID`, INPUT_LIMITS.identifier);
    assertText(photo.evidenceId, `${position} evidence ID`, INPUT_LIMITS.identifier);
    if (
      !evidenceIds.has(photo.evidenceId) ||
      photo.contentType !== "image/webp" ||
      !/^[a-z0-9-]+\.webp$/.test(photo.assetFilename) ||
      !Number.isInteger(photo.width) ||
      !Number.isInteger(photo.height) ||
      photo.width < 1 ||
      photo.height < 1 ||
      photo.width > INPUT_LIMITS.evidencePhotoLongEdge ||
      photo.height > INPUT_LIMITS.evidencePhotoLongEdge
    ) {
      throw new Error(`${position} relation or image metadata is invalid.`);
    }
  }
  if ([...studentById.keys()].some((studentId) => !studentCounts.has(studentId))) {
    throw new Error("Each demo student must have at least one evidence record.");
  }
  if (new Set(studentCounts.values()).size < 2) {
    throw new Error("Demo student histories must have uneven evidence counts.");
  }
  if (
    followUpCount === 0 ||
    followUpCount === dataset.evidence.length ||
    distinctTags.size < 10
  ) {
    throw new Error("Demo dataset structured-field coverage is incomplete.");
  }

  return {
    version: dataset.version,
    classCount: dataset.classes.length,
    studentCount: dataset.students.length,
    evidenceCount: dataset.evidence.length,
    photoCount: dataset.photos.length,
    earliestEvidenceDate: new Date(
      Math.min(...dataset.evidence.map((record) => Date.parse(record.evidenceDate)))
    ).toISOString(),
    latestEvidenceDate: new Date(
      Math.max(...dataset.evidence.map((record) => Date.parse(record.evidenceDate)))
    ).toISOString(),
  };
}

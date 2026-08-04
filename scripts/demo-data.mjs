import { INPUT_LIMITS } from "../lib/validation/input-limits.ts";

export const DEMO_CLERK_USER_ID = "user_3HQButQuO16dX0RvhZbZ7jtQb2m";
export const DEMO_DATASET_VERSION = "2026-school-spring-v1";
export const DEMO_DATABASE_IDENTITY = Object.freeze({
  projectId: "floral-forest-27181712",
  branchId: "br-wild-recipe-atxbdvko",
  databaseName: "neondb",
});

const ALLOWED_STUDENT_NAMES = new Set(["Jeremy", "Stacy", "Jeff", "Mary"]);
const ALLOWED_EVIDENCE_TYPES = new Set([
  "Academic check-in",
  "General observation",
  "Behavior observation",
  "Assessment observation",
  "Accommodation log",
  "Progress monitoring",
  "Communication log",
]);
const EXPECTED_TYPE_COUNTS = new Map([
  ["Academic check-in", 14],
  ["General observation", 10],
  ["Behavior observation", 8],
  ["Assessment observation", 8],
  ["Accommodation log", 6],
  ["Progress monitoring", 6],
  ["Communication log", 4],
]);
const DATASET_START = Date.parse("2026-03-09T00:00:00.000-04:00");
const DATASET_END = Date.parse("2026-05-01T23:59:59.999-04:00");

const classes = [
  {
    id: "demo_class_math_support_2026",
    name: "6th Grade Math Support",
    nameKey: "6th grade math support",
    createdAt: "2026-03-02T14:00:00.000Z",
  },
  {
    id: "demo_class_ela_support_2026",
    name: "7th Grade ELA Support",
    nameKey: "7th grade ela support",
    createdAt: "2026-03-02T14:05:00.000Z",
  },
];

const students = [
  {
    id: "demo_student_jeremy_2026",
    classId: "demo_class_math_support_2026",
    displayName: "Jeremy",
    mentionHandle: "jeremy",
    schoolLocalId: null,
    createdAt: "2026-03-03T14:00:00.000Z",
  },
  {
    id: "demo_student_stacy_2026",
    classId: "demo_class_math_support_2026",
    displayName: "Stacy",
    mentionHandle: "stacy",
    schoolLocalId: null,
    createdAt: "2026-03-03T14:05:00.000Z",
  },
  {
    id: "demo_student_jeff_2026",
    classId: "demo_class_ela_support_2026",
    displayName: "Jeff",
    mentionHandle: "jeff",
    schoolLocalId: null,
    createdAt: "2026-03-03T14:10:00.000Z",
  },
  {
    id: "demo_student_mary_2026",
    classId: "demo_class_ela_support_2026",
    displayName: "Mary",
    mentionHandle: "mary",
    schoolLocalId: null,
    createdAt: "2026-03-03T14:15:00.000Z",
  },
];

const authoredEvidence = {
  jeremy: [
    {
      at: "2026-03-09T09:05:00.000-04:00",
      note: "had a really hard time staying focused today",
      type: "Academic check-in",
      topic: "decimal addition",
      performance: "struggling",
      behavior: ["attention"],
      tags: ["math", "focus"],
      followUpNotes: ["Check in during tomorrow's warmup"],
    },
    {
      at: "2026-03-12T09:05:00.000-04:00",
      note: "needed three reminders to get back to the practice problems",
      type: "Behavior observation",
      topic: "independent work",
      behavior: ["off task", "attention"],
      tags: ["focus", "behavior"],
    },
    {
      at: "2026-03-17T09:05:00.000-04:00",
      note: "got 4 out of 10 on the decimal exit ticket and mixed up place values",
      type: "Assessment observation",
      topic: "decimal addition",
      performance: "incorrect",
      tags: ["math", "assessment"],
      followUpNotes: ["Reteach place-value alignment in small group"],
    },
    {
      at: "2026-03-20T09:05:00.000-04:00",
      note: "worked one problem at a time after I covered the rest of the page",
      type: "Accommodation log",
      topic: "decimal addition",
      performance: "needed support",
      tags: ["math", "support"],
    },
    {
      at: "2026-03-25T09:05:00.000-04:00",
      note: "forgot homework",
      type: "General observation",
      topic: "organization",
      behavior: ["organization"],
      tags: ["homework", "organization"],
    },
    {
      at: "2026-03-30T09:05:00.000-04:00",
      note: "called home about the missing work. family is going to check the folder tonight",
      type: "Communication log",
      topic: "missing work",
      tags: ["homework", "communication"],
    },
    {
      at: "2026-04-02T09:05:00.000-04:00",
      note: "remembered to ask for missing work when out",
      type: "Academic check-in",
      topic: "organization",
      performance: "improving",
      tags: ["self-advocacy", "organization"],
    },
    {
      at: "2026-04-07T09:05:00.000-04:00",
      note: "refused to answer when called on and put his pencil down",
      type: "Behavior observation",
      topic: "variables",
      behavior: ["refusal"],
      tags: ["behavior", "math"],
      followUpNotes: ["Offer a private check-in before the next discussion"],
    },
    {
      at: "2026-04-10T09:05:00.000-04:00",
      note: "apologized for getting an attitude and came back ready to work",
      type: "General observation",
      topic: "self-regulation",
      behavior: ["repair"],
      tags: ["behavior", "progress"],
    },
    {
      at: "2026-04-15T09:05:00.000-04:00",
      note: "moved himself to another spot to focus and finished the last four equations",
      type: "Academic check-in",
      topic: "equations",
      performance: "independent",
      behavior: ["attention"],
      tags: ["focus", "math"],
    },
    {
      at: "2026-04-20T09:05:00.000-04:00",
      note: "was finally able to explain variables in his own words",
      type: "Progress monitoring",
      topic: "equations",
      performance: "improving",
      tags: ["progress", "math"],
    },
    {
      at: "2026-04-24T09:05:00.000-04:00",
      note: "got 8 out of 10 on equations and checked each answer",
      type: "Assessment observation",
      topic: "equations",
      performance: "correct",
      tags: ["assessment", "math"],
    },
    {
      at: "2026-04-28T09:05:00.000-04:00",
      note: "asked a really good question and sparked discussion",
      type: "Academic check-in",
      topic: "variables",
      performance: "independent",
      behavior: ["participation"],
      tags: ["participation", "math"],
    },
    {
      at: "2026-05-01T09:05:00.000-04:00",
      note: "on point today - finished the warmup without a reminder",
      type: "Progress monitoring",
      topic: "equations",
      performance: "independent",
      tags: ["progress", "focus"],
    },
  ],
  stacy: [
    {
      at: "2026-03-09T10:15:00.000-04:00",
      note: "struggling with decimal addition and kept lining the numbers up from the left",
      type: "Academic check-in",
      topic: "decimal addition",
      performance: "struggling",
      tags: ["math", "decimal-addition"],
      followUpNotes: ["Review place-value alignment tomorrow"],
    },
    {
      at: "2026-03-12T10:15:00.000-04:00",
      note: "raised her hand to answer a question!",
      type: "General observation",
      topic: "decimal addition",
      behavior: ["participation"],
      tags: ["participation", "math"],
    },
    {
      at: "2026-03-17T10:15:00.000-04:00",
      note: "used the place-value chart for every problem and did not need me to point to it",
      type: "Accommodation log",
      topic: "decimal addition",
      performance: "needed support",
      tags: ["math", "support"],
    },
    {
      at: "2026-03-20T10:15:00.000-04:00",
      note: "got 6 out of 10 on the quiz. regrouping errors on three problems",
      type: "Assessment observation",
      topic: "decimal addition",
      performance: "incorrect",
      tags: ["assessment", "math"],
      followUpNotes: ["Practice regrouping in the next small group"],
    },
    {
      at: "2026-03-25T10:15:00.000-04:00",
      note: "stared off into space for a while today and only finished half the practice",
      type: "Academic check-in",
      topic: "math practice",
      performance: "incomplete",
      behavior: ["attention"],
      tags: ["focus", "math"],
    },
    {
      at: "2026-03-30T10:15:00.000-04:00",
      note: "emailed home about finishing the quiz corrections this week",
      type: "Communication log",
      topic: "quiz corrections",
      tags: ["assessment", "communication"],
    },
    {
      at: "2026-04-02T10:15:00.000-04:00",
      note: "asked what the question was really asking before she started the word problem",
      type: "General observation",
      topic: "word problems",
      behavior: ["self-advocacy"],
      tags: ["self-advocacy", "math"],
    },
    {
      at: "2026-04-07T10:15:00.000-04:00",
      note: "completed all six decimal problems after one worked example",
      type: "Academic check-in",
      topic: "decimal addition",
      performance: "needed support",
      tags: ["math", "support"],
    },
    {
      at: "2026-04-10T10:15:00.000-04:00",
      note: "needed two reminders to stop doodling and come back to the warmup",
      type: "Behavior observation",
      topic: "work initiation",
      behavior: ["off task", "redirection"],
      tags: ["focus", "behavior"],
      followUpNotes: ["Start with a brief check-in at the next class"],
    },
    {
      at: "2026-04-15T10:15:00.000-04:00",
      note: "used extra time and checked her answers with the calculator",
      type: "Accommodation log",
      topic: "decimal operations",
      performance: "independent",
      tags: ["math", "support"],
    },
    {
      at: "2026-04-20T10:15:00.000-04:00",
      note: "got 8 out of 10 and fixed one mistake before turning it in",
      type: "Assessment observation",
      topic: "decimal operations",
      performance: "correct",
      tags: ["assessment", "math"],
    },
    {
      at: "2026-04-24T10:15:00.000-04:00",
      note: "explained why the decimal points need to line up to her partner",
      type: "Progress monitoring",
      topic: "decimal addition",
      performance: "improving",
      tags: ["progress", "math"],
    },
    {
      at: "2026-04-28T10:15:00.000-04:00",
      note: "volunteered an answer and remembered to include the units",
      type: "Academic check-in",
      topic: "word problems",
      performance: "independent",
      behavior: ["participation"],
      tags: ["participation", "math"],
    },
    {
      at: "2026-05-01T10:15:00.000-04:00",
      note: "spoke with home about how much more she is participating in math",
      type: "Communication log",
      topic: "participation",
      tags: ["participation", "communication"],
    },
  ],
  jeff: [
    {
      at: "2026-03-09T13:10:00.000-04:00",
      note: "refused to answer when called on and would not open the book",
      type: "Behavior observation",
      topic: "class discussion",
      behavior: ["refusal"],
      tags: ["behavior", "reading"],
      followUpNotes: ["Check in privately before the next read-aloud"],
    },
    {
      at: "2026-03-12T13:10:00.000-04:00",
      note: "fell asleep again during independent reading",
      type: "General observation",
      topic: "independent reading",
      behavior: ["attention"],
      tags: ["focus", "reading"],
      followUpNotes: ["Check in about the best time and place for reading"],
    },
    {
      at: "2026-03-17T13:10:00.000-04:00",
      note: "had a hard time finding the main idea even after rereading",
      type: "Academic check-in",
      topic: "main idea",
      performance: "struggling",
      tags: ["reading", "comprehension"],
    },
    {
      at: "2026-03-20T13:10:00.000-04:00",
      note: "finished the written response when the directions were read aloud and chunked",
      type: "Accommodation log",
      topic: "written response",
      performance: "needed support",
      tags: ["writing", "support"],
    },
    {
      at: "2026-03-25T13:10:00.000-04:00",
      note: "drawing on desk instead of starting. cleaned it up after one reminder",
      type: "Behavior observation",
      topic: "work initiation",
      behavior: ["off task", "redirection"],
      tags: ["behavior", "focus"],
    },
    {
      at: "2026-03-30T13:10:00.000-04:00",
      note: "called home after the reset room. shared what happened and that he came back to class",
      type: "Communication log",
      topic: "self-regulation",
      tags: ["behavior", "communication"],
    },
    {
      at: "2026-04-02T13:10:00.000-04:00",
      note: "sent to reset room after yelling across the room",
      type: "Behavior observation",
      topic: "self-regulation",
      behavior: ["disruption"],
      tags: ["behavior", "self-regulation"],
      followUpNotes: ["Review the reset plan before the next class"],
    },
    {
      at: "2026-04-07T13:10:00.000-04:00",
      note: "really into this chapter of the read aloud and tracked the whole time",
      type: "General observation",
      topic: "comprehension",
      behavior: ["participation"],
      tags: ["reading", "participation"],
    },
    {
      at: "2026-04-10T13:10:00.000-04:00",
      note: "answered the inference question after I asked him to point to one clue",
      type: "Academic check-in",
      topic: "inference",
      performance: "needed support",
      tags: ["reading", "support"],
    },
    {
      at: "2026-04-15T13:10:00.000-04:00",
      note: "got 3 out of 5 on the exit ticket and found both supporting details",
      type: "Assessment observation",
      topic: "supporting details",
      performance: "improving",
      tags: ["assessment", "reading"],
    },
    {
      at: "2026-04-20T13:10:00.000-04:00",
      note: "used the read-aloud support and finished without leaving his seat",
      type: "Accommodation log",
      topic: "comprehension",
      performance: "needed support",
      tags: ["reading", "support"],
    },
    {
      at: "2026-04-24T13:10:00.000-04:00",
      note: "apologized for getting an attitude and rejoined the group",
      type: "General observation",
      topic: "self-regulation",
      behavior: ["repair"],
      tags: ["behavior", "progress"],
    },
    {
      at: "2026-04-28T13:10:00.000-04:00",
      note: "volunteered to read out loud and kept going after a tough word",
      type: "Progress monitoring",
      topic: "oral reading",
      performance: "improving",
      behavior: ["participation"],
      tags: ["progress", "reading"],
    },
    {
      at: "2026-05-01T13:10:00.000-04:00",
      note: "completed the whole written response after making a quick outline",
      type: "Academic check-in",
      topic: "written response",
      performance: "independent",
      tags: ["writing", "organization"],
    },
  ],
  mary: [
    {
      at: "2026-03-09T14:20:00.000-04:00",
      note: "on point today and ready with her book before we started",
      type: "General observation",
      topic: "reading discussion",
      behavior: ["participation"],
      tags: ["reading", "participation"],
    },
    {
      at: "2026-03-12T14:20:00.000-04:00",
      note: "asked a really good question and sparked discussion about the character's choice",
      type: "Academic check-in",
      topic: "text evidence",
      performance: "independent",
      tags: ["reading", "participation"],
    },
    {
      at: "2026-03-17T14:20:00.000-04:00",
      note: "included three details in the paragraph but did not have a clear topic sentence",
      type: "Assessment observation",
      topic: "paragraph organization",
      performance: "needed support",
      tags: ["assessment", "writing"],
      followUpNotes: ["Conference on topic sentences during writing group"],
    },
    {
      at: "2026-03-20T14:20:00.000-04:00",
      note: "volunteered to read out loud",
      type: "Academic check-in",
      topic: "oral reading",
      performance: "independent",
      tags: ["reading", "participation"],
    },
    {
      at: "2026-03-25T14:20:00.000-04:00",
      note: "got frustrated with revision, took a short break, and came back to finish",
      type: "Behavior observation",
      topic: "self-regulation",
      behavior: ["self-regulation"],
      tags: ["behavior", "writing"],
      followUpNotes: ["Offer a planned break before the next revision task"],
    },
    {
      at: "2026-03-30T14:20:00.000-04:00",
      note: "made a connection to an earlier chapter and helped the group remember the scene",
      type: "General observation",
      topic: "comprehension",
      behavior: ["participation"],
      tags: ["reading", "participation"],
    },
    {
      at: "2026-04-02T14:20:00.000-04:00",
      note: "used the graphic organizer before writing and stayed with it until every box was filled",
      type: "Accommodation log",
      topic: "paragraph organization",
      performance: "needed support",
      tags: ["writing", "support"],
    },
    {
      at: "2026-04-07T14:20:00.000-04:00",
      note: "cited one strong detail and explained how it supported her answer",
      type: "Assessment observation",
      topic: "text evidence",
      performance: "improving",
      tags: ["assessment", "reading"],
    },
    {
      at: "2026-04-10T14:20:00.000-04:00",
      note: "remembered to ask for missing work when out",
      type: "Academic check-in",
      topic: "organization",
      behavior: ["self-advocacy"],
      tags: ["self-advocacy", "organization"],
    },
    {
      at: "2026-04-15T14:20:00.000-04:00",
      note: "distracted during independent writing, then moved herself to a quieter spot",
      type: "Behavior observation",
      topic: "independent writing",
      behavior: ["attention"],
      tags: ["focus", "writing"],
      followUpNotes: ["Start the next writing block in the quieter seat"],
    },
    {
      at: "2026-04-20T14:20:00.000-04:00",
      note: "wrote a clear topic sentence and three details with only one check-in",
      type: "Progress monitoring",
      topic: "paragraph organization",
      performance: "improving",
      tags: ["progress", "writing"],
    },
    {
      at: "2026-04-24T14:20:00.000-04:00",
      note: "helped her partner find the sentence that supported his answer",
      type: "General observation",
      topic: "text evidence",
      behavior: ["participation"],
      tags: ["reading", "participation"],
    },
    {
      at: "2026-04-28T14:20:00.000-04:00",
      note: "earned 4 out of 5 on the written response and used two pieces of evidence",
      type: "Assessment observation",
      topic: "written response",
      performance: "correct",
      tags: ["assessment", "writing"],
    },
    {
      at: "2026-05-01T14:20:00.000-04:00",
      note: "revised the paragraph on her own and caught a sentence fragment",
      type: "Progress monitoring",
      topic: "revision",
      performance: "independent",
      tags: ["progress", "writing"],
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
  if (!Number.isFinite(timestamp)) {
    throw new Error(`${label} must be a valid fixed timestamp.`);
  }
  return timestamp;
}

export function validateDemoDataset(dataset = DEMO_DATASET) {
  if (dataset.version !== DEMO_DATASET_VERSION) {
    throw new Error("Demo dataset version does not match the canonical version.");
  }
  if (dataset.classes.length !== 2) {
    throw new Error("Demo dataset must contain exactly 2 classes.");
  }
  if (dataset.students.length !== 4) {
    throw new Error("Demo dataset must contain exactly 4 students.");
  }
  if (dataset.evidence.length !== 56) {
    throw new Error("Demo dataset must contain exactly 56 evidence records.");
  }

  assertUnique(dataset.classes, "id", "Class IDs");
  assertUnique(dataset.classes, "nameKey", "Class name keys");
  assertUnique(dataset.students, "id", "Student IDs");
  assertUnique(dataset.students, "mentionHandle", "Student handles");
  assertUnique(dataset.evidence, "id", "Evidence IDs");

  const classIds = new Set(dataset.classes.map((classGroup) => classGroup.id));
  for (const [index, classGroup] of dataset.classes.entries()) {
    assertText(classGroup.id, `Class ${index + 1} ID`, INPUT_LIMITS.identifier);
    assertText(classGroup.name, `Class ${index + 1} name`, INPUT_LIMITS.className);
    if (classGroup.nameKey !== classGroup.name.toLowerCase()) {
      throw new Error(`Class ${index + 1} name key is not normalized.`);
    }
    assertTimestamp(classGroup.createdAt, `Class ${index + 1} creation date`);
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
    if (!classIds.has(student.classId) || student.schoolLocalId !== null) {
      throw new Error(`Student ${index + 1} roster relation is invalid.`);
    }
    assertTimestamp(student.createdAt, `Student ${index + 1} creation date`);
    studentById.set(student.id, student);
  }
  const typeCounts = new Map();
  const studentCounts = new Map();
  const distinctTags = new Set();
  let topicCount = 0;
  let performanceCount = 0;
  let behaviorCount = 0;
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

    if (record.topic !== null) {
      assertText(record.topic, `${position} topic`, INPUT_LIMITS.evidenceField);
      topicCount += 1;
    }
    if (record.performance !== null) {
      assertText(
        record.performance,
        `${position} performance`,
        INPUT_LIMITS.evidenceField
      );
      performanceCount += 1;
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
    if (record.behavior.length > 0) behaviorCount += 1;

    if (
      !Array.isArray(record.tags) ||
      record.tags.length < 1 ||
      record.tags.length > 3 ||
      record.tags.length > INPUT_LIMITS.tagsPerEvidence
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
      validatedAt < evidenceDate ||
      createdAt !== validatedAt ||
      updatedAt !== validatedAt
    ) {
      throw new Error(`${position} fixed timestamps are inconsistent.`);
    }

    typeCounts.set(record.evidenceType, (typeCounts.get(record.evidenceType) ?? 0) + 1);
    studentCounts.set(record.studentId, (studentCounts.get(record.studentId) ?? 0) + 1);
  }

  for (const [type, expectedCount] of EXPECTED_TYPE_COUNTS) {
    if (typeCounts.get(type) !== expectedCount) {
      throw new Error(`Demo dataset evidence-type coverage is invalid for ${type}.`);
    }
  }
  if ([...studentById].some(([studentId]) => studentCounts.get(studentId) !== 14)) {
    throw new Error("Each demo student must have exactly 14 evidence records.");
  }
  if (
    topicCount < 40 ||
    performanceCount < 24 ||
    behaviorCount < 12 ||
    followUpCount < 10 ||
    followUpCount > 14 ||
    distinctTags.size < 10
  ) {
    throw new Error("Demo dataset structured-field coverage is incomplete.");
  }

  return {
    version: dataset.version,
    classCount: dataset.classes.length,
    studentCount: dataset.students.length,
    evidenceCount: dataset.evidence.length,
    earliestEvidenceDate: new Date(
      Math.min(...dataset.evidence.map((record) => Date.parse(record.evidenceDate)))
    ).toISOString(),
    latestEvidenceDate: new Date(
      Math.max(...dataset.evidence.map((record) => Date.parse(record.evidenceDate)))
    ).toISOString(),
  };
}

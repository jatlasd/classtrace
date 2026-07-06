# Unit 33 - Per-Student Report View and Date-Range Query

## Goal

Add one readable, read-only evidence report for a single active roster student.

After this unit:

- A teacher can open a restrained **View report** action from an existing student timeline.
- The report remains inside the student workflow and does not add a Reports navigation item.
- The report can be filtered by optional start and end dates.
- A blank date range includes all eligible evidence for that student.
- The report shows stored Evidence notes as the main content, with structured metadata as supporting context.
- The report reads like a calm document view rather than a dashboard, data table, IEP template, parent update, or analytics report.
- Report reads are workspace-scoped and one-student only.

This unit does not add print/PDF behavior. Unit 34 owns the browser Print / Save as PDF pass.

## Why This Unit Exists

Units 31 and 32 made the teacher-approved Evidence note durable and readable in the feed, timeline, and CSV export. Pre-beta teachers also need a more readable way to review one student's stored evidence over time without leaving the student workflow or generating a formal document.

The report is a presentation of already-saved evidence. It must not infer trends, create recommendations, summarize with AI, fabricate claims, or reshape evidence into an IEP, behavior report, or parent communication template.

## Architect Blueprint

Blueprint ready.

### Language

- **Student report**: A read-only, per-student presentation of stored validated evidence.
- **Date range**: Optional date-only filters for evidence dates. Blank start and blank end means all eligible evidence.
- **Eligible evidence**: Non-archived validated evidence owned by the current teacher workspace and attached to the selected active roster student.
- **Document view**: A readable report-like screen with student context and evidence entries, not a generated file or analytics dashboard.
- **Supporting metadata**: Structured fields such as summary, evidence type, topic, performance, behavior, tags, follow-up state, validation date, and class snapshot.

### Decisions

- Add the report as a nested student route, likely `/app/students/[studentId]/report`, so reports stay inside the student workflow.
- Add a restrained "View report" action to the existing student timeline header/action area.
- Use server-side reads and validation for the selected student and optional date range.
- Treat date filters as inclusive date-only filters over `EvidenceRecord.evidenceDate`.
- Order report evidence chronologically, oldest to newest, so the report reads naturally.
- Include only non-archived evidence by default.
- Do not add print controls, generated PDFs, all-student reports, class reports, AI summaries, or report templates in this unit.

## Prerequisite Gate

Do not implement Unit 33 until all of these are true:

1. Unit 32 is complete and reviewed/approved by the human.
2. This Unit 33 spec exists.
3. The human explicitly confirms Unit 33 implementation should begin.

Writing this spec does not authorize implementation by itself.

## Scope

### In Scope

- Add a per-student report route inside the authenticated app.
- Add a restrained report entry action from the existing student timeline.
- Add a server-only report read helper that verifies:
  - current workspace ownership;
  - selected active roster student;
  - one-student scope;
  - non-archived evidence only;
  - optional date-range validity.
- Add optional start and end date controls on the report screen.
- Render report context:
  - student name;
  - mention handle;
  - current class when available;
  - selected date range or all-evidence label;
  - evidence record count.
- Render evidence entries in chronological order with Evidence note as primary content.
- Render structured summary and metadata as supporting context.
- Render an honest empty state when no eligible evidence matches the selected range.
- Update focused tests for route/helper/date validation/UI guardrails.
- Update `context/ui-registry.md` for the new report pattern.
- Update `context/progress-tracker.md` after implementation.

### Out of Scope

- Printable report styling or print button.
- Generated PDF download, PDF storage, PDF upload, or external print/report service.
- Report templates.
- IEP reports, parent updates, behavior reports, progress reports with inferred trends, or compliance artifacts.
- Class reports.
- All-student reports.
- Report dashboard or Reports navigation item.
- Evidence editing from the report surface.
- Archive/delete controls on report entries.
- AI summaries, AI rewriting, AI pattern detection, or generated recommendations.
- Raw draft note display or export.
- File uploads, photos, audio, voice notes, PDFs, or attachments.
- Class-scoped capture, classwide notes, or multi-student evidence.
- Organization, district/admin, SIS/Classroom/Clever/ClassLink, gradebook, IEP-writing, parent communication, analytics, billing, telemetry, background jobs, or new dependencies.

## Likely Files Changed

### Likely new

- `context/specs/33-per-student-report-view-and-date-range-query.md`
- `app/app/students/[studentId]/report/page.tsx`
- `components/students/student-report-page.tsx`
- `lib/evidence/student-report-records.ts`
- `lib/evidence/student-report-records.test.ts`
- Static/UI guard tests for the student report route and UI

### Likely modified

- `components/students/student-timeline-page.tsx`
- `lib/routes.ts`
- `context/ui-registry.md`
- `context/progress-tracker.md`

### Possibly modified

- `lib/student-timeline-ui.test.ts`
- `lib/student-timeline-from-database-ui.test.ts`
- `lib/student-report-ui.test.ts` if created as a static guard test

### Not expected

- `prisma/schema.prisma`
- Prisma migrations
- `package.json`
- Lockfiles
- `next.config.*`
- `tsconfig.json`
- `eslint.config.*`
- `postcss.config.*`
- `app/globals.css`
- `components/ui/*`
- `proxy.ts`
- `app/api/**`
- Clerk auth route files
- Landing page components

If implementation needs one of the not-expected files, stop and explain why before editing.

## Route Requirements

### Route shape

Preferred route:

```txt
/app/students/[studentId]/report
```

Add a route helper, for example:

```ts
studentReport: (studentId: string) => `/app/students/${studentId}/report`
```

Keep the report under the authenticated `/app` shell and protected by the existing Clerk route protection.

### Query parameters

Supported query parameters:

```txt
start=YYYY-MM-DD
end=YYYY-MM-DD
```

Rules:

- Both parameters are optional.
- Blank start and blank end means all eligible evidence.
- Start-only means evidence on or after that date.
- End-only means evidence on or before that date.
- Start and end together mean an inclusive date range.
- Reject invalid date strings with plain teacher-safe copy.
- Reject ranges where start is after end.
- Preserve entered values in the date controls after validation errors.

Use date-only validation. Do not add time-of-day controls.

## Data Requirements

### Server-only helper

Add a server-only helper such as:

```ts
getStudentReportRecordsForWorkspace(...)
```

The helper should:

- accept trusted `workspaceId`, `studentId`, and parsed date range input;
- verify the selected roster student by `workspaceId`, `id`, and `archivedAt: null`;
- return `null` for missing, archived, or unowned students;
- read only evidence records matching the same `workspaceId` and `rosterStudentId`;
- filter `archivedAt: null`;
- apply the optional evidence date range;
- order records oldest to newest;
- return client-safe display models only;
- omit internal ownership IDs from returned report records;
- include the evidence class snapshot when available;
- include `evidenceNote` when present and never fabricate it from `summary`.

### Date filtering

The report should filter by `EvidenceRecord.evidenceDate`, not `createdAt` or `validatedAt`.

For date-only inputs:

- interpret `start` as inclusive beginning of that date;
- interpret `end` as inclusive through that date;
- implement the database query in a way that includes all records on the end date.

Suggested query shape:

```ts
evidenceDate: {
  gte: startDate,
  lt: dayAfterEndDate,
}
```

Use whichever date-bound construction is most consistent with existing project code and tests, but make the inclusive behavior explicit in tests.

### Report display model

The report model should include enough data for a factual document view:

```ts
type StudentReportStudent = {
  id: string;
  displayName: string;
  mentionHandle: string;
  classGroupName?: string;
  schoolLocalId?: string;
};

type StudentReportEvidenceRecord = {
  id: string;
  evidenceDate: string;
  evidenceNote?: string;
  summary: string;
  evidenceType: string;
  topic?: string;
  performance?: string;
  behavior?: string;
  tags: string[];
  followUpNeeded: boolean;
  followUpNotes?: string;
  validatedAt: string;
  classGroupName?: string;
};
```

Do not include:

```txt
workspaceId
teacherProfileId
clerkUserId
rawNote
draftText
originalCapture
sourceText
```

## UI Requirements

### Student timeline entry point

Add one restrained report action to the existing student timeline header/action area.

Copy:

```txt
View report
```

The action should be secondary to the timeline and export controls. It should not introduce a Reports nav item or make reports feel like the main product surface.

### Report page layout

Use the current calm student/timeline design language:

- constrained page shell similar to the student timeline;
- header with back-to-timeline action;
- factual student context;
- date-range filter controls;
- readable report body;
- no dashboard cards, charts, trend panels, or admin framing.

Preferred copy:

```txt
Student report
Evidence report
Evidence included
All evidence
Apply range
Clear range
No evidence in this range.
```

Avoid:

```txt
Generate report
Insights
Trends
Recommendations
IEP-ready
Compliance-ready
Parent report
Behavior analysis
AI summary
```

### Date controls

- Use visible labels for start and end date inputs.
- Use normal browser date inputs if compatible with the existing form patterns.
- Use GET form submission so the selected range is reflected in the URL.
- Show validation errors near the date controls.
- Provide a clear way to return to all evidence, likely a secondary "Clear range" link.

### Report content

For each evidence entry:

- show evidence date;
- show Evidence note as the primary content when present;
- show structured summary as supporting context;
- label legacy structured-only records honestly when `evidenceNote` is missing;
- show evidence type and optional topic/performance/behavior/tags as supporting metadata;
- show follow-up notes if present as stored factual text;
- do not infer patterns, progress, causes, diagnoses, or recommendations.

### Empty state

If the selected range has no eligible evidence:

```txt
No evidence in this range.
Try a wider date range or clear the dates to view all evidence for this student.
```

If the student has no eligible evidence at all, use the existing student-timeline spirit:

```txt
No validated evidence yet.
Capture a student-specific note, review it, and this report will have evidence to show.
```

## Accessibility Requirements

- Date inputs have visible labels.
- Error text is readable and near the date controls.
- The report route has one clear `h1`.
- Back/report/filter actions have accessible names.
- Color is not the only indicator of validation errors.
- The page works on mobile and desktop without horizontal overflow.
- Report entries use semantic list/article structure where practical.

## Logic Requirements

### Ownership

The report route must:

- resolve the current workspace server-side with `getCurrentWorkspace()`;
- never accept workspace ID, teacher ID, or Clerk ID from the client;
- call the report helper with the trusted workspace ID;
- return the same safe not-found style for missing, archived, or unowned students.

### Validation

Date validation should return a typed result instead of throwing raw errors into the page.

Suggested result shape:

```ts
type StudentReportDateRange =
  | { status: "valid"; start?: string; end?: string; startDate?: Date; endDate?: Date }
  | { status: "invalid"; start?: string; end?: string; error: string };
```

Keep user-facing errors plain:

```txt
Use a valid start date.
Use a valid end date.
Choose a start date before the end date.
```

### Read-only behavior

The report must not mutate:

- students;
- evidence;
- archive/delete state;
- export state;
- saved notes;
- structured metadata.

## Test Requirements

Add or update focused tests before or alongside implementation.

### Report helper tests

Tests should verify:

- selected student lookup is scoped by workspace and `archivedAt: null`;
- missing/unowned/archived students return `null`;
- evidence query is scoped by workspace and roster student;
- archived evidence is excluded;
- blank range returns all eligible evidence;
- start-only range applies lower bound;
- end-only range applies upper bound inclusively;
- start+end range applies inclusive bounds;
- invalid ranges are rejected before querying evidence;
- results are ordered oldest to newest;
- returned models include Evidence note without fabricating legacy notes;
- returned models omit internal ownership IDs and raw draft fields.

### Route/UI tests

Tests should verify:

- student timeline includes a "View report" action pointing to the student report route;
- report route resolves current workspace server-side;
- report route does not accept workspace or teacher IDs from search params;
- report page includes date controls with visible labels;
- report page includes factual student/range/count context;
- report entries use Evidence note as primary content and structured summary as supporting context;
- legacy note-less entries are labeled honestly;
- empty range state uses teacher-safe copy;
- no Reports nav item is added;
- no print/PDF button is added in Unit 33;
- no AI, trend, recommendation, compliance, IEP, parent, admin, upload, analytics, billing, or new dependency scope appears.

## Acceptance Criteria

1. A teacher can open a report for one active roster student from that student's timeline.
2. The report route is protected by the existing authenticated app shell.
3. The report verifies student ownership server-side through the current workspace.
4. Another teacher cannot access the report data.
5. Blank date range shows all non-archived evidence for the selected student.
6. Valid start/end filters show only matching evidence by evidence date.
7. Invalid dates show plain teacher-safe errors.
8. Start-after-end is rejected.
9. Evidence entries are chronological from oldest to newest.
10. Evidence notes are the primary report text for new beta records.
11. Structured summary and metadata remain supporting context.
12. Legacy records without notes are not given fabricated note text.
13. Empty states are clear and action-oriented.
14. The report is read-only.
15. No Reports navigation item, class report, all-student report, report template, print/PDF behavior, AI, uploads, admin, analytics, billing, or new dependency scope is added.
16. UI matches the current calm ClassTrace design system on mobile and desktop.
17. Focused tests pass.
18. `npm.cmd run test` passes.
19. `npm.cmd run lint` passes.
20. `npm.cmd run build` passes.
21. `context/ui-registry.md` and `context/progress-tracker.md` are updated.

## Verification Commands

Run focused tests first, for example:

```bash
npm.cmd run test -- lib/evidence/student-report-records.test.ts lib/student-report-ui.test.ts lib/student-timeline-ui.test.ts
```

Then run:

```bash
npm.cmd run test
npm.cmd run lint
npm.cmd run build
```

If the implementation creates different focused test files, report the actual focused command.

Manual browser checks should cover:

1. Sign in with Clerk development auth.
2. Open an active student's timeline.
3. Use "View report" to open that student's report.
4. Confirm all-evidence view shows non-archived evidence only.
5. Apply a start-only range.
6. Apply an end-only range.
7. Apply a start+end range.
8. Try an invalid range and confirm teacher-safe error copy.
9. Confirm Evidence notes are primary and structured fields are supporting context.
10. Confirm there is no print/PDF action yet.
11. Check desktop and mobile layouts for readable report content and no horizontal overflow.

Do not claim manual browser verification unless it is actually run.

## Progress Tracker Updates

After implementation, update `context/progress-tracker.md` with:

- Unit 33 implementation summary;
- report route and query behavior;
- ownership/date-range verification;
- tests/checks run;
- manual browser verification status;
- remaining risks;
- Unit 34 handoff for printable report behavior.

Do not mark Unit 33 complete until relevant automated checks pass or the human explicitly accepts incomplete verification.

## Stop Conditions

Stop and ask the human before continuing if:

- the implementation would require class reports, all-student reports, report templates, or a Reports navigation item;
- the implementation would generate PDFs or add print-specific behavior that belongs to Unit 34;
- the implementation would infer trends, diagnoses, recommendations, progress claims, or themes;
- the implementation would add AI rewriting, summarization, or analysis;
- the implementation would expose raw draft notes;
- the implementation would add evidence editing or report-surface mutations;
- the implementation would weaken workspace ownership or one-student report scope;
- the implementation would add uploads, organizations, admin tools, analytics, billing, background jobs, or new dependencies;
- verification fails and the fix is outside this unit's scope.

## Post-Unit State

After Unit 33 is complete:

```txt
Student timeline       -> includes restrained View report action
Student report route   -> one active student, workspace-scoped
Date range             -> optional, validated, evidenceDate-based
Report content         -> Evidence notes primary, structured metadata supporting
Report behavior        -> read-only, no generated files
Print / Save as PDF    -> deferred to Unit 34
```

The next planned unit is Unit 34 - Printable Student Report.

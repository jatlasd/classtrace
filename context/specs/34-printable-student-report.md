# Unit 34 - Printable Student Report

## Goal

Make the existing single-student report useful in normal browser print and Save as PDF flows.

After this unit:

- A teacher can use a clear **Print / Save as PDF** action from the student report page.
- The browser print output contains the report heading, student context, selected date range, evidence count, and evidence entries.
- App navigation, filters, buttons, and other non-report controls are hidden from printed output.
- Evidence entries avoid awkward page breaks where practical.
- The printed report matches the date range the teacher reviewed on screen.
- No generated PDF file, PDF storage, external print service, or new dependency is added.

This unit builds on Unit 33. It does not add report templates, class reports, all-student reports, AI summaries, export generation, or any new report workflow.

## Why This Unit Exists

Unit 33 added a readable, read-only report for one active roster student. Pre-beta teachers need a simple way to take that exact report into meetings or local records using the browser's built-in print and Save as PDF behavior.

The safest beta version is not a PDF-generation system. It is the same one-student, workspace-scoped, teacher-reviewed evidence report with print-specific styling.

## Architect Blueprint

Blueprint ready.

### Language

- **Print / Save as PDF**: The browser's built-in print dialog, not app-generated PDF creation.
- **Printable report**: The student report content formatted for paper/PDF output.
- **Print chrome**: App navigation, buttons, date filter controls, and other screen-only controls that should not appear in print.
- **Selected range**: The current `start` and `end` query parameters already validated by the Unit 33 report route.

### Decisions

- Add a small client-side print action that calls `window.print()`.
- Keep the action inside the existing student report page, not in global navigation.
- Add print-specific CSS using existing app styles and media queries.
- Preserve the current report route and query parameters.
- Do not add generated file downloads, PDF libraries, server-side PDF rendering, or print services.
- Do not add a print preview route unless implementation proves the existing route cannot print cleanly.

## Prerequisite Gate

Do not implement Unit 34 until all of these are true:

1. Unit 33 is complete and reviewed/approved by the human.
2. This Unit 34 spec exists.
3. The human explicitly confirms Unit 34 implementation should begin.

Writing this spec does not authorize implementation by itself.

## Scope

### In Scope

- Add a restrained Print / Save as PDF action to the existing student report view.
- Implement browser print behavior through `window.print()`.
- Add print-specific layout rules so printed output includes only the intended report content.
- Preserve the selected date range through the existing report URL/query state.
- Ensure report heading, student context, selected date range, record count, and evidence entries print clearly.
- Hide non-report chrome in print:
  - authenticated app top navigation;
  - back/action buttons;
  - print button;
  - date range form controls;
  - other screen-only helper UI.
- Keep evidence entries readable and avoid page breaks inside entries where practical.
- Update focused tests/static UI guardrails for print action and print-scope exclusions.
- Update `context/ui-registry.md` for the printable report pattern.
- Update `context/progress-tracker.md` after implementation.

### Out of Scope

- Generated PDF files.
- PDF download endpoints.
- PDF storage.
- PDF uploads.
- External print/report services.
- New dependencies.
- Report templates or custom report builders.
- Class reports.
- All-student reports.
- Reports navigation item.
- IEP reports, parent updates, behavior report templates, compliance artifacts, or official documentation generation.
- AI summaries, AI rewriting, trend detection, recommendations, or generated conclusions.
- Evidence editing, archive, delete, or export actions from the report surface.
- Raw draft note display or raw draft export.
- File uploads, photos, audio, voice notes, PDFs, or attachments.
- Class-scoped capture, classwide notes, or multi-student evidence.
- Organization, district/admin, SIS/Classroom/Clever/ClassLink, gradebook, IEP-writing, parent communication, analytics, billing, telemetry, or background jobs.

## Likely Files Changed

### Likely new

- `context/specs/34-printable-student-report.md`
- `components/students/student-report-print-action.tsx`
- Static/UI guard tests for printable report behavior, if a new test file is clearest.

### Likely modified

- `components/students/student-report-page.tsx`
- `app/globals.css` or another existing global stylesheet location, only for narrowly scoped `@media print` rules if component-local class names are insufficient.
- `context/ui-registry.md`
- `context/progress-tracker.md`

### Possibly modified

- `lib/student-report-ui.test.ts`
- `lib/routes.test.ts` only if route helpers need a print-related assertion, though route changes are not expected.

### Not expected

- `prisma/schema.prisma`
- Prisma migrations
- `package.json`
- Lockfiles
- `next.config.*`
- `tsconfig.json`
- `eslint.config.*`
- `postcss.config.*`
- `components/ui/*`
- `app/api/**`
- Clerk auth files
- Evidence save/read helpers
- Student report server helper
- Landing page files

If implementation needs one of the not-expected files, stop and explain why before editing.

## UI Requirements

### Print action

Add one clear screen-only action to the existing student report page.

Preferred copy:

```txt
Print / Save as PDF
```

The action should:

- be secondary and restrained;
- sit near the report header/action area;
- use existing `Button` styling;
- call the browser print dialog;
- not imply that ClassTrace generates or stores a PDF.

Avoid copy such as:

```txt
Generate PDF
Download report
Create official report
Compliance packet
IEP-ready report
```

### Screen layout

The on-screen report should remain recognizably the Unit 33 report:

- student workflow route;
- back-to-timeline action;
- date range controls;
- factual report context;
- Evidence notes as primary content;
- structured metadata as supporting context.

Do not redesign the report into a static PDF preview.

### Print layout

Printed output should include:

- report title;
- student display name;
- mention handle;
- current class when available;
- selected date range or all-evidence label;
- record count for the current range;
- evidence entries in the current sorted order;
- Evidence note as primary text;
- structured summary and metadata as supporting context;
- honest legacy structured-entry labeling when no Evidence note exists.

Printed output should exclude:

- app top navigation;
- back buttons;
- Print / Save as PDF button;
- date filter form fields and apply/clear controls;
- hover-only or interactive affordances;
- unrelated app chrome.

### Page break behavior

Use print-friendly CSS where practical:

- avoid breaking a single evidence card across pages when feasible;
- keep heading/context together at the start;
- preserve readable spacing without wasting paper;
- use black or existing readable ink colors on a white/paper-like print background;
- remove heavy shadows or decorative screen-only effects in print.

Do not over-engineer pagination. Browser print behavior can vary, so the goal is a readable report, not exact layout parity across every printer.

## Accessibility Requirements

- The print action has an accessible name.
- The print action works with keyboard activation.
- The page still has one clear `h1`.
- Print-hidden controls remain available on screen.
- Screen-only and print-only content does not duplicate confusing context for assistive technology.
- Date range context remains visible in print even when date controls are hidden.

## Logic Requirements

### Browser-only print behavior

The print action should be a small Client Component because it needs `window.print()`.

Expected pattern:

```ts
"use client";

export function StudentReportPrintAction(): JSX.Element {
  return (
    <Button type="button" onClick={() => window.print()}>
      Print / Save as PDF
    </Button>
  );
}
```

Use the existing component/import patterns and return type conventions in the project.

### Preserve route state

The print output must reflect the report currently loaded in the browser.

Do not:

- mutate search params before printing;
- fetch alternate report data for print;
- add a second server read path;
- add a generated file route.

### Read-only behavior

The print unit must not mutate:

- students;
- evidence;
- archive/delete state;
- export state;
- saved notes;
- structured metadata.

## Styling Requirements

Prefer scoped class names on the report page plus a narrow `@media print` block.

Potential class names:

```txt
student-report-page
student-report-screen-only
student-report-print-root
student-report-print-context
student-report-entry
```

Print CSS should be as small and targeted as possible.

Allowed print CSS behavior:

- hide `.student-report-screen-only`;
- hide global app chrome when printing from a report page if needed;
- remove shadows;
- set print background/text colors for readability;
- apply `break-inside: avoid` to report entries;
- tighten spacing for paper.

Do not change the global visual language for normal screen rendering.

## Test Requirements

Add or update focused tests before or alongside implementation.

Tests should verify:

- the student report page includes a "Print / Save as PDF" action;
- the print action is screen-only;
- the print action uses browser print behavior rather than linking to a generated PDF route;
- report date range context remains visible outside the hidden date form;
- print-specific class names or CSS hooks are present on report content;
- date controls are hidden from print through the chosen print class/hook;
- evidence entries have a print page-break guard class or style hook;
- no generated PDF endpoint, download route, or PDF library/dependency is added;
- no Reports navigation item is added;
- no AI, trend, recommendation, compliance, IEP, parent, admin, upload, analytics, billing, or new dependency scope appears.

If the test approach is static file inspection, keep it focused and avoid brittle assertions against unrelated formatting.

## Acceptance Criteria

1. A teacher can click "Print / Save as PDF" from one student's report.
2. The action opens the browser print dialog through `window.print()`.
3. The printed report includes the same selected date range and evidence records shown on screen.
4. Report heading, student context, selected range, record count, and evidence entries print clearly.
5. App navigation and screen-only controls are hidden in print.
6. Date filter controls are hidden in print, while the selected range label remains visible.
7. Evidence entries avoid page breaks inside entries where practical.
8. Evidence notes remain primary and structured metadata remains supporting context.
9. Legacy note-less records remain honestly labeled.
10. The report remains read-only.
11. No generated PDF file, PDF endpoint, PDF storage, PDF upload, external print service, or new dependency is added.
12. No Reports navigation item, class report, all-student report, report template, AI, upload, admin, analytics, billing, or new workflow scope is added.
13. UI matches the current calm ClassTrace design system on screen.
14. Printed output is readable for both short and longer evidence histories.
15. Focused tests pass.
16. `npm.cmd run test` passes.
17. `npm.cmd run lint` passes.
18. `npm.cmd run build` passes.
19. `context/ui-registry.md` and `context/progress-tracker.md` are updated.

## Verification Commands

Run focused tests first, for example:

```bash
npm.cmd run test -- lib/student-report-ui.test.ts
```

Then run:

```bash
npm.cmd run test
npm.cmd run lint
npm.cmd run build
```

If implementation creates different focused test files, report the actual focused command.

Manual browser checks should cover:

1. Sign in with Clerk development auth.
2. Open an active student's report from that student's timeline.
3. Apply a date range and confirm the URL/query state reflects it.
4. Click "Print / Save as PDF".
5. Confirm browser print preview opens.
6. Confirm the printed content includes report title, student context, selected range, count, and evidence entries.
7. Confirm app navigation, back/action buttons, print button, and date controls do not print.
8. Confirm Evidence notes remain primary and structured details are supporting context.
9. Check a short report and a longer report if data is available.
10. Check desktop and mobile screen layouts still remain readable before printing.

Do not claim manual browser verification unless it is actually run.

## Progress Tracker Updates

After implementation, update `context/progress-tracker.md` with:

- Unit 34 implementation summary;
- print action behavior;
- print CSS/layout behavior;
- tests/checks run;
- manual browser print verification status;
- remaining risks;
- Unit 35 handoff for pre-beta feature review.

Do not mark Unit 34 complete until relevant automated checks pass or the human explicitly accepts incomplete verification.

## Stop Conditions

Stop and ask the human before continuing if:

- implementation would require generated PDF files or a PDF dependency;
- implementation would require a new route for generated reports;
- implementation would require class reports, all-student reports, report templates, or Reports navigation;
- implementation would infer trends, diagnoses, recommendations, progress claims, or themes;
- implementation would add AI rewriting, summarization, or analysis;
- implementation would expose raw draft notes;
- implementation would add evidence editing or report-surface mutations;
- implementation would weaken workspace ownership or one-student report scope;
- implementation would add uploads, organizations, admin tools, analytics, billing, background jobs, or new dependencies;
- verification fails and the fix is outside this unit's scope.

## Post-Unit State

After Unit 34 is complete:

```txt
Student report route       -> one active student, workspace-scoped
Date range                 -> existing Unit 33 query state preserved
Screen report              -> readable student report with print action
Print / Save as PDF        -> browser-native, no generated file infrastructure
Printed content            -> report-only output with student/range/evidence context
Next planned unit          -> Unit 35 pre-beta feature review and coverage pass
```

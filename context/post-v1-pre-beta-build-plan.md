# Post-V1 / Pre-Beta Build Plan

This file defines the ordered feature build path after the completed V1 build and before inviting beta teachers into ClassTrace.

It is deliberately narrow. The purpose is not to turn ClassTrace into a broad school platform. The purpose is to make the existing teacher-first evidence loop usable in a real classroom over time:

```txt
class-first roster setup → student-specific capture → structured draft + teacher-approved evidence note → saved evidence → student timeline → readable student report
```

V1 is complete. This plan changes a few V1 assumptions intentionally, under teacher control:

- Active students must belong to exactly one active class.
- Classes become the organizing structure for roster setup, not a required capture context.
- The teacher-approved evidence note becomes a durable part of saved evidence.
- A readable per-student report becomes available from the existing student timeline.

This plan does not authorize implementation by itself. Each unit still needs its own focused spec and explicit human approval before implementation begins.

---

## Pre-Beta Product Decisions Already Made

These decisions are settled unless the human explicitly changes them later.

### Classes and roster

- Every active student belongs to exactly one class during beta.
- A class has one required name. There are no separate subject, course, period, grade, or room fields in beta.
- Classes organize the roster only. The global capture workflow remains exactly as it is: teachers do not choose a class before capturing evidence.
- The roster becomes layered: teachers see classes first and open a class to see its students.
- Classes can exist with no students.
- Teachers create classes from the roster’s class-level surface. Student entry does not create a new class inline.
- Students are added from inside a class and inherit that class.
- Teachers can edit a student’s name, mention handle, and class assignment.
- Teachers move students through Edit Student, not drag and drop.
- Classes can be renamed and archived. They are not permanently deleted during beta.
- A class with active students cannot be archived until its students have been moved to active classes.
- Archived classes are hidden by default and available in an archived-classes view.
- Roster import lives inside an opened class. Imported students inherit the currently opened class; imports do not contain a class column or class picker.

### Evidence notes

- After capture, the existing structured review remains.
- A separate editable **Evidence note** field is prefilled with the capture text after deterministic removal of the resolved student mention and parsed tags.
- There is no professional rewriting, generative cleanup, or silent wording change.
- The review UI makes it unmistakable that the evidence note will be saved exactly as shown unless the teacher edits it.
- The final teacher-approved note is stored permanently with the evidence record.
- Saved evidence records are not editable later. Archive and permanent-delete behavior remain the corrective paths.
- Structured fields remain useful organization and filtering metadata. The evidence note is the primary human-readable observation.

### Student reports

- Reports are per student only.
- Reports live from the existing student profile/timeline, not in a separate Reports section.
- A report is a clear presentation of stored evidence, not a purpose-specific template such as an IEP, parent update, or behavior report.
- Teachers may select an optional date range. A blank range includes all eligible evidence.
- The report supports the normal browser Print / Save as PDF flow. Beta does not generate a separate downloadable PDF file.

---

## Core Principle

Build one visible, testable unit at a time.

For UI-heavy features, build or adapt the full UI with safe local/mock state first when that reduces implementation risk, then wire real logic in the next focused unit. For data-heavy features, keep the server/data work tied to a visible teacher workflow as soon as possible.

Every unit must:

- Preserve ClassTrace as a teacher-first student evidence system, not a general notebook or school operating system.
- Keep the capture composer global and prominent.
- Keep one resolved student per evidence record.
- Require teacher validation before durable evidence is saved.
- Keep all student and evidence data scoped to the current teacher workspace server-side.
- Use deterministic note processing only. Do not add generative AI or external note processing.
- Stay text-only. Do not add attachments, uploads, photos, audio, voice notes, or PDFs.
- Avoid district/admin tools, shared records, SIS sync, gradebook features, parent communication, billing, analytics, background jobs, or in-app beta-feedback tooling.
- Avoid broad redesigns or unrelated refactors.
- Run relevant checks before being considered complete.
- Update `context/progress-tracker.md` and any context document changed by the unit.

---

## Phase 6 — Pre-Beta Contract Reset

### 27 Pre-Beta Product and Architecture Contract Reset

Update the project context so agents do not accidentally enforce superseded V1 rules while building beta features.

**UI:**

- No production UI change is required in this unit.
- Add only a small development-visible migration/upgrade state if it is necessary to prevent existing active students without a class from entering class-first roster workflows incorrectly.

**Logic:**

- Update the relevant context files to distinguish the completed V1 contract from the post-V1/pre-beta contract.
- Replace the V1-only rule that all raw capture text is forbidden from permanent storage with the beta rule: only the teacher-reviewed Evidence note may be durable; the original capture remains a temporary draft.
- Replace optional class assignment with the beta rule that every active student must have one active class.
- Preserve the existing invariants around one-student evidence, teacher validation, workspace isolation, deterministic parsing, and text-only operation.
- Define a safe migration posture for existing V1 data:
  - Do not invent class assignments for active students.
  - Do not fabricate evidence-note text for historical structured-only records.
  - Existing records without a durable note must remain honest legacy structured records until archived or deleted.
  - New beta evidence saves require a teacher-approved Evidence note.
- Add this plan to the standard agent read order once it becomes the active build path.

**Done when:**

- `context/project-overview.md`, `context/architecture.md`, `AGENTS.md`, and any affected rules no longer conflict with the beta decisions above.
- The migration posture for existing students and evidence is documented.
- No runtime behavior is changed beyond any narrowly required safety gate for legacy data.
- Relevant documentation checks pass.

---

## Phase 7 — Class-First Roster

### 28 Class Domain, Ownership, and Migration Foundation

Add the server-side class behavior required for a class-first roster without changing the capture workflow.

**UI:**

- No broad roster redesign in this unit.
- A minimal temporary upgrade state is allowed if existing active students must be assigned before normal roster actions can continue.

**Logic:**

- Finalize `ClassGroup` as a teacher-workspace-owned, named, archivable class record.
- Enforce one active class assignment for every active roster student in beta.
- Require class names to be non-empty and prevent confusing duplicate class names within the same workspace using a documented normalization rule.
- Add narrow workspace-scoped helpers and Server Actions for:
  - listing active and archived classes;
  - creating a class;
  - renaming a class;
  - archiving a class;
  - listing active students inside a class.
- Preserve the current `EvidenceRecord.classGroupId` behavior as the class associated with evidence when it was saved. Moving a student later must not rewrite old evidence into the student’s new class.
- Do not add permanent class deletion.
- Do not allow archive behavior to silently leave an active student unassigned. Archive must be rejected until those students are moved.
- Design the data migration so the database and app can safely move from V1’s nullable class assignment to beta’s required active assignment without guessing at real teacher data.
- Keep all class and roster operations workspace-scoped on the server. Never accept a client-provided workspace or teacher identifier.

**Done when:**

- A teacher can only read or mutate classes inside their own workspace.
- New active students cannot be created without a valid active class.
- Existing active students have a clear, safe assignment path rather than a guessed class.
- A class cannot be archived while active students still belong to it.
- Historical evidence retains its original class relationship after a student moves.
- Focused ownership, validation, archive-blocking, and migration tests pass.
- Lint/test/build pass.

---

### 29 Layered Roster and Class-First Onboarding

Replace the flat student-first roster surface with the beta class-first workspace.

**UI:**

- The roster opens at the class level, showing class rows/cards rather than one long flat student list.
- Opening a class shows that class’s normal student list and class-level actions.
- A class can show an empty state and remain empty.
- The empty onboarding path begins with **Create your first class**.
- After creation, route into the new class’s empty roster surface with clear choices to add students one at a time or import a list.
- Keep class management inside Roster. Do not add a separate Classes navigation item.
- Add normal class actions in the class-level surface: create, rename, and archive.
- Keep archived classes out of the default roster view and expose a restrained archived-classes view.
- Add/Edit Student from the appropriate class context. Edit Student can change display name, mention handle, school/local ID when present, and class assignment.
- Moving a student uses the edit flow and an existing active-class selector. Do not add drag and drop.
- Preserve current archive/delete student behavior where it remains compatible with class assignment.

**Logic:**

- A newly added student is associated with the class currently being viewed.
- All class choices in student editing come from active classes in the current workspace.
- Onboarding is complete only when the teacher has at least one active student assigned to a class. Empty classes are valid but do not by themselves enable meaningful capture.
- Preserve global feed behavior. Do not introduce class-first capture, class filters that block capture, classwide notes, or multi-student capture.
- Keep the existing student timeline route and evidence ownership model intact.

**Done when:**

- A new teacher can create a class, add a student to it, and reach the global evidence feed.
- An existing teacher can organize students by opening classes from the roster.
- Every visible active student has one visible active class assignment.
- A teacher can correct a student’s name, handle, or class safely.
- Classes with no students are supported.
- Archived classes and archived students remain clearly separated from active roster work.
- UI matches the current ClassTrace design system and uses plain teacher language.
- Lint/test/build pass.

---

### 30 Class-Scoped Roster Import

Move roster import from the global roster surface into an opened class.

**UI:**

- Place the existing paste-list import entry point inside an opened class’s student-management surface.
- Keep the existing review-before-save interaction: paste, preview, correct/cancel, confirm, success/error state.
- Make it obvious that every imported student will be added to the currently open class.
- Keep manual one-at-a-time entry available beside or near import without turning the class page into an admin console.

**Logic:**

- Retain the simple pasted formats for student name, optional handle, and optional school/local ID.
- Do not accept a class column, class picker, or inline class creation inside import.
- Bind every valid confirmed import row to the currently opened active class server-side.
- Preserve all-or-nothing import behavior and server-side duplicate validation.
- Block import into an archived or unowned class with teacher-safe copy.
- Update onboarding handoff so a successful class-scoped import can complete setup and route the teacher to the feed when appropriate.

**Done when:**

- A teacher can open a class, paste a student list, preview it, and save all valid students into that class.
- Imported students cannot land unassigned or in another teacher’s class.
- Import remains atomic and duplicate protections remain intact.
- The old unscoped roster import surface is removed or clearly replaced.
- Lint/test/build pass.

---

## Phase 8 — Durable Teacher-Authored Evidence

### 31 Evidence Note Data Contract and Save Boundary

Add the durable teacher-approved Evidence note to saved evidence without weakening the validation boundary.

**UI:**

- No broad review redesign in this unit beyond any minimum field bridge needed to verify the new persistence contract.

**Logic:**

- Add a dedicated durable Evidence note field to the evidence model. Do not overload `summary`; structured summary and teacher-authored note serve different purposes.
- For every new beta evidence record, require a non-empty teacher-approved Evidence note.
- Use the existing deterministic clean-text output as the initial note value: the captured wording with the resolved student mention and parsed tags removed.
- Do not perform AI rewriting, professionalization, compression, rephrasing, or other wording changes.
- Save the final reviewed note exactly as submitted from the review field. Once the teacher can see and edit it, do not silently transform it again.
- Update the save action, server-only evidence helper, client-safe record models, and tests to carry the note.
- Retain the temporary raw capture only through the compose/review state. Do not add a durable raw-capture field, raw-note logging, or a hidden draft archive.
- Keep evidence records immutable after save. Do not add an edit-evidence action or revision-history feature.
- Treat existing V1 structured-only records honestly: do not fabricate a teacher-authored note from their summary. Their display can use the legacy structured presentation until those records are archived or deleted.

**Done when:**

- A new evidence record cannot save without a teacher-approved note.
- The durable note is distinct from structured summary and metadata.
- The database write contains the reviewed note and no original raw-capture field.
- Server-side tests prove workspace ownership, note requirement, and raw-capture non-persistence.
- Historical V1 records do not receive invented note content.
- Lint/test/build pass.

---

### 32 Evidence Note Review, Feed, Timeline, and Export Pass

Make the durable Evidence note understandable at review time and useful everywhere teachers read their evidence.

**UI:**

- Add the editable Evidence note field to the existing structured review panel.
- Give the field primary visual weight and clear, calm explanatory copy that communicates: **This note will be saved exactly as shown.**
- Keep the structured interpretation visible and editable as supporting teacher-controlled metadata.
- Make saved Evidence notes the primary human-readable content in feed rows and student timeline entries.
- Keep tags, evidence type, topic, performance, behavior, and follow-up information as secondary organization/context rather than replacing the note.
- Make older V1 records without a note visually honest as structured legacy entries; do not pretend their summary was a verbatim teacher observation.

**Logic:**

- Prefill the Evidence note with deterministic clean text only.
- Ensure the final note is included in client-side feed search and any existing relevant local filters.
- Update individual CSV export to include the durable Evidence note while preserving current one-student, workspace-scoped export behavior.
- Preserve archive and permanent-delete behavior for evidence records.
- Do not add post-save evidence editing, automatic cleanup, report generation, or any new AI behavior.

**Done when:**

- A teacher reviewing a capture can plainly see what words will become the saved record.
- Leaving the field untouched saves the prefilled clean text exactly as displayed.
- Editing the field saves the edited wording exactly as displayed.
- Feed, timeline, and individual CSV export include the durable note for new beta records.
- Existing record behavior remains safe and understandable.
- Lint/test/build pass.

---

## Phase 9 — Per-Student Evidence Report

### 33 Per-Student Report View and Date-Range Query

Add one readable, general evidence report for a single student.

**UI:**

- Add a restrained **View report** action from the existing student profile/timeline.
- Keep reports inside the student workflow. Do not add a Reports navigation item, report home page, or dashboard.
- Provide an optional start date and end date. Leaving both blank includes all eligible evidence.
- Present the report as a calm, readable document view rather than a data table or compliance dashboard.
- Include factual context at the top: student name, current class where appropriate, selected date range or all-evidence label, and record count.
- Present evidence in chronological order with the saved Evidence note as the main content and structured fields/tags as supporting context.
- Use only factual organization. Do not manufacture trends, diagnoses, growth claims, recommendations, or “common themes.”
- Show an honest empty state when the selected date range has no eligible evidence.

**Logic:**

- Query only one active student owned by the current teacher workspace.
- Include only non-archived evidence by default.
- Validate date inputs and reject invalid ranges with plain teacher-safe copy.
- Keep report reads server-side and return client-safe display models only.
- Preserve class history correctly: evidence should retain the class relationship associated with it when it was saved, even if the student later moves classes.
- Do not modify evidence from the report surface.
- Do not add class reports, all-student reports, report templates, custom report builders, AI summaries, or export generation in this unit.

**Done when:**

- A teacher can open one student’s report from that student’s timeline.
- A blank range shows all eligible evidence; a valid range shows only matching evidence.
- The report makes the saved notes and supporting metadata easier to understand than CSV.
- Another teacher cannot access the report or report data.
- Lint/test/build pass.

---

### 34 Printable Student Report

Make the single-student report useful outside the browser without adding PDF-generation infrastructure.

**UI:**

- Add a clear browser **Print / Save as PDF** action inside the student report view.
- Create print-specific layout rules so the browser output reads as a document:
  - report heading and student/date-range context remain visible;
  - evidence entries do not break awkwardly when practical;
  - navigation, filters, buttons, and non-report chrome do not print;
  - the selected date range remains apparent in the printed document.
- Keep the on-screen report and print output visually related without making the screen version look like a static PDF preview.

**Logic:**

- Use the browser’s normal print capability. Do not create a separate generated PDF download, PDF storage, external print service, or new dependency.
- Preserve the existing selected date range through the report route/state so printed output matches what the teacher reviewed.
- Keep report generation read-only and per student.

**Done when:**

- A teacher can use the report’s Print / Save as PDF action in a normal browser flow.
- Printed output contains only the intended student report content and selected range.
- The print layout remains readable across a short report and a longer evidence history.
- Lint/test/build pass.

---

## Phase 10 — Pre-Beta Feature Verification

### 35 Pre-Beta Feature Review and Coverage Pass

Run a focused review of the new beta feature path before inviting teachers to use it.

**Review checklist:**

- Active students have exactly one active class; class ownership is workspace-scoped.
- Class archive cannot strand active students without a class.
- Class-first onboarding, manual entry, edit student, and class-scoped import all work together.
- Global capture behavior is unchanged: one resolved student remains required and teachers do not need to choose a class to capture.
- New evidence saves include the teacher-approved Evidence note and no durable raw-capture field.
- Evidence notes cannot be edited after save.
- Feed, timeline, CSV, and report views present the durable note correctly.
- Legacy V1 structured-only records are not given fabricated teacher wording.
- Student reports remain one-student, workspace-scoped, date-range-correct, and read-only.
- Print / Save as PDF uses the browser and excludes app chrome.
- No AI, attachment, multi-student, classwide-note, district/admin, sync, gradebook, IEP-writing, parent communication, reporting-dashboard, analytics, or feedback-tooling scope has entered the app.
- Context documents accurately describe the post-V1/pre-beta rules.

**Done when:**

- New or changed product invariants have focused automated coverage.
- `npm.cmd run test` passes.
- `npm.cmd run lint` passes.
- `npm.cmd run build` passes.
- Manual browser checks cover onboarding, class management, manual add, import, edit/move student, capture/review/save, feed/timeline, report filtering, and print layout.
- Findings are documented separately as fix units or explicitly accepted follow-ups. Do not quietly expand the plan during review.

---

## Explicitly Out of Scope for This Build

Do not add these features while implementing the plan above:

- AI rewriting, AI summaries, AI pattern detection, or external note processing.
- Post-save evidence editing, revision history, or automatic professionalization.
- Class-first capture, classwide notes, multi-student capture, or bulk evidence entry.
- Class reports, all-student reports, report templates, report builders, dashboards, or inferred trend analysis.
- Generated PDF files, PDF storage, PDF uploads, or external print/report services.
- Drag-and-drop roster management.
- Inline class creation while adding a student or importing a roster.
- File uploads, photos, audio, voice notes, attachments, or work samples.
- District accounts, organizations, shared student records, administrators, SIS sync, Google Classroom, Clever, ClassLink, or gradebook features.
- IEP writing, parent messaging, student-facing features, billing, analytics, telemetry, background jobs, or in-app beta feedback/reporting tools.
- Deployment, signup gating, production operations, monitoring, backups, legal/compliance review, or beta recruitment. Those are separate from this feature build plan.

---

## Recommended Implementation Order

```txt
27 Contract reset
→ 28 Class domain and migration foundation
→ 29 Layered roster and class-first onboarding
→ 30 Class-scoped roster import
→ 31 Evidence note data/save boundary
→ 32 Evidence note review and read surfaces
→ 33 Per-student report view
→ 34 Printable report
→ 35 Pre-beta feature review
```

Do not skip the contract reset or class-domain foundation. The rest of the plan depends on cleanly changing V1’s optional-class and structured-only-evidence assumptions before UI work starts.

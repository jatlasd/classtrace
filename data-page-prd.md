# ClassTrace Explore Evidence PRD

## Status

Proposed major feature for the invitation-only limited beta.

This document defines a bounded first release. It does not approve the deferred
capabilities listed below or change the behavior of the current product until
the feature is implemented and verified.

## Product Summary

ClassTrace helps a teacher turn a quick classroom observation into one
teacher-reviewed evidence record for one roster student. Explore Evidence helps
the teacher retrieve and organize those saved records later.

The feature is a teacher-operated, deterministic evidence query tool. A teacher
chooses what to see, names the students, tags, dates, classes, or photo
presence that matter, and receives current results with the supporting evidence
visible.

The product loop becomes:

```text
Capture naturally
  → review and save evidence
    → explore saved evidence
      → inspect the supporting records
```

Explore Evidence is not an automated analytics system. It does not interpret
evidence, recommend conclusions, score students or teachers, or generate
documentation.

## Problem

The long-term value of classroom evidence depends on being able to retrieve the
right records when a teacher needs them. Today, a teacher may need to remember
events, move through timeline pages, count records manually, or assemble
evidence elsewhere.

Examples of appropriately scoped questions include:

- What evidence did I save for Jeremy during the last 30 days?
- Which saved records are tagged `#reteach` and `#fractions`?
- Which students are represented in evidence tagged `#independent` this month?
- Which saved records from Reading Support include a photo?
- What photo evidence have I saved for Mary?

Explore Evidence should answer these questions from teacher-approved evidence
without changing how the teacher captures it.

## Product Principle

**Teachers should not have to collect evidence differently in order to find it
later.**

Students, teacher-reviewed tags, evidence dates, classes, and photo presence
already provide useful structure. Explore Evidence makes that existing
structure directly usable.

## User Promise

**Ask a question of your saved evidence and inspect the records that answer it.**

Every count and student grouping must remain traceable to the qualifying saved
evidence. The feature presents what matches; the teacher decides what it means.

## Primary Users

The feature is designed for individual teachers with substantial documentation
needs, especially:

- Special education teachers
- Case managers
- Interventionists
- Resource teachers
- Co-teachers
- Teachers managing anecdotal or progress-monitoring evidence across students

The interface must not require knowledge of databases, Boolean logic, or formal
data analysis.

## Product Vocabulary and Evidence Boundary

The feature is named **Explore Evidence**.

- App navigation label: **Explore**
- Page context: **Explore**
- Supporting copy: **Ask questions of the evidence you reviewed and saved.**

The interface describes the teacher's work as a **question**. The
implementation may call the submitted definition a query, but the teacher does
not need to learn query, filter, or condition terminology.

Explore Evidence queries only permanent, teacher-validated `EvidenceRecord`
data. It never queries or displays temporary drafts or raw capture text.

The provenance path is:

```text
Result → supporting saved evidence → student timeline
```

The word **capture** remains reserved for the temporary capture-and-review
workflow. Query results are **evidence** or **students represented by matching
evidence**.

## Core Experience

The page begins with a visible sentence composed from interactive slots:

> Show me evidence for **any student** tagged **any tags** from **all time**.

The first bounded page of active evidence appears immediately. Activating a
sentence slot opens and focuses the corresponding field in the optional
**Filters** plate. The same plate is available from the explicit Filters
disclosure and groups Student/Class, Tags/Photo, and Date as Who, What, and
When. Empty fields do not constrain results. The teacher can change the sentence
or fields without saving a configuration. **Show results** runs the current
valid question; **Update results** applies changes after the displayed results
no longer match.

Example:

> Show me **Students** from **Last 30 days**
> Student **Jeremy**, **Mary**
> Tags **#fractions**, **#reteach** (all of these tags)
> Without **#assessment**
> Photo **With a photo**

Tags are one field. Two or more selected tags default to matching all of them,
with any-of as an explicit exception. Exclude stays behind **Without…**. A
second include group can add the other matching mode after the primary tags
have a value.

The underlying implementation is a direct evidence filter, not a generalized
query language.

## First-Release Query Definition

A query contains the following bounded fields:

- Result view: Evidence or Students
- Students: any selected student
- Tags: include any selected tags
- Tags: include all selected tags
- Tags: exclude selected tags
- Date: one supported date rule
- Classes: any selected class
- Photo: either, with a photo, or without a photo

The stored and submitted query definition is versioned. It contains only these
known fields and bounded arrays of identifiers or normalized tag values.

### Condition logic

All populated condition sections are combined with **AND**.

Within a condition:

- Students match when the evidence belongs to any selected student.
- Classes match when the evidence belongs to any selected class.
- **Tags include any** matches when an evidence record has at least one selected
  tag.
- **Tags include all** matches when an evidence record has every selected tag.
- **Tags exclude** matches when an evidence record has none of the selected
  tags.
- The photo condition evaluates whether the evidence record has its one
  validated photo relation.

Tag inclusion and exclusion always evaluate one evidence record. For example,
excluding `#independent` means that the returned records do not have that tag.
It does not mean that a student has no independent evidence elsewhere.

The first release does not support arbitrary condition groups, mixed top-level
AND/OR expressions, collection-wide absence, frequency thresholds, or temporal
sequences.

### Tag matching

Tags use the same normalization as evidence save:

- A leading `#` is removed for storage and comparison.
- Surrounding whitespace is removed.
- Values are compared in lowercase.
- Matching is exact. `#read` does not match `#reading`.
- Tags are displayed with a leading `#`.

The tag picker offers normalized tags found in the teacher's active evidence.
Typing may filter the picker, but it does not run an evidence query until a tag
is selected.

### Date rules

The first release supports:

- All time
- Exact date
- Custom date range
- Last 7 days
- Last 30 days
- This month

Date semantics follow the existing teacher device-local calendar model:

- Exact dates represent teacher-local calendar dates.
- Custom ranges include both the start and end date.
- Last 7 days includes today and the previous six local calendar dates.
- Last 30 days includes today and the previous 29 local calendar dates.
- This month begins on the first local calendar date of the current month and
  ends today.
- Relative rules are recalculated whenever the query runs.
- The submitted question contains the relative rule, not a client-resolved date
  range.

The first release does not add week-start preferences, marking periods, rolling
hour windows, or before/after operators.

## Searchable Evidence Scope

Explore Evidence searches the same active evidence universe as the current
evidence feed:

- Evidence must be permanently saved and teacher validated.
- Archived evidence is excluded.
- Evidence belonging to an archived student is excluded.
- Temporary drafts and raw captures are excluded.
- Deleted records are unavailable.

### Class meaning

Class means the class relation stored on the evidence record when the evidence
was validated. It does not change when the student later changes classes.

An archived class may remain available as a condition when active evidence
still references it. The interface labels it as archived. If a class relation
is no longer available, Explore Evidence does not add a historical class-name
model to reconstruct it.

Evidence whose class relation is no longer available remains eligible for
queries that do not filter by class.

## Query Execution

Explore Evidence always supports an unsaved current question. Saving a reusable
configuration is not required or included in the first release.

- Changing a field updates the current question but does not query the server.
- **Show results** runs the complete valid question when the displayed results
  already match. **Update results** runs it after the question has changed.
- A custom date question cannot run until its date or range is valid.
- Typing inside a student, class, or tag picker narrows available choices; it
  does not run the evidence question.
- After the question changes, the run action reads **Update results** instead
  of a separate draft-versus-applied status line.
- While a question is running, the run action reads **Updating results…** and
  prevents duplicate submission.
- A query failure preserves the current fields and the last successful
  results, and offers a retry.
- Refreshing or reopening the page returns to the default all-evidence question.

Evidence created in another tab appears the next time the teacher chooses
**Show results**, **Update results**, or refreshes the page. Query execution does not require
WebSockets, server-sent events, subscriptions, background processing, or
notifications.

## Results Experience

Results prioritize supporting evidence rather than abstract summaries. The
first release provides only the two counts needed to orient the teacher:

- Matching evidence records
- Students represented by those records

Counts must describe the complete query result, not only the current result
page.

### Evidence view

- List individual matching evidence records.
- Sort by evidence date descending, then creation time descending.
- Use bounded server-side pagination.
- Reuse the shared evidence-record content and authenticated photo patterns.
- Link the student identity to the student's timeline.
- Keep the result surface read-only. Archive and delete actions remain in their
  existing evidence-management contexts.

### Students view

- Group matching evidence by roster student.
- List students alphabetically by display name rather than by match count.
- Show each student's complete matching-evidence count.
- Expand a student to reveal only evidence records that satisfy the current
  query.
- Sort supporting evidence by evidence date descending, then creation time
  descending.
- Paginate student groups and supporting evidence on the server when needed.

Students view does not rank students, infer performance, or evaluate whether a
student has sufficient evidence.

## Page Structure

The authenticated navigation becomes:

```text
Capture → Explore → Students → Settings
```

The Explore Evidence page uses the established warm evidence-trace visual
system rather than an analytics dashboard.

### Desktop

- Compact page context followed by the primary “Show me evidence for … tagged
  … from …” question
- Interactive sentence slots that open and focus the matching Student, Class,
  Tags, Date, or Photo control in one optional Who / What / When filter plate
- Explicit Show results / Update results execution
- Matching counts and open trace results below, or an alphabetical grouped
  student list with supporting records in inset wells

### Mobile

- The sentence, filter plate, and results remain one stacked working column.
- Controls stack or wrap without horizontal scrolling.
- Evidence and student rows preserve the existing mobile evidence patterns.

The page does not use metric cards, charts, decorative visualizations, or a
spreadsheet-like grid.

## Required States

The feature must define and test:

- No saved evidence yet
- Initial all-evidence results
- Current question has unapplied changes
- Show results pending
- No matches
- Query failure with retry
- Evidence-result pagination
- Student-group pagination
- Supporting-evidence loading and pagination

Empty and error states preserve the current query and explain the next useful
action without implying that evidence is missing for instructional reasons.

## Accessibility and Responsive Behavior

- Every control has a persistent accessible label.
- Multi-select controls support keyboard search, selection, and removal.
- Selected and unavailable values are not communicated by color alone.
- Clearing a filter field preserves a predictable focus position.
- Dismissing Without or an extra tag group moves focus to Tags.
- Result-count changes and query failures are announced without repeatedly
  interrupting screen-reader navigation.
- Updating state remains visible in reduced-motion mode.
- Touch targets approach 44 by 44 pixels on mobile.
- Long student, class, and tag names wrap or truncate intentionally without
  hiding their controls.
- Dropdowns and popovers are not clipped by the query work surface.

## Architecture and Data Contract

The feature remains inside the existing Next.js, Prisma, and PostgreSQL
architecture.

### Query boundary

```text
authenticated request
  → current accepted workspace
    → bounded query validation
      → workspace-scoped evidence query domain
        → paginated client-safe results
```

- The browser never supplies a trusted workspace ID.
- Every protected evidence, student, class, and photo predicate includes the
  authenticated workspace boundary.
- The client submits only the bounded versioned filter definition and pagination
  input.
- Server entry points map failures to safe typed results.
- Prisma remains server-only.
- The query domain owns filtering, grouping, counts, sorting, and pagination.
- Existing feed-page client filtering is not reused as the data source for
  Explore Evidence.

### Direct query model

The first release uses a direct filter object for its known fields. It does not
introduce a generic operator registry, nested expression tree, query language,
search service, or speculative sequence architecture.

The database query must evaluate the complete workspace-scoped match set.
Evidence rows, student groups, and expanded supporting records remain bounded
and paginated. Database indexes are added only for the implemented filter and
sort shapes and verified against representative query plans or test data.

## Privacy and Logging

- Unsaved query state remains transient client interaction state.
- Detailed query conditions are not encoded into shareable URLs.
- Raw notes, evidence content, query definitions, selected identifiers, tags,
  and condition values are not written to application logs or telemetry.
- Photo bytes never participate in query evaluation; only the owned photo
  relation is checked.
- Results use the existing authenticated photo delivery boundary.
- No student information is sent to an external AI, analytics, or search
  service.

## First-Release Scope

The first meaningful release includes:

- `/app/explore` page and Explore navigation item
- Evidence or Students result view
- Student condition
- Exact normalized tag inclusion and exclusion
- Supported local-calendar date rules
- Class-at-validation condition
- With-photo or without-photo condition
- AND across populated condition sections
- Any/all/exclude behavior within supported multi-value conditions
- Explicit server-backed ad hoc query execution through **Show results**
- Accurate complete-result counts
- Server-side sorting and pagination
- Expandable supporting evidence for Student results
- Required loading, empty, unavailable, and error states
- Desktop and mobile accessible behavior

## Explicitly Deferred and Out of Scope

The first release does not include:

- Generative AI, AI summaries, AI-written reports, or AI interpretation
- Automated conclusions, recommendations, or instructional judgments
- Suggested queries based on teacher behavior
- Full-text searching of Evidence notes, summaries, or raw captures
- Goals or goal associations
- Subjects, skills, courses distinct from existing classes, or marking periods
- Evidence-type, topic, performance, behavior, follow-up, or arbitrary-field
  conditions
- Frequency thresholds such as “at least three times”
- Collection-wide missing-evidence or absence queries
- Sequence or before/after relationships among evidence records
- Arbitrary nested AND/OR/NOT expressions
- Pattern detection or trend visualization
- Charts, dashboards, ranking, scoring, or compliance indicators
- Report generation from query results
- Saved views or other reusable query configurations
- Sharing, collaboration, schedules, notifications, or background monitoring
- Archived-evidence browsing or recovery
- Historical reconstruction of permanently deleted class relations

These items are not architectural requirements for the first release. A later
product decision must earn and define any addition before implementation.

## Acceptance Criteria

### Query correctness

- Every result belongs to the authenticated workspace.
- Cross-workspace student, class, evidence, and photo identifiers cannot affect
  results or disclose existence.
- Tag any, all, and exclusion semantics match their definitions with positive,
  empty, and false-positive cases.
- Date presets and inclusive custom ranges match teacher-local calendar dates.
- Photo conditions correctly include photo-only evidence.
- Counts remain accurate when results span multiple pages.
- Evidence and Student views are derived from the same qualifying evidence set.
- Expanding a student never shows nonmatching evidence.
- Archived evidence and evidence for archived students are excluded.
- Archived referenced classes and deleted class relations behave as documented.

### Query execution

- A teacher can construct and run any supported question without saving it.
- Changing fields does not rerun the question until **Show results** or
  **Update results** is activated.
- Picker typing alone does not run the evidence question.
- Invalid or incomplete dates prevent submission and identify what must be
  corrected.
- Unapplied changes are distinguishable because the run action reads
  **Update results**.
- Pending submission prevents an accidental duplicate request.
- Failure preserves the current fields and last successful results; retry
  reruns the current valid question.

### Interface and accessibility

- The builder and result controls are operable by keyboard on desktop and
  mobile layouts.
- Focus behavior, labels, errors, updating state, and result-count announcements
  are covered by rendered interaction tests.
- Important flows receive desktop and mobile accessibility checks.
- Evidence content reuses the existing trusted display component rather than
  duplicating its markup.

### Database and performance

- Any query-supporting schema changes preserve workspace ownership constraints.
- Schema changes pass Prisma validation and database integration tests against
  an explicitly disposable database.
- Representative datasets include more evidence than one result page and enough
  students and tags to exercise grouping and pagination.
- Query plans and response behavior are checked for the supported filter and
  sorting combinations before release to the beta cohort.

## Success Evaluation

The feature succeeds when a teacher can:

1. Open Explore Evidence and understand what is currently being shown.
2. Construct a supported multi-condition question without learning Boolean or
   database terminology.
3. Receive the correct evidence or student grouping from the complete saved
   evidence set.
4. Inspect the records supporting every count or student result.
5. Revise and rerun the current question without saving a configuration first.

Initial evaluation should use moderated beta tasks, teacher feedback, and known
test datasets. This feature does not add product analytics or behavioral
tracking to measure its own adoption.

## North Star

A teacher should be able to think:

**“I wonder what evidence I have…”**

…and use Explore Evidence to retrieve the teacher-reviewed records that answer
the question.

# ClassTrace demo account specification

## Purpose

Build one durable, hosted ClassTrace account that can be used for repeatable
product demonstrations. The account should feel like a teacher has used
ClassTrace consistently for several weeks: the roster is ready, the evidence
feed is populated, each student has a useful timeline, reports contain a
coherent history, filters return meaningful results, and CSV export has enough
records to be credible.

This is a canonical fictional workspace, not a generic development seed and
not a template copied into real teacher accounts.

## Confirmed production target

- Neon project: `classtrace` (`floral-forest-27181712`)
- Neon branch: `production` (`br-wild-recipe-atxbdvko`)
- Database: `neondb`
- Clerk user ID: `user_3HQButQuO16dX0RvhZbZ7jtQb2m`
- Current state verified on August 3, 2026:
  - teacher profile exists
  - personal workspace exists
  - current beta acknowledgement exists
  - 0 classes
  - 0 students
  - 0 evidence records

The Clerk identity, teacher profile, workspace, and beta acceptance are
preserved during every reset. Only the classes, roster students, and evidence
inside this exact workspace are replaced.

## Language

- **Demo account**: the real Clerk account above and its one production
  ClassTrace workspace.
- **Canonical dataset**: the versioned classes, students, and validated evidence
  records that define the reset state.
- **Evidence note**: the teacher-reviewed observation stored permanently and
  displayed in the feed, timeline, report, and export.
- **Source note**: prose used while authoring the dataset. Source notes are not
  stored as raw captures or added to a raw-note field.
- **Reset**: an explicit operator-run replacement of the demo workspace's
  classes, students, and evidence with the canonical dataset.

## Dataset shape

Dataset version: `2026-school-spring-v1`

Use fixed timestamps between March 9 and May 1, 2026. Dates never move when the
dataset is reset. Store explicit `evidenceDate`, `validatedAt`, `createdAt`, and
`updatedAt` values so ordering is deterministic across resets.

The starting state contains:

- 2 active classes
- 4 active fictional students
- 56 active evidence records: 14 per student
- no archived classes, students, or evidence
- no pending or session-stored captures
- no legacy records with a missing Evidence note

Fifty-six records intentionally exceed the 50-record feed page size. This makes
both feed pages demonstrable while keeping most evidence on the first page.

### Classes and roster

| Class | Students | Purpose in the demo |
|---|---|---|
| 6th Grade Math Support | Jeremy, Stacy | Academic skill development, accommodations, assessment, attention, organization, and self-advocacy |
| 7th Grade ELA Support | Jeff, Mary | Reading engagement, oral participation, writing, behavior, communication, and progress monitoring |

Mention handles are the lowercase first names: `jeremy`, `stacy`, `jeff`, and
`mary`. School-local IDs remain empty. Every student belongs to exactly one
active class.

Only Jeremy, Stacy, Jeff, and Mary may appear as student names anywhere in the
dataset, tests, command output, or documentation.

### Evidence-type coverage

The 56 records should use every current teacher-facing evidence type except
`Unclear`. `Unclear` is a temporary interpretation state and should not appear
as teacher-approved demo evidence.

| Evidence type | Target count | Demo purpose |
|---|---:|---|
| Academic check-in | 14 | Everyday skill and work observations |
| General observation | 10 | Authentic moments that do not need inflated categorization |
| Behavior observation | 8 | Focus, refusal, redirection, regulation, and repair |
| Assessment observation | 8 | Quizzes, exit tickets, and demonstrated performance |
| Accommodation log | 6 | Read-aloud, chunking, breaks, prompting, and small-group support |
| Progress monitoring | 6 | Change over time without becoming an analytics story |
| Communication log | 4 | Brief, factual family-contact records with no family names or contact details |

Exact counts may move by one while authoring if a more natural teacher-approved
classification calls for it, but all seven types must remain represented and
the total must remain 56.

### Student story arcs

Each student's 14 records form a small, non-linear story. Students should have
strengths, ordinary days, setbacks, and improvement. No student is reduced to a
diagnosis, deficit, or behavior label.

| Student | Beginning | Middle | Later evidence |
|---|---|---|---|
| Jeremy | Difficulty sustaining focus and incomplete math work | Begins choosing strategies, asking about missing work, and responding to redirection | Explains variables, asks a discussion-opening question, and completes selected work more independently |
| Stacy | Quiet participation and inconsistent confidence with decimal operations | Uses supports, asks for clarification, and begins volunteering answers | Shows more accurate work and explains a strategy while still needing occasional check-ins |
| Jeff | Avoidance, fatigue, refusal, and a reset-room incident alongside flashes of reading interest | Re-engages through the class read-aloud and repairs an interaction | Volunteers to read, participates in discussion, and completes a short written response with support |
| Mary | Consistent engagement with some difficulty organizing written responses | Uses planning and revision supports and asks specific questions | Produces a stronger paragraph, contributes text evidence, and shows increased independence |

Progress must remain credible: later records do not erase continuing needs, and
one strong day is not described as mastery.

### Structured-field coverage

Across the dataset:

- At least 40 records have a topic or skill.
- At least 24 records have a performance value.
- At least 12 records have a behavior or work-habit value.
- Between 10 and 14 records have a follow-up note and `followUpNeeded = true`.
- Every record has 1 to 3 normalized lowercase tags.
- At least 10 distinct tags appear across the account.
- At least 4 records for each student have no follow-up, showing routine evidence
  rather than making every observation an intervention.

Recommended recurring tags are `math`, `reading`, `writing`, `focus`,
`participation`, `organization`, `assessment`, `homework`, `self-advocacy`,
`behavior`, `support`, and `progress`.

Summaries use the application's established composition:

```text
Student · optional topic · optional performance · optional behavior · Evidence type
```

Do not invent fields or store parser confidence, raw captures, diagnoses,
grades, disability categories, parent contact details, or official-plan goals.

## Voice and content rules

Evidence notes should sound like quick teacher observations that were reviewed
for saving, not generated case notes. Prefer short fragments, plain verbs,
specific classroom moments, occasional excitement, and natural variation in
detail. Do not make all notes grammatical, clinical, or uniformly structured.

The starting voice examples are:

- "had a really hard time staying focused today"
- "raised her hand to answer a question!"
- "on point today"
- "stared off into space for a while today"
- "struggling with decimal addition"
- "volunteered to read out loud"
- "apologized for getting an attitude"
- "sent to reset room"
- "really into this chapter of the read aloud"
- "moved himself to another spot to focus"
- "refused to answer when called on"
- "was finally able to explain variables"
- "remembered to ask for missing work when out"
- "drawing on desk"
- "fell asleep again"
- "forgot homework"
- "asked a really good question and sparked discussion"

Use these as tone anchors and, where they fit a student arc, as approved
Evidence notes. Add concrete details selectively. A realistic mix is:

- about one third very short notes
- about one half one-sentence observations with a task or outcome
- the remainder two-sentence notes containing support, response, or next step

Avoid polished phrases such as "demonstrated commendable growth," diagnostic
claims, moral judgment, fake quotations, exact family details, and repetitive
sentence templates.

## Reset design

Add an operator-only command named `npm run demo:reset`. It is not exposed in
the teacher product, operator console, or deployed UI.

### Required inputs and guards

The reset command:

1. Reads a dedicated `DEMO_DATABASE_URL`, never the application's ordinary
   `DATABASE_URL` by default.
2. Requires `DEMO_RESET_ALLOWED=1`.
3. Requires `DEMO_CLERK_USER_ID` to equal the canonical Clerk ID above.
4. Requires a command-line confirmation value equal to that same Clerk ID.
5. Parses the database URL and requires a Neon hostname and database name
   `neondb`.
6. Queries Neon connection settings and requires the exact production project
   ID, branch ID, and database name recorded above.
7. Queries the exact Clerk ID and requires one teacher profile, one workspace,
   and at least one beta agreement acceptance.
8. Stops before deletion if any guard or dataset validation fails.
9. Never prints the connection string, credentials, Evidence notes, or other
   record content.

The production account ID is intentionally part of the canonical operational
contract, but database credentials remain environment-only.

### Transaction behavior

Within one serializable transaction scoped to the resolved workspace:

1. Delete that workspace's evidence records.
2. Delete that workspace's roster students.
3. Delete that workspace's classes.
4. Insert the two canonical classes.
5. Insert the four canonical students with same-workspace class relations.
6. Insert all 56 canonical evidence records with same-workspace student and
   class relations.
7. Verify the expected counts and relations before commit.

Use deterministic, demo-prefixed IDs so the same dataset has stable routes and
stable ordering after every reset. The transaction is all-or-nothing. A failed
reset leaves the previous account data intact.

Do not delete or recreate the `TeacherProfile`, `Workspace`, or
`BetaAgreementAcceptance`. Do not use the account-deletion workflow or create
an operator audit row; a demo reset is not an account deletion.

### Command output

Successful output is limited to:

- dataset version
- confirmation that the canonical demo workspace was reset
- class, student, and evidence counts
- earliest and latest evidence dates

Failure output names the failed safety condition without printing sensitive or
student-entered content.

### Operator command

Set the three dedicated variables only in the terminal used for the reset. Do
not add the demo database credential to Vercel or replace the application's
ordinary `DATABASE_URL`.

```powershell
$env:DEMO_DATABASE_URL="<production Neon connection string>"
$env:DEMO_CLERK_USER_ID="user_3HQButQuO16dX0RvhZbZ7jtQb2m"
$env:DEMO_RESET_ALLOWED="1"
npm.cmd run demo:reset -- --confirm user_3HQButQuO16dX0RvhZbZ7jtQb2m
```

Close the terminal or clear the three variables after the reset.

## Implementation plan

1. Convert this specification into a versioned canonical dataset module with
   deterministic IDs and all 56 fully authored Evidence records.
2. Add pure dataset validation for counts, names, handles, timestamps, field
   limits, allowed evidence types, tags, references, and the absence of raw-note
   fields.
3. Add production reset guards and unit tests proving that missing, mismatched,
   and ambiguous targets are rejected before mutation.
4. Implement the workspace-scoped serializable replacement transaction and a
   small command runner using the project's existing Prisma/Postgres stack.
5. Add the `demo:reset` package script and document only the required
   environment variables and confirmation syntax.
6. Run unit tests and lint for the new modules.
7. Exercise the reset first against an isolated Neon branch or disposable test
   database and verify counts, ownership, fixed timestamps, and idempotency.
8. After explicit approval, run the guarded command once against the confirmed
   production demo account.
9. Smoke-test the deployed demo account: feed pages, student timelines, report
   date filtering and printing, search by student/tag/text, and one CSV export.

Vercel access is useful only to confirm the deployed production environment
points at the expected Neon project before the first live reset. The reset
itself remains an explicit local operator command with dedicated credentials.

## Verification and acceptance criteria

The work is complete when:

- Resetting twice produces the same IDs, counts, field values, and ordering.
- The reset cannot target a different Clerk user by changing only one input.
- A failure before commit preserves the previous demo dataset.
- No non-demo workspace rows change.
- Every Evidence record belongs to exactly one canonical student in the same
  workspace and records that student's active class.
- Every saved record contains an Evidence note and a fixed validation date.
- The feed has 50 records on page 1 and 6 on page 2.
- Search returns useful results for all four students and recurring tags.
- Each student timeline contains 14 chronologically coherent records.
- The feed contains all 56 records, and a March 9 through May 1 report contains
  the expected 14 records for each individual student.
- CSV export for each student contains that student's 14 records and no other
  student's data.
- No raw source note is persisted or logged.
- No new schema, dependency, authentication bypass, demo UI, or product scope is
  introduced.

## Out of scope

- Automatically resetting on sign-in, deploy, or a schedule
- A public reset button or demo-mode banner
- Shared credentials or authentication bypasses
- Generating evidence with AI or at runtime
- Copying the dataset into teacher workspaces
- Seeding real student information
- Changing the production schema
- Using a Neon branch reset as the account-reset mechanism

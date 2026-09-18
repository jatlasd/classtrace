# ClassTrace canonical demo account

## Purpose

This fictional workspace should feel like a teacher has been using ClassTrace
since the start of school: a ready roster, a growing evidence feed, a few busy
student timelines, and other students the teacher has barely documented yet.
The history includes unfinished work, quiet days, routine positives, supports,
participation, and occasional behavior observations. It does not give every
student an improvement story.

The dataset is authored in `scripts/demo-data.mjs`. It is loaded only by an
explicit operator reset, never generated at runtime or copied into new teacher
accounts. The redesign changes the reset contents, not the product UI or schema.

## Canonical production identity

- Neon project: `classtrace` (`floral-forest-27181712`)
- Neon branch: `production` (`br-crimson-shadow-atdtagrm`)
- Database: `neondb`
- Clerk user ID: `user_3F2ep7ny1zVEKuEZ2aLpsp4EHRR`

The profile, workspace, and beta acceptance were verified on September 17, 2026.
That historical verification is not a statement of the account's current row
counts. Updating the canonical dataset does not change the hosted account until
an operator runs the reset.

Every reset preserves the Clerk identity, `TeacherProfile`, `Workspace`, and
`BetaAgreementAcceptance`. Only classes, students, evidence, and related photos
inside the selected workspace are replaced.

## Dataset shape

Version: `2026-27-school-fall-v4`.

The fictional 2026–27 school calendar starts **August 31, 2026** for this demo
window. Evidence runs through **September 15, 2026**, using fixed classroom
times in America/New_York and normalized UTC timestamps. Dates never move with
the reset date. Classes and most students were added before the first
observation on August 31; Miles was added September 8 and Iris September 10.

The canonical state contains:

- **3 active classes**
- **14 active fictional students**
- **81 active evidence records**
- **12 validated photos**, attached to twelve of those records
- No archived rows, pending captures, or records missing an Evidence note

IDs are deterministic and demo-prefixed. Every record has explicit
`evidenceDate`, `validatedAt`, `createdAt`, and `updatedAt` values. Validation is
fixed at 20 minutes after the observation, with creation and update timestamps
matching validation. Observation times differ, giving deterministic feed and
timeline ordering even when several records share a date.

### Classes and student histories

These are authored counts, not per-student quotas enforced by the validator.
Jeremy, Stacy, Jeff, and Mary retain the four most developed histories. The ten
additional first names are fictional demo roster entries, extending the usual
four-name examples for this dataset only. No real student identities, surnames,
school-local IDs, family names, or contact details are used.

| Class | Student / mention handle | Evidence records | Photos |
|---|---|---:|---:|
| 6th Grade Math Support | Jeremy / `@jeremy` | 17 | 2 |
| 6th Grade Math Support | Stacy / `@stacy` | 13 | 2 |
| 6th Grade Math Support | Nina / `@nina` | 5 | 0 |
| 6th Grade Math Support | Caleb / `@caleb` | 2 | 1 |
| 6th Grade Math Support | Owen / `@owen` | 1 | 0 |
| 7th Grade ELA Support | Jeff / `@jeff` | 12 | 2 |
| 7th Grade ELA Support | Mary / `@mary` | 10 | 2 |
| 7th Grade ELA Support | Tessa / `@tessa` | 4 | 1 |
| 7th Grade ELA Support | Jonah / `@jonah` | 3 | 0 |
| 7th Grade ELA Support | Iris / `@iris` | 1 | 0 |
| 8th Grade Study Skills | Rowan / `@rowan` | 7 | 1 |
| 8th Grade Study Skills | Eli / `@eli` | 3 | 0 |
| 8th Grade Study Skills | Lena / `@lena` | 2 | 1 |
| 8th Grade Study Skills | Miles / `@miles` | 1 | 0 |

Class totals are **38 math**, **30 ELA**, and **13 study-skills** records. Every
student belongs to exactly one active class; Capture remains global.

Jeremy has scattered math successes alongside missing work and continuing
trouble getting through a page. Stacy participates and uses supports, but
regrouping and word problems still need attention. Jeff's reading interest
coexists with a difficult day and incomplete writing; the family call follows
the reset-room observation on the same day. Mary's discussion contributions do
not always translate into finished written responses.

The shorter histories do not resolve neatly either. Nina keeps getting stuck
on subtraction across zero. Tessa still copies too much text for her answers.
Rowan's folder comes back without the planner. Lena has two ordinary positive
notes. Owen, Iris, and Miles have just one observation each. Sparse documentation
does not imply absence, difficulty, or success.

### Evidence mix and photos

| Evidence type | Authored count |
|---|---:|
| General observation | 28 |
| Academic check-in | 25 |
| Accommodation log | 9 |
| Assessment observation | 7 |
| Behavior observation | 5 |
| Progress monitoring | 4 |
| Communication log | 3 |

All seven saved evidence types appear; `Unclear` remains a draft state. Type
counts may change with future edits. The three communication notes record brief
family contact and contain no names or contact details.

The twelve anonymous synthetic WebP work samples live in
`scripts/demo-assets/`, together with their provenance files:

- Stacy's decimal place-value work, August 31
- Jeremy's one-step equations, September 9
- Mary's paragraph organizer, September 9
- Jeff's annotated reading passage, September 11
- Jeremy's unfinished math practice, September 15
- Stacy's corrected word problems, September 15
- Jeff's oral-reading running record, September 14
- Mary's revised paragraph draft, September 10
- Caleb's decimal answers without shown work, September 2
- Tessa's copied text-evidence response, September 8
- Rowan's mostly blank weekly planner, September 4
- Lena's vocabulary study cards, September 11

Photos are occasional: **69 records have no photo**, and **6 students have no
photo**. Each photo belongs to one evidence record; no record has multiple photos.

### Structured fields and voice

There are 18 recurring tags, including `math`, `reading`, `writing`, `focus`,
`participation`, `organization`, `work-completion`, `homework`, `assessment`,
`support`, and `self-advocacy`. They overlap across students and classes instead
of forming isolated student-specific categories. Sixteen observations need
follow-up; the other 65 do not. Topics, performance, and behavior are optional
and omitted where the observation does not need them.

Summaries keep the product's composition:

```text
Student · optional topic · optional performance · optional behavior · Evidence type
```

The Evidence note is the approved observation, separate from that structured
summary. Keep the informal voice and vary length and detail:

- "had a really hard time staying focused today"
- "raised her hand to answer a question!"
- "on point today"
- "borrowed a pencil, got going with everyone else"
- "folder made it back, planner did not"
- "same thing with text evidence today, copied most of the paragraph"

Avoid uniform sentence templates, diagnoses, polished case-note language such
as "demonstrated growth," and guaranteed improvement arcs. These are saved
observations, not raw captures: no `rawNote`, `sourceNote`, `captureText`, or
unresolved `@student` mention belongs in a persisted Evidence note. Do not store
parser confidence, grades, disability categories, official-plan goals, or family
contact information.

## Dataset validation

`validateDemoDataset()` checks:

- The current version, 3 classes, 12–15 students, and 70–90 evidence records
- Some photos, fewer than the number of students
- Unique IDs, class name keys, mention handles, photo assets, and photo relations
- Approved fictional names, normalized names/handles/tags, and shared input limits
- Valid class/student/evidence relations and a populated roster for every class
- All seven saved evidence types, recurring tags, and records with and without
  follow-up, without exact type or structured-field quotas
- At least one record per student and uneven history sizes
- Nonempty approved notes, no raw-capture fields or mentions, and summaries that
  agree with the structured fields
- Fixed ISO timestamps within the school-year window: classes precede students,
  students precede evidence, and validation follows the observation
- Bounded WebP metadata, one photo per evidence record, and safe asset filenames

The tests pin the authored 14-student / 81-record composition. The validator
allows natural variation within the intended size range. It does not require
14 records per student, a growth arc, a photo per student, or exact type totals.
Workspace ownership is assigned by the reset transaction and checked again
inside that transaction; the dataset never supplies its own workspace ID.

## Local development reset

`npm run demo:reset:local` loads the same dataset and twelve photos into one
existing Clerk development user's workspace. It preserves that profile,
workspace, and beta acceptance and replaces that workspace's demo contents.
Development IDs receive a deterministic suffix scoped to the selected Clerk
user, including every class, student, evidence, and photo relation.

The command requires all of these guards:

- `.env.local` supplies a Neon `DATABASE_URL` named exactly `classtrace_dev`.
- The connected project, branch, and database identities are present and differ
  from the canonical production identities.
- `CLERK_SECRET_KEY` starts with `sk_test_`.
- The runtime is neither production nor Vercel.
- Exactly one `--email` or `--clerk-user-id` target is followed by `--confirm`.
- The target resolves uniquely in Clerk development and owns exactly one
  database workspace with a beta acceptance.

For the existing `jatlasdev2` development account, after preserving any work you
need from that workspace:

```bash
npm run demo:reset:local -- --email jatlasdev2@gmail.com --confirm
```

Or use the Clerk ID form:

```bash
npm run demo:reset:local -- --clerk-user-id <development-clerk-user-id> --confirm
```

Then start the app with `npm run dev`. The command is an explicit operator
operation, separate from application routes and the production reset.

## Production reset safeguards

`npm run demo:reset` remains an operator-only local command. It is not exposed
in the product or operator console. It requires:

1. A dedicated `DEMO_DATABASE_URL`, never the ordinary `DATABASE_URL` by default
2. `DEMO_RESET_ALLOWED=1`
3. `DEMO_CLERK_USER_ID` equal to the canonical Clerk ID above
4. `--confirm` followed by that same Clerk ID
5. A PostgreSQL URL with a Neon hostname and database name `neondb`
6. The exact connected Neon project, branch, and database identities above
7. One matching teacher profile, one workspace, and a beta acceptance
8. Successful dataset validation before opening the replacement transaction

Do not put the demo database credential in Vercel or replace the application's
ordinary database URL. The guarded command remains:

```powershell
$env:DEMO_DATABASE_URL="<production Neon connection string>"
$env:DEMO_CLERK_USER_ID="user_3F2ep7ny1zVEKuEZ2aLpsp4EHRR"
$env:DEMO_RESET_ALLOWED="1"
npm.cmd run demo:reset -- --confirm user_3F2ep7ny1zVEKuEZ2aLpsp4EHRR
```

Close the terminal or clear those three variables afterward. The dataset
redesign itself does not run or authorize this production reset.

### Transaction and output

In one serializable transaction scoped to the resolved workspace, the reset:

1. Verifies the database identity and locks the selected profile/workspace.
2. Deletes its evidence (cascading to photos), then students, then classes.
3. Inserts 3 classes, 14 students, 81 evidence records, and 12 photos.
4. Verifies counts and same-workspace student/class/evidence relations.
5. Commits, or rolls back on failure, with at most three serialization attempts.

No profile, workspace, beta acceptance, schema, or operator audit row is created
or deleted. Repeating the reset produces identical IDs, values, dates, and
ordering. A failed transaction preserves the previous dataset.

Successful output is limited to the dataset version, reset confirmation,
aggregate counts, and earliest/latest evidence dates. Failure output names the
failed safeguard without printing credentials, notes, photo bytes, or record
content.

## Product checks

After a separately authorized reset, the canonical data should support:

- **Capture and roster:** all 14 handles resolve to one student in the right
  class, with 5 math, 5 ELA, and 4 study-skills students to browse.
- **Evidence feed:** 50 records on the first page and 31 on the second, with
  several students and all three classes on both pages.
- **Search:** try `@jeremy`, `@rowan`, `#organization`, `#support`,
  `place-value`, `regrouping`, and `8th Grade Study Skills`. Feed search filters
  the currently loaded page; Explore Evidence searches saved evidence across
  the workspace and supports student/class/tag conditions.
- **Timelines and reports:** compare Jeremy's 17 records with Owen's single
  observation. An August 31–September 15 report includes the per-student totals
  above; a September-only report includes just that month's observations.
- **Photos:** Explore distinguishes 12 records with photos from 69 without.
- **CSV exports:** each student exports exactly their own history, with the
  approved note preserved and photo presence indicated.

Automated coverage includes dataset integrity and composition, consumption by
the existing read models, development ID scoping, production/development reset
guards, workspace-scoped inserts, rollback, and repeatable reset inputs. Browser
checks, printing, and an actual database reset require separate execution; unit
tests do not establish live account state.

## Out of scope

No automatic reset on sign-in, deploy, or a schedule; no public reset control,
authentication bypass, shared credentials, AI generation, new dependencies,
product UI changes, or schema changes. Never use real student information or
load this dataset into another teacher's workspace without explicit selection
and confirmation through the existing operator guard.

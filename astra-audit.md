I would not open this build to real classroom data today. It is credible for a small, guided beta using fictional data. The core ownership and permanent-save boundaries are substantially sound; the main confirmed defects concern draft recovery, photo coordination, archiving, and export accuracy.

Audited commit: 627a944. No source, configuration, or database records were changed. The worktree remains clean.

1. BETA READINESS

ClassTrace implements a coherent workflow:

class/roster setup → local capture → deterministic draft → teacher review → saved evidence → retrieval/report/export

The repository separates routes, authenticated Server Actions, domain operations, and database access reasonably well. It does not need an architectural rewrite.

Verification completed:

Check	Result

Clean installation from lockfile, Node 22.23.2	Passed in an isolated /tmp copy
Lint	Passed
Coverage suite	515 tests across 97 files passed
Coverage	81.4% statements; 83.08% branches
Production build with locked dependencies	Passed
Standalone TypeScript check	29 errors, all in test files
Prisma validation	Passed, with two investigated SetNull warnings
Dependency audit	16 affected packages: 11 high, 4 moderate, 1 low
Browser checks	Public page, authenticated Settings, feed, timeline, CSV download, photo report, and initial Explore results worked
Responsive checks	Feed worked at 1440px and 390px without horizontal overflow


The browser CSV download contained the expected 14 records. The inspected report’s photo loaded successfully.

The existing installation differed from the lockfile, including Next.js and Sharp. I verified the build and normal gates again against the exact locked dependencies rather than treating the stale installation as repository evidence.

Not verified: production configuration, migration replay, backup restoration, real-device camera behavior, or a complete database-writing lifecycle. The database integration command resets its target, so I did not run it under your non-destructive instruction.

2. MUST FIX BEFORE BETA

P1 for the proposed real-data launch — the required agreement prohibits that use. CONFIRMED.

Evidence: The mandatory acknowledgement requires fictional or synthetic student information and expressly prohibits real student work photos. Acceptance is persisted by agreement version.

Failure mode: Inviting teachers to use real classroom data would directly contradict the conditions every teacher must accept.

Affected: Every teacher entering the proposed real-data beta.

Severity: This blocks that launch scope. It is not an authentication defect.

Smallest direction: Make an explicit decision about the permitted data scope. Retain fictional-only use until the real-data launch conditions are established; then align and version the agreement and public expectations. Editing the wording alone would not establish readiness.


I found no confirmed technical P0 or P1 defect that independently blocks a guided fictional-data beta.

Before approving real-data use, I would also require evidence from the intended deployment: a complete fictional-data lifecycle, two-workspace isolation checks, migration validation, and a demonstrated recovery procedure. These are outstanding verification requirements, not confirmed failures.

3. SHOULD FIX SOON

All six findings below are CONFIRMED P2 issues.

F1 — Draft restoration can erase a newly captured note.

Evidence: Hydration snapshots stored drafts, awaits photo restoration, then replaces the entire draft list. The composer remains available, and the persistence effect subsequently writes the older list.

Reproduction: With photo restoration delayed, a new capture appeared in the manifest. Completing restoration removed it; the composer had already cleared.

Affected/failure: Teachers capturing immediately after opening or refreshing a feed containing photo drafts can silently lose the new capture.

Why P2: Real local draft loss, limited to a startup timing window; saved evidence is unaffected.

Smallest fix: Disable capture until restoration completes, or merge restored drafts with captures created during restoration.


F2 — Missing draft photos disappear without a usable recovery warning.

Evidence: The feed creates a missing-photo warning, but the entire photo section—including that warning and the replacement input—requires a photo to exist.

Reproduction: A rendered draft with a missing photo showed neither warning nor replacement control, while validation remained enabled. Photo-only drafts are filtered out during restoration.

Affected/failure: After storage failure, eviction, or key loss, teachers can unknowingly save text without its intended photo, or lose sight of a photo-only draft.

Why P2: Incomplete evidence and failed recovery, without corruption of already-saved records.

Smallest fix: Preserve an explicit missing-photo state, show a reattach control, and require an explicit decision before proceeding without the photo.


F3 — Saving during photo replacement uploads the previous image.

Evidence: Replacement processing is tracked locally but is not passed to the review panel. The save handler sends the existing blob.

Reproduction: While replacement normalization was held pending, “Validate and save” remained enabled and invoked validation.

Affected/failure: A teacher replacing an incorrect photo can save the old image, especially when processing is slow on a phone.

Why P2: The durable attachment can differ from the intended replacement. The prior preview remains visible, which limits severity.

Smallest fix: Coordinate normalization, local persistence, and validation under one pending state; submit a stable reviewed photo snapshot.


F4 — Archiving evidence removes every normal retrieval path.

Evidence: The confirmation describes hiding evidence from default views while retaining it. However, feed, Explore, timeline, report, and CSV export all exclude archived evidence. No archived-evidence list or restoration action exists.

Affected/failure: Teachers cannot find, restore, export, or individually delete an archived record through the UI. Its data and photo remain stored.

Why P2: Important recovery and expectation mismatch, but not physical deletion.

Smallest fix: Temporarily remove individual evidence archiving, or add a small workspace-scoped archive view with Restore/Delete.


F5 — CSV exports assign historical evidence to the student’s current class.

Evidence: CSV generation repeats student.classGroup for every row. Saving instead records the evidence’s class, which reports and Explore use.

Reproduction: The actual export module labeled historical Reading evidence as Math after the student’s current class changed to Math.

Affected/failure: Teachers exporting after a class move receive misleading historical metadata that can be retained outside ClassTrace.

Why P2: Material output inaccuracy; the stored relationship remains correct and reports provide an alternative.

Smallest fix: Select and export each evidence record’s class. Add a regression covering evidence before and after a class move.


F6 — Ordinary negation produces contradictory structured suggestions.

Evidence: Phrase matching checks word boundaries without negation handling; the behavior dictionary then supplies classifications.

Reproductions: @Mary was not disruptive during class. suggests disruption. @Mary no longer struggling with fractions. suggests struggling and reteaching.

Affected/failure: Teachers documenting improvement or the absence of behavior receive contradictory fields that can survive into saved evidence if approved unchanged.

Why P2: These are common classroom sentences. Mandatory editable review and preservation of the approved note substantially reduce severity.

Smallest fix: Suppress negated recognized phrases using narrow deterministic rules. Test positive, negated, ambiguous, and mixed-clause examples.


4. SAFE TO DEFER

These are P3 improvements, not reasons to delay a controlled beta:

Issue	Evidence and direction

Test-fixture type drift	Standalone TypeScript reports 29 errors across eight test files. For example, roster fixtures omit required updateMany. Next.js filters test-file diagnostics during its build, explaining why the build passes. Repair fixtures rather than weakening application types.
Archived classes permanently reserve names	Duplicate checks include archived classes, while the archived-class UI offers no restoration. An archived “Reading” cannot be restored or recreated under that name.
CSV transport failure strands the button	Export handling lacks a catch around the browser request. A reproduced rejected request left “Preparing CSV…” disabled until refresh.
Report filter reset inconsistency	Uncontrolled date inputs retained edited dates after cleared props in a rendered reproduction. Actual Next.js navigation behavior remains unverified.
Monitoring disclosure drift	The privacy notice discusses Clerk, hosting/database providers, and Resend, but omits the active Sentry monitoring path. Align the explanation with actual collection.


Dependency maintenance also belongs here based on the exposure established in this audit. The advisory count is real, but it is not evidence of 11 exploitable production flaws. Several paths concern Prisma tooling, development servers, or unused database adapters. For example, the reviewed Hono disclosure requires hono/jsx memoization, which ClassTrace’s React frontend does not use. Maintainer advisory

Update dependencies deliberately; do not accept npm audit fix --force as a reviewed migration plan.

5. VERIFIED OKAY

These are important areas I investigated and would preserve:

Authentication and ownership: Teacher entry points derive the accepted workspace from Clerk. Client-provided workspace identity does not authorize access.

Relational integrity: The ownership migration enforces composite workspace relationships. Its SQL correctly nulls only classGroupId; Prisma’s warning is not proof of a broken constraint.

Concurrency: Production adapters recheck active student/class state inside serializable transactions. Outer preflight checks are not the only protection.

Permanent evidence: Reviewed notes are preserved after permitted trimming. Evidence and its photo commit atomically to one resolved student.

Privacy boundary: Parsing is local and deterministic. Raw capture text is absent from the permanent-save payload. No generative AI path was found.

Photo security: Local drafts use authenticated encryption with session-scoped keys. The server independently decodes and re-encodes images; retrieval authenticates and sends private, no-store and nosniff.

Destructive operations: Student deletion is workspace-scoped with dependent cascades and explicit UI confirmation. The operator exception is independently authorized and narrowly scoped.

Retrieval: Explore’s results, counts, groups, and supporting records use consistent ownership/filter predicates.

CSV escaping: Formula-leading characters are neutralized. The leading apostrophe is intentional protection.

Dates: Report boundaries account for separate timezone offsets across daylight-saving transitions.

Feed search: Its page-local behavior is explicitly labeled; Explore provides broader retrieval.

Error recovery API: unstable_retry is supported by the installed Next.js version. It should not be replaced merely because older examples use reset.


These conclusions concern inspected code, tests, and the browser paths exercised—not proof of the production database’s current configuration.

6. CROSS-CUTTING OBSERVATIONS

The strongest boundary is permanent persistence; the weakest is asynchronous browser state. Server validation is careful, but restoration, photo replacement, and UI readiness do not consistently coordinate. The most valuable next tests should exercise those interleavings.

The existing test suite is useful but misses lifecycle connections. Photo storage tests and save tests can both pass while the interface submits the wrong photo. CSV tests can pass while class changes make exports historically incorrect. Existing E2E coverage does not establish the complete capture-to-export lifecycle. CI currently runs lint, coverage, and build.

Archive behavior is inconsistent across domains. Students have a restoration path; evidence does not. That matters more than naming or component organization.

No demonstrated early-beta performance blocker emerged. Feed and Explore are bounded. Student timelines, reports, and exports load all matching student evidence; photo-heavy reports are a future growth point, not a demonstrated small-cohort failure.

The following remain REQUIRES VERIFICATION, rather than confirmed defects:

Cross-tab sign-out cleanup during delayed authentication changes.

Workspace reprovisioning racing the second stage of account deletion.

Large roster imports approaching transaction time limits.

Retrying a save after the database committed but the response was lost.

Production invitation restrictions, migration state, backup window, and restoration.


7. RECOMMENDED FIX ORDER

1. Fix draft hydration so new captures cannot be overwritten.


2. Establish explicit photo states for restoration, replacement, and saving; fix both photo defects together.


3. Add rendered lifecycle regressions for those exact failures.


4. Correct historical CSV class selection.


5. Provide archive recovery or temporarily remove the unsupported action.


6. Add narrow negation suppression with positive and false-positive tests.


7. Address transport errors, test fixtures, and dependency maintenance.


8. Validate the intended deployment and recovery procedure before deciding whether to expand beyond fictional-data use.



8. FINAL VERDICT

Real teachers testing fictional data: yes, in a small guided cohort with the documented limitations.

Real teachers using real classroom data today: no. The current required agreement expressly prohibits it, and the deployment’s complete lifecycle and recovery behavior have not been demonstrated. The confirmed P2 issues also deserve focused correction because they can lose drafts or misrepresent intended evidence.

The audit is complete. No fixes have been implemented; I’m waiting for your approval.
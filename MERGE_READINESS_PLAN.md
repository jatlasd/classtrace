# Merge readiness: dev → main

**Verdict: READY TO MERGE — NO OPEN BLOCKERS**

Reviewed on 2026-09-09. Scope is the local `main...dev` change set from
merge base `6f4bc579e42a4798178c2227b091bd52a38d6a41` through `dev`
`7101f3ac713f083820920ba211a0b54e2fbac8ea`, plus the merge-readiness
cleanup in the current working tree.

All confirmed merge blockers are resolved, the clean Node 22 install and CI
gates pass, the migration history replays against the guarded disposable test
database, and the complete Playwright suite passes. No confirmed P0/P1 auth,
workspace-isolation, privacy-boundary, or permanent-save integrity defect was
found in the reviewed changes. This verdict concerns merging the branch; it is
not a production-safety or compliance claim.

## Resolved blockers

### Destructive demo shortcut

The generic, account-specific `demo` alias was removed. The explicitly named
`demo:reset:local` command remains and still requires the caller to provide its
target and `--confirm`; the existing development-database and target guards are
unchanged.

### Evidence calendar-day regression

Feed grouping, relative day headings, and saved-row accessible names now use a
single browser-local calendar timezone after hydration, with a stable UTC
fallback during SSR and the first client render. Focused coverage includes
UTC+13, America/New_York, and a daylight-saving transition. Saved evidence
timestamps and date-storage behavior are unchanged.

### Enabled-text contrast

The shared faint foreground token is now `#756a86`, which clears the intended
4.5:1 threshold against Base, Plate, and Well. Browser checks calculate the
rendered contrast for desktop and mobile navigation and explanatory text.

### Mobile Explore expectation

The obsolete absolute `y < 450` assertion was replaced with the intended
viewport relationship: the first result must begin above the fixed mobile
navigation. The test continues through overflow, filter opening, date focus,
invalid-range handling, and disabled-submit behavior. The desktop cold-load
filter path also passes.

### Critical Next.js advisories

Final dependency triage found two current critical advisories affecting the
pinned Next.js 16.2.11 release. Next.js and `eslint-config-next` were updated to
the patched 16.3.4 release, followed by a clean install and a complete rerun of
the application and browser gates. The current production-dependency audit has
zero critical findings.

## Completed cleanup

- Removed the stale `astra-audit.md` and `data-page-prd.md` review/spec files.
- Removed unused `@radix-ui/react-separator` code and dependency entries.
- Removed the obsolete `NoteContent` tone branch.
- Retained the Next.js 16.3.4-generated agent-rules block in `AGENTS.md`; the
  development server otherwise recreates it as an uncommitted change.
- Preserved the deliberate mobile Explore composition and the guarded demo
  reset tooling.

The larger `main...dev` deletions of local agent/editor tooling and retired
landing assets remain consistent with the branch's hygiene and UI changes.
Build/import checks found no broken references. Demo image assets are consumed
by the reset tooling.

## Final verification

All application commands used Node **22.23.2**. The verified framework/runtime
versions are Next.js **16.3.4**, Prisma **7.8.0**, and Sharp **0.35.4**.

| Check | Result |
|---|---|
| `npm ci` | Passed from the updated lockfile |
| `npm run lint` | Passed |
| `npm run test:coverage` | Passed: 522 tests in 99 files; 81.25% statements, 82.71% branches |
| `npm run build` | Passed: compilation, TypeScript, and route generation |
| `npx prisma validate` | Passed; two pre-existing composite-relation `SetNull` warnings remain |
| `TEST_DATABASE_RESET_ALLOWED=1 npm run test:db` | Passed: all nine migrations replayed and 6 database tests passed |
| `npm run test:e2e` | Passed: authenticated setup and all 4 browser scenarios, 5 tests total |
| Focused calendar/feed/saved-row/reset coverage | Included and passed in the full coverage run |
| Rendered desktop/mobile Explore checks | Passed in the full browser run, including contrast and the full mobile interaction path |
| `git diff --check` and final file-list review | Passed |

The clean install reports no critical advisory after the Next.js update. Its
remaining npm advisories resolve through build/development tooling paths
(Sentry bundling, Browserslist, and the Prisma CLI), not the deployed request
path. npm's proposed Prisma remediation is a major downgrade, so no blind
`npm audit fix` or unrelated dependency rewrite was applied.

## Merge and release boundary

There are no remaining merge-readiness actions beyond committing this cleanup
with the branch and performing the normal merge. Pull-request CI remains the
authoritative merge gate and will rerun lint, coverage, and build.

Before deploying the merged commit, follow the existing release procedure:
apply the committed migration to the verified deployment target before
promoting the matching app build. No production migration, production smoke
test, real-device camera check, or complete browser save/delete lifecycle was
performed during this review. Those are release/operational checks, not open
merge blockers.

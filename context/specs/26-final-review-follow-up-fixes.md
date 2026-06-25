# Unit 26 - Final Review Follow-Up Fixes

Phase 5 follow-up unit. Spec only - implementation work is tracked in `context/progress-tracker.md`.

Reference: `context/specs/25-final-v1-review.md`.

---

## Goal

Fix the Unit 25 review findings without expanding V1 scope.

This unit addresses:

- Real signed-in account identity in the authenticated top navigation.
- Signed-in redirects away from `/sign-in` and `/sign-up`.
- Removal of the inert notifications button.
- Documentation drift in dependency and design-decision notes.
- Removal of the stale POC photo attachment type.

---

## Scope

Allowed:

- Small edits to existing auth pages.
- Small edits to the existing top navigation component.
- Tests or source guardrails for the corrected behavior.
- Documentation updates to `context/code-standards.md`, `context/ui-registry.md`, and `context/progress-tracker.md`.

Out of scope:

- New account settings editing.
- Notification features.
- New routes beyond existing auth-route redirects.
- Schema changes, migrations, new dependencies, uploads, AI, analytics, organization/admin behavior, billing, gradebook, IEP-writing, parent communication, full-account export, or all-student export.

---

## Acceptance Checks

- Top nav no longer imports mock teacher data and no longer renders a notifications button.
- Signed-in users visiting `/sign-in` or `/sign-up` are redirected to `/app`.
- Stale POC capture types remain text-only.
- Context docs reflect current dependencies and active design direction.
- Focused tests pass.
- `npm.cmd run test` passes.
- `npm.cmd run lint` passes.
- `npm.cmd run build` passes.

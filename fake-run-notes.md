# Fake-account run follow-up plan

## Goal

Make roster setup, capture review, and saved-evidence management feel obvious to a teacher without adding product scope. Remove UI that looks analytical without providing a real workflow, and keep the support path useful without duplicating the authenticated feedback form.

## Product decisions

- A new capture should move directly into editable review because teacher review is required before saving.
- **Review later** means collapse the review and keep the draft in the Needs review queue.
- **Edit original capture** is distinct from editing the saved Evidence note and structured fields.
- Student creation stays class-scoped, but the class-first step should not hide the student workflow.
- `/support` remains available for signed-out teachers, but it should be a short routing page rather than a second support experience.
- Patterns, Evidence cues, and Review prompts are removed; ClassTrace is not an analytics product.

## Work 1 — Make adding students obvious and immediately responsive

### Run notes

> 1. adding students in the roster page is not untuitive at all
>
> 2. new students do not populate on the roster page after adding

### Changes

- Reframe the roster overview as **Students by class** and make **Add/manage students** the clear action for every class.
- Simplify manual entry so student name is the primary field. Continue deriving the mention handle automatically and place handle and local ID under optional details.
- After a successful create action, add the returned student to the visible list immediately, then refresh from the server to reconcile authoritative state and class counts.
- Preserve class ownership, active-class validation, workspace scoping, and existing import behavior.

### Likely touchpoints

- `app/app/roster/page.tsx`
- `components/roster/manual-student-entry-form.tsx`
- Roster interaction tests and `actions/roster.test.ts`

### Acceptance

A teacher can tell where to add a student without exploring the page, and the new student appears in the correct class immediately without a manual reload.

## Work 2 — Make review the clear next step after capture

### Run notes

> 3. after new capture, the "needs review, edit, delete" area needs ui refactoring. doesn't fit, ugly, etc
>
> 3a. "review before saving" needs to be the focus. not in an obnoxious way, but in a "this is the next step" way
>
> 4. should it automatically open into edit mode when reviewing instead of having to click "edit"?
>
> 5. what is the point of the "dismiss" button? is it just a "back" button?

### Changes

- Open every new capture directly in the editable review form.
- Give the Evidence note and **Save validated evidence** the strongest hierarchy; keep structured fields editable without a second generic Edit mode.
- Retain a clearly labeled **Edit original capture** action for correcting the source note or student mention.
- Rename **Dismiss for now** to **Review later**. It collapses the form and preserves the draft in the Needs review queue.
- Keep **Delete draft** explicit but visually secondary.
- Simplify the draft card so status, review, source editing, and deletion no longer compete in a narrow action rail.

### Likely touchpoints

- `components/dashboard/evidence-capture-card.tsx`
- `components/dashboard/interpretation-review-panel.tsx`
- `components/dashboard/evidence-feed.tsx`
- Capture and review interaction tests

### Acceptance

After Capture, the teacher lands on an editable Evidence note with one obvious save action. Review later preserves the draft, and editing the original capture remains available without being confused with evidence review.

## Work 3 — Simplify saved evidence and remove pseudo-analytics

### Run notes

> 6. honestly the whole capturecard isn't really untuitive at all. the right panel is a badge, subtext, then a floating "...manage evidence" button?
>
> 9. what is the point of the "patterns" and "evidence cues" thing on the right side of the page? pseudo-analytics?

### Changes

- Remove the saved-evidence right rail. Place validation status with the student/date metadata and let the Evidence note use the available width.
- Replace the vague **Manage evidence** disclosure with explicit **Archive** and **Delete** actions using the existing confirmations.
- Remove the Patterns, Evidence cues, and Review prompts sidebar.
- Remove summarization code and tests made obsolete by deleting that sidebar. Keep real follow-up information attached to the relevant draft or evidence record.

### Likely touchpoints

- `components/dashboard/saved-evidence-row.tsx`
- `components/dashboard/classtrace-noticed-panel.tsx`
- Feed layout and capture-summary modules/tests

### Acceptance

Evidence rows scan as one coherent record, management actions are unambiguous, and the feed no longer presents lightweight counts or parser output as analytics.

## Work 4 — Correct mention-editor alignment

### Run note

> 7. the text formatting when the reactmention thing is active is ugly and not properly aligned with the actual text?

### Changes

- Give the React Mentions input and highlight layers identical font family, size, line height, padding, wrapping, box sizing, and scrolling behavior.
- Check plain text, active mentions, long notes, suggestion navigation, and focus/error states.

### Likely touchpoint

- `components/dashboard/quick-capture-card.tsx`

### Acceptance

Highlighted mentions sit directly beneath the typed text with no visible offset at desktop or mobile widths.

## Work 5 — Reduce the public support page to its real purpose

### Run note

> 8. is the "support" page even really necessary since there's no public support route? it's just a text doc with links back to the settings because the form is in the settings page. confusing.

### Changes

- Keep `/support` for signed-out and invitation-related problems.
- Reduce it to two paths: signed-in teachers open Account feedback; teachers who cannot sign in reply through their invitation contact.
- Preserve the warning against including student information and the account-deletion link.
- Remove explanatory copy already present beside the authenticated form or in privacy documentation.

### Likely touchpoints

- `app/support/page.tsx`
- `app/public-info-pages.test.tsx`
- Public footer/settings links only if their labels need clarification

### Acceptance

A visitor can choose the correct support path immediately, and the public page no longer feels like a duplicate form or policy document.

## Implementation order

1. Roster workflow and immediate student update.
2. Capture card and review-state redesign.
3. Saved-evidence row simplification and sidebar removal.
4. Mention-editor alignment.
5. Support-page reduction.

Complete and verify each work package before starting the next so functional regressions are separated from visual restructuring.

## Final verification

- Add rendered interaction coverage for immediate roster updates, auto-open review, Review later, original-capture editing, exact Evidence-note saving, and archive/delete confirmations.
- Check roster, capture, review, and evidence-feed behavior at desktop and mobile widths, including keyboard focus and reduced-motion behavior.
- Confirm raw capture text still follows the approved `sessionStorage` boundary and is never saved or logged.
- Run `npm run lint`, `npm run test`, and `npm run build`.

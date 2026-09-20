# ClassTrace repeated-use QoL audit

Audit date: 2026-09-19

Audited branch: `main`

Audited commit: `7e7a4bba52456d7fa5504183999ec0f1c2fd65e1`

## Scope and conclusion

This audit treats the current implementation as the source of truth and focuses on friction that compounds during repeated teacher use: extra navigation, repeated entry, lost query state, long scan paths, and mobile viewport waste. It does not propose a new product loop.

The highest-value work is concentrated in four places:

1. Replace the mobile bottom tab bar with a compact header/menu model and remove its collisions with bottom sheets.
2. Add one reusable, lightweight student quick-jump; use it in the authenticated shell and as a timeline student switcher, then preserve that student when opening Capture.
3. Make retrieval operate on the corpus before pagination: workspace-wide feed text search, URL-backed Explore state, and bounded/filterable student timelines.
4. Tighten the mobile Capture-to-result loop and make pending session drafts visible from navigation without changing their privacy or persistence model.

The existing foundations are generally sound. Capture still produces a temporary draft, validation still precedes save, Explore already has useful structured retrieval, mobile Explore filters already collapse behind a disclosure, and core controls generally have labels and visible focus treatment. The recommendation is to remove friction around those foundations, not replace them.

## Audit method and visual evidence

I traced the authenticated routes, server reads, client state, URL state, session draft storage, shared evidence rendering, and tests. I then exercised the seeded fictional workspace in Chromium at 1440×900 and 390×844. The browser run created one session-only draft, did not validate or save it, and discarded it when the browser context closed.

Key measurements:

- The main feed renders 50 records per page. At 390×844, page 1 was 11,392px tall and pagination began at 11,071px: about 13.5 phone viewports before the page boundary.
- The same feed page was 7,995px tall at 1440×900.
- Mary's seeded timeline renders all 17 records in one response and was 3,784px tall at 390×844.
- Applying a Mary filter in Explore left the URL at `/app/explore`; refreshing reset the question to “any student.”
- Following “Older evidence” moved to `/app/feed?page=2` at `scrollY = 0`; the evidence heading was another 525px below the top, so each page change repeats a scroll past Capture.
- With the draft-review bottom sheet open at 390×844, Playwright could not activate the visible draft row because the fixed bottom navigation intercepted the pointer event.

Captured workflow evidence:

| Step | Capture | General health |
| --- | --- | --- |
| 1 | [Desktop Capture and feed](../output/playwright/qol-audit/01-feed-desktop.png) | Clear hierarchy and calm styling; the 50-record page is far too long. |
| 2 | [Mobile Capture and feed](../output/playwright/qol-audit/02-feed-mobile.png) | Controls remain legible, but the composer and permanent bottom bar consume too much of the first viewport. |
| 3 | [Immediate post-capture state](../output/playwright/qol-audit/03-feed-mobile-after-capture.png) | The draft count is clear on Capture; it disappears from awareness after navigation. |
| 4 | [Mobile draft-review sheet](../output/playwright/qol-audit/04-draft-review-mobile.png) | Focus-managed dialog structure is present, but the bottom tab bar overlaps the interaction zone and intercepted the draft-row tap. |
| 5 | [Current mobile menu](../output/playwright/qol-audit/05-current-mobile-menu.png) | Well-formed modal behavior, but it contains trust/support links rather than primary navigation. |
| 6 | [Mobile Students overview](../output/playwright/qol-audit/06-roster-mobile.png) | Student cards are readable; retrieval is entirely visual scrolling by class. No pending-draft signal appears. |
| 7 | [Mobile student timeline](../output/playwright/qol-audit/07-student-timeline-mobile.png) | Evidence is readable, but there is no switcher, search, filtering, or bounded page. Capture loses the student context. |
| 8 | [Mobile Explore, filters closed](../output/playwright/qol-audit/08-explore-mobile.png) | This is a good mobile adaptation: the query is summarized and filters are collapsed. Preserve it. |
| 9 | [Mobile Explore, filters open](../output/playwright/qol-audit/09-explore-filters-mobile.png) | Usable and without horizontal overflow, though applying filters is below the first viewport and the bottom bar crowds the lowest controls. |
| 10 | [Mobile feed page boundary](../output/playwright/qol-audit/10-feed-pagination-mobile.png) | Pagination itself is understandable, but appears only after 11k+ pixels; the authenticated footer adds another block before the fixed nav. |

Browser console output contained development-only Clerk/Next warnings but no application errors during the audited flows.

## Verdict on the twelve proposed concerns

“QoL” means a bounded improvement to the existing loop. “Larger feature” marks a related idea that should not be smuggled into this work. “Unnecessary” marks UI or scope that should be removed or avoided.

| # | Verdict | Classification | Priority |
| --- | --- | --- | --- |
| 1 | **Modify and confirm.** The current Students overview links directly to timelines; a class detail page is not required. The real path is surface → Students → scan class sections → student. That is still too slow at roster scale. | QoL: shared student quick-jump and timeline switcher. Unnecessary: a broad command palette. | P1 |
| 2 | **Confirm.** Timeline and report “Capture something” links both go to generic `/app/feed` and discard the student. | QoL: validated student context in the Capture URL and preselected mention. | P1 |
| 3 | **Confirm.** All classifications use the same small outlined text pill in the shared evidence renderer. | QoL: stable icon-plus-label treatment. Unnecessary: card-by-card rainbow colors. | P2 |
| 4 | **Confirm retrieval friction; narrow the summary proposal.** Timelines load and render every record with no controls. Total count/date span already exist. | QoL: text search, type/tag/date filters, and pagination. Larger feature: metric cards, trend analytics, inferred “common topic” insights. | P1 |
| 5 | **Confirm.** The UI accurately says “Search this page,” so it is not mislabeled, but the interaction model is inadequate. The server fetches a page first and the client filters only that array. | QoL: workspace-wide server search before pagination. Unnecessary: duplicating all Explore controls in the feed. | P1 |
| 6 | **Confirm.** The `#` mention provider is wired to an empty array even though Explore already reads normalized workspace tags. | QoL: lightweight existing-tag suggestions. Larger feature: taxonomy management or fuzzy semantic merging. | P1 |
| 7 | **Confirm.** Draft state and count are hydrated only inside `EvidenceFeed`; no other route can signal pending work. | QoL: count/dot on Capture in global navigation. Larger and privacy-breaking: server-side or cross-device draft notifications. | P1 |
| 8 | **Confirm.** Explore's applied query, result view, and page live in component state/server actions; the route ignores search parameters. Refresh demonstrably resets the query. | QoL: canonical applied state in the URL. Larger feature: named/saved searches. | P2 |
| 9 | **Strongly confirm.** Page size is 50; mobile page 1 measured 11,392px. Pagination is bottom-only, and page changes restart above the 525px Capture block. | QoL: 20-record pages, clearer/duplicated controls, and evidence-anchor navigation. Infinite scroll is explicitly wrong. | P1 |
| 10 | **Confirm and replace.** The fixed four-item bottom bar is the primary mobile navigation and reserves permanent layout space. The hamburger currently contains only trust/support links. | QoL: compact mobile header plus primary navigation drawer/menu and direct Capture access. | P0 |
| 11 | **Confirm.** At 390px, the composer stacks photo controls, permanent guidance, and a full-width action; the saved feed begins well below the fold. | QoL: tighter grouping and conditional guidance while retaining usable targets. Unnecessary: shrinking text or tap targets. | P1 |
| 12 | **Confirm, with nuance.** Explore already has a genuine mobile collapse pattern and roster cards adapt acceptably. The largest failures are fixed-UI collisions, unbounded vertical lists, context loss, and below-fold actions—not universal horizontal breakage. | QoL: focused mobile pass with real-device keyboard testing. Larger feature: separate mobile product or native app. | P0/P1 |

## Detailed findings by implementation area

### A. Student wayfinding and context continuity

#### A1. One shared student quick-jump

Current flow and code:

- `/app/roster` is rendered by `app/app/roster/page.tsx`. `StudentsOverview` groups every active student by class and renders direct timeline links, but has no search input.
- `listActiveRosterStudentsForWorkspace` in `lib/students/roster-students.ts` already returns display name, mention handle, local student ID, and class context under the authenticated workspace boundary.
- `AppShellNavigation` in `components/dashboard/app-shell-navigation.tsx` knows only the pathname. Neither desktop navigation nor the mobile menu has roster access.

Friction: after dozens or hundreds of repetitions, choosing Students and visually locating a class/student is repeated navigation and rereading. With more classes or a larger roster, the overview degrades linearly even though the destination is known.

Smallest coherent fix:

- Build one `StudentQuickJump`/combobox that searches active students by display name, normalized `@mentionHandle`, and exact/partial local student ID, then navigates directly to `routes.student(id)`.
- Show class name and handle in results so duplicate display names are distinguishable; show local ID only when present and useful for disambiguation.
- Reuse it in the desktop authenticated header, the replacement mobile menu, and as a compact “Switch student” action in the student header. On phones, opening “Switch student” can use the same full-width search surface rather than permanently occupying timeline space.
- Keep the Students overview for roster browsing and management; quick-jump is a shortcut, not a replacement.

Do not build a global command palette, action syntax, command history, or keyboard-shortcut system for this problem. The route target is only an active student.

Accessibility: implement an actual labeled combobox/listbox with arrow-key navigation, Enter selection, Escape dismissal, announced result count/no-match state, visible focus, and focus restoration. Do not make local ID or class differentiation color-only. On mobile, the search panel must respond to the visual viewport so the software keyboard does not hide results.

#### A2. Preserve the selected student when capturing

Current flow and code:

- `StudentProfileHeader` and `StudentTimelineEmptyState` in `components/students/student-timeline-page.tsx` link to `routes.feed` with no context.
- `ReportHeader` in `components/students/student-report-page.tsx` does the same.
- `/app/feed` accepts only `page`, `filter`, and `q`; `QuickCaptureCard` has no initial-student prop and initializes its note state empty.

Friction: the teacher has already established the student, then must type and resolve the same `@mention` again. This is exactly the kind of repeated context entry that becomes irritating in daily use.

Smallest coherent fix:

- Link to `/app/feed?student=<studentId>` from timeline, empty timeline, and report.
- On the feed server, validate that ID as an active student in the current workspace. Pass a minimal selected-student value to `QuickCaptureCard`, render its mention token as genuinely selected composer state, and focus the composer.
- If the student is missing, archived, or outside the workspace, discard the parameter and present the generic composer with a safe message. Never put note text in the URL.

This depends on the same active-student lookup as the quick-jump, but should not require a new capture mode or student-specific capture route.

### B. Retrieval, filtering, and bounded lists

#### B1. Main-feed search must run before pagination

Current flow and code:

- `app/app/feed/page.tsx` parses `q` but calls `getEvidenceFeedPageForWorkspace(workspaceId, page)` without it.
- `getEvidenceFeedPageForWorkspace` in `lib/evidence/evidence-feed-records.ts` skips/takes 50 records first.
- `EvidenceFeed` computes `visibleEvidenceRecords` by applying `evidenceRecordMatchesSearch` only to `initialEvidenceRecords`.
- The current matcher already covers note/summary, student name/handle, class, type, topic, performance, behavior, follow-up text, and tags. The problem is query placement, not missing client matching logic.

Friction: a teacher must know which historical page contains a record before searching. The current honest “Search this page” label prevents deception, but it does not make the tool useful once history spans pages.

Smallest coherent fix:

- Treat `q` as bounded URL state and apply workspace-scoped, case-insensitive search in the server/domain query before `skip`/`take`.
- Search the saved evidence corpus across the same teacher-visible fields; retain useful `@handle` and `#tag` affordances.
- Return match count/page state so “no results” means no corpus match, not no match in the current slice.
- Keep this as basic free-text retrieval. Do not copy Explore's class/tag/date/photo filter editor into Capture.

Explore remains the structured retrieval surface. Its current contract supports student, class-at-capture, tag inclusion/exclusion, date, photo, and evidence/grouped view, but not free text or evidence classification. The meaningful product gap is therefore simple corpus text retrieval, not another all-purpose query builder.

Accessibility: submit/search state should be announced without every keystroke causing disruptive focus movement. A short debounce or explicit submit are both defensible; preserve the query in the URL and move focus to a results heading only on an explicit search/page action.

#### B2. Make feed pages deliberately bounded

Current flow and code:

- `EVIDENCE_FEED_PAGE_SIZE` is 50.
- Saved rows use 17px evidence text, metadata, optional follow-up rails, and work-sample photos up to 256px high. These are reasonable row choices individually but compound badly at 50 records.
- Pagination appears only after every record. Its links preserve `q`/filter, but Next navigation returns to the page top above Capture.
- The authenticated `SiteFooter` then repeats four trust/support links before the fixed mobile navigation.

Smallest coherent fix:

- Start with 20 records per feed page. This is a bounded default worth validating with photo-heavy real data; it avoids the extra round trips of 10–15 while cutting the current worst scan by 60%.
- Put a compact page status/control near the feed heading when another page exists and retain the full control below the records.
- Page links should target the evidence heading (or deliberately restore/focus it) so moving to Older/Newer does not require scrolling past Capture again.
- Make the boundary explicit: “Page 2 · older evidence” or an equivalent announced label. Preserve `q` and other meaningful URL state.
- Do not use infinite scroll or “load more” that silently recreates an unbounded page.

#### B3. Student timelines need server-side retrieval controls and pagination

Current flow and code:

- `getStudentTimelineRecordsForWorkspace` in `lib/evidence/student-timeline-records.ts` calls `findMany` with no `take` and returns every active record.
- `StudentTimelinePage` groups the full array by month and has no client or URL state.
- The header already shows deterministic total count and date span.

Friction: at 17 seeded records the mobile page already measures 3,784px. A school year of records increases server payload, render work, and manual scanning together.

Smallest coherent fix:

- Add URL-backed text search plus explicit evidence type, tag, and date filters; apply them server-side before pagination.
- Let text search cover topic, skill/performance, behavior/work habit, note, summary, and tags rather than presenting separate controls for every parsed field.
- Paginate at 20 records. Keep month grouping within each page and show total matches separately from records on the current page.
- Once Explore URL state exists, offer a quiet “More filters in Explore” route pre-scoped to the student rather than duplicating Explore.

The suggested header summaries should be narrowed. Keep the existing total and date span. A simple “recent” filter shortcut may be useful if it is literally the same date filter. Do not add “common topic,” “independent observations,” trends, or metric cards until usage demonstrates a stable need: those are analytics-like product features and free-form teacher-reviewed fields make them easy to misread.

#### B4. Put applied Explore state in the URL

Current flow and code:

- `app/app/explore/page.tsx` has no `searchParams` input and always renders `DEFAULT_EXPLORE_QUERY`, page 1.
- `ExploreEvidencePage` keeps `draftQuery`, `appliedQuery`, results, current page/view, expansions, and supporting pages in component state; `runQuery` calls server actions and never updates navigation state.
- The mobile query summary and collapsed Filters disclosure are strong and should remain.

Smallest coherent fix:

- Encode only meaningful **applied** state: student/class IDs, tag groups, date rule/range, photo rule, result view, and result page. Leave unsubmitted draft edits local.
- Parse, bound, normalize, and workspace-validate URL values on the route, using the same contract as the server action. Use readable repeated parameters rather than an opaque JSON blob.
- Update history when filters are applied, page/view changes, or filters clear so Back/Forward, refresh, and bookmarks behave naturally.
- Preserve current relative-date semantics and account for the browser offset. The existing initial server query uses offset zero while client actions send local offsets, so timezone handling is a real dependency of URL hydration.
- Keep expanded student rows and their supporting-evidence subpages ephemeral; they are incidental disclosure state, not bookmark-worthy query state.

Do not build saved-search naming, sharing, alerts, or search management in this pass.

### C. Capture speed, tag reuse, and draft awareness

#### C1. Tighten the mobile Capture composition

Current flow and code:

- `QuickCaptureCard` uses 20px phone-side padding, a 23px/34px two-line composer, two photo buttons, a permanent guidance paragraph, and a full-width 48px Capture action stacked in separate rows.
- The feed begins 40px below the Capture section.
- The mobile shell permanently consumes a 56px-plus-safe-area bottom region and the layout adds `pb-20`.

Friction: at 390×844 the first saved record is not fully reachable in the first viewport. The primary four-step loop—open, type, submit, see draft/result—feels like a form page rather than a quick capture surface.

Smallest coherent fix:

- Reduce card and section gaps modestly and group photo + Capture actions into one compact action row where width permits; allow an intentional wrap at the smallest widths.
- Keep the composer comfortably two lines but remove excess vertical padding around it.
- Shorten or conditionally reveal the static “nothing saves…” guidance after the teacher has begun typing; always keep errors, resolution status, photo privacy warnings, and review requirements explicit.
- Consider one compact “Add photo” entry on phone if platform behavior can still make camera and library choices clear. Do not remove either capability without device testing.
- Reduce the Capture-to-feed gap and remove the redundant feed filter row described below.

Do not reduce body text below readable sizes or targets below roughly 44px. The issue is stacking and permanent copy, not typography alone.

The browser cannot faithfully simulate iOS/Android software-keyboard behavior. A real-device pass is required to confirm that the composer, mention suggestions, Capture action, toast, menu, and review sheet remain visible with the keyboard open and across safe areas.

#### C2. Reuse existing workspace tags in Capture

Current flow and code:

- `QuickCaptureCard` passes `tagSuggestions = []` to the `#` mention provider.
- `getExploreEvidenceOptionsForWorkspace` already queries distinct active evidence tags, strips `#`, lowercases, deduplicates, and bounds the result.

Smallest coherent fix:

- Reuse/extract that workspace-scoped tag-options read and pass normalized existing tags to Capture.
- Filter client-side as the teacher types; prefer prefix matches and exact existing spellings, while still allowing a new tag.
- Reuse the same lightweight suggestions in detailed review later if tag drift remains there.

Autocomplete can reduce capitalization and spelling drift. It cannot safely infer that `#fraction` and `#fractions` mean the same thing, so do not silently merge, rename, or police the teacher's taxonomy. A taxonomy manager, synonym system, or AI tag recommendation is a larger feature.

Accessibility: the `#` suggestion list needs the same keyboard and announcement behavior as the student mention list, and selected markup must remain understandable to assistive technology.

#### C3. Surface pending drafts globally without changing persistence

Current flow and code:

- Session drafts are workspace-scoped, versioned, bounded, and expire at local midnight in `lib/evidence/session-draft-storage.ts`; photo bytes remain in IndexedDB.
- Only `EvidenceFeed` hydrates those drafts and renders `DraftReviewQueue`.
- `AppShellNavigation` subscribes to cleanup for sign-out but has no count. The roster screenshot demonstrates a pending draft with no global signal.

Smallest coherent fix:

- Show a quiet numeric badge or dot on the Capture item in desktop navigation and in the replacement mobile menu. Prefer a count while small; accessible text should say “Capture, 2 drafts to review,” not expose meaning only through color.
- Hydrate only the count at shell level using the existing workspace/version/expiry rules. Keep raw notes out of shell rendering and out of any new storage.
- Publish a same-tab draft-count event or small context when Capture adds/removes a draft because the browser `storage` event does not notify the same document for `sessionStorage` writes.
- Treat this as device-tab/session-local. Do not imply cross-device awareness.

Do not move drafts to `localStorage`, the database, telemetry, notifications, or server synchronization. That would violate the current privacy/product contract and is unnecessary for the stated QoL goal.

### D. Evidence scanability

#### D1. Give classifications a restrained, shared visual signature

Current flow and code:

- `EvidenceRecordContent` is shared by the feed, timeline, Explore, and report.
- Its `Detail` component renders every `evidenceType` as the same outlined text pill. Topic, performance, behavior, and tags differ mostly by text tone.
- Follow-up already uses an amber left rail, so reusing rails for classification would overload an existing meaning.

Friction: Academic check-in, Behavior observation, Communication log, Accommodation log, Assessment observation, Progress monitoring, and General observation require reading every label. Repetition makes a long trace visually homogeneous.

Smallest coherent fix:

- Define a stable mapping from the seven current saved classifications to an icon plus short text label.
- Use one restrained neutral badge system with limited semantic accents—e.g. icon shape and a subtle border/background token—rather than seven saturated card colors.
- Place the classification consistently near the primary row metadata in all shared evidence surfaces.
- Preserve visible text and an accessible name; icons and color are redundant cues, never the only cue.

Do not redesign whole cards, add decorative illustrations, or introduce a color legend that teachers must memorize. Also do not use the existing follow-up rail for type.

### E. Mobile shell and authenticated mobile pass

#### E1. Replace the fixed bottom navigation

Current flow and code:

- `AppTabBar` is fixed to the bottom below `lg`, has four equal tabs, and reserves permanent space through `app/app/layout.tsx`'s `pb-20`.
- `AppShellDrawer` is already a focus-trapped modal sheet, but contains brand copy, four trust/support links, and sign-out—not Capture, Explore, Students, or Settings.
- Both the bottom tab bar and `DraftReviewQueue` use `z-50`. In the audited viewport the tab bar intercepted pointer input intended for the visible draft row.

Smallest coherent replacement:

- Keep a compact sticky top header with current-route context, a direct compact Capture action on non-Capture routes, and a menu button.
- Turn the menu into primary navigation: Capture (with pending count), Explore, Students, Settings, then secondary support/trust/sign-out. Put the student quick-jump near the top.
- Use a top-anchored/side panel or full-height dialog behavior that remains usable when the quick-jump opens the keyboard. Do not simply move the current desktop nav labels into a cramped row.
- Remove the fixed bottom bar and `pb-20`; reposition feed toasts to the actual safe-area bottom when no modal is open.
- Preserve active-route indication, Escape/backdrop close, focus trap/return, 44px targets, reduced-motion behavior, and top/bottom safe areas.

A top menu is less thumb-reachable than a bottom bar, so the direct Capture affordance matters. On the Capture route itself, the composer is already the primary action and the header can stay simpler.

#### E2. Fix bottom-sheet ownership and collision

The draft-review failure is not only visual polish: the visible draft row could not be clicked because the tab navigation intercepted the event. Removing the bottom nav resolves the main conflict, but modal ownership should still be explicit:

- A modal sheet must be above every non-modal shell element and should inert the background.
- Its scrollable region and action footer must account for `env(safe-area-inset-bottom)` without another fixed layer on top.
- Keep the current focus trap and Escape/focus-return behavior; these are good foundations.
- Verify the longest valid and correction-required draft states, not only the collapsed queue row. Important approve/delete actions must remain reachable without escaping the modal scroll container.

#### E3. Preserve the mobile adaptations that already work

- Explore's closed-filter state is compact and legible. Do not replace it with permanently stacked desktop filters.
- Roster student cards and timeline action wrapping showed no horizontal overflow at 390px. The issue is finding/scanning, not broken card layout.
- Settings measured about two viewports and had no horizontal overflow; it is lower-frequency and should not displace work on Capture, retrieval, or timelines.

When Explore filters are open, the Show/Update action begins about 1,191px down the page. After removing the bottom bar, assess a small sticky in-panel action footer on phone only if real-device testing still shows repeated apply-button hunting. Do not change the successful collapsed summary preemptively.

## Additional QoL findings from the implementation

### 1. The feed's status filters are redundant or dead-end controls

Classification: **unnecessary complexity; remove rather than expand.**

`All` and `Validated` show the same saved records because the feed contains saved/validated evidence. `Needs review` deliberately returns an empty list and tells the teacher to use the draft queue above. This consumes mobile space and creates a round trip to a dead end. Remove the three-way group. The draft queue/count is the review entry; the saved feed is validated evidence.

### 2. Pagination changes destroy the teacher's feed position

Classification: **genuine QoL.**

The page link preserves query parameters but lands at the top of Capture. The measured page-2 evidence heading was 525px below the new scroll position. Use an evidence anchor/focus target and announce the new page. This overlaps the stricter-pagination work and should be implemented with it.

### 3. The student report repeats the same context-loss bug

Classification: **genuine QoL; part of concern 2, not separate scope.**

The report's “Capture something” action also links to generic Capture. Use the same validated student parameter as timeline actions.

### 4. Authenticated footer links duplicate the mobile menu and add end-of-page bulk

Classification: **small QoL, lower priority.**

`SiteFooter` appears on every authenticated route and renders Privacy, Beta terms, Support, and Account deletion; the current mobile drawer repeats the same destinations. Once the replacement menu owns those secondary links, simplify the authenticated mobile footer or omit the duplicate grid while retaining any required beta/trust access. This is most visible after a long feed, immediately before pagination/navigation.

### 5. Timeline filtering alone would leave an unbounded data path

Classification: **genuine QoL/performance dependency.**

The timeline domain query has no `take`, so client-only filtering would still transfer and render the entire school year. Filtering and pagination must be server-side and workspace-scoped. Avoid solving the visual symptom without bounding the read.

## Dependencies and overlap

| Shared dependency | Work that should share it | Boundary to preserve |
| --- | --- | --- |
| Active-student lightweight index | Global quick-jump, timeline switcher, Capture student parameter validation | Active students only; workspace predicate on every read; no student notes in shell state. |
| Canonical query parsing | Feed `q`/page, timeline filters/page, Explore URL state | Bound all inputs; do not create one over-general query framework. Keep route-specific contracts. |
| Shared evidence classification mapping | Feed, timeline, Explore, report | Text remains present; do not overload follow-up/danger semantics. |
| Existing normalized workspace tags | Capture autocomplete and current Explore tag filter | Suggestions only; do not mutate taxonomy or infer synonyms. |
| Existing session draft manifest | Capture queue and shell count | Count only outside Capture; keep raw notes in approved session storage and photos in IndexedDB. |
| Mobile shell/modal layering | Navigation drawer, draft review, photo modal, toasts | One clear modal layer, focus containment, safe areas, visual viewport behavior. |

Feed search and Explore should share evidence-field normalization where practical, but they should remain different tools: feed search is fast free text; Explore is explicit structured retrieval. The student timeline can use a compact subset and link into Explore for more structure.

## Priority by repeated-use impact

### P0 — correctness and obstruction

- Replace the persistent mobile bottom nav and remove its reserved viewport space.
- Fix modal layering so the draft-review sheet cannot be covered or have taps intercepted.

### P1 — daily speed and context

- Shared student quick-jump plus timeline switcher.
- Student-preserving Capture links from timeline, empty state, and report.
- Mobile Capture density pass that retains accessible targets.
- Pending-draft count in global navigation.
- Existing-tag autocomplete in Capture.
- Workspace-wide feed text search before pagination.
- Reduce feed page size to 20, add a top pager/status, and land page changes at evidence.
- Add bounded timeline search/type/tag/date retrieval and pagination.
- Remove the no-op All/Needs review/Validated feed controls.

### P2 — durable state and scanability

- URL-backed applied Explore state, including page and view.
- Shared icon-plus-label evidence classification treatment.
- Simplify duplicate authenticated mobile footer links.
- Consider an in-panel mobile Explore apply footer only after testing the shell without the bottom bar.

## What should intentionally not be built

- No broad command palette; a student picker solves the stated navigation problem.
- No AI search, embeddings, semantic retrieval, AI tag suggestions, or generative summaries.
- No analytics dashboard, trend cards, inferred topic rollups, or performance metrics in the student header.
- No saved-search system until URL persistence has been used and shown insufficient.
- No infinite scroll.
- No new draft persistence, cross-device synchronization, push notification, or server-side draft store.
- No tag taxonomy manager, automatic singular/plural merging, or silent retagging.
- No separate mobile product/native app and no compressed copy of desktop navigation.
- No classification rainbow, card redesign, or color-only meaning.
- No separate control for every structured evidence field on the student timeline; start with text plus type/tag/date.

## Recommended implementation order

1. **Mobile shell safety:** remove `AppTabBar` on mobile, build primary navigation into the compact menu, remove `pb-20`, correct modal/toast layering, and verify safe areas/focus on small phones.
2. **Student context path:** add the shared quick-jump, reuse it for “Switch student,” and add validated student-preserving Capture links from timeline/report.
3. **Capture loop:** tighten the mobile composer, add workspace tag suggestions, and expose the existing session draft count in navigation without exposing draft content.
4. **Feed retrieval:** move free-text search into the workspace-scoped server query, remove redundant status filters, change the page size to 20, add top/bottom page controls, and land navigation at the evidence heading.
5. **Timeline retrieval:** add URL-backed text/type/tag/date filtering and 20-record server pagination; retain only deterministic total/date-span summary.
6. **Explore durability:** parse applied query/page/view from the URL and update browser history while preserving the current collapsed mobile filter experience and timezone semantics.
7. **Evidence scanability:** introduce the shared accessible icon-plus-label classification mapping across feed, timeline, Explore, and reports.
8. **Mobile finishing pass:** re-test Capture, long/correction-required draft review, Explore filters/results, roster, timelines, photo dialogs, keyboard-open states, 320–430px widths, landscape, and installed-PWA safe areas; simplify the authenticated footer if the replacement menu makes it redundant.

This order fixes the interaction collision first, then removes the most repeated context rebuilding, then improves retrieval and scanning without expanding the product's scope.

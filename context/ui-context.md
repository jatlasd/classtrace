# UI context

## Experience goal

ClassTrace should feel like a calm evidence inbox for a working teacher. The interface exists to make capture, review, and retrieval quick and trustworthy; it is not a decorative classroom theme or an enterprise dashboard.

Priority order:

1. Quick capture
2. Clear teacher review
3. Scannable evidence feed and direct evidence retrieval
4. Student timeline/reporting
5. Roster and settings support

## Visual language

- Public and authenticated routes share one cool-surface, indigo, and mint semantic palette. Public pages use the colors more compositionally; authenticated routes keep them restrained around the teacher's work.
- Indigo ground owns public navigation, hero/showcase fields, the closing invitation, and active app navigation. Mint is a brand signature used only inside those indigo fields; it always takes dark mint ink when used as a fill.
- Light surfaces use white, cool neutral surfaces, indigo actions, and ink links/icons. Validation uses ink-muted icons or bordered neutral treatments rather than mint or pastel washes; red remains reserved for destructive state.
- Inter is the sole user-facing type family. Weight, size, spacing, and color create identity and page hierarchy.
- Borders and tonal separation do most layout work. Shadows are tight, palette-tinted, and reserved for genuinely floating or focused surfaces.
- Corners are modest (`rounded-md`, `rounded-card`); pills are for chips/status only.
- The shared brand lockup uses the approved compact `CT` tile: mint with dark letters on indigo, and indigo with mint letters on light surfaces.

Use semantic tokens from `app/globals.css`. Do not introduce raw palette utilities or hex values in components.

## App shell and hierarchy

- Authenticated routes share one responsive application shell and one `main`
  landmark: a fixed muted-surface sidebar at `lg` and above, and a sticky muted-surface header
  with a modal navigation drawer below `lg`.
- A keyboard skip link targets `#main-content`.
- Active navigation uses `aria-current="page"` and restrained visual emphasis.
- Primary navigation is Capture, Explore, Students, then Settings. Capture
  remains the first navigation/action concept.
- Mobile navigation contains focus, closes from Escape or the backdrop, returns
  focus to its trigger, and prevents background scrolling while open.
- Do not add fake search, notification, review, reporting, or admin navigation.

The feed begins with its page header and prominent quick-capture composer. The class roster exists to organize students; it must not displace capture as the product’s center.

## Component principles

- Use ledgers/lists for evidence and roster data rather than grids of interchangeable cards.
- Evidence text is primary; date, status, structure, tags, and actions support scanning.
- One shared evidence-content component owns Evidence note/legacy copy, structured summary, chips, follow-up, and long-content overflow.
- Archive is visually calmer than permanent delete. Delete copy states permanence and requires confirmation.
- Empty states explain the next useful action without marketing language.
- Loading/error/not-found states are deliberate and do not expose technical details.

## Forms and state

- Every field has a visible label; placeholders are hints only.
- Invalid controls use `aria-invalid` when the error belongs to that control.
- Dynamic error summaries use a live region and receive focus when the teacher needs to act on them.
- Pending buttons use a real ellipsis (`…`) and remain explicit about the action.
- Feed search/filter state lives in the URL. Explore questions remain transient
  client state and run only through **Show results**. Evidence pagination is
  explicit and bounded.
- Explore uses one sentence-like question surface followed by complete-result
  counts and evidence-ledger rows. It does not use metric cards, charts, or
  analytics-dashboard chrome.
- The first successful workspace save may show one inline retrieval payoff with timeline, report, and capture-another actions.
- Do not hide a destructive action behind an unrelated icon or ambiguous menu affordance.

## Accessibility

- Meet WCAG AA contrast for text and interactive states.
- Preserve visible keyboard focus.
- Icon-only buttons require accessible names; decorative icons use `aria-hidden`.
- Navigation landmarks are named.
- Touch targets should approach 44×44 px on mobile.
- Color is never the only signal for validation, error, selection, or archive state.
- All animations/transitions respect `prefers-reduced-motion`.
- Teacher-entered text and long identifiers must wrap without horizontal overflow.

## Responsive behavior

- Mobile layouts stack naturally; controls wrap rather than creating horizontal scrolling.
- Evidence rows collapse date/status metadata above the evidence content.
- Roster editing/actions remain reachable without hover.
- Desktop uses available width for scanning, not for adding dashboard panels.
- Printable reports remove app chrome and avoid splitting an evidence entry across pages.

## Copy

Use direct teacher language: Capture, Explore evidence, Show results, What happened?, Review before saving, Evidence note, Student, Class, Tags, Follow-up, Timeline, Report, Archive, Delete.

Do not use AI, insights, intelligence, compliance, district-approved, case-management platform, automation, or generated-document language.

## Anti-slop rules

- No decorative glass, gradient text, texture downloads, noise filters, striped/grid overlays, or arbitrary blobs.
- No colored side-stripe callout cards.
- No broad `transition-all`; animate only the property that communicates state.
- No huge soft shadows paired with borders.
- No repeated eyebrow labels or card grids as default scaffolding.
- No handwritten decoration inside authenticated product workflows.
- No new one-off chip, evidence, form, or button vocabulary when a shared pattern exists.
- No placeholder controls for future features.

The public landing page may use more generous composition and committed dark fields than the app, but it remains sans-serif, border-led, and structurally connected to the product. It must remain truthful about product behavior, reduced-motion safe, and free of paper textures, classroom decoration, handwritten elements, doodles, tape, gradients, or scrapbook styling.

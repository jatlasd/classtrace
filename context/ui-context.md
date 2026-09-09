# UI context

## Authority and experience goal

The current implementation is the visual source of truth. For UI work, read
`DESIGN.md`, inspect `app/globals.css`, and inspect the relevant route and shared
components. When older prose disagrees with the implementation, preserve the
implementation and correct the prose.

ClassTrace should feel like a warm, calm evidence trace for a working teacher.
The interface makes capture, review, and retrieval quick and trustworthy; it is
not a decorative classroom theme or an enterprise dashboard.

Priority order:

1. Quick sentence capture
2. Clear teacher review
3. Scannable saved evidence and direct retrieval
4. Student timeline and reporting
5. Roster and settings support

## Visual language

- Bricolage Grotesque is the sole loaded user-facing family. Display, body,
  label, and compact technical roles use its optical-size and width variations.
- The page ground is warm ivory. White Plates contain active or bounded work;
  pale violet Wells hold inset controls and secondary structure.
- Aubergine ink has three hierarchy levels for primary, supporting, and faint
  content. Rules derive from the same ink.
- Amber distinguishes the live moment, provisional drafts, changed filters, and
  actions that advance work. Ink distinguishes saved, validated evidence.
  Explicit copy and shape must accompany the color distinction.
- Danger pink-red is reserved for invalid and destructive state.
- The trace motif is a fine line with nodes: amber for live/provisional moments,
  ink for saved evidence.
- Plates use a 16px radius and subtle shadow; Wells and ordinary controls use an
  8px radius. Full rounding is established for calls to action, navigation,
  filters, search, compact state, and circular identity marks.
- Semantic left rules are allowed for provisional, follow-up, unresolved, and
  danger states. Do not use them as decoration.
- Use semantic tokens and shared utilities from `app/globals.css`; do not build
  a second palette or surface system in components.

The shared brand lockup is an abstract two-circle trace mark beside the
ClassTrace wordmark. The large circle is ink (or Base when inverse) and the
small lower-right node is amber. There is no `CT` tile.

## App shell and hierarchy

- Authenticated teacher-workspace routes under `/app` use a sticky top header on
  every viewport and one `main#main-content`. There is no desktop sidebar or
  fixed route-header rail. Sign-in, beta acknowledgement, and operator routes
  use their own focused layouts.
- At `lg`, Capture, Explore, Students, and Settings are centered as text-led top
  navigation; the active destination receives an amber dot.
- Below `lg`, the same four destinations form a fixed bottom tab bar. The mobile
  top header keeps the brand, current route label where needed, and a menu.
- The mobile menu is a bottom sheet for trust/support links and Sign out, not a
  duplicate primary nav. It traps focus, closes with Escape/backdrop, restores
  trigger focus, and prevents background scrolling.
- Capture remains the first destination and the visual center of the product.
  Student timelines and reports activate Students without joining global nav.
- Do not add fake search, notification, analytics, review, reporting, or admin
  navigation.

## Core composition

- Capture is a large sentence field in a live Plate, not a conventional
  multi-field form. It uses `@student` and optional `#tag` language, with photo
  actions and one amber Capture action below.
- Capturing creates a device-local provisional draft. Drafts remain in Plates
  and expose explicit review and clearing boundaries. Review expands in place.
- Teacher validation is the transition from amber/provisional to ink/saved.
  Never make a deterministic interpretation look permanently saved.
- Saved evidence appears in an open chronological trace rather than repeated
  cards. Evidence text leads; identity, date, class, structured details, photo,
  follow-up, and actions support scanning.
- Explore is a sentence with editable slots. The optional Who/What/When filter
  Plate elaborates those slots; results change only through Show results or
  Update results and return as an evidence trace or grouped student list.
- Students uses linked student Plates in a responsive grid for the overview,
  divided Plate rows for class management, and inline disclosures for adding or
  managing roster records.
- A student timeline is a month-grouped saved trace with the student's identity
  as the dominant heading. Reports use print-safe ruled rows.

These patterns are contextual. Do not impose a blanket “all cards” or “all
ledgers” rule: active/provisional work belongs in Plates, secondary controls in
Wells, chronological saved evidence in traces, identity entry points in small
linked Plates, and dense management data in divided rows.

## Forms and state

- Every field has a visible label; placeholders are hints only.
- Invalid controls use `aria-invalid` when the error belongs to that control.
- Dynamic error summaries use a live region and receive focus when the teacher
  must act on them.
- Pending buttons use a real ellipsis (`…`) and name the pending action.
- Feed search/filter state lives in the URL. Explore query state remains
  transient client state; field edits apply only through Show results or Update
  results. View changes and pagination use the last applied query.
- Destructive actions state permanence, require confirmation, and restore a
  predictable focus position on cancel.
- Empty states explain the next useful action without marketing language.

## Accessibility and responsive behavior

- Meet WCAG AA contrast for text and interactive states and preserve visible
  keyboard focus.
- Icon-only buttons have accessible names; decorative icons are hidden.
- Navigation landmarks are named and active links use `aria-current="page"`.
- Touch targets approach 44×44px on mobile.
- Color is never the only signal for provisional/saved, validation, error,
  selection, archive, or destructive state.
- Long teacher-entered text, student names, handles, tags, and identifiers wrap
  without horizontal overflow.
- Mobile layouts stack and controls wrap. Content reserves room for the fixed
  bottom tabs. Roster actions never depend on hover.
- Printable reports remove app chrome and avoid splitting an evidence entry.
- All animation and transition behavior respects `prefers-reduced-motion`.

## Voice

Use direct teacher language: Capture, Explore, Show results, Update results,
What happened?, Review before saving, Evidence note, Student, Class, Tags,
Follow-up, Trace, Timeline, Report, Validate, Archive, Delete.

Do not use AI, insights, intelligence, compliance, district-approved,
case-management platform, automation, or generated-document language.

## Anti-slop rules

- No enterprise dashboard chrome, fake metrics, ornamental school imagery, or
  controls for features that do not exist.
- No gradient text, glass panels, downloaded textures, noise filters, arbitrary
  blobs, scrapbook styling, handwritten type, doodles, tape, or sticky notes.
  The landing page's existing pale radial `grain` field is an intentional part
  of the redesign, not a general invitation to add gradients.
- No rainbow tags, competing accent palette, giant soft shadows, or stacks of
  nested floating cards.
- No repeated eyebrow labels unless they express a real moment or state.
- No broad `transition-all`; animate only the property that communicates state.
- No new one-off button, field, brand, evidence, or confirmation vocabulary
  when a shared pattern exists.
- Do not use amber as generic decoration or style saved evidence like a draft.

The landing page may use larger typography, more generous spacing, and the
established subtle radial field, but it shares the same warm palette, type,
trace motif, plates, and live-to-saved story as the application.

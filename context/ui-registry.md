# UI Registry

Living document. Updated after every meaningful UI component is built or changed.

Read this before building any new ClassTrace component. Match existing patterns exactly before inventing new ones.

This file records actual UI patterns used in the app. `ui-context.md` defines the design rules; this file documents the concrete component patterns already in use.

**2026-06-11 design system:** Tokens from `classtrace_asset_kit/design-tokens.json` via `app/globals.css`. Use `rounded-card`, `shadow-paper`, `shadow-floating`, `font-display`, `bg-validated`, `bg-navy`, `text-link`, `tape-tab`, and `bg-audience-*` (landing only). Registry entries below were refreshed for the warm-paper overhaul.

---

## How to Use

Before building any component:

1. Check if a similar component already exists here.
2. If yes, match its structure, classes, spacing, and interaction pattern.
3. If no, build it using `context/ui-context.md`, then add the new pattern here.
4. Do not invent raw colors, spacing systems, component styles, or layout patterns.

After building or changing any UI component, update this file with:

- Component name
- File path
- Last updated date
- Key classes by property
- Pattern notes

Run `/imprint` after building UI components so new patterns are captured here.

---

## Components

### App Sidebar

File: `components/dashboard/app-sidebar.tsx`  
Last updated: 2026-06-11

| Property | Class |
|---|---|
| Shell | `hidden w-[72px] shrink-0 flex-col border-r border-sidebar-border bg-sidebar lg:flex xl:w-[220px]` |
| Header | `flex h-16 items-center justify-center border-b border-sidebar-border xl:justify-start xl:px-5` |
| Logo mark | `flex size-9 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground` |
| Logo text | `font-display ml-3 hidden text-[15px] font-semibold tracking-tight text-sidebar-foreground xl:block` |
| Nav list | `flex flex-1 flex-col gap-1 px-2 py-4` |
| Nav item | `group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors` |
| Active nav item | `bg-sidebar-accent text-sidebar-accent-foreground` |
| Inactive nav item | `text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground` |
| Nav icon | `size-[18px] shrink-0` |
| Active indicator | `ml-auto hidden size-1.5 rounded-full bg-sidebar-primary xl:block` |
| Footer | `border-t border-sidebar-border px-2 py-4` |
| Footer button | `flex items-center justify-center gap-3 rounded-lg px-3 py-2.5 text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent/50 hover:text-sidebar-foreground xl:justify-start` |
| User avatar | `flex size-8 shrink-0 items-center justify-center rounded-full bg-sidebar-primary text-xs font-semibold text-sidebar-primary-foreground` |

**Pattern notes:**  
The desktop sidebar is dark, compact at `lg`, expanded at `xl`, and uses sidebar-specific semantic tokens only. Active state uses `bg-sidebar-accent`, `text-sidebar-accent-foreground`, and a small `bg-sidebar-primary` dot. Do not use main workspace colors inside the sidebar unless explicitly needed.

---

### Mobile Bottom Navigation

File: `components/dashboard/mobile-nav.tsx`  
Last updated: 2026-06-10

| Property | Class |
|---|---|
| Shell | `fixed inset-x-0 bottom-0 z-50 flex items-center justify-around border-t border-border bg-card px-2 py-2 lg:hidden` |
| Nav item | `flex flex-col items-center gap-0.5 rounded-lg px-4 py-1.5` |
| Active item | `text-primary` |
| Inactive item | `text-muted-foreground` |
| Icon | `size-5` |
| Active icon stroke | `2.25` |
| Inactive icon stroke | `1.75` |
| Label | `text-[10px] font-medium` |

**Pattern notes:**  
Mobile navigation is fixed to the bottom and only appears below `lg`. It uses the card surface rather than the dark sidebar surface. Keep mobile nav compact and touch-friendly. Do not add dense secondary actions here.

---

### Quick Capture Card

File: `components/dashboard/quick-capture-card.tsx`  
Last updated: 2026-06-11

| Property | Class |
|---|---|
| Shell | `rounded-card border border-border bg-card shadow-paper ring-1 ring-transparent transition-shadow focus-within:ring-primary/20` |
| Main padding | `p-4 pb-2` |
| Label | `font-display mb-2 block text-base font-semibold text-foreground` |
| Help text | `mt-1 text-xs text-muted-foreground` |
| Footer | `flex items-center justify-between gap-3 border-t border-border px-4 py-3` |
| Action icon row | `flex items-center gap-0.5` |
| Icon button | `flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground` |
| Icon | `size-[18px]` with `strokeWidth={1.75}` |
| Capture button | `h-9 rounded-lg px-5 text-sm font-semibold` |

**Pattern notes:**  
The quick capture card is the most important UI pattern in ClassTrace. Keep it fast, calm, and uncluttered. The prompt should be direct teacher language: “What happened?” The composer should remain visually prominent and should not become a long form. The footer uses a top border and keeps secondary icon actions visually quiet. V1 should block saving until exactly one resolved roster student is selected.

---

### Evidence Capture Card

File: `components/dashboard/evidence-capture-card.tsx`  
Last updated: 2026-06-11

| Property | Class |
|---|---|
| Shell | `rounded-card border border-border bg-card shadow-paper` |
| Inner spacing | `space-y-3 p-4` |
| Metadata row | `flex flex-wrap items-center gap-2` |
| Timestamp text | `text-xs text-muted-foreground` |
| Action row | `ml-auto flex flex-wrap items-center gap-1` |
| Interpretation panel | `rounded-lg border border-border/60 bg-muted/30 px-3 py-3` |
| Interpretation eyebrow | `mb-2.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground` |
| Chip group | `flex flex-wrap gap-1.5` |
| Follow-up list | `mt-3 space-y-1 border-t border-border/50 pt-2.5` |
| Follow-up item | `text-xs leading-relaxed text-muted-foreground` |
| Full-width mobile action | `w-full sm:w-auto` |

**Pattern notes:**  
Evidence cards use the standard card surface and a quiet interpretation panel inside the card. The “ClassTrace read this as” section is visually secondary and should not feel like final truth. Validation and review actions should be clear but not louder than the evidence content.

---

### Evidence Chips

File: `components/dashboard/evidence-capture-card.tsx`  
Last updated: 2026-06-11

| Variant | Class |
|---|---|
| Base chip | `inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize` |
| Default chip | `border-border bg-card text-foreground` |
| Student chip | `border-border bg-secondary text-foreground` |
| Tag chip | `border-border bg-muted/60 text-link` |
| Evidence chip | `border-primary/25 bg-primary/10 text-primary` |
| Unresolved chip | `border-accent/50 bg-accent/25 text-foreground` |
| Student avatar inside chip | `mr-1.5 inline-flex size-4 items-center justify-center rounded-full text-[9px] font-bold text-white` |
| Resolved student link hover | `transition-opacity hover:opacity-80` |

**Pattern notes:**  
Chips are compact, rounded, and low-contrast. Student chips currently use sky styling, unresolved states use amber, evidence type uses primary, and tags use muted/link styling. Avoid bright rainbow tagging. Chips organize evidence; they are not decorative stickers.

---

### Review Status Badges

File: `components/dashboard/evidence-capture-card.tsx`  
Last updated: 2026-06-11

| State | Class |
|---|---|
| Needs review | `rounded-full border border-accent/50 bg-accent/30 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-foreground` |
| Validated | `rounded-full border border-validated/60 bg-validated px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-validated-foreground` |

**Pattern notes:**  
Status badges are small, uppercase, and secondary. They should help the teacher scan review state without making the card feel like an enterprise workflow ticket.

---

### Unresolved Mention Warning

File: `components/dashboard/evidence-capture-card.tsx`  
Last updated: 2026-06-10

| Property | Class |
|---|---|
| Warning shell | `mt-3 rounded-md border border-amber-200/60 bg-amber-50/50 px-3 py-2.5 dark:border-amber-900/40 dark:bg-amber-950/20` |
| Warning text | `text-xs leading-relaxed text-amber-900 dark:text-amber-100` |
| Warning emphasis | `font-medium` |
| Link/action row | `mt-2 flex flex-wrap items-center gap-3` |
| Warning link/action | `text-xs font-medium text-amber-900 underline-offset-2 hover:underline dark:text-amber-100` |

**Pattern notes:**  
Warnings should be helpful and specific. They should explain what the teacher can do next. In V1, unresolved mentions should block permanent save rather than becoming durable evidence.

---

### Inline Edit Area

File: `components/dashboard/evidence-capture-card.tsx`  
Last updated: 2026-06-10

| Property | Class |
|---|---|
| Edit container | `space-y-2` |
| Textarea | `min-h-[120px] text-[15px] leading-relaxed` |
| Button row | `flex flex-wrap gap-2` |
| Primary save | Existing `Button` with `size="sm"` |
| Cancel | Existing `Button` with `variant="outline"` and `size="sm"` |
| Delete action | Existing `Button` with `variant="ghost"`, `size="xs"`, `className="text-destructive hover:text-destructive"` |

**Pattern notes:**  
Inline editing should stay compact and local to the card. Do not open heavy modals for small evidence edits unless the unit explicitly calls for that. Destructive actions must be visibly destructive and must use clear confirmation copy.

---

### Standard Card Surface

File: shared pattern across dashboard components  
Last updated: 2026-06-10

| Property | Class |
|---|---|
| Shell | `rounded-card border border-border bg-card shadow-paper` |
| Inner spacing | `p-4` or `space-y-3 p-4` |
| Secondary panel | `rounded-lg border border-border/60 bg-muted/30 px-3 py-3` |
| Divider | `border-t border-border` or `border-t border-border/50` |
| Metadata text | `text-xs text-muted-foreground` |
| Section eyebrow | `text-[10px] font-semibold uppercase tracking-wider text-muted-foreground` |

**Pattern notes:**  
Most ClassTrace app surfaces should use quiet white cards with subtle borders and small shadows. Avoid heavy shadows, dense dashboards, and overly decorated containers.

---

### Primary Action Button

File: `components/ui/button` usage across app  
Last updated: 2026-06-10

| Property | Class |
|---|---|
| Common capture/action size | `h-9 rounded-lg px-5 text-sm font-semibold shadow-sm` |
| Small action | Existing `Button` with `size="sm"` |
| Extra-small text action | Existing `Button` with `size="xs"` |
| Outline action | Existing `Button` with `variant="outline"` |
| Ghost action | Existing `Button` with `variant="ghost"` |
| Destructive text override | `text-destructive hover:text-destructive` |

**Pattern notes:**  
Use the existing Button component before creating new button styles. Primary actions should be clear but not huge. Ghost buttons are appropriate for secondary card actions like edit/delete. Permanent delete should use destructive styling and strong warning copy.

---

### App Typography Pattern

File: shared pattern from `app/globals.css` and current components  
Last updated: 2026-06-10

| Usage | Class |
|---|---|
| Main font | `font-sans` using Plus Jakarta Sans |
| Page/card title | `text-base font-semibold text-foreground` or `text-lg font-semibold` |
| Body note text | `text-[15px] leading-relaxed` |
| Helper text | `text-xs text-muted-foreground` |
| Metadata | `text-xs text-muted-foreground` |
| Eyebrow labels | `text-[10px] font-semibold uppercase tracking-wider text-muted-foreground` |
| Sidebar brand | `text-[15px] font-semibold tracking-tight text-sidebar-foreground` |
| Mobile nav label | `text-[10px] font-medium` |

**Pattern notes:**  
ClassTrace should feel readable and practical. Use small labels and metadata, but keep evidence content readable. Avoid oversized dashboard typography inside the authenticated app.

---

### Landing Header

File: `components/landing/landing-header.tsx`  
Last updated: 2026-06-11

| Property | Class |
|---|---|
| Shell | `sticky top-0 z-40 border-b border-border/60 bg-background/90 backdrop-blur` |
| Inner row | `mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-6 lg:px-8` |
| Logo mark | `flex size-9 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground` |
| Wordmark | `text-[15px] font-semibold tracking-tight text-foreground` |
| Header text link | `rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground` |
| Header button | `Button` default with `h-9 rounded-lg px-4 text-sm font-semibold shadow-sm` |

**Pattern notes:**  
The public header reuses the sidebar logo mark (`bg-sidebar-primary`) for brand continuity but is otherwise a light surface. Sign-in is a quiet text link; sign-up is the only filled button. Sticky with translucent background and blur so the page scrolls underneath calmly.

---

### Landing Hero ("teacher's desk" direction)

File: `components/landing/landing-hero.tsx`  
Last updated: 2026-06-11

| Property | Class |
|---|---|
| Ruled-paper texture | `pointer-events-none absolute inset-0 opacity-40 [background-image:repeating-linear-gradient(to_bottom,transparent,transparent_35px,var(--border)_35px,var(--border)_36px)]` with `aria-hidden` |
| Atmosphere blob | `pointer-events-none absolute ... rounded-full bg-accent/70 blur-3xl` with `aria-hidden` |
| Eyebrow pill | `inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-semibold text-muted-foreground shadow-sm` |
| Headline | `text-5xl font-semibold leading-[1.02] tracking-tighter text-foreground sm:text-6xl lg:text-7xl` |
| Headline accent word | `font-hand relative font-medium text-primary` with highlighter sweep behind: `absolute inset-x-[-4px] bottom-[0.08em] top-[0.18em] -rotate-1 rounded-sm bg-primary/15` |
| Subhead | `text-base leading-relaxed text-muted-foreground lg:text-lg` |
| Primary CTA | `Button` default with `h-11 rounded-lg px-7 text-[15px] font-semibold shadow-sm` |
| Handwritten aside | `font-hand text-lg text-muted-foreground` |
| Rotated note card | Standard card shell + `-rotate-2` / `rotate-1` with `transition-transform duration-500 hover:rotate-0` and `shadow-md` |
| Tape strip | `absolute -top-3 left-1/2 h-6 w-24 -translate-x-1/2 rotate-2 rounded-sm border border-border/50 bg-accent/80` with `aria-hidden` |
| Raw note text | `font-hand text-2xl leading-snug text-foreground` |
| Handwritten connector | `font-hand text-xl text-muted-foreground` ("you review it ↓") with `aria-hidden` |
| Entrance motion | `animate-in fade-in slide-in-from-bottom-6 [animation-delay:150ms] [animation-fill-mode:backwards]` staggered per card |

**Pattern notes:**  
Public landing uses an editorial "teacher's desk" direction: ruled-paper texture from the `--border` token, rotated paper-note cards with tape strips that straighten on hover, and Caveat handwriting doing real annotation work (margin notes, connectors, step asides). The structured card reuses the exact Evidence Chips and Validated badge classes from the app. All motion is CSS-only via `tw-animate-css` and respects the staggered page-load pattern; decorative elements carry `aria-hidden`. This expressive treatment is for the public landing page only — never inside the authenticated app.

---

### Landing Section

File: `components/landing/landing-how-it-works.tsx`, `landing-audience.tsx`, `landing-closing-cta.tsx`  
Last updated: 2026-06-11

| Property | Class |
|---|---|
| Section padding | `mx-auto max-w-6xl px-4 py-20 md:px-6 lg:px-8 lg:py-28` |
| Eyebrow | `text-[11px] font-semibold uppercase tracking-wider text-muted-foreground` |
| Section title | `text-3xl font-semibold tracking-tight text-foreground lg:text-4xl` with optional `font-hand font-medium text-primary` accent phrase |
| Big step numeral | `font-hand text-6xl font-semibold leading-none text-primary/25` |
| Dashed connector | `h-px flex-1 border-t border-dashed border-border` with `aria-hidden` |
| Step annotation | `font-hand text-lg text-primary` |
| Audience strip | `border-y border-border/60 bg-card/50` row with `font-hand text-primary/60` `✱` separators |
| Closing headline | `text-4xl font-semibold tracking-tighter text-foreground lg:text-5xl` preceded by `font-hand text-2xl text-primary` lead-in |

**Pattern notes:**  
How-it-works steps use oversized Caveat numerals at low opacity with dashed-rule connectors (lesson-plan feel) instead of icon-tile cards. Each step ends with a short handwritten aside in primary. The audience strip is a single quiet band with handwritten asterisk separators, not a pill grid.

---

### Landing Dark Band

File: `components/landing/landing-not-dashboard.tsx`  
Last updated: 2026-06-11

| Property | Class |
|---|---|
| Section shell | `bg-sidebar text-sidebar-foreground` |
| Eyebrow | `text-[11px] font-semibold uppercase tracking-wider text-sidebar-foreground/60` |
| Headline de-emphasis | `text-sidebar-foreground/50` inside the heading |
| Struck list item | `text-sidebar-foreground/50 line-through decoration-sidebar-primary/70 decoration-2` with `font-hand text-sidebar-primary` `✗` marker |
| Handwritten payoff | `font-hand text-3xl leading-snug text-sidebar-foreground` |
| Inner panel | `rounded-2xl border border-sidebar-border bg-sidebar-accent/60 p-6 lg:p-8` |
| Panel body | `text-[15px] leading-relaxed text-sidebar-foreground/80` |
| Panel footnote | `border-t border-sidebar-border pt-4 text-xs text-sidebar-foreground/60` |

**Pattern notes:**  
One dramatic dark band per landing page, using sidebar tokens as the brand-dark surface (echoes the app shell). Carries the "what ClassTrace is not" message with struck-through items and a handwritten payoff line, plus the teacher-control panel. Sidebar tokens on a non-nav surface are a landing-page-only exception — documented here intentionally; do not repeat inside the authenticated app.

---

### Landing Footer

File: `components/landing/landing-footer.tsx`  
Last updated: 2026-06-11

| Property | Class |
|---|---|
| Shell | `border-t border-border/60` |
| Inner row | `mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 md:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8` |
| Small logo mark | `flex size-7 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground` |
| Footer link | `text-xs font-medium text-muted-foreground transition-colors hover:text-foreground` |
| Dev/utility link | `text-xs text-muted-foreground/60 transition-colors hover:text-muted-foreground` |
| Copyright | `text-xs text-muted-foreground/60` |

**Pattern notes:**  
The footer is intentionally quiet. The "Open app workspace" dev link uses the most muted treatment so it never competes with sign-up/sign-in. Remove or repoint that link when Clerk auth lands in unit 04.

---

## Layout Patterns

### Authenticated App Shell

Current pattern:

| Area | Pattern |
|---|---|
| Desktop nav | Dark sidebar, hidden below `lg` |
| Mobile nav | Fixed bottom nav, visible below `lg` |
| Main content | Light workspace background with card-based content |
| Primary route | Evidence feed |
| Secondary routes | Roster, students, settings |

**Pattern notes:**  
Keep the app shell consistent. Do not replace the authenticated app with a full-screen wizard. Guided onboarding should appear inside the normal app structure.

---

### Evidence Feed

Current pattern:

| Area | Pattern |
|---|---|
| Top area | Quick capture composer |
| Main content | Chronological evidence cards |
| Card style | `rounded-xl border border-border bg-card shadow-sm` |
| Review section | Muted inner panel |
| Actions | Small buttons or full-width mobile action |
| Empty/guided state | Should point to roster setup or first capture |

**Pattern notes:**  
The feed is the center of the app. It is global, but not general-purpose. Do not add classwide note behavior or teacher journaling patterns.

---

### Roster and Student Views

Current/future pattern:

| Area | Pattern |
|---|---|
| Roster setup | Guided cards, manual entry, import preview |
| Roster list | Clear rows/cards with editable names/handles/groups |
| Student profile | Header plus evidence timeline |
| Timeline | Evidence cards adapted for a single student |
| Export | Individual student action only |

**Pattern notes:**  
Roster and student screens should support capture and evidence review. They should not turn into SIS-style data management or district analytics.

---

## Registry Update Rules

After building or changing a UI component:

1. Add or update its entry here.
2. Include the file path.
3. Include the date.
4. List exact classes for the important visual properties.
5. Add short pattern notes.
6. If a new pattern affects global design rules, update `context/ui-context.md` too.
7. If the change affects current progress, update `context/progress-tracker.md`.

Do not let this registry drift from the actual UI.

---

## Open UI Registry Gaps

These patterns should be added or refined when they are built or audited:

- Guided roster setup card
- Manual student entry form
- Roster import preview table
- Student profile header
- Student timeline evidence card
- Individual student export button/panel
- Archive confirmation dialog
- Permanent delete confirmation dialog
- Clerk sign-in/sign-up screens
- Settings page
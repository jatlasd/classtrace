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
Last updated: 2026-06-11 (full-mockup rebuild)

| Property | Class |
|---|---|
| Shell | `sticky top-0 z-40 border-b border-border/70 bg-background/95 backdrop-blur` |
| Inner row | `mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-6 lg:px-8` |
| Logo mark | `NotebookPen` line icon, `size-7 text-navy`, `strokeWidth={2}` — no filled block |
| Wordmark | `font-display text-xl font-semibold tracking-tight text-foreground` |
| Header text link | `hidden ... text-sm font-medium text-foreground/80 hover:text-foreground sm:block` |
| Header button | `Button variant="navy"` with `h-9 rounded-md px-4 text-sm font-semibold` |

**Pattern notes:**  
Per the `classtrace-full-mockup.png` rebuild, the public logo is a line-art `NotebookPen` icon in navy (no filled tile) and the header CTA is the navy variant labeled "Capture your first note". Sign-in is hidden below `sm` to avoid mobile overflow; it remains available in the footer and closing CTA.

---

### Landing Hero ("teacher's desk" direction)

File: `components/landing/landing-hero.tsx`  
Last updated: 2026-06-11 (full-mockup rebuild)

| Property | Class |
|---|---|
| Ruled-paper texture | `pointer-events-none absolute inset-0 opacity-40 ruled-lines` with `aria-hidden` |
| Curved section bottom | Hero `section` uses `pb-8`; a bottom background shape uses `absolute inset-x-[-8%] bottom-[-76px] h-36 rounded-[0_0_50%_50%/0_0_100%_100%] bg-secondary/60` to create the slight curve into the flow band |
| Headline | `font-display text-4xl font-semibold leading-[1.12] tracking-tight sm:text-5xl lg:text-[3.4rem]` |
| Subhead | `text-[15px] leading-relaxed text-muted-foreground` |
| Primary CTA | `Button` default with `h-11 rounded-md px-7 text-[15px] font-semibold` |
| Secondary CTA | Underlined text link: `border-b border-link pb-0.5 text-sm font-medium text-link hover:text-foreground` ("See how one moment becomes evidence →") |
| Handwritten margin note | `font-hand ... rotate-[-4deg] text-xl text-primary` absolute beside the CTA with `aria-hidden` ("for teachers who have to remember everything ↘") |
| Raw note card | `-rotate-1 rounded-sm bg-accent/60 shadow-floating hover:rotate-0` with tape strip and inner ruled-line overlay; all text in `font-hand text-xl/2xl leading-[2rem]` |
| Handwritten connector | `font-hand text-xl text-foreground` ("you review it ↓") with dashed leader line |
| Evidence card | `rotate-1 rounded-card border border-border bg-card p-5 pl-7 shadow-floating hover:rotate-0` with red pin dot (`bg-primary/70`) |
| Evidence card rows | `dl` with `divide-y divide-border/70`, labels/values in `font-mono text-[13px]` ("Student:", "Category:", "Status:", "Evidence:") |
| Validated pill | `rounded-full border border-validated-foreground/20 bg-validated px-2.5 py-0.5 font-mono text-xs text-validated-foreground` |
| Card footer | `border-t border-border/70 pt-3 font-mono text-xs text-muted-foreground` + small `Check` icon |
| Entrance motion | `animate-in fade-in slide-in-from-bottom-6 [animation-delay:...] [animation-fill-mode:backwards]` staggered per card |

**Pattern notes:**  
Rebuilt to match `classtrace_asset_kit/classtrace-full-mockup.png`. The hero secondary action is an underlined text link, not a button. The reviewed-evidence card uses labeled monospace rows (form-like) rather than app chips, per the mockup. The raw note is a ruled yellow sticky with handwritten date line and note text. Expressive treatment remains landing-page-only.

---

### Landing Section

File: `components/landing/landing-how-it-works.tsx`, `landing-timeline.tsx`, `landing-audience.tsx`, `landing-closing-cta.tsx`  
Last updated: 2026-06-11 (full-mockup rebuild)

| Property | Class |
|---|---|
| Flow band shell | `border-y border-border/70 bg-secondary/60` with centered `font-display text-2xl/3xl` heading |
| Step card | `flex h-full flex-col rounded-card border border-border bg-card p-5 shadow-paper` |
| Circled step numeral | `font-hand flex size-9 items-center justify-center rounded-full border-2 text-xl` colored per step (`border-primary text-primary`, validated, link) |
| Step arrow connector | `font-hand absolute -right-9 top-24 text-xl text-muted-foreground` rendering `-->` (desktop only, `aria-hidden`) |
| Step preview | Mini mock at card bottom: sticky note (`bg-accent/70 -rotate-2 shadow-paper`), composer mock with icon row + navy `Save`, checkbox review rows + `Validated ✓` pill, mini timeline with squiggle lines |
| Timeline paper card | `-rotate-1 rounded-[0.7rem] border border-border bg-card pl-[4.5rem] shadow-floating hover:rotate-0 lg:min-h-[272px]` with tape strip, red margin rule (`left-12 w-px bg-destructive/45`), ruled-line overlay, entries in `font-hand text-[1.35rem] leading-[1.55rem]`, handwritten dates, and larger colored dots |
| Timeline headline | `font-display text-4xl/5xl` with `hand-underline-blue` on "the receipts" and `hand-underline-rust` on "the easiest ones to lose" |
| Audience heading | Centered `font-display text-2xl/3xl` |
| Audience labels | `font-hand rounded-sm px-5 py-2 text-lg shadow-paper bg-audience-*` with small centered `tape-tab` and alternating ±1° rotation |
| Closing CTA layout | Three-column paper strip: left handwritten `font-hand text-[1.65rem] text-link` note + oversized arrow, centered headline with `hand-underline-rust` on "need it later", centered rust CTA button, `font-hand text-7xl text-primary` star, and visible right-edge punched holes (`size-4 rounded-full border border-border/90 bg-card shadow-inner`) over `ruled-lines` |

**Pattern notes:**  
Rebuilt to match the full mockup: the flow is a muted centered band with circled hand-drawn numbers and `-->` arrows between cards; previews sit at the bottom of each card. The timeline card is notebook paper with a red margin line. The audience section is centered taped labels, and the closing CTA uses handwritten asides on both flanks.

---

### Landing Dark Band

File: `components/landing/landing-not-dashboard.tsx`  
Last updated: 2026-06-11 (full-mockup rebuild)

| Property | Class |
|---|---|
| Section shell | `bg-sidebar text-sidebar-foreground` with centered `max-w-4xl` column |
| Headline | `font-display text-3xl/4xl font-semibold tracking-tight` |
| Crossed-out tape strip | `bg-audience-tan px-5 py-2.5 shadow-paper` with alternating ±1° rotation; X drawn via two thin diagonal `linear-gradient` overlays in `var(--destructive)` at `opacity-60`, `aria-hidden`; label in `font-hand text-lg text-foreground` |
| Gold payoff line | `font-display text-2xl/3xl font-semibold text-sidebar-primary` ("It's your private documentation memory.") |
| Body | `max-w-2xl text-[15px] leading-relaxed text-sidebar-foreground/80` centered |
| Handwritten closer | `font-hand text-xl/2xl text-sidebar-primary` with `underline decoration-sidebar-primary/70 underline-offset-4` on "One teacher, one workspace." |

**Pattern notes:**  
Rebuilt as a fully centered chalkboard band per the mockup: heading, a row of four tan tape strips with thin rust X cross-outs ("Not a gradebook" etc.), gold serif payoff, centered body paragraph, and a handwritten gold closing line. Sidebar tokens on a non-nav surface remain a landing-page-only exception.

---

### Landing Footer

File: `components/landing/landing-footer.tsx`  
Last updated: 2026-06-12 (Clerk auth foundation)

| Property | Class |
|---|---|
| Shell | `border-t border-border/70` |
| Inner row | `mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6 md:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8` |
| Logo | `NotebookPen` line icon `size-6 text-navy` + `font-display text-lg font-semibold` wordmark |
| Sign in link | `text-sm font-medium text-foreground/80 hover:text-foreground` |
| Secondary auth link | `text-sm text-muted-foreground hover:text-foreground` ("Create account →") |

**Pattern notes:**  
Matches the mockup footer structure: logo left, auth links right. The old direct workspace dev link was removed when Clerk auth landed because `/app/*` is protected. Footer links should point to public auth routes, not protected app routes.

---

### Clerk Auth Screens

File: `app/sign-in/[[...sign-in]]/page.tsx`, `app/sign-up/[[...sign-up]]/page.tsx`  
Last updated: 2026-06-12

| Property | Class |
|---|---|
| Page shell | `flex min-h-screen items-center justify-center bg-background px-4 py-8` |
| Auth component | Clerk prebuilt `SignIn` / `SignUp` |
| Background | `bg-background` |
| Border | Provided by Clerk prebuilt component |
| Radius | Provided by Clerk prebuilt component |
| Shadow | Provided by Clerk prebuilt component |
| Spacing | `px-4 py-8` around centered auth component |

**Pattern notes:**  
Auth screens intentionally use Clerk prebuilt components inside a minimal ClassTrace page shell. Do not add organizations, role selectors, admin setup, district language, or custom account-management UI in V1 auth routes.

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

### Guided Roster Setup Cards

File: `app/app/roster/page.tsx`  
Last updated: 2026-06-15

| Property | Class |
|---|---|
| Page shell | `mx-auto max-w-3xl px-4 py-8 sm:px-6` |
| Eyebrow | `text-xs font-semibold uppercase tracking-wider text-muted-foreground` |
| Page title | `font-display text-2xl font-semibold tracking-tight text-foreground` |
| Helper copy | `text-sm leading-relaxed text-muted-foreground` |
| Card grid | `grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(220px,0.65fr)]` |
| Setup card | `rounded-card border border-border bg-card p-4 shadow-paper` |
| Card title | `font-display text-lg font-semibold text-foreground` |
| Card helper | `text-xs leading-relaxed text-muted-foreground` |
| Empty roster card | `rounded-card border border-border bg-card p-6 text-sm leading-relaxed text-muted-foreground shadow-paper` |
| Transition action | Existing `Button` with `variant="outline"` and `size="sm"` |

**Pattern notes:**  
Guided roster setup lives inside the authenticated app shell, not a full-screen wizard. As of Unit 07, this page reads active roster students from the database and uses a transition card labeled "Manual entry connects next" until Unit 08 wires the teacher-facing create form. The import card remains secondary/non-saving until import is built later. Copy should explain that roster setup comes before evidence capture and avoid district, SIS, or admin language.

---

### Database Roster List

File: `app/app/roster/page.tsx`  
Last updated: 2026-06-15

| Property | Class |
|---|---|
| List shell | `space-y-3` |
| Student row | `rounded-card border border-border bg-card p-4 shadow-paper` |
| Student content row | `flex min-w-0 items-center gap-4` |
| Avatar | `flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold text-foreground` |
| Student name | `font-medium text-foreground` |
| Handle text | `text-sm text-muted-foreground` |
| Class/group text | `mt-0.5 text-xs text-muted-foreground` |

**Pattern notes:**  
The Unit 07 roster list is read-only and database-backed. Rows are intentionally non-navigational until student timelines are database-backed because the current student profile route still reads the old local POC roster. It uses muted token avatars instead of the old POC color palette so the roster view stays quiet and token-based. Edit, delete, archive, and final manual-entry controls remain deferred to later units.

---

### Feed Roster Required State

File: `components/dashboard/evidence-feed.tsx`  
Last updated: 2026-06-15

| Property | Class |
|---|---|
| Shell | `rounded-card border border-border bg-card p-4 shadow-paper` |
| Eyebrow | `text-[10px] font-semibold uppercase tracking-wider text-muted-foreground` |
| Title | `font-display text-lg font-semibold text-foreground` |
| Body | `text-sm leading-relaxed text-muted-foreground` |
| Primary action | Existing `Button` with `h-9 rounded-lg px-5 text-sm font-semibold` |

**Pattern notes:**  
When the local roster is empty, the feed shows this setup prompt in the composer position so teachers are guided toward one-student roster setup before capture. This is UI guidance only for Unit 06; full one-student capture enforcement belongs to a later unit.

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

- Manual student entry form
- Roster import preview table
- Student profile header
- Student timeline evidence card
- Individual student export button/panel
- Archive confirmation dialog
- Permanent delete confirmation dialog
- Settings page
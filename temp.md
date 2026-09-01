# ClassTrace palette migration — indigo & mint (2c / 3a)

Replaces the teal + burnt-orange palette. Reference render: `Accent Options.dc.html`, option 3a.

## Tokens

| Token | Value | Use |
|---|---|---|
| `--ground` | `#1A2444` | Dark hero / nav / footer background |
| `--ground-raised` | `#2E3A63` | Cards or bands sitting on `--ground` |
| `--ink` | `#141A2E` | Body text on light surfaces |
| `--ink-muted` | `#5C6480` | Secondary text, metadata, timestamps on light |
| `--on-ground` | `#EFF2F0` | Text on `--ground` |
| `--on-ground-muted` | `#C3CBDA` | Body copy on `--ground` |
| `--surface` | `#F7F9F8` | App card / panel background |
| `--surface-2` | `#EAEEEC` | Sidebar, inset fields, subtle fills |
| `--surface-3` | `#FCFDFC` | Inner cards inside `--surface` |
| `--line` | `rgba(26,36,68,.12)` | Borders on light surfaces |
| `--line-on-ground` | `rgba(239,242,240,.09)` | Borders on `--ground` |
| `--accent` | `#84D9C3` | Primary buttons, eyebrows, icon strokes, active marks |
| `--accent-ink` | `#10231F` | **Text/icons placed on `--accent`** |
| `--accent-deep` | `#146B5E` | Accent used AS text or icon on light surfaces (@mentions, #tags, links) |
| `--accent-soft` | `#D6E6E0` | Avatar fills, quiet accent washes on light |

Mint at oklch(.83 .09 172) is too light for white text. Two rules follow from that:

1. Anything with `--accent` as a **background** takes `--accent-ink`, never white.
2. Anything with accent as **text or a thin icon on a light surface** uses `--accent-deep`, not `--accent` (4.5:1+ on `--surface`).

`--accent` as text is fine on `--ground` (eyebrows, links in the dark hero).

## Old → new mapping

| Old | New |
|---|---|
| dark teal ground `#0C2A30` (and near variants) | `--ground` `#1A2444` |
| cream `#F2EFE9` / `#F4F1EA` | `--on-ground` `#EFF2F0` for text; `--surface` `#F7F9F8` for panels |
| burnt orange `#B4470F` — button/band fills | `--accent` `#84D9C3` + `--accent-ink` text |
| burnt orange as text (eyebrows on dark) | `--accent` `#84D9C3` |
| burnt orange as text on light (@mention, #tag, `01` step numbers) | `--accent-deep` `#146B5E` |
| full-bleed orange CTA band | `--accent` band with `--accent-ink` heading |
| white button text on orange | `--accent-ink` `#10231F` |

## Component specifics

- **Nav** — background `--ground`, links `--on-ground-muted`, "Sign in" `--on-ground`, "Invited sign-up" `--accent` bg / `--accent-ink` text, bottom border `--line-on-ground`.
- **Primary button** — `--accent` bg, `--accent-ink` text, radius unchanged. Hover: darken to `#6FCCB4`.
- **Secondary button on dark** — transparent, `1px solid rgba(239,242,240,.28)`, `--on-ground` text.
- **App shell** — `--surface` card, `--surface-2` sidebar, active nav item `--ground` bg with `--on-ground` text and `--accent` icon stroke.
- **Tag chips** — `1px solid --line`, text `--ink-muted`, no fill.
- **Avatars** — `--accent-soft` fill, `--accent-deep` initials.
- **Check / status icons** — `--accent` stroke on dark, `--accent-deep` stroke on light.
- **Focus ring** — `2px solid --accent-deep` with `2px` offset on light, `--accent` on dark.

## Contrast (WCAG AA)

- `--on-ground` on `--ground` — 13.6:1
- `--on-ground-muted` on `--ground` — 8.4:1
- `--accent-ink` on `--accent` — 11.9:1
- `--accent-deep` on `--surface` — 4.8:1
- `--ink-muted` on `--surface` — 5.6:1
- `--accent` on `--surface` — **1.6:1, fails.** Never use `--accent` for text or thin strokes on light surfaces; that is what `--accent-deep` is for.

## Migration order

1. Add the tokens; do not delete the old ones yet.
2. Swap ground + neutrals globally. The page should look correct in greyscale-plus-indigo before any accent lands.
3. Swap accent fills, flipping their text to `--accent-ink` in the same edit — a missed flip leaves white-on-mint.
4. Grep for the old hexes (`0C2A30`, `B4470F`, `F2EFE9`, `F4F1EA` and near variants) and for `text-white` / `color:#fff` inside anything now filled with `--accent`.
5. Delete the old tokens.

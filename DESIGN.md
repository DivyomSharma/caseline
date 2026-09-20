# Design

<!-- impeccable:design-schema 1 -->

## World

Civic/government institutional identity, directly referenced from
uidai.gov.in (UIDAI/Aadhaar, Government of India) — a brief-pinned
direction, not a concept-tournament pick. Reads as an official system of
record: institutional gravity over startup polish.

## Palette

Restrained strategy: neutral ink/lavender ground plus a tricolor accent
used sparingly (never as a fill, only as a 3px hairline signature).

- `--color-ink` `#17153a` — primary text, dark surfaces
- `--color-ink-soft` `#423f6b` — secondary text
- `--color-primary` `#241f52` — CTAs, active nav, brand mark
- `--color-primary-hover` `#171341`
- `--color-lavender` `#eeecf9` — soft panel/pill backgrounds
- `--color-lavender-border` `#ddd9f0` — card borders, dividers
- `--color-saffron` `#ff9933` / `--color-civic-green` `#138808` — tricolor
  hairline only (under sidebar brand mark, under top header); also used as
  chart accent hues
- `--background` `#f7f6fb` — page ground
- White cards throughout

No dark mode — commits to one light civic-institutional look, matching the
reference world.

## Type

- Display: **Lora** (serif, `--font-display`) — page titles, KPI numbers,
  wordmark. Matches UIDAI's serif headline treatment; avoids the Playfair/
  Fraunces default.
- Body/UI: **Geist Sans** (existing) — labels, nav, body copy, forms.

## Components

- **Pills, not rectangles**: nav items, buttons, badges, date chip, DB-slate
  toggle all use `rounded-full`.
- **Tricolor hairline**: `.tricolor-hairline` utility (saffron/white/green,
  3px) — signature institutional accent under the sidebar brand block and
  the top header. Used exactly twice per screen, never as decoration
  elsewhere.
- **Cards**: white, `rounded-2xl`, `border-[var(--color-lavender-border)]`,
  `shadow-sm`. No colored left-borders.
- Icons: lucide-react, single stroke weight, unchanged library.

## Surfaces covered in this pass

`src/app/layout.tsx`, `src/app/globals.css`, `src/components/layout/Sidebar.tsx`,
`src/components/layout/TopHeader.tsx`, `src/app/(dashboard)/layout-client.tsx`,
`src/app/(dashboard)/dashboard/dashboard-client.tsx`,
`src/app/(auth)/login/page.tsx`.

## Not yet covered

Individual CRUD pages (cases, criminals, FIRs, victims, officers, stations,
investigations, evidence, courts, laws, map, reports, analytics, settings)
still carry the old stone/amber Tailwind classes. They inherit the shell
(sidebar, header, page background, fonts) but their internal cards/badges/
buttons have not been retokenized. Apply the same `--color-*` tokens and
pill language there in a follow-up pass.

## Process note

This redesign ran as a brief-pinned direction (explicit UIDAI URL) — the
concept-seed roll and decision-page tournament in new-work.md §3 were
skipped since the world was named, not chosen. No image-generation
capability was available in this session, so the build was code-led
throughout, with no comp round. Finish review was a self-review (screenshot
+ detector) rather than a spawned finish-reviewer subagent, disclosed here
for the record.

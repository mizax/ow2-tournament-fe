# Frontend Impeccable Playbook

This playbook defines the quality bar for UI work in `ow2-tournament-fe`.
Use it as the acceptance gate before merge.

## 1. Design Intent (non-negotiable)

Every screen must answer:
- What is the primary action here?
- What should users notice first in 1 second?
- What visual motif ties this screen to the brand?

If these are unclear, design is not done.

## 2. Visual System Rules

### 2.1 Color
- Build from semantic tokens in `src/assets/styles/main.css` only.
- Prefer `oklch(...)` and `color-mix(...)`; do not introduce raw hex unless unavoidable.
- Keep one dominant hue and one warm accent; avoid rainbow accents.
- No pure black (`#000`) or pure white (`#fff`).
- For dark theme, tune dedicated dark tokens; do not rely on auto inversion.

### 2.2 Surface hierarchy
- Do not wrap everything in cards.
- Use at most 3 surface levels on one viewport:
  - level 0: page background
  - level 1: section plane
  - level 2: focused interactive surface
- If two adjacent sections have same importance, separate with spacing or divider, not extra containers.

### 2.3 Typography
- Keep Cyrillic-safe font stack and verify no fallback drift.
- Use fluid scale (`clamp`) for large headings.
- Avoid decorative text effects (no gradient text for headings/metrics).
- Uppercase labels are allowed only for short metadata (tabs, chips, overlines).

### 2.4 Tabs and nav
- Tabs are linear controls, not mini-cards.
- Active tab must be indicated by contrast + underline/border, not filled pills by default.
- Long tab sets must scroll on mobile with visible affordance.

### 2.5 Motion
- Motion communicates state changes; never decorative noise.
- Use `transform` + `opacity`; do not animate layout dimensions.
- Respect reduced motion.

## 3. Component Standards

### 3.1 Interactive states
Every interactive element must have:
- default
- hover
- active (or pressed/selected)
- focus-visible (keyboard)
- disabled (if applicable)

No missing focus-visible rings for custom controls.

### 3.2 Data tables
- Headers and cells must wrap safely for narrow widths.
- Keep numeric columns aligned (`tabular-nums` where useful).
- Truncation is acceptable only when full value is available via title/tooltip/context.

### 3.3 i18n
- No hardcoded UI copy in components.
- `aria-label`, helper labels, and metadata labels must use i18n keys too.
- Russian translation must be added in same change when introducing a new key.

## 4. Page-level Composition Rules

### 4.1 Home
- Hero must carry brand signature (tone + color motif), not generic box.
- Tournament lists should read as editorial sections, not repeated card wallpaper.

### 4.2 Tournament Details
- Header zone: tab rail + one supporting action (`Матчи`) aligned intentionally.
- On mobile, supporting action can stack, but must align with tab rhythm.
- Content sections should breathe: clear spacing between tab rail and content body.

### 4.3 Manager flows
- Dense operational screens should be quieter than marketing surfaces.
- Use color for status and priority, not as decoration.

## 5. Accessibility Gate

Before merge, verify:
- Keyboard traversal reaches all actionable controls.
- Focus is visible on custom elements.
- Contrast is acceptable in both light and dark themes.
- `aria-label` values are meaningful and localized.
- No information is color-only.

## 6. Responsive Gate

Check at least:
- 360px (small mobile)
- 768px (tablet)
- 1280px (desktop)

For each width:
- no horizontal bleed from core content
- no clipped labels in tabs/buttons
- primary action remains visible without hunting

## 7. Dark Theme Gate

Dark mode is complete only when:
- background/surface separation is clear without glow tricks
- accent still reads as same brand, not a different product
- muted text remains readable
- borders are visible but not noisy

## 8. Pre-merge Checklist

- [ ] Uses existing semantic tokens; no random local palette
- [ ] No card-over-card nesting
- [ ] Tabs/navigation are linear and intentional
- [ ] All interactive states present, including focus-visible
- [ ] i18n complete (including aria and RU keys)
- [ ] Mobile + tablet + desktop verified
- [ ] Light + dark verified
- [ ] Build passes (`npm run build-only`)

## 9. Project-specific references

- Theme tokens: `src/assets/styles/main.css`
- Shared visual utilities: `src/assets/styles/components.css`
- Tabs primitives: `src/components/ui/tabs/TabsList.vue`, `src/components/ui/tabs/TabsTrigger.vue`
- Example composition: `src/views/tournament/TournamentDetailsView.vue`, `src/views/HomeView.vue`


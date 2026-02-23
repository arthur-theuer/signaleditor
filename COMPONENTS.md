# Component Status

Tracking cleanup/modernization progress per component.

## Conventions

### CSS split: Tailwind vs scoped styles

- **Tailwind classes** → layout (flex, grow, order, basis, gap, padding, margin, min-width, position, z-index, display at breakpoints)
- **Scoped `<style>`** → appearance (colors, borders, border-radius, backgrounds, typography, cursors, transitions)
- Never mix: if a property is layout, it goes in Tailwind. If appearance, it stays scoped.
- Scoped styles must not set layout properties that Tailwind also controls — this causes specificity conflicts (scoped selectors have higher specificity than utility classes).

### Spacing and sizing

- Use `@theme` tokens: `gap-card`, `p-cell`, `mb-page`, `h-unit`, `h-row`, etc.
- No hardcoded pixel values — use `var(--spacing-*)` in scoped styles or Tailwind spacing utilities.
- Exception: `1px` for borders is fine.
- Computed sizes: use `calc()` with tokens, e.g. `calc(5 * var(--spacing-row))`.

### Colors

- Always use `var(--color-*)` tokens — they adapt to dark mode automatically.
- Tailwind color utilities (`bg-raised`, `text-muted`, `border-border`) work via `@theme inline`.

### Responsive

- Mobile-first: default styles are for smallest viewport, add `sm:`, `md:`, `lg:`, `xl:` for wider.
- Breakpoints use Tailwind defaults: sm=640, md=768, lg=1024, xl=1280, 2xl=1536.
- Prefer Tailwind responsive classes over `@media` in scoped styles.

### Fonts

- Use `var(--font-sans)` or `var(--font-mono)` — never hardcode font stacks.
- Font sizes: `var(--text-input)` (14px), `var(--text-preview)` (11px).
- Font weights: `var(--font-weight-normal/medium/semibold/bold)`.

### Repeated class strings

- If the same Tailwind class string appears 3+ times, extract to a `const` in the script block.

### Props

- Remove unused props (e.g. `onchange` was removed from Datenpanel when dirty tracking was dropped).
- Flat props are fine — don't group into objects unless the component is being refactored for other reasons.

### Svelte idioms

- Use `tick()` instead of `setTimeout(() => ..., 0)` for post-render focus/DOM access.
- Prefer `value` + `oninput` over `bind:value` when the input handler does more than just assign (e.g. `autoArrow`).
- Don't mix `bind:value` + `oninput` on the same input — it's redundant.

### Buttons and icons

- **Icon sizes**: two tiers — `size={16}` for in-content buttons, `size={20}` for toolbar buttons.
- **Stroke width**: all icons render at 1px absolute (`strokeWidth={1.5}` for size=16, `strokeWidth={1.2}` for size=20).
- **Hover stroke**: `.hl:hover svg` increases stroke-width to 2.25 (~1.5px absolute) globally.
- **IconBtn component**: use for standard icon buttons (icon-only or icon+label) with `color`, `active`, `wide` props. Handles sizing, borders, hl, and color variants.
- **Colored borders**: toggle/action buttons with semantic meaning (Km toggle, Schließen) use colored borders via IconBtn `color` prop. Neutral buttons use `card-border`.
- **Custom buttons**: Plusleiste, Zwischenaktionen, Importzeile, Toolbar have unique styling — use raw `<button>` with `.hl` class for hover stroke effect.

### Tooltips

- Use `<Hinweis text="..." />` from `ui/Hinweis.svelte` for button tooltips.
- Shown on hover via global `.hl:hover .hinweis { display: flex; }` rule.
- Consistent appearance: `bg-raised`, `card-border`, `text-preview` size, pill shape (`radius-container`).
- Parent must have `.hl` class (provides `position: relative` and hover trigger).
- Status labels (e.g. save state indicator) are separate — they use colored backgrounds intentionally.

### Body and page padding

- `body` has no horizontal padding.
- Each top-level content section adds its own `px-page`.
- Full-width elements (toolbar) naturally span the viewport without negative margin hacks.

## Progress

| Component | Tailwind layout | Scoped appearance | Responsive | Reviewed | Notes |
|---|---|---|---|---|---|
| Datenpanel | ✅ | ✅ | ✅ 3-tier | ✅ | Deduplicated, tokens, autoArrow |
| Codepanel | ✅ | ✅ | — | ✅ | Blob revoke fix, calc max-height |
| Toolbar | 🔧 | — | Partial | 🔍 In progress | Body padding refactor |
| Signalpanel | — | — | — | — | |
| Signalzeile | — | — | — | — | |
| Signalzelle | — | — | — | — | |
| Plusleiste | — | — | Container query | — | |
| Importzeile | — | — | — | — | |
| Kilometerzelle | — | — | — | — | |
| Knotenzeile | — | — | — | — | |
| Notizzeile | — | — | — | — | |
| Abzweigungszeile | — | — | — | — | |
| Meldungspanel | ✅ | ✅ | ✅ sm/md | ✅ | Tailwind layout, card-style close btn, collapsed muted branches, font-mono |
| Dateibrowser | — | — | — | — | |
| Zeilenaktionen | ✅ | ✅ | — | ✅ | Uses IconBtn |
| Zwischenaktionen | — | — | — | — | |
| ui/Symbolknopf | ✅ | ✅ | — | ✅ | Shared button component |
| ui/Hinweis | ✅ | ✅ | — | ✅ | Tooltip pill, shown on .hl:hover |
| debug/Breakpoints | ✅ | — | ✅ | ✅ | Debug-only, removable |

## Meldungspanel Audit

### Gradient option
The original `editor.html` had colored tinted backgrounds on meldung rows:
- Single-segment: 15% blend of signal color with white as background + colored border
- Multi-segment: vertical `linear-gradient` of tinted backgrounds + averaged border color

This was lost in the Svelte port. Restoring it requires `colorToLightBg` and `averageColors` utilities — tracked as a future enhancement.

### Completed fixes
1. ✅ Close button → standard card style (`card-border`, `color-bg-raised`) + `hl` + X icon
2. ✅ Meldung color classes moved from `:global()` in component to `app.css`
3. ✅ Collapsed 4 repetitive muted-row branches into single `{#if}` with inline label
4. ✅ Layout properties moved to Tailwind classes
5. ✅ Responsive width: 220px at sm, 280px at md+; margin-left uses `ml-cell` token
6. ✅ `font-family: monospace` → `var(--font-mono)`
7. ✅ Section-header stays in App.svelte (matches Pluszeile height for visual alignment)

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

### Tooltips

- Shared pattern: hidden by default, shown on hover, positioned below parent with `top: calc(100% + var(--spacing-card))`.
- Extract to a shared `.tooltip` class when used in multiple places within a component.

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
| Meldungspanel | — | — | — | — | |
| Dateibrowser | — | — | — | — | |
| Zeilenaktionen | — | — | — | — | |
| Zwischenaktionen | — | — | — | — | |
| BreakpointDebug | ✅ | — | ✅ | ✅ | Debug-only, removable |

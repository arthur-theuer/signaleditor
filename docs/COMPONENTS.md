# Component Status

Tracking component inventory and conventions.

## Conventions

### CSS approach

All styling uses scoped `<style>` blocks in components plus shared classes in `components.css`. No utility framework.

- **Scoped styles** for component-specific layout and appearance.
- **`components.css`** for shared patterns: `.btn`, `.hl-field`, `.dropdown`, `.row-cell`, `.section-header`, meldung color classes, and Lucide hover stroke rule.
- **`tokens.css`** for design tokens (`--spacing-*`, `--color-*`, `--text-*`, `--font-*`, `--radius-*`).
- **`reset.css`** for browser normalization.

### Spacing and sizing

- Use `var(--spacing-*)` tokens from `tokens.css`. No hardcoded pixel values.
- Exception: `1px` for borders.
- Computed sizes: `calc()` with tokens, e.g. `calc(1.5 * var(--spacing-unit))`.

### Colors

- Always use `var(--color-*)` tokens — they adapt to dark mode via `prefers-color-scheme`.

### Responsive

- **Container queries** (`@container`) for component-internal responsive behavior (how content adapts within its allocated space). Used in Signalzelle, Importzeile, Plusleiste.
- **Media queries** (`@media`) for app-level layout changes (what's visible at different viewport sizes). Used in Zeilenaktionen, Toolbar, Zwischenaktionen, App.svelte.
- Breakpoints: sm=640px, md=768px.

### Fonts

- `var(--font-sans)` or `var(--font-mono)` — never hardcode font stacks.
- Font sizes: `var(--text-title)` (24px), `var(--text-header)` (16px), `var(--text-input)` (14px), `var(--text-caption)` (12px).
- Font weights: `var(--font-weight-normal/medium/semibold/bold)`.

### Props

- Remove unused props.
- Flat props are fine — don't group into objects unless refactoring for other reasons.

### Svelte idioms

- Use `tick()` instead of `setTimeout(() => ..., 0)` for post-render focus/DOM access.
- Prefer `value` + `oninput` over `bind:value` when the input handler does more than just assign.
- Don't mix `bind:value` + `oninput` on the same input.

### Buttons and icons

- **Icon sizes**: `size={16}` everywhere, `strokeWidth={1.5}` (1px absolute at 16px/24 viewBox).
- **Hover stroke**: `button:hover:not(:disabled) svg` increases stroke-width to 3 (~2px absolute) globally in `components.css`.
- **`.btn`** class (in `components.css`): shared button base with border, radius, hover outline, focus-visible, disabled state. Used by Symbolknopf, Plusleiste, Toolbar.
- **`.hl-field`** class: focus ring via `outline` on `:focus-within`, lifts with `z-index: 1`. Used on input wrappers.
- **Symbolknopf**: reusable icon button component with `color`, `active`, `bordered` props.
- **Custom buttons**: Plusleiste, Zwischenaktionen, Importzeile, Toolbar have unique styling — use raw `<button>` with `.btn` class.

### Tooltips

- Native `title` attribute on buttons. The `Hinweis` component was removed.

### Body and page padding

- `body` has no horizontal padding.
- `.content-pad` in App.svelte adds `padding-left/right: var(--spacing-cell)` (mobile) or `var(--spacing-page)` (sm+).
- Full-width elements (toolbar) span the viewport without negative margin hacks.

## Component Inventory

### App shell

| Component | Role | Notes |
|---|---|---|
| App.svelte | State owner, file I/O, undo/redo, keyboard shortcuts, panel visibility | Uses `Editor` class from `useEditor.svelte.ts` |
| +layout.svelte | Root layout, global CSS imports, analytics | |
| +page.svelte | Renders App.svelte | |

### Main components

| Component | Role | Notes |
|---|---|---|
| Toolbar | Sticky header, icon buttons, PIN auth, toggles | |
| Datenpanel | Meta fields form (strecke/linie, von, via, nach, name) | 3-tier responsive |
| Signalpanel | Signal list grid container, drag-and-drop, keyboard nav | CSS grid + subgrid |
| Signalzeile | Signal row: renders 2-4 Signalzelle components | No own styles |
| Signalzelle | Signal cell: type-ahead input, abbreviation overlays, dropdown | Container queries for abbreviation |
| Signalname | Name + bahnhof sub-fields inside Signalzelle | |
| Notizzeile | Note row: single input, yellow background | |
| Knotenzeile | Knoten row: code cell + station search, teal | |
| Abzweigungszeile | Junction row: 5 separate cells (arrow, strecke, von/nach, richtung, arrow) | |
| Importzeile | Import row: file cell + info cell | Container queries for file name tiers |
| Kilometerzelle | Optional km cell | |
| Zeilenaktionen | Row actions: clear/delete, ellipsis menu below sm | |
| Zwischenaktionen | Insert zone between rows: line + CirclePlus trigger, expandable Plusleiste | |
| Plusleiste | Add bar: 5 row-type buttons with container query label tiers | |
| Codepanel | YAML preview/export panel | |
| Dateibrowser | Cloud file browser for loading/managing saved files | |

### UI primitives (`ui/`)

| Component | Role | Notes |
|---|---|---|
| Symbolknopf | Reusable icon button with color/active/bordered variants | Extends `.btn` |
| Stationsfeld | Station search with fuzzy matching and dropdown (mode: code or name) | Merged from Stationssuche + Stationsname |
| Meldungzelle | Single meldung cell in the grid's mel column | |
| Importinfo | Import stitch/count info bar | Container queries for 3 tiers |
| Dateibrowsereintrag | Single file entry in Dateibrowser | |
| Dateistatus | Save status indicator in Toolbar | |
| Passwortfeld | PIN input field | |

### Debug

| Component | Role | Notes |
|---|---|---|
| Breakpoints | Viewport width + breakpoint label overlay | Commented out in App.svelte |

## Meldung display

Meldungen were originally a separate side panel (`Meldungspanel.svelte`, now deleted). They are now rendered inline as a grid column (`mel`) inside each `.signal-row` via `Meldungzelle`.

The original `editor.html` had colored tinted backgrounds on meldung rows (single-segment: 15% blend of signal color with white; multi-segment: vertical gradient). This was not ported. Restoring it would require `colorToLightBg` and `averageColors` utilities.

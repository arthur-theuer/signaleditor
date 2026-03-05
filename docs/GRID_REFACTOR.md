# Grid Refactor Plan

Migrate the signal list from flex-based rows to CSS grid + subgrid.
Each step is independently shippable — verify before moving to the next.

## Current DOM structure

```
.signal-list-inner                       (no layout)
  Zwischenaktionen                       (div.insert-wrapper)
  .combined-row                          (display: flex)
    .signal-row                          (display: flex)
      .signal-id
      [Kilometerzelle → .km-cell]
      Signalzeile → 2–4 × Signalzelle (.row-cell)
        | Notizzeile → .row-cell.note-cell
        | Knotenzeile → .row-cell.knoten-code-cell + .row-cell.knoten-search-cell
        | Abzweigungszeile → 5 × .row-cell.abzweigung-cell
        | Importzeile → .row-cell.import-file-cell + Importinfo (.import-info-cell)
      Zeilenaktionen → .signal-actions
    [.meldung-col → Meldungzelle]
  ...
  [.drop-indicator]                      (absolute-positioned)
```

## Target DOM structure

```
.signal-list-inner                       (display: grid — master columns)
  Zwischenaktionen                       (grid-column: 1 / -1)
  .signal-row                            (subgrid, grid-column: 1 / -1)
    .signal-id                           → [id]
    [.km-cell]                           → [km]
    Signalzeile → Signalzelle cells      → [s1]..[s2b]
      | Notizzeile → .note-cell          → [s1 / act]
      | Knotenzeile → .knoten-group      → [s1 / act]  (internal flex)
      | Abzweigungszeile → .abzw-group   → [s1 / act]  (internal flex)
      | Importzeile → .import-group      → [s1 / act]  (internal flex)
    .signal-actions                      → [act]
    [.meldung-col]                       → [mel]
  ...
  [.drop-indicator]                      (grid-column: 1 / -1)
```

## Column layout

```
[id]  [km?]  [s1]  [s1b]  [s2]  [s2b]  [act]  [mel?]
auto  auto   1fr   1fr    1fr   1fr    auto   220px/280px
```

- `km` and `mel` columns toggled via CSS classes on `.signal-list-inner`
- 4 grid template variants: base, +km, +mel, +km+mel
- Non-signal rows span `s1 / act` via a wrapper div with internal flex
- Signal 1b/2b are conditional; when absent, signal_1/signal_2 each span 2 cols

## Step 1: Subgrid + meldung column

Remove `.combined-row`. Make `.signal-row` a direct child of `.signal-list-inner`.
Move `.meldung-col` inside `.signal-row` as the last child.

Template changes:
- Remove `<div class="combined-row">` wrapper
- Move `{#if meldungen}` block inside `.signal-row`, after `Zeilenaktionen`
- Add class toggles to `.signal-list-inner`: `has-km`, `has-mel`

CSS changes:
- `.signal-list-inner`: `display: grid`, define 4 column template variants
- `.signal-row`: `display: grid; grid-template-columns: subgrid; grid-column: 1 / -1`
- Remove horizontal padding from `.signal-row` (breaks subgrid alignment);
  add `padding: 0 var(--spacing-card)` to `.signal-list-inner` instead
- `.signal-id`: grid-column `id`
- `.meldung-col`: grid-column `mel`, add `border-left` separator
- `Zwischenaktionen`: `grid-column: 1 / -1`
- `.drop-indicator`: `grid-column: 1 / -1`
- Remove `.combined-row` CSS

App.svelte changes:
- `.meldungen-header`: replace `border-left: none` with `border-left: 1px solid`
- `.header-row`: remove gap
- Remove close button from meldungen header (toolbar toggle is sufficient)
- Remove unused `X` import

Non-signal row types need wrapper divs to occupy a single grid cell:
- Knotenzeile: wrap 2 cells in `.knoten-group` (flex)
- Abzweigungszeile: wrap 5 cells in `.abzw-group` (flex)
- Importzeile: wrap file-cell + Importinfo in `.import-group` (flex)
- Notizzeile: single cell, no wrapper needed

Signal cell placement via `data-field` attribute on Signalzelle:
- `signal_1`: `grid-column: s1 / span 2` (or `span 1` when 1b present)
- `signal_1b`: `grid-column: s1b`
- `signal_2`: `grid-column: s2 / span 2` (or `span 1` when 2b present)
- `signal_2b`: `grid-column: s2b`

**Files:** Signalpanel.svelte, App.svelte, Signalzelle.svelte,
Knotenzeile.svelte, Abzweigungszeile.svelte, Importzeile.svelte

**Test:** All row types render correctly. Columns align across rows.
Toggle km and meldungen. Drag-and-drop works. Zwischenaktionen expand.
Tab navigation works. Dropdowns position correctly.

## Step 2: Row borders

Remove individual `.row-cell` card borders. Add `border-bottom` on `.signal-row`.
Container `overflow: hidden` clips the last row's border at the rounded corner.

Elements losing `border: var(--card-border)`:
- `.row-cell` (components.css)
- `.signal-id` (Signalpanel.svelte)
- `.km-cell` (Kilometerzelle.svelte)
- `.import-info-cell` (Importinfo.svelte)

All keep `background` and `border-radius`.

Dropdown offset: change `left: -1px; right: -1px` → `left: 0; right: 0`
(no longer compensating for parent border).

Focus ring (`.hl-field:focus-within`): uses `outline`, unaffected by border removal.

`.meldung-inner` keeps its own border (separate visual context).

App.svelte: add `overflow: hidden` to `.signals-container`,
remove `.signals-list` padding.

**Files:** components.css, Signalpanel.svelte, Kilometerzelle.svelte,
Importinfo.svelte, App.svelte

**Test:** Rows have horizontal dividers. Cells have background/radius but no
card border. Focus ring and dropdowns still work. Last row clips cleanly.

## Step 3: Signal 1/2 divider

Add a visual separator between signal_1 group and signal_2 group.
Options: `border-left` on the s2 cell, or extra gap between s1b and s2 columns.

**Files:** Signalpanel.svelte (CSS)

**Test:** Signal 1 and signal 2 are visually grouped. Non-signal rows span
across the divider without showing it.

## Step 4: Split Signalzelle sub-fields

Signal input, Signalname (name + bahnhof), and alt-toggle become separate
grid cells. Column layout changes from `[s1][s1b][s2][s2b]` to
`[s1][n1][s2][n2]` where each signal+name pair shares a column when no alt,
or splits when alt is active.

This is the largest change — major rewrite of Signalzelle and Signalname.

**Files:** Signalzelle.svelte, Signalname.svelte, Signalzeile.svelte,
Signalpanel.svelte

## Step 5: Cleanup

Remove dead CSS (`.combined-row`, wrapper divs if consolidated, unused
`radius-inner` rules). Verify FOCUSABLE_SELECTOR, `getFirstFieldInRow`,
and keyboard navigation still work.

**Files:** Signalpanel.svelte, Signalzelle.svelte, Signalname.svelte,
components.css

## Risks

- **Subgrid + padding:** Horizontal padding on `.signal-row` shifts subgrid
  columns. Solution: padding on `.signal-list-inner`, not on rows.
- **Drag-and-drop:** Rows are still single elements (subgrid). Parent is now
  grid — test that drag events and drop indicator still work.
- **Container queries:** `.signals-container` uses `container-type: inline-size`.
  Grid doesn't conflict but verify.
- **Scroll anchoring:** `overflow-anchor: none` on `.signal-list-inner` — verify
  with grid.
- **Zwischenaktionen height:** Currently `height: var(--spacing-card)`. As a grid
  item spanning all columns, it should still collapse to its content height.

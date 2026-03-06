# Grid Refactor Plan

Migrate the signal list from flex-based rows to CSS grid + subgrid.
Each step is independently shippable — verify before moving to the next.

## DOM structure

```
.signals-container                       (App.svelte, overflow: hidden)
  .signal-list-inner                     (Signalpanel.svelte, display: grid)
    .header-row                          (subgrid row, grid-column: 1 / -1)
      .signale-header                    → [1 / g-mel] or [1 / -1]
      [.meldungen-header]               → [mel / -1]
    Zwischenaktionen                     (grid-column: 1 / -1)
    .signal-row                          (subgrid, grid-column: 1 / -1)
      .signal-id                         → [id]
      [.km-cell]                         → [km]
      Signalzeile → Signalzelle cells    → [s1]..[s2b]
        | Notizzeile → .note-cell        → [s1 / g-act]
        | Knotenzeile → .knoten-group    → [s1 / g-act]  (internal flex)
        | Abzweigungszeile → .abzw-group → [s1 / g-act]  (internal flex)
        | Importzeile → .import-group    → [s1 / g-act]  (internal flex)
      .signal-actions                    → [act]
      [.meldung-col]                     → [mel]
    ...
    [.drop-indicator]                    (grid-column: 1 / -1, absolute)
  Plusleiste                             (sibling of .signal-list-inner)
```

Header content is passed from App.svelte to Signalpanel via a Svelte snippet.

## Column layout

No `column-gap` — spacing is handled by explicit gap columns.
`--spacing-card` (4px) is the gap width. Double gaps at divider boundaries.

### Base (no km, no mel)

```
[pad-l] [id] [g-id] [s1] [g-s1] [s1b] [g-s1b] [g-s2] [s2] [g-s2b] [s2b] [g-act] [act] [pad-r]
 4px    unit  4px    1fr   4px    1fr    4px     4px    1fr   4px     1fr    4px    auto   4px
```

### +km

```
[pad-l] [id] [g-id] [km]     [g-km] [s1] ... [act] [pad-r]
 4px    unit  4px   km-width  4px    ...             4px
```

### +mel

```
... [act] [g-act-end] [g-mel] [mel]      [pad-r]
    auto   4px         4px    mel-width    4px
```

### Column naming

- `pad-l`, `pad-r` — edge padding (same width as gaps)
- `g-{col}` — gap after column `{col}` (e.g., `g-id`, `g-s1`, `g-km`)
- Double gaps at divider boundaries: `g-s1b` + `g-s2` between signal groups,
  `g-act-end` + `g-mel` before meldung column

### Cell placement

| Cell | Placement |
|------|-----------|
| `.signal-id` | `id` |
| `.km-cell` | `km` |
| signal_1 (no alt) | `s1 / g-s1b` |
| signal_1 (with alt) | `s1` |
| signal_1b | `s1b` |
| signal_2 (no alt) | `s2 / g-act` |
| signal_2 (with alt) | `s2` |
| signal_2b | `s2b` |
| Non-signal rows | `s1 / g-act` |
| `.signal-actions` | `act` |
| `.meldung-col` | `mel` |
| Header signale (no mel) | `1 / -1` |
| Header signale (with mel) | `1 / g-mel` (padding-right: --spacing-card) |
| Header meldungen | `g-mel / -1` |

## Completed steps

### Step 1: Subgrid + meldung column

Removed `.combined-row`. Made `.signal-row` a subgrid child of `.signal-list-inner`.
Moved `.meldung-col` inside `.signal-row`. Added `has-km`/`has-mel` class toggles.
Non-signal rows wrapped in group divs (`.knoten-group`, `.abzw-group`, `.import-group`).

### Step 2: Row borders

Removed individual cell borders. Added `border-bottom` on `.signal-row`.
`overflow: hidden` on `.signals-container` clips at rounded corners.

### Grid architecture

- Replaced `column-gap` with explicit gap columns
- `pad-l`/`pad-r` are `var(--spacing-card)`
- `--km-width` and `--mel-width` CSS variables reduce template duplication
- `padding-block` on `.signal-row` for vertical spacing
- Header row moved into grid via Svelte snippet (App.svelte → Signalpanel)
- Double gap columns at divider boundaries for future vertical separators

## Remaining steps

### Step 3: Signal 1/2 divider

Add visual separators at the double-gap boundaries (`g-s1b`/`g-s2` and
`g-act-end`/`g-mel`). Approach TBD — pseudo-elements on 0-width columns
caused layout issues in subgrid context. Consider dedicated divider `<div>`
elements in the template instead.

**Files:** Signalpanel.svelte

### Step 4: Split Signalzelle sub-fields

Signal input, Signalname (name + bahnhof), and alt-toggle become separate
grid cells. This is the largest change — major rewrite of Signalzelle and
Signalname.

**Files:** Signalzelle.svelte, Signalname.svelte, Signalzeile.svelte,
Signalpanel.svelte

### Step 5: Cleanup

Remove dead CSS. Verify FOCUSABLE_SELECTOR, `getFirstFieldInRow`,
and keyboard navigation still work.

**Files:** Signalpanel.svelte, Signalzelle.svelte, Signalname.svelte,
components.css

## Risks

- **Vertical border continuity:** `padding-block` on `.signal-row` creates gaps
  in vertical borders. Divider approach TBD — 0-width columns with pseudo-elements
  caused subgrid layout issues.
- **Drag-and-drop:** Rows are subgrid elements. Tested and working.
- **Container queries:** `.signals-container` uses `container-type: inline-size`.
  No conflict with grid.
- **Scroll anchoring:** `overflow-anchor: none` on `.signal-list-inner`.

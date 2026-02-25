# Refactor Plan

Analysis of accumulated code debt and opportunities for harmonization. Not a rewrite — targeted refactors to reduce inconsistency, duplication, and fragility.

---

## 1. Focus Highlight System (`hl` / `hl-wrap`)

**Current state:** The blue focus ring is implemented via two global CSS classes in `app.css`:
- `.hl` — direct focus (`::after` on `:focus`)
- `.hl-wrap` — delegated focus (`::after` on `:focus-within`)

Both use `position: relative` + `::after` with `box-shadow` and `opacity` transition.

**Problems:**
- Every interactive element must manually add `hl` or `hl-wrap` — easy to forget (Notizzeile lost its focus ring during refactor).
- The `::after` pseudo-element requires `position: relative` on the parent, which conflicts with components that need `position: relative` for other purposes (dropdowns, overlays).
- `hl-wrap` is applied inconsistently: sometimes on the `.signal-cell` itself (Notizzeile), sometimes on an inner wrapper div (Knotenzeile, Signalzelle), sometimes on a `<span>` (Datenpanel).
- The `calc(var(--radius-card) - 1px)` inner radius is repeated 11 times across components — should be a token.

**Proposal:**
- Create a `--radius-inner` token: `calc(var(--radius-card) - 1px)`.
- Consider making `.signal-cell` always act as `hl-wrap` (it already has `position: relative`). Sub-fields within a cell that need independent focus rings can opt out.
- Document the rule: "every focusable field needs `hl` or `hl-wrap`" in AGENTS.md.

---

## 2. Stationssuche / Stationsname Duplication

**Current state:** Two nearly identical components with the same structure:
- Same state variables: `query`, `open`, `activeIndex`, `searchInput`
- Same functions: `select`, `handleFocus`, `handleBlur`, `handleInput`, `focusNextTabbable`, `handleKeydown`
- Same keyboard navigation (ArrowUp/Down/Enter/Escape/Tab)
- Same dropdown rendering pattern
- Same styling structure

**Differences:**
- Stationssuche binds `code` (station code), Stationsname binds `name` (station name)
- Stationssuche shows a resolved name below the input, Stationsname shows a resolved code
- Stationssuche has a search icon

**Proposal:**
- Extract a shared `SearchDropdown` component that handles: state, keyboard nav, dropdown rendering, focus management.
- Stationssuche and Stationsname become thin wrappers that provide: the search function, display format, and resolved value display.
- Alternatively, merge into a single component with a `mode` prop (`'code' | 'name'`).

---

## 3. Dropdown / Popover Pattern

**Current state:** Four components implement dropdown/popover behavior independently:
- `Signalzelle` — signal type dropdown (`dropdownOpen`, `dropdownIndex`)
- `Stationssuche` — station search dropdown (`open`, `activeIndex`)
- `Stationsname` — name search dropdown (`open`, `activeIndex`)
- `Zeilenaktionen` — ellipsis action menu (`menuOpen`)

Each reimplements: open/close state, click-outside handling, keyboard navigation, positioning.

**Problems:**
- Click-outside is only implemented in Zeilenaktionen (via `document.addEventListener`). Stationssuche/Stationsname use `handleBlur` with `setTimeout` which is fragile. Signalzelle uses a cooldown timer.
- No shared pattern for "close on Escape", "close on click outside", "close on blur".

**Proposal:**
- Extract a `useClickOutside` action or utility that components can reuse.
- Standardize the open/close lifecycle: Escape closes, click-outside closes, blur closes (with configurable delay for relatedTarget checks).

---

## 4. Input Attribute Inconsistency

**Current state:** Text inputs across the app have inconsistent attributes:

| Component | `autocomplete` | `autocorrect` | `spellcheck` |
|-----------|---------------|---------------|-------------|
| Notizzeile | `none` | `off` | `false` |
| Abzweigungszeile | `none` | `off` | `false` |
| Signalzelle (signal) | `none` | — | — |
| Signalzelle (name) | `none` | — | — |
| Datenpanel | `none` | — | — |
| Kilometerzelle | `none` | — | — |
| Stationssuche | `none` | — | — |
| Stationsname | `none` | — | — |

**Problems:**
- `autocorrect="off"` and `spellcheck="false"` are only on some inputs. All inputs in this app contain technical data (signal names, station codes, km values) — none should have autocorrect or spellcheck.
- Some inputs are missing `autocomplete` entirely (Passwortfeld, some Datenpanel inputs on separate lines).

**Proposal:**
- Add `autocomplete="none" autocorrect="off" spellcheck="false"` to every text input in the app. Consider a global CSS rule `input { -webkit-text-size-adjust: none; }` for mobile.
- Alternatively, create a Svelte action `use:noAutofill` that sets all three attributes.

---

## 5. CSS Architecture: Tailwind vs Scoped Styles

**Current state:** The codebase mixes three CSS approaches:
1. **Tailwind utility classes** in templates: `flex`, `gap-card`, `shrink-0`, `items-center`, `min-w-0`, `relative`, `h-full`
2. **Scoped `<style>` blocks** in components
3. **Global styles in `app.css`**: `.signal-cell`, `.section-header`, `.hl`, `.hl-wrap`

**Problems:**
- No clear rule for when to use Tailwind vs scoped styles. Some components use Tailwind for layout (`flex gap-card shrink-0`) and scoped styles for theming. Others use scoped styles for everything.
- The `signal-input-wrapper` in Signalzelle has `class="signal-input-wrapper flex-1 flex min-w-0 h-full hl-wrap"` — 5 Tailwind utilities mixed with 2 semantic classes. This makes it hard to override in scoped styles (specificity conflicts with `!important` as seen in Zeilenaktionen).
- Global `.signal-cell` in `app.css` defines `flex: 1; min-width: 0; height: var(--spacing-unit)` — but individual components override these (Importzeile adds `container-type`, Kilometerzelle overrides width). The base class does too much.

**Proposal:**
- Establish a clear split: Tailwind for one-off layout positioning (`flex`, `relative`, `shrink-0`). Scoped styles for component-specific theming and sizing. Global styles only for truly shared patterns (`.signal-cell` base, `.hl` system).
- Move the Tailwind utilities from `signal-input-wrapper` into scoped styles to avoid specificity conflicts.
- Consider whether `.signal-cell` should be a minimal base (just `position: relative; min-width: 0`) with sizing applied per-component.

---

## 6. Signalzelle Complexity

**Current state:** Signalzelle.svelte is 430 lines — the largest component. It handles:
- Signal type selection (type-ahead keyboard input with fuzzy matching)
- Dropdown rendering and navigation
- Name field (with Stationsname or plain input depending on signal type)
- Bahnhof field (deferred reveal, auto-populate from name)
- Three abbreviation layers (full text, `SIGNAL_ABBREV`, `SIGNAL_SHORT`)
- Alt-signal toggle button
- Container queries for responsive abbreviation
- Focus management across 3 sub-fields

**Problems:**
- The signal type-ahead logic (buffer, cooldown, fuzzy matching, dropdown) is ~100 lines that could be extracted.
- Three overlapping text display mechanisms: the input value, `.signal-abbrev` (container query), `.signal-short` (bahnhof state). The parent-child CSS selectors (`.has-bahnhof .signal-abbrev`) work but are fragile with Svelte scoping.
- `bahnhofRevealed` state adds a third visibility dimension on top of `needsBahnhof` and `disabled`.

**Proposal:**
- Extract the type-ahead logic into a reusable `useTypeAhead` function or a `TypeAheadInput` component.
- Consolidate the three text layers. Instead of three overlapping elements with CSS visibility toggling, render only the appropriate text based on state (Svelte `{#if}` / `{:else}`).
- Consider splitting the name+bahnhof section into a sub-component (`SignalNameGroup`) to reduce Signalzelle's template complexity.

---

## 7. Row Component Structure

**Current state:** Five row types, each a separate component:
- `Signalzeile` — renders 2-4 `Signalzelle` components
- `Notizzeile` — single input in a `.signal-cell`
- `Knotenzeile` — Stationssuche in a `.signal-cell`
- `Abzweigungszeile` — 5 sub-fields in a `.signal-cell`
- `Importzeile` — file picker cell + info cell, complex container queries

**Problems:**
- Each row component independently applies `.signal-cell` and manages its own inner layout. The relationship between `.signal-cell` (global) and the component's inner structure is implicit.
- Notizzeile is 35 lines. Knotenzeile is 30 lines. They're almost identical in structure (a `.signal-cell` with a single interactive child). The only differences are the background color and the child component.
- Abzweigungszeile has its own sub-field system (`.abzweigung-field` with border separators) that's similar to Signalzelle's multi-section layout but implemented differently.

**Proposal:**
- Consider a `CellWrapper` component that provides the `.signal-cell` container with background color as a prop. Notizzeile and Knotenzeile become one-liners.
- Harmonize the sub-field separator pattern between Abzweigungszeile and Signalzelle. Both use `border-left: 1px solid var(--color-border)` on adjacent fields — this could be a shared `.cell-divider` class or a `+ .field` sibling selector in `.signal-cell`.

---

## 8. Overflow Management

**Current state:** `overflow: hidden` is applied inconsistently:
- `.signal-cell` in `app.css`: no overflow set
- `.import-info-cell`: has `overflow: hidden` (added as hotfix)
- `.import-info`: has `overflow: hidden`
- Individual spans (`.import-stitch`, `.import-count`): have `overflow: hidden`
- Stationssuche/Stationsname dropdown: needs to overflow the cell (no clipping)

**Problems:**
- Text overflow was a recurring bug (import stitch protruding, note field not stretching). Each was fixed individually rather than systematically.
- Adding `overflow: hidden` to `.signal-cell` globally would break dropdowns that need to overflow.

**Proposal:**
- Add `overflow: hidden` to `.signal-cell` as the default. Components with dropdowns (Signalzelle, Stationssuche, Stationsname) override with `overflow: visible` on the cell or use a portal pattern for dropdowns.
- Alternatively, render all dropdowns via a portal/teleport to `<body>` so they're never clipped by parent overflow.

---

## 9. Responsive Breakpoint Strategy

**Current state:** Three responsive mechanisms coexist:
1. **CSS container queries** (`@container`) — used in Signalzelle (abbreviation at 170px), Importzeile (file cell tiers, info cell tiers)
2. **CSS media queries** (`@media`) — used in Zeilenaktionen (ellipsis below sm/640px), Toolbar (hide title)
3. **Svelte reactive state** — `bahnhofRevealed` in Signalzelle

**Problems:**
- Container queries and media queries serve different purposes but are mixed without clear guidelines.
- The Zeilenaktionen `!important` hack exists because `:global()` selectors can't override Svelte-scoped styles. This is a symptom of the Tailwind/scoped style mixing (issue #5).

**Proposal:**
- Establish a rule: container queries for component-internal responsive behavior (how content adapts within its allocated space). Media queries for app-level layout changes (what's visible at different viewport sizes).
- Document breakpoints: xs (<640), sm (640), md (768), lg (1024).

---

## 10. Constants Organization

**Current state:** `constants.ts` (104 lines) contains:
- Signal enums (`SIGNAL_ENUM`, `HAUPTSIGNAL_ENUM`, `VORSIGNAL_ENUM`)
- Abbreviation maps (`SIGNAL_ABBREV`, `SIGNAL_SHORT`)
- Feature flags (`REQUIRES_NAME`, `REQUIRES_STATION_SEARCH`, `REQUIRES_BAHNHOF`)
- Signal relationships (`VORSIGNAL_TO_HAUPTSIGNAL`, `SIGNALTYPEN`)
- Display data (`MELDUNGEN`, `MELDUNG_FARBEN`, `BAHNHOF_FARBEN`)
- Station data re-export (`STATIONEN`)

**Problems:**
- Everything signal-related is in one file. Adding a new signal type requires touching multiple arrays/maps.
- `SIGNAL_ABBREV` and `SIGNAL_SHORT` are separate maps but serve the same purpose at different sizes. Could be a single map with multiple tiers.

**Proposal:**
- Consider a signal registry pattern: each signal type is defined once with all its properties (full name, abbreviation, short code, requires name, requires bahnhof, hauptsignal mapping, etc.).
- Split into `signals-config.ts` (signal definitions) and `display-config.ts` (colors, messages).

---

## Priority Order

| # | Area | Impact | Effort | Priority |
|---|------|--------|--------|----------|
| 4 | Input attributes | Low risk, high consistency | Small | Do first |
| 1 | Focus highlight system | Prevents future bugs | Small | Do first |
| 2 | Stationssuche/Stationsname | Removes ~150 lines of duplication | Medium | High |
| 8 | Overflow management | Prevents recurring bugs | Small | High |
| 7 | Row component structure | Simplifies 2 components | Small | Medium |
| 3 | Dropdown pattern | Reduces fragile code | Medium | Medium |
| 5 | CSS architecture | Prevents specificity issues | Medium | Medium |
| 6 | Signalzelle complexity | Improves maintainability | Large | Medium |
| 9 | Responsive strategy | Documentation + guidelines | Small | Low |
| 10 | Constants organization | Nice-to-have | Medium | Low |

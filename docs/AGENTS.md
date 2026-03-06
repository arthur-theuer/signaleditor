# Agent Guidelines

## Project Overview

Signaleditor is a SvelteKit web app for editing Swiss railway signal data files. It manages two data types — **Video** (camera-based signal recordings) and **Strecke** (route-based signal data) — each containing ordered lists of entries: signals, nodes (Knoten), notes (Notiz), junctions (Abzweigung), and imports.

Data is stored as YAML files. The app supports local file import/export and cloud storage via Vercel Blob (PIN-authenticated).

## Tech Stack

- **Svelte 5** with `$state`, `$props`, `$effect` (runes mode)
- **SvelteKit** with `@sveltejs/adapter-vercel`
- **Vercel Blob** for cloud file storage
- **TypeScript** throughout
- **Vite** for build tooling

## Architecture

### App Shell

- `src/App.svelte` — main app component, renders toolbar/panels/grid, keyboard shortcuts, auto-save
- `src/lib/useEditor.svelte.ts` — `Editor` class: state management, file I/O, undo/redo, dirty tracking
- `src/routes/+layout.svelte` — root layout, global CSS import, Vercel analytics/speed insights
- `src/routes/+page.svelte` — renders `App.svelte`
- `src/app.html` — HTML shell with favicon links

### CSS Files

- `src/tokens.css` — design tokens (spacing, colors, fonts, radii) with dark mode overrides
- `src/reset.css` — browser normalization
- `src/components.css` — shared component classes (`.btn`, `.hl-field`, `.dropdown`, `.row-cell`, `.section-header`, meldung colors, icon hover)
- `src/app.css` — imports the above three files

### Components (`src/components/`)

- `Toolbar.svelte` — sticky header toolbar with icon buttons (undo/redo, upload, download, save, lock), text buttons (Neues Video, Neue Strecke, Dateien), toggle buttons (Signaldatei, Meldungen), save status indicator
- `Datenpanel.svelte` — meta fields form (streckennummer/linie, von, via, nach, name, video)
- `Signalpanel.svelte` — signal list CSS grid container with subgrid rows, drag-and-drop, keyboard navigation, row management
- `Signalzeile.svelte` — single signal row: renders 2-4 `Signalzelle` components, manages alt toggles and signal change side effects
- `Signalzelle.svelte` — signal cell with type-ahead input, abbreviation overlays (container query), dropdown, and deferred bahnhof reveal
- `Signalname.svelte` — name + bahnhof sub-fields inside Signalzelle
- `Notizzeile.svelte` — note row (single input, yellow background)
- `Knotenzeile.svelte` — knoten row (code cell + station search, teal)
- `Abzweigungszeile.svelte` — junction row (5 cells: arrow, strecke, von/nach, richtung, arrow; purple)
- `Importzeile.svelte` — import row (file cell + info cell, container queries for file name tiers)
- `Kilometerzelle.svelte` — optional km cell shown when Kilometer toggle is active
- `Zeilenaktionen.svelte` — row action buttons (clear, delete); collapses to ellipsis menu below sm breakpoint
- `Zwischenaktionen.svelte` — insert zone between rows (thin line + CirclePlus trigger, expandable Plusleiste)
- `Plusleiste.svelte` — add bar at bottom of signal list (5 row-type buttons with container query label tiers)
- `Codepanel.svelte` — YAML code preview/export panel
- `Dateibrowser.svelte` — cloud file browser for loading/managing saved files

### UI Primitives (`src/components/ui/`)

- `Symbolknopf.svelte` — reusable icon button with `color`, `active`, `bordered` props
- `Stationsfeld.svelte` — station search with fuzzy matching and dropdown (mode: `code` or `name`)
- `Meldungzelle.svelte` — single meldung cell rendered in the grid's `mel` column
- `Importinfo.svelte` — import stitch/count info bar with 3-tier container queries
- `Dateibrowsereintrag.svelte` — single file entry in Dateibrowser
- `Dateistatus.svelte` — save status indicator extracted from Toolbar
- `Passwortfeld.svelte` — PIN input field

### Libraries (`src/lib/`)

- `types.ts` — data types (Editordaten, Videodaten, Streckendaten, Eintrag variants, type guards)
- `signals.ts` — signal logic (autofill, row emptiness checks, signal type detection)
- `signals.config.ts` — signal registry (signal definitions with all properties)
- `constants.ts` — signal enums, abbreviation maps, station data re-export
- `yaml.ts` — re-exports from yaml-generate and yaml-parse
- `yaml-generate.ts` — YAML generation from editor data
- `yaml-parse.ts` — YAML parsing (including legacy format support)
- `reports.ts` — meldungen generation from signal data, HTML export
- `meldungen.ts` — meldung generation logic
- `sources.ts` — import resolution, cache, auto-stitch logic
- `stationen.ts` — Swiss station list (SBB Dienststellen dataset)
- `station-search.ts` — fuzzy search and highlighting for station lookup
- `api.ts` — HTTP client for auth and file API endpoints
- `auth.svelte.ts` — reactive auth state (`$state`-based loggedIn flag, login/logout)
- `history.svelte.ts` — undo/redo history with `$state`
- `useEditor.svelte.ts` — `Editor` class: centralized editor state and file operations
- `useTypeAhead.svelte.ts` — type-ahead keyboard input with fuzzy matching for signal selection
- `useDragDrop.svelte.ts` — drag-and-drop (mouse + touch) for row reordering
- `focus.ts` — focus utilities (`focusWithoutScroll`, `withStableScroll`)

### Server (`src/lib/server/` and `src/routes/api/`)

- `src/lib/server/auth.ts` — PIN verification against `EDITOR_PIN` env var
- `src/lib/server/files.ts` — Vercel Blob storage operations
- `src/routes/api/auth/+server.ts` — POST /api/auth (login)
- `src/routes/api/files/+server.ts` — GET (list files), POST (create file)
- `src/routes/api/files/[name]/+server.ts` — GET (read), PUT (update), DELETE (delete)

## Design System

### Layout Tokens

| Token | Value | Usage |
|---|---|---|
| `--spacing-unit` | 40px | Base size for buttons, inputs, row height |
| `--spacing-card` | 4px | Gap between cards/cells in a row |
| `--spacing-half-card` | 2px | Half of card gap |
| `--spacing-cell` | 12px | Inner cell padding |
| `--spacing-page` | 20px | Page-level horizontal/bottom padding |
| `--radius-card` | 8px | Border radius for individual cards/cells |
| `--radius-inner` | 7px | Inner radius (card - 1px) for nested elements |
| `--radius-container` | 12px | Border radius for outer containers/panels |

### Font Scale

| Token | Value | Usage |
|---|---|---|
| `--text-title` | 24px | App title |
| `--text-header` | 16px | Section headers |
| `--text-input` | 14px | Primary text (inputs, buttons, labels) |
| `--text-caption` | 12px | Dropdowns, hints |

### Color Hierarchy

| Token | Hex | Usage |
|---|---|---|
| `--color-text` | #424242 | Primary text, input values |
| `--color-text-secondary` | #616161 | Secondary info (e.g. station name from valid code) |
| `--color-text-muted` | #9e9e9e | Placeholders, example hints, empty-state text |

Rule: placeholder/example text uses `--color-text-muted`. When a value resolves to real data, switch to `--color-text-secondary`.

### Interaction System

Two shared classes in `components.css`:

**`.btn`** — button hover/focus/disabled states:
- `border: var(--card-border)`, `border-radius: var(--radius-card)`, `background: var(--color-bg-raised)`
- Hover: `outline: 2px solid currentColor; outline-offset: -2px`
- Focus-visible: `outline: 2px solid var(--color-focus)`
- Disabled: `color: var(--color-text-muted)`, no hover effect
- `.btn-flash`: momentary outline (undo/redo feedback)

**`.hl-field`** — input wrapper focus ring:
- `position: relative; cursor: pointer`
- `:focus-within`: `outline: 2px solid var(--color-focus); outline-offset: -2px; z-index: 1`
- Suppresses child `outline: none` on `input`, `select`, `button`

**`.dropdown`** — positioned below parent, flattens parent's bottom corners via `:has(> .dropdown)`.

### Icons

- Lucide icons at `size={16}`, `strokeWidth={1.5}` (via `ICON` constant in `constants.ts`)
- Global hover rule: `button:hover:not(:disabled) svg { stroke-width: 3 !important; }`

### General Rules

- No drop shadows anywhere
- All standalone buttons use `border-radius: var(--radius-card)` (via `.btn`)
- Component styles are scoped via Svelte `<style>` blocks; shared styles in `components.css`
- Toolbar background uses `--color-red-bg` when not logged in

## Signal List Grid

The signal list uses CSS grid with subgrid. See `GRID_REFACTOR.md` for the column layout, cell placement rules, and remaining steps.

Key points:
- Single `grid-template-columns` on `.signal-list-inner` with all named lines always present
- Optional `km` and `mel` columns collapse to `0px` via CSS custom properties
- Each `.signal-row` is a subgrid child (`grid-column: 1 / -1`)
- Non-signal rows (note, knoten, abzweigung, import) span `s1 / g-act` via group wrappers
- Signal cells use `:has()` selectors to adjust column span when alt signals are present

## Git Workflow

- Use `arthur.theuer@outlook.com` as the commit author email
- Always push to `origin main` immediately after a successful build
- The remote URL contains a PAT for authentication — no additional token setup needed
- Build command: `npm run build`

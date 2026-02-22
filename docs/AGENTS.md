# Agent Guidelines

## Project Overview

Signaleditor is a SvelteKit web app for editing Swiss railway signal data files. It manages two data types — **Video** (camera-based signal recordings) and **Strecke** (route-based signal data) — each containing ordered lists of entries: signals, nodes (Knoten), notes (Notiz), junctions (Abzweigung), and imports.

Data is stored as YAML files. The app supports local file import/export and cloud storage via Vercel Blob (PIN-authenticated).

## Tech Stack

- **Svelte 5** with `$state`, `$props`, `$effect` (runes mode)
- **SvelteKit** with `@sveltejs/adapter-vercel`
- **Vercel Blob** for cloud file storage
- **TypeScript** throughout
- **Vite 7** for build tooling

## Architecture

### App Shell

- `src/App.svelte` — main app component, state management, undo/redo, keyboard shortcuts, auto-save
- `src/routes/+layout.svelte` — root layout, global CSS import, Vercel analytics/speed insights, click-to-focus handler
- `src/routes/+page.svelte` — renders `App.svelte`
- `src/app.html` — HTML shell with favicon links
- `src/app.css` — global styles, CSS custom properties (design tokens), highlight overlay system

### Components (`src/components/`)

- `Toolbar.svelte` — sticky header toolbar with icon buttons (undo/redo, upload, download, save, lock), text buttons (Neues Video, Neue Strecke, Dateien), toggle buttons (Kilometer, Signaldatei, Meldungen), save status indicator
- `Metafelder.svelte` — meta fields form (streckennummer/linie, von, via, nach, name, video)
- `Signalpanel.svelte` — main signal list with drag-and-drop reordering, keyboard navigation, row management
- `Signalzeile.svelte` — single signal row (signal_1, signal_1b, signal_2, signal_2b, bahnhof)
- `Signalzelle.svelte` — individual signal cell with input and preview
- `Notizzeile.svelte` — note row
- `Knotenzeile.svelte` — node row
- `Abzweigungszeile.svelte` — junction row (strecke, richtung, seite buttons)
- `Importzeile.svelte` — import row (datei, von, bis)
- `Kilometerzelle.svelte` — optional km cell shown when Kilometer toggle is active
- `Zeilenaktionen.svelte` — row action buttons (clear, delete) on the right side of each row
- `Zwischenaktionen.svelte` — insert zone between rows (S N A K I buttons, shown on hover)
- `Plusleiste.svelte` — add bar at bottom of signal list (+ Signal, + Notiz, + Abzweigung, + Knoten, + Import)
- `Meldungspanel.svelte` — side panel showing generated signal messages with Schließen button
- `Codepanel.svelte` — YAML code preview/export panel
- `Dateibrowser.svelte` — cloud file browser for loading/managing saved files

### Libraries (`src/lib/`)

- `types.ts` — data types (Editordaten, Videodaten, Streckendaten, Eintrag variants, type guards)
- `yaml.ts` — YAML generation and parsing (including legacy format support)
- `api.ts` — HTTP client for auth and file API endpoints
- `auth.svelte.ts` — reactive auth state (`$state`-based loggedIn flag, login/logout)
- `history.svelte.ts` — undo/redo history with `$state`
- `signals.ts` — signal logic (autofill, row emptiness checks)
- `reports.ts` — Meldungen generation from signal data, HTML export
- `colors.ts` — color utilities (light backgrounds, color averaging)
- `sources.ts` — import auto-stitching logic
- `stationen.ts` — Swiss station list (SBB Dienststellen dataset)
- `constants.ts` — signal type constants and options

### Server (`src/lib/server/` and `src/routes/api/`)

- `src/lib/server/auth.ts` — PIN verification against `EDITOR_PIN` env var
- `src/routes/api/auth/+server.ts` — POST /api/auth (login)
- `src/routes/api/files/+server.ts` — GET (list files), POST (create file)
- `src/routes/api/files/[name]/+server.ts` — GET (read), PUT (update), DELETE (delete)

## Design System

### Layout Tokens

| Token | Value | Usage |
|---|---|---|
| `--unit` | 40px | Base size for buttons, inputs, single-height elements |
| `--row-height` | 80px (2 × unit) | Signal row height (input + preview stacked) |
| `--card-gap` | 4px | Gap between cards/cells in a row |
| `--half-gap` | 2px | Half of card-gap, used for vertical padding |
| `--card-radius` | 8px | Border radius for individual cards/cells |
| `--container-radius` | 12px (card-radius + card-gap) | Border radius for outer containers/panels |
| `--page-gap` | 20px | Page-level horizontal/bottom padding |

### Color Hierarchy

| Token | Hex | Usage |
|---|---|---|
| `--color-text` | #333 | Primary text, input values |
| `--color-text-secondary` | #666 | Resolved/real secondary info (e.g. station name from valid code) |
| `--color-text-muted` | #999 | Placeholders, example hints, empty-state text |

Rule: placeholder/example text uses `--color-text-muted`. When a value resolves to real data, switch to `--color-text-secondary`.

### Highlight Overlay System (`.hl` / `.hl-wrap`)

The blue focus/hover overlay used on all interactive elements. Defined globally in `app.css`.

**How it works:**
- `.hl` or `.hl-wrap` class on the element sets `position: relative`
- `::after` pseudo-element with `inset: -1px` extends 1px outside the element
- `border: 2px solid var(--color-focus)` + `background: var(--color-focus-bg)`
- `border-radius: inherit` — inherits from the element itself
- `opacity: 0` by default, `1` on hover (`.hl`) or focus-within (`.hl-wrap`)

**Contract — every `.hl` / `.hl-wrap` element MUST have:**
1. Its own `border` (typically `var(--card-border)`) — the `::after` at `inset: -1px` is sized to cover a 1px border
2. Its own `border-radius` — `inherit` only works if the element defines one
3. No ancestor with `overflow: hidden` that would clip the `::after` at `inset: -1px`, OR the element must be inset enough from the clipping ancestor that the -1px extension is not clipped

**Variants:**
- `.hl` — shows on hover
- `.hl-wrap` — shows on focus-within (for input wrappers), suppresses child `outline`
- `.hl.hl-primary` — darker border (`--color-focus-ring`), used for primary actions
- `.hl.hl-flash` — always visible (forced `opacity: 1`)
- To show only on active/selected (not hover): override `.element:hover::after { opacity: 0 }` and `.element.active::after { opacity: 1 }`

### Icons

- Toolbar: 20px Lucide-style inline SVGs, `viewBox="0 0 24 24"`, `stroke-width="2"`, `stroke-linecap="round"`, `stroke-linejoin="round"`, 44x44px hit target
- Row actions (Zeilenaktionen): `stroke-width="2.5"`
- Delete buttons: 16px icon, `stroke-width="2.5"`, `color: var(--color-red)`

### General Rules

- No drop shadows anywhere
- All standalone buttons use `border-radius: var(--container-radius)`
- Cards/cells inside containers use `border-radius: var(--card-radius)`
- Component styles are scoped via Svelte `<style>` blocks; global styles in `app.css`
- Toolbar background uses `--color-red-bg` when not logged in

## Git Workflow

- Use `arthur.theuer@outlook.com` as the commit author email
- Always push to `origin main` immediately after a successful build
- The remote URL contains a PAT for authentication — no additional token setup needed
- Build command: `npm run build`

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

## UI Conventions

- All toolbar icon buttons use 44x44px hit targets with 20px SVG icons inside
- Toolbar icons use Lucide-style inline SVGs with `viewBox="0 0 24 24"`, `stroke-width="2"`, `stroke-linecap="round"`, `stroke-linejoin="round"`
- Row action icons (Zeilenaktionen) use `stroke-width="2.5"`
- CSS uses custom properties defined in `:root` (e.g. `--color-focus`, `--color-red-bg`, `--card-radius`)
- All buttons use `border-radius: var(--container-radius)` (12px) matching panel outer radius
- No drop shadows anywhere in the project
- Component styles are scoped via Svelte `<style>` blocks; global styles live in `app.css`
- The highlight system (`.hl`, `.hl-wrap`) provides blue hover/focus overlays via `::after` pseudo-elements — used on all interactive elements
- Page background turns red (`--color-red-bg`) when user is not logged in

## Git Workflow

- Use `arthur.theuer@outlook.com` as the commit author email
- Always push to `origin main` immediately after a successful build
- The remote URL contains a PAT for authentication — no additional token setup needed
- Build command: `npm run build`

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

- `src/App.svelte` — main app component, state management, undo/redo, keyboard shortcuts
- `src/components/` — UI components (German naming: Signalzeile, Knotenzeile, Metafelder, etc.)
- `src/lib/` — shared logic: types, YAML parsing/generation, auth, API client, history, station data
- `src/routes/api/` — SvelteKit server endpoints for auth and Vercel Blob file operations
- `src/app.css` — global styles and CSS custom properties (design tokens)

## UI Conventions

- All toolbar icon buttons use 44x44px hit targets with SVG icons inside
- Icons use Lucide-style inline SVGs with `viewBox="0 0 24 24"`, `stroke-width="2.5"`, `stroke-linecap="round"`, `stroke-linejoin="round"`
- CSS uses custom properties defined in `:root` (e.g. `--color-focus`, `--color-red-bg`, `--card-radius`)
- Component styles are scoped via Svelte `<style>` blocks; global styles live in `app.css`
- The highlight system (`.hl`, `.hl-wrap`) provides hover/focus overlays via `::after` pseudo-elements

## Git Workflow

- Use `arthur.theuer@outlook.com` as the commit author email
- Always push to `origin main` immediately after a successful build
- The remote URL contains a PAT for authentication — no additional token setup needed
- Build command: `npm run build`

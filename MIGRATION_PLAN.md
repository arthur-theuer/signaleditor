# Signal Editor — Migration to Svelte 5

Migrate `editor.html` (single-file, ~2400 lines) to a Svelte 5 + TypeScript + Vite project.

## Goals

- Separate concerns into components and modules
- Reactive state management via Svelte 5 runes (`$state`, `$derived`, `$effect`)
- TypeScript for type safety on the data model and signal logic
- Retain single-file portable build via `vite-plugin-singlefile`
- Deployable to Vercel as static site

## Tech Stack

| Tool | Role |
|------|------|
| Svelte 5 | UI framework (compiles away, no runtime overhead) |
| TypeScript | Type safety |
| Vite | Dev server + bundler (official Svelte tooling) |
| vite-plugin-singlefile | Produces portable single HTML file |
| Vercel | Hosting (auto-deploys from git) |

## Naming Conventions

- **Repo / package**: `signaleditor`
- **Module files** (`src/lib/`): English names
- **Component files** (`src/components/`): German domain nouns + English structural words
- **TypeScript types**: German, matching YAML field names
- **CSS variables**: No prefix, keep existing names (`--row-height`, `--card-gap`, etc.)

## Project Structure

```
signaleditor/
├── index.html
├── package.json
├── vite.config.ts
├── svelte.config.js
├── tsconfig.json
├── src/
│   ├── main.ts                      # Mount App.svelte
│   ├── app.css                      # CSS variables, body, shared styles
│   ├── App.svelte                   # Top-level layout and state
│   │
│   ├── lib/
│   │   ├── types.ts                 # Eintrag union, Strecke, Editordaten, etc.
│   │   ├── constants.ts             # Enums, KNOTEN dict, MELDUNGEN, MELDUNG_FARBEN
│   │   ├── signals.ts               # Signal type detection, prediction, meldung generation
│   │   ├── yaml.ts                  # YAML parse/generate
│   │   ├── sources.ts               # Quelle resolution, cache, auto-stitch
│   │   ├── reports.ts               # Meldungen generation, HTML export
│   │   ├── colors.ts                # Color utilities
│   │   └── history.svelte.ts        # Undo/redo with $state
│   │
│   └── components/
│       ├── Toolbar.svelte            # File operations, undo/redo, toggles
│       ├── MetaFields.svelte         # Strecke metadata inputs
│       ├── SignalList.svelte         # Iterates signale, dispatches to row components
│       ├── InsertZone.svelte         # Hover-reveal insert buttons between rows
│       ├── SignalRow.svelte          # Full signal row with cells + actions
│       ├── SignalCell.svelte         # Single signal select + name + preview
│       ├── KmCell.svelte             # Km input with prev/next previews
│       ├── NoteRow.svelte            # Notiz text input
│       ├── KnotenRow.svelte          # Knoten code input + name preview
│       ├── QuelleRow.svelte          # File reference + resolved signal list
│       ├── AbzweigungRow.svelte      # Junction marker (arrow + strecke + direction)
│       ├── RowActions.svelte         # Delete + clear buttons
│       ├── AddBar.svelte             # Bottom row-type insert buttons
│       ├── YamlPanel.svelte          # YAML output textarea + copy/download
│       └── MeldungenPanel.svelte     # Rendered meldungen table
```

## TypeScript Types

Discriminated union matching YAML field names:

```typescript
type Abzweigung = {
    seite: 'links' | 'rechts';
    strecke: string;
    von_nach: 'von' | 'nach';
    richtung: string;
};

type Quelle = {
    datei: string;
    von?: string;
    bis?: string;
};

type Signaleintrag = {
    id: number;
    km?: string;
    signal_1: string;
    signal_1b?: string;
    signal_2?: string;
    signal_2b?: string;
    bahnhof?: string;
};

type Notizeintrag = {
    id: number;
    km?: string;
    notiz: string;
};

type Knoteneintrag = {
    id: number;
    km?: string;
    knoten: string;
};

type Abzweigungseintrag = {
    id: number;
    km?: string;
    abzweigung: Abzweigung;
};

type Quelleneintrag = {
    id: number;
    km?: string;
    quelle: Quelle;
};

type Eintrag = Signaleintrag | Notizeintrag | Knoteneintrag | Abzweigungseintrag | Quelleneintrag;

type Strecke = {
    id: string;
    name: string;
    linie: string;
    streckenvideos: string[];
};

type Editordaten = {
    strecke: Strecke;
    signale: Eintrag[];
};
```

## Migration Phases

Each phase produces a working application.

### Phase 1 — Scaffold and data layer

No UI yet. Establish the project and migrate pure logic.

1. Create Vite + Svelte 5 + TypeScript project
2. Define TypeScript types in `lib/types.ts`
3. Move constants to `lib/constants.ts`
4. Move YAML parsing/generation to `lib/yaml.ts`
5. Move signal logic to `lib/signals.ts`
6. Move color utilities to `lib/colors.ts`
7. Move quelle resolution to `lib/sources.ts`
8. Move meldungen generation to `lib/reports.ts`
9. Verify: imports compile, logic functions are callable

### Phase 2 — App shell and simple components

Minimal UI that loads and displays data.

1. Set up `app.css` with CSS custom properties from `:root`
2. Create `App.svelte` with `$state` for `Editordaten`, `dirty`, `showKm`, `showMeldungen`
3. Create `Toolbar.svelte` — file buttons, undo/redo, toggles
4. Create `MetaFields.svelte` — bind to `data.strecke` fields
5. Create `AddBar.svelte` — insert buttons at bottom
6. Create `YamlPanel.svelte` — `$derived` YAML output from data
7. Verify: load a YAML file, see it in the YAML panel, edit meta fields

### Phase 3 — Row components (one at a time)

Migrate row types from simplest to most complex.

1. `NoteRow.svelte` — single input, `bind:value`
2. `KnotenRow.svelte` — code input + `$derived` name preview
3. `AbzweigungRow.svelte` — arrow toggle, strecke/vonnach/richtung inputs
4. `KmCell.svelte` — km input with prev/next preview strips
5. `RowActions.svelte` — delete + clear buttons
6. `SignalCell.svelte` — signal select with enum cycling, name input, preview strips
7. `SignalRow.svelte` — composes SignalCell + KmCell + RowActions
8. `QuelleRow.svelte` — file input, async resolve with `{#await}`, expandable list
9. `SignalList.svelte` — `{#each data.signale}` dispatching to row components
10. `InsertZone.svelte` — hover-reveal buttons between rows
11. Verify: full editor works, all row types render and edit correctly

### Phase 3 — Interactions and state management

1. Undo/redo (`lib/history.svelte.ts`) with `$state` snapshots
2. Keyboard navigation (tab between fields, arrow key enum cycling)
3. Auto-stitch via `$effect` when quelle datei values change
4. Dirty flag via `$effect` watching data changes
5. `beforeunload` warning when dirty
6. Verify: undo/redo, keyboard nav, auto-stitch all work

### Phase 5 — Meldungen panel and export

1. `MeldungenPanel.svelte` — reactive meldungen list via `$derived`
2. HTML export — download meldungen as standalone HTML
3. YAML copy/download from YamlPanel
4. Verify: meldungen output correct, exports produce valid files

### Phase 6 — Build and deploy

1. Add `vite-plugin-singlefile` to `vite.config.ts`
2. Verify `npm run build` produces a working single `dist/index.html`
3. Push to git repository
4. Connect to Vercel (auto-detects Vite, deploys `dist/`)
5. Verify: deployed site works, portable HTML file works offline

## What Gets Eliminated

Code that exists only because of the manual DOM approach:

| Current code | Why it disappears |
|---|---|
| `buildRowElement()` (~200 lines) | Replaced by Svelte components |
| `attachRowEventListeners()` (~200 lines) | Replaced by `bind:` and `on:` in components |
| `renderRow()`, `renderSignals()` | Svelte re-renders reactively |
| `syncDataAndUI()`, `saveRowData()` | `bind:value` keeps data and UI in sync |
| `tmplKmCell()`, `tmplSignalCell()`, `tmplSignalActions()` | Replaced by component templates |
| `tmplMeldungRow()` | Replaced by MeldungenPanel component |
| Manual `addEventListener` calls (~60) | Inline event handlers in components |
| `document.getElementById` / `querySelector` calls | Component references |
| `innerHTML` string building | Svelte template syntax |

## Notes

- The `strecken/` directory with video source files stays as-is (static assets)
- `vite-plugin-singlefile` inlines all JS/CSS into one HTML file for portable distribution
- TypeScript is strict but incremental — start with `any` where needed, tighten later
- Each phase can be tested independently before moving to the next

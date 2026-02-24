# Signaleditor — Codebase Audit

Full audit of every source file. Covers architecture, patterns, consistency, bugs, and improvement opportunities.

---

## Architecture Overview

| Layer | Files | Role |
|-------|-------|------|
| **Entry** | `+page.svelte`, `+layout.svelte` | SvelteKit routing, global CSS import, `.hl-wrap` click delegation |
| **App shell** | `App.svelte` | State owner, file I/O, undo/redo, keyboard shortcuts, auto-save |
| **Toolbar** | `Toolbar.svelte` | Header bar with button groups, PIN auth, file indicator |
| **Data panels** | `Datenpanel.svelte`, `Codepanel.svelte`, `Meldungspanel.svelte`, `Dateibrowser.svelte` | Metadata editing, YAML preview, meldungen display, cloud file browser |
| **Signal list** | `Signalpanel.svelte` | Row list with drag-and-drop, tab navigation, insert/delete/clear |
| **Row types** | `Signalzeile`, `Notizzeile`, `Knotenzeile`, `Abzweigungszeile`, `Importzeile` | One component per entry type |
| **Cells** | `Signalzelle.svelte`, `Kilometerzelle.svelte` | Signal picker (type-ahead, arrow keys), km input |
| **Row actions** | `Zeilenaktionen.svelte`, `Zwischenaktionen.svelte`, `Plusleiste.svelte` | Delete/clear, insert-between, append buttons |
| **UI primitives** | `Symbolknopf.svelte`, `Hinweis.svelte` | Reusable button, hover tooltip |
| **Debug** | `Breakpoints.svelte` | Viewport width + breakpoint label overlay |
| **Lib: domain** | `types.ts`, `signals.ts`, `constants.ts`, `stationen.ts`, `reports.ts`, `yaml.ts`, `sources.ts` | Types, signal logic, YAML parse/generate, meldung generation, import resolution |
| **Lib: infra** | `api.ts`, `auth.svelte.ts`, `history.svelte.ts` | REST client, auth state, undo/redo history |
| **Server** | `server/auth.ts`, `server/files.ts`, `api/auth/+server.ts`, `api/files/+server.ts`, `api/files/[name]/+server.ts` | PIN verification, Vercel Blob storage CRUD |

---

## Findings

### 1. Bugs

#### 1.1 `Importzeile.svelte` — `$derived` wrapping functions instead of values

```ts
let firstKnoten = $derived(() => { ... });
let lastKnoten = $derived(() => { ... });
```

These use `$derived(() => ...)` which stores a **function**, not its return value. They are then called as `firstKnoten()` and `lastKnoten()` in the template, which works but defeats reactivity — the function is recreated on every render regardless of whether dependencies changed. Should be `$derived.by(() => { ... })` to get a reactive value.

**Impact**: Functional but wasteful. The derived value is a new function reference every time, so downstream `$derived` values (`vonCode`, `bisCode`) that depend on calling it will always re-evaluate.

**Fix**: Change to `$derived.by(...)` and remove the `()` calls at usage sites.

#### 1.2 `Importzeile.svelte` — `$effect` for async resolution has no cleanup

```ts
$effect(() => {
  const datei = eintrag.import.datei;
  if (!datei) { resolveResult = null; return; }
  resolveImport(eintrag.import).then(res => {
    resolveResult = res;
  }).catch(err => {
    resolveResult = { signale: [], error: (err as Error).message };
  });
});
```

If `datei` changes rapidly, multiple promises race and the last to resolve wins (not necessarily the latest). No cancellation or staleness check.

**Impact**: Low in practice (file selection is infrequent), but architecturally fragile.

**Fix**: Track a request counter or use an AbortController pattern.

#### 1.3 `sources.ts` — `importCache` is a module-level `Record` with no eviction

```ts
const importCache: Record<string, Editordaten> = {};
```

Files are cached forever. If a file is updated on the server, the stale cached version is used until page reload.

**Impact**: Users may see outdated import data after editing a source file in the cloud.

**Fix**: Add a TTL, or invalidate on save/delete operations.

#### 1.4 `api.ts` — PIN stored in module-level `let`, not reactive

```ts
let pin: string | null = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem(PIN_KEY) : null;
```

This runs once at module load. If `sessionStorage` is cleared externally, the module still holds the old PIN. Also, `auth.svelte.ts` wraps this with `$state` but the underlying `api.ts` variable is not reactive — `isLoggedIn()` in `api.ts` checks the non-reactive `pin`, while `auth.svelte.ts` maintains a separate `loggedIn` state. These can drift if `api.ts` functions are called directly.

**Impact**: Minor — the app consistently uses `auth.svelte.ts` as the single entry point.

#### 1.5 `yaml.ts` — YAML generation doesn't quote special characters

```ts
yaml += `    signal_1: ${sig.signal_1}\n`;
```

If a signal name contains `:`, `#`, or leading/trailing whitespace, the generated YAML is invalid. Same for meta fields (strecke, von, nach, via, name).

**Impact**: Unlikely with current signal enums, but user-entered names (bahnhof, notiz, richtung) could contain colons.

**Fix**: Quote string values or use a YAML library.

#### 1.6 `yaml.ts` — Legacy format detection is fragile

```ts
if (content.includes('\nstrecke:\n') || content.startsWith('strecke:\n')) {
  return parseLegacyYAML(content);
}
```

This check runs *after* the main parser has already extracted meta fields. If a file has `typ: strecke` on line 1 and also contains `strecke:` as a section header, the main parser partially processes it before the legacy check triggers.

**Impact**: Edge case — only affects legacy files that also have a `typ:` field.

---

### 2. Consistency Issues

#### 2.1 `font-family: monospace` vs `var(--font-mono)`

Most components use `var(--font-mono)`, but several still use bare `monospace`:

- `Kilometerzelle.svelte` — `.km-preview`, `.km-input`
- `Knotenzeile.svelte` — `.knoten-input`, `.knoten-preview`
- `Notizzeile.svelte` — `.note-input`
- `Abzweigungszeile.svelte` — `.abzweigung-field input`, `.abzweigung-btn`
- `Datenpanel.svelte` — `.daten-field input`, `.station-preview`

**Fix**: Replace all `font-family: monospace` with `font-family: var(--font-mono)`.

#### 2.2 Layout in scoped `<style>` vs Tailwind

The project convention (per prior refactoring) is: layout in Tailwind classes, appearance in scoped `<style>`. Several components still have layout properties in scoped styles:

**Fully in scoped CSS (not yet migrated)**:
- `Kilometerzelle.svelte` — all layout in scoped CSS
- `Knotenzeile.svelte` — all layout in scoped CSS
- `Notizzeile.svelte` — all layout in scoped CSS
- `Abzweigungszeile.svelte` — all layout in scoped CSS
- `Dateibrowser.svelte` — all layout in scoped CSS
- `Meldungspanel.svelte` — partial (some Tailwind, some scoped)
- `Zwischenaktionen.svelte` — all layout in scoped CSS
- `Plusleiste.svelte` — all layout in scoped CSS

**Already migrated**:
- `Signalpanel.svelte` ✅
- `Signalzelle.svelte` ✅
- `Codepanel.svelte` ✅
- `Datenpanel.svelte` ✅

#### 2.3 `StoragePrefix` type defined in two places

- `src/lib/api.ts`: `export type StoragePrefix = 'strecken' | 'routen';`
- `src/lib/server/files.ts`: `export type StoragePrefix = 'strecken' | 'routen';`

**Fix**: Define once in `types.ts` and import in both.

#### 2.4 Section header pattern

`section-header` is a global class in `app.css`. It's used by `Signalpanel` (via `App.svelte`), `Meldungspanel`, and `Datenpanel`. The `Datenpanel` version is slightly different (it has a `.header-id` child). This works but the shared global class makes it non-obvious which components depend on it.

---

### 3. Structural Observations

#### 3.1 `App.svelte` is large (~230 lines of script)

It owns all top-level state and orchestrates file I/O, undo/redo, auto-save, keyboard shortcuts, panel visibility, and import stitching. This is manageable but approaching the point where extracting a `fileManager` or `editorState` module would improve readability.

#### 3.2 Prop drilling is extensive

`App.svelte` passes 20+ props to `Toolbar.svelte`. `Signalpanel.svelte` passes props through to `Signalzeile` → `Signalzelle`. This is idiomatic Svelte 5 but makes refactoring harder. A context-based approach or a shared state module could reduce coupling.

#### 3.3 `history.svelte.ts` uses `JSON.stringify`/`JSON.parse` for snapshots

This is simple and correct but O(n) on every focusin event. For large signal lists (hundreds of rows), this could cause input lag. The `save()` method does deduplicate consecutive identical states.

#### 3.4 No tests

There are no test files anywhere in the project. The domain logic in `signals.ts`, `yaml.ts`, `reports.ts`, and `sources.ts` is testable and would benefit from unit tests, especially the YAML parser and signal prediction logic.

#### 3.5 `Breakpoints.svelte` is included in production

```svelte
<Breakpoints /> <!-- Remove this line to hide debug overlay -->
```

This debug component is rendered in `App.svelte` with a comment suggesting removal. It should be conditionally rendered or removed before production deployment.

---

### 4. Security

#### 4.1 PIN-based auth is minimal

The PIN is sent as a Bearer token and compared server-side against `EDITOR_PIN` env var. There's no rate limiting, no session tokens, no expiry. The PIN is stored in `sessionStorage` (cleared on tab close).

**Impact**: Acceptable for a low-stakes internal tool. Not suitable if the data becomes sensitive.

#### 4.2 File names are sanitized server-side

```ts
const safeName = name.replace(/[^a-zA-Z0-9._-]/g, '_');
```

This prevents path traversal. The Vercel Blob storage adds another layer of isolation.

---

### 5. Performance

#### 5.1 `stationen.ts` is 1704 lines (~1700 entries)

This is a static lookup table loaded at module init. At ~50KB, it's included in the client bundle. Could be lazy-loaded or moved to a server endpoint if bundle size becomes a concern.

#### 5.2 `autoStitchImporte` runs on every import datei change

The `$effect` in `App.svelte` triggers `autoStitchImporte` whenever any import's `datei` field changes. This resolves all imports sequentially. For many imports, this could be slow.

#### 5.3 Container queries are zero-cost

The Importzeile refactoring from ResizeObserver to CSS container queries eliminated all JS overhead for responsive text truncation. This is the correct approach.

---

### 6. Dark Mode

Dark mode is fully implemented via `prefers-color-scheme: dark` media query in `app.css`. All color tokens have dark variants. The `color-scheme: light dark` on `body` ensures native form controls adapt.

No manual toggle exists — it follows system preference only.

---

### 7. Deployment

- **Adapter**: `@sveltejs/adapter-vercel` — deploys as Vercel serverless functions
- **Storage**: `@vercel/blob` for file persistence
- **Analytics**: `@vercel/analytics` + `@vercel/speed-insights` injected in layout
- **No CI/CD config** in the repository (likely configured in Vercel dashboard)

---

## Summary of Actionable Items

| Priority | Item | Effort |
|----------|------|--------|
| **Bug** | Fix `$derived(() => ...)` → `$derived.by(...)` in Importzeile | 5 min |
| **Bug** | Add YAML string quoting for special characters | 30 min |
| **Consistency** | Replace `font-family: monospace` → `var(--font-mono)` in 5 components | 10 min |
| **Consistency** | Deduplicate `StoragePrefix` type | 5 min |
| **Cleanup** | Remove or conditionally render `Breakpoints.svelte` | 2 min |
| **Quality** | Add unit tests for `yaml.ts`, `signals.ts`, `reports.ts` | 2-4 hrs |
| **Refactor** | Migrate remaining components to Tailwind layout convention | 1-2 hrs |
| **Robustness** | Add staleness check to Importzeile async resolution | 15 min |
| **Robustness** | Add cache invalidation to `importCache` | 15 min |

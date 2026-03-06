# Signaleditor — Codebase Audit

Audit of the codebase covering bugs, consistency, and improvement opportunities.
Last updated after grid refactor Steps 1-2 and Tailwind removal.

---

## Resolved Items

These were identified in earlier audits and have been fixed:

- ✅ `$derived(() => ...)` → `$derived.by(...)` in Importzeile (firstKnoten, lastKnoten)
- ✅ Importzeile async resolution staleness — uses `resolveSeq` counter
- ✅ YAML string quoting for special characters
- ✅ `font-family: monospace` → `var(--font-mono)` everywhere
- ✅ `StoragePrefix` type deduplicated (defined once in `types.ts`)
- ✅ Highlight system split into `.btn` (buttons) and `.hl-field` (input wrappers)
- ✅ Stationssuche + Stationsname merged into `Stationsfeld`
- ✅ Input attributes standardized (`autocomplete="none"`, `autocorrect="off"`, `spellcheck="false"`)
- ✅ Overflow management: `.row-cell` overflow handled per-component
- ✅ TypeAhead extracted from Signalzelle into `useTypeAhead.svelte.ts`
- ✅ Signal registry created in `signals.config.ts`
- ✅ Tailwind removed — all styles now scoped CSS or `components.css`
- ✅ Meldungspanel deleted — meldungen rendered inline via `Meldungzelle` in grid

---

## Open Items

### `importCache` has no eviction

`sources.ts` caches imported files in a module-level `Record` with no TTL or invalidation. If a file is updated on the server, the stale cached version is used until page reload.

**Impact**: Users may see outdated import data after editing a source file in the cloud.

### `api.ts` PIN not reactive

The PIN is stored in a module-level `let` in `api.ts`, read once from `sessionStorage` at module load. `auth.svelte.ts` wraps this with `$state` but the underlying variable is not reactive. These can drift if `api.ts` functions are called directly.

**Impact**: Minor — the app consistently uses `auth.svelte.ts` as the entry point.

### No tests

No test files in the project. Domain logic in `signals.ts`, `yaml-parse.ts`, `yaml-generate.ts`, `reports.ts`, and `sources.ts` would benefit from unit tests.

### `Breakpoints.svelte` still in codebase

Debug component is commented out in `App.svelte` but the file remains. Can be deleted.

---

## Security Notes

- PIN-based auth is minimal (no rate limiting, no session tokens, no expiry). Acceptable for a low-stakes internal tool.
- File names are sanitized server-side (`/[^a-zA-Z0-9._-]/g` → `_`).
- Vercel Blob storage provides additional isolation.

---

## Performance Notes

- `stationen.ts` is ~1700 entries (~50KB) loaded at module init. Could be lazy-loaded if bundle size becomes a concern.
- `history.svelte.ts` uses `JSON.stringify`/`JSON.parse` for snapshots on every `focusin`. Deduplicates consecutive identical states but is O(n) on data size.

<script lang="ts">
  import { CloudDownload } from 'lucide-svelte';
  import type { Importeintrag, Eintrag } from '../lib/types';
  import { isSignaleintrag, isNotizeintrag, isAbzweigungseintrag, isKnoteneintrag } from '../lib/types';
  import { ICON, STATIONEN } from '../lib/constants';
  import { resolveImport, cacheImport } from '../lib/sources';
  import { parseYAMLContent } from '../lib/yaml';
  import Dateibrowser from './Dateibrowser.svelte';

  let {
    eintrag = $bindable(),
    usedFiles = new Set<string>(),
    onchange,
  }: {
    eintrag: Importeintrag;
    usedFiles?: Set<string>;
    onchange: () => void;
  } = $props();

  let showPicker = $state(false);

  type ResolveState = { signale: Eintrag[]; error: string | null };
  let resolveResult = $state<ResolveState | null>(null);

  let hasFile = $derived(!!eintrag.import.datei);
  let fileBaseName = $derived(eintrag.import.datei?.replace(/\.(ya?ml|html)$/i, '') ?? '');
  let resolved = $derived(resolveResult && !resolveResult.error);

  // Counts in button order: Signale, Notizen, Abzweigungen, Knoten
  let signalCount = $derived(resolveResult?.signale.filter(isSignaleintrag).length ?? 0);
  let notizCount = $derived(resolveResult?.signale.filter(isNotizeintrag).length ?? 0);
  let abzCount = $derived(resolveResult?.signale.filter(isAbzweigungseintrag).length ?? 0);
  let knotenCount = $derived(resolveResult?.signale.filter(isKnoteneintrag).length ?? 0);

  function buildCount(labels: [string, string, string, string], sep = ' ', join = ', '): string {
    if (!resolved) return '';
    const parts: string[] = [];
    if (signalCount) parts.push(`${signalCount}${sep}${labels[0]}`);
    if (notizCount) parts.push(`${notizCount}${sep}${labels[1]}`);
    if (abzCount) parts.push(`${abzCount}${sep}${labels[2]}`);
    if (knotenCount) parts.push(`${knotenCount}${sep}${labels[3]}`);
    return parts.join(join);
  }

  let countFull = $derived(buildCount([
    signalCount === 1 ? 'Signal' : 'Signale',
    notizCount === 1 ? 'Notiz' : 'Notizen',
    abzCount === 1 ? 'Abzweigung' : 'Abzweigungen',
    'Knoten',
  ]));
  let countMedium = $derived(buildCount(['Sig.', 'Not.', 'Abzw.', 'Kn.']));
  let countShort = $derived(buildCount(['S', 'N', 'A', 'K'], '', ' '));



  // Derive start/end knoten from resolved signals
  let firstKnoten = $derived.by(() => {
    if (!resolved) return null;
    const first = resolveResult!.signale[0];
    if (first && isKnoteneintrag(first)) return first.knoten;
    return null;
  });
  let lastKnoten = $derived.by(() => {
    if (!resolved) return null;
    const entries = resolveResult!.signale;
    const last = entries[entries.length - 1];
    if (last && isKnoteneintrag(last)) return last.knoten;
    return null;
  });

  let vonCode = $derived(eintrag.import.von || firstKnoten || '');
  let bisCode = $derived(eintrag.import.bis || lastKnoten || '');

  function formatStitch(von: string, bis: string, fmt: (code: string) => string): string {
    const v = von ? fmt(von) : '';
    const b = bis ? fmt(bis) : '';
    if (v && b) return `${v} → ${b}`;
    if (v) return `${v} → ?`;
    if (b) return `? → ${b}`;
    return '';
  }

  // Three tiers: "Bern (BN) → Rothrist (RTR)", "Bern → Rothrist", "BN → RTR"
  let stitchFull = $derived(formatStitch(vonCode, bisCode, (c) => {
    const name = STATIONEN[c]?.[0];
    return name ? `${name} (${c})` : c;
  }));
  let stitchMedium = $derived(formatStitch(vonCode, bisCode, (c) => {
    return STATIONEN[c]?.[0] ?? c;
  }));
  let stitchCompact = $derived(formatStitch(vonCode, bisCode, (c) => c));

  let otherUsedFiles = $derived.by(() => {
    const s = new Set(usedFiles);
    if (eintrag.import.datei) s.delete(eintrag.import.datei);
    return s;
  });

  let resolveSeq = 0;

  $effect(() => {
    const datei = eintrag.import.datei;
    const seq = ++resolveSeq;
    if (!datei) {
      resolveResult = null;
      return;
    }
    resolveImport(eintrag.import).then(res => {
      if (seq === resolveSeq) resolveResult = res;
    }).catch(err => {
      if (seq === resolveSeq) resolveResult = { signale: [], error: (err as Error).message };
    });
  });

  async function handleFileSelect(content: string, fileName: string) {
    const parsed = parseYAMLContent(content);
    cacheImport(fileName, parsed);
    eintrag.import.datei = fileName;
    showPicker = false;
    onchange();
  }
</script>

<div
  class="row-cell import-cell import-file-cell"
  class:has-file={hasFile}
  role={hasFile ? 'button' : undefined}
  tabindex={hasFile ? 0 : undefined}
  onclick={hasFile ? () => showPicker = true : undefined}
  onkeydown={hasFile ? (e) => { if (e.key === 'Enter') showPicker = true; } : undefined}
>
  <div class="import-name">
    {#if hasFile}
      <span class="import-filename file-full">{eintrag.import.datei}</span>
      <span class="import-filename file-noext">{fileBaseName}</span>
    {:else}
      <span class="import-placeholder">Datei auswählen</span>
    {/if}
  </div>
  <button class="import-folder-btn" onclick={(e) => { e.stopPropagation(); showPicker = true; }} title="Datei auswählen">
    <CloudDownload {...ICON} />
  </button>
</div>
<div class="row-cell import-cell import-info-cell" class:empty={!hasFile}>
  <div class="import-info">
    {#if resolveResult?.error}
      <span class="import-error">{resolveResult.error}</span>
    {:else if hasFile && resolved}
      <span class="import-stitch tier-full">{stitchFull || '—'}</span>
      <span class="import-stitch tier-medium">{stitchMedium || '—'}</span>
      <span class="import-stitch tier-compact">{stitchCompact || '—'}</span>
      <span class="import-divider"></span>
      <span class="import-count tier-full">{countFull || '—'}</span>
      <span class="import-count tier-medium">{countMedium || '—'}</span>
      <span class="import-count tier-compact">{countShort || '—'}</span>
    {/if}
  </div>
</div>

{#if showPicker}
  <Dateibrowser
    mode="select"
    lockedTab="strecken"
    usedFiles={otherUsedFiles}
    onload={handleFileSelect}
    onclose={() => showPicker = false}
  />
{/if}

<style>
  .import-cell { background: var(--color-import); }
  .import-file-cell { container-type: inline-size; outline: none; }
  .import-name {
    flex: 1;
    min-width: 0;
    display: flex;
    align-items: center;
    padding: 0 var(--spacing-cell);
    height: 100%;
  }
  .import-filename {
    font-size: var(--text-input);
    font-family: var(--font-mono);
    font-weight: var(--font-weight-medium);
    color: var(--color-text);
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  .import-placeholder {
    font-size: var(--text-input);
    font-family: var(--font-mono);
    color: var(--color-text-muted);
    user-select: none;
    pointer-events: none;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .import-folder-btn {
    width: var(--spacing-unit);
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: none;
    border-left: 1px solid var(--color-border);
    border-radius: 0 var(--radius-inner) var(--radius-inner) 0;
    cursor: pointer;
    color: var(--color-import-text);
    height: 100%;
  }
  .import-folder-btn:hover {
    background: color-mix(in srgb, currentColor 8%, transparent);
  }
  .file-noext { display: none; }

  /* Narrow: < 200px */
  @container (max-width: 199px) {
    /* No file: hide name, button fills cell */
    .has-file .import-folder-btn { display: none; }
    .has-file { cursor: pointer; }
    .has-file .import-name { justify-content: center; }
    .has-file .import-filename {
      color: var(--color-focus);
    }
    .import-file-cell:not(.has-file) .import-name { display: none; }
    .import-file-cell:not(.has-file) .import-folder-btn {
      width: 100%;
      border-left: none;
      border-radius: var(--radius-inner);
    }
    .file-full { display: none; }
    .file-noext { display: inline; }
  }

  /* Medium: 200–299px — name without extension + button */
  @container (min-width: 200px) and (max-width: 299px) {
    .file-full { display: none; }
    .file-noext { display: inline; }
  }

  /* Wide: >= 300px — full filename + full button (default) */
  .import-info-cell.empty {
    background: var(--color-bg);
    pointer-events: none;
  }
  .import-info-cell {
    container-type: inline-size;
    overflow: hidden;
  }
  .import-info {
    display: flex;
    align-items: center;
    height: 100%;
    width: 100%;
    overflow: hidden;
  }
  .import-divider {
    border-left: 1px solid var(--color-border);
    align-self: stretch;
  }
  .import-count, .import-stitch, .import-error {
    font-size: var(--text-input);
    font-family: var(--font-mono);
    white-space: nowrap;
    overflow: hidden;
    padding: 0 var(--spacing-cell);
    flex: 1;
    min-width: 0;
  }
  .import-count { color: var(--color-text-secondary); flex: 1.5; }
  .import-stitch { color: var(--color-import-text); }
  .import-error { color: var(--color-red); }

  /* Tier visibility: compact shown by default, wider tiers override */
  .tier-full, .tier-medium { display: none; }
  .tier-compact { display: block; }

  @container (min-width: 300px) {
    .tier-medium { display: block; }
    .tier-compact { display: none; }
  }

  @container (min-width: 420px) {
    .tier-full { display: block; }
    .tier-medium { display: none; }
  }
</style>

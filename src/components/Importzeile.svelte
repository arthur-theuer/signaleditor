<script lang="ts">
  import { CloudDownload } from 'lucide-svelte';
  import type { Importeintrag, Eintrag } from '../lib/types';
  import { isSignaleintrag, isNotizeintrag, isAbzweigungseintrag, isKnoteneintrag } from '../lib/types';
  import { STATIONEN } from '../lib/constants';
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
  let resolved = $derived(resolveResult && !resolveResult.error);

  // Counts in button order: Signale, Notizen, Abzweigungen, Knoten
  let signalCount = $derived(resolveResult?.signale.filter(isSignaleintrag).length ?? 0);
  let notizCount = $derived(resolveResult?.signale.filter(isNotizeintrag).length ?? 0);
  let abzCount = $derived(resolveResult?.signale.filter(isAbzweigungseintrag).length ?? 0);
  let knotenCount = $derived(resolveResult?.signale.filter(isKnoteneintrag).length ?? 0);

  function buildCount(labels: [string, string, string, string], sep = ' '): string {
    if (!resolved) return '';
    const parts: string[] = [];
    if (signalCount) parts.push(`${signalCount}${sep}${labels[0]}`);
    if (notizCount) parts.push(`${notizCount}${sep}${labels[1]}`);
    if (abzCount) parts.push(`${abzCount}${sep}${labels[2]}`);
    if (knotenCount) parts.push(`${knotenCount}${sep}${labels[3]}`);
    return parts.join(', ');
  }

  let countFull = $derived(buildCount([
    signalCount === 1 ? 'Signal' : 'Signale',
    notizCount === 1 ? 'Notiz' : 'Notizen',
    abzCount === 1 ? 'Abzweigung' : 'Abzweigungen',
    'Knoten',
  ]));
  let countMedium = $derived(buildCount(['Sig.', 'Not.', 'Abzw.', 'Kn.']));
  let countShort = $derived(buildCount(['S', 'N', 'A', 'K'], ''));



  // Derive start/end knoten from resolved signals
  let firstKnoten = $derived(() => {
    if (!resolved) return null;
    const first = resolveResult!.signale[0];
    if (first && isKnoteneintrag(first)) return first.knoten;
    return null;
  });
  let lastKnoten = $derived(() => {
    if (!resolved) return null;
    const entries = resolveResult!.signale;
    const last = entries[entries.length - 1];
    if (last && isKnoteneintrag(last)) return last.knoten;
    return null;
  });

  let vonCode = $derived(eintrag.import.von || firstKnoten() || '');
  let bisCode = $derived(eintrag.import.bis || lastKnoten() || '');

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
    const name = STATIONEN[c];
    return name ? `${name} (${c})` : c;
  }));
  let stitchMedium = $derived(formatStitch(vonCode, bisCode, (c) => {
    return STATIONEN[c] ?? c;
  }));
  let stitchCompact = $derived(formatStitch(vonCode, bisCode, (c) => c));

  let otherUsedFiles = $derived.by(() => {
    const s = new Set(usedFiles);
    if (eintrag.import.datei) s.delete(eintrag.import.datei);
    return s;
  });

  $effect(() => {
    const datei = eintrag.import.datei;
    if (!datei) {
      resolveResult = null;
      return;
    }
    resolveImport(eintrag.import).then(res => {
      resolveResult = res;
    }).catch(err => {
      resolveResult = { signale: [], error: (err as Error).message };
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

<div class="signal-cell import-cell">
  <div class="import-inner">
    <div class="import-name">
      {#if hasFile}
        <span class="import-filename">{eintrag.import.datei}</span>
      {:else}
        <span class="import-placeholder">Datei auswählen</span>
      {/if}
    </div>
    <button class="import-folder-btn hl" onclick={() => showPicker = true} title="Datei auswählen">
      <CloudDownload size={20} strokeWidth={1.2} />
    </button>
  </div>
</div>
<div class="signal-cell import-cell import-info-cell" class:empty={!hasFile}>
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
  .import-inner { display: flex; height: 100%; }
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
  }
  .import-folder-btn {
    width: var(--spacing-row);
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: none;
    border-left: 1px solid var(--color-border);
    border-radius: 0 calc(var(--radius-card) - 1px) calc(var(--radius-card) - 1px) 0;
    cursor: pointer;
    color: var(--color-import-text);
    height: 100%;
  }
  .import-info-cell.empty {
    background: var(--color-bg);
    pointer-events: none;
  }
  .import-info-cell {
    container-type: inline-size;
  }
  .import-info {
    display: flex;
    flex-direction: column;
    justify-content: center;
    height: 100%;
    overflow: hidden;
  }
  .import-divider {
    border-top: 1px solid var(--color-border);
  }
  .import-count, .import-stitch, .import-error {
    font-size: var(--text-input);
    font-family: var(--font-mono);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    padding: 0 var(--spacing-cell);
    display: flex;
    align-items: center;
    flex: 1;
  }
  .import-count { color: var(--color-text-secondary); }
  .import-stitch { color: var(--color-import-text); }
  .import-error { color: var(--color-red); }

  /* Tier visibility: compact shown by default, wider tiers override */
  .tier-full, .tier-medium { display: none; }
  .tier-compact { display: flex; }

  /* ~30 chars × 8.4px + 24px padding = ~276px */
  @container (min-width: 276px) {
    .tier-medium { display: flex; }
    .tier-compact { display: none; }
  }

  /* ~45 chars × 8.4px + 24px padding = ~402px */
  @container (min-width: 402px) {
    .tier-full { display: flex; }
    .tier-medium { display: none; }
  }
</style>

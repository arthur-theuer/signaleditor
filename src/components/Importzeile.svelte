<script lang="ts">
  import { CloudDownload, DiamondPlus, SquarePen, Share2, Crosshair } from 'lucide-svelte';
  import type { Importeintrag, Eintrag } from '../lib/types';
  import { isSignaleintrag, isNotizeintrag, isAbzweigungseintrag, isKnoteneintrag } from '../lib/types';
  import { STATIONEN } from '../lib/constants';
  import { resolveImport, cacheImport } from '../lib/sources';
  import { parseYAMLContent } from '../lib/yaml';
  import Dateibrowser from './Dateibrowser.svelte';

  let {
    eintrag = $bindable(),
    usedFiles = new Set<string>(),
    countTier = 0,
    stitchTier = 0,
    onchange,
    oncounttruncate,
    onstitchtruncate,
  }: {
    eintrag: Importeintrag;
    usedFiles?: Set<string>;
    countTier?: number;
    stitchTier?: number;
    onchange: () => void;
    oncounttruncate?: (tier: number) => void;
    onstitchtruncate?: (tier: number) => void;
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

  let countText = $derived(() => {
    if (!resolved) return '';
    const parts: string[] = [];
    if (signalCount) parts.push(`${signalCount} Signale`);
    if (notizCount) parts.push(`${notizCount} Notizen`);
    if (abzCount) parts.push(`${abzCount} Abzweigungen`);
    if (knotenCount) parts.push(`${knotenCount} Knoten`);
    return parts.join(', ');
  });

  type CountItem = { count: number; icon: typeof DiamondPlus };
  let countItems = $derived(() => {
    if (!resolved) return [] as CountItem[];
    const items: CountItem[] = [];
    if (signalCount) items.push({ count: signalCount, icon: DiamondPlus });
    if (notizCount) items.push({ count: notizCount, icon: SquarePen });
    if (abzCount) items.push({ count: abzCount, icon: Share2 });
    if (knotenCount) items.push({ count: knotenCount, icon: Crosshair });
    return items;
  });

  // Stitch truncation detection: three tiers (0=full, 1=medium, 2=compact)
  let stitchFullEl = $state<HTMLElement | null>(null);
  let stitchMediumEl = $state<HTMLElement | null>(null);
  let lastStitchTier = -1;

  $effect(() => {
    const fullEl = stitchFullEl;
    const medEl = stitchMediumEl;
    if (!fullEl || !medEl) { if (lastStitchTier !== 0) { lastStitchTier = 0; onstitchtruncate?.(0); } return; }

    function check() {
      let tier = 2;
      if (fullEl!.scrollWidth <= fullEl!.clientWidth) tier = 0;
      else if (medEl!.scrollWidth <= medEl!.clientWidth) tier = 1;
      if (tier !== lastStitchTier) { lastStitchTier = tier; onstitchtruncate?.(tier); }
    }

    const ro = new ResizeObserver(check);
    ro.observe(fullEl);
    check();

    return () => { ro.disconnect(); if (lastStitchTier !== 0) { lastStitchTier = 0; onstitchtruncate?.(0); } };
  });

  // Count truncation detection: three tiers (0=text, 1=icons+commas, 2=icons only)
  let countTextEl = $state<HTMLElement | null>(null);
  let countIconsEl = $state<HTMLElement | null>(null);
  let lastCountTier = -1;

  $effect(() => {
    const textEl = countTextEl;
    const iconsEl = countIconsEl;
    if (!textEl || !iconsEl) { if (lastCountTier !== 0) { lastCountTier = 0; oncounttruncate?.(0); } return; }

    function check() {
      let tier = 2;
      if (textEl!.scrollWidth <= textEl!.clientWidth) tier = 0;
      else if (iconsEl!.scrollWidth <= iconsEl!.clientWidth) tier = 1;
      if (tier !== lastCountTier) { lastCountTier = tier; oncounttruncate?.(tier); }
    }

    const ro = new ResizeObserver(check);
    ro.observe(textEl);
    check();

    return () => { ro.disconnect(); if (lastCountTier !== 0) { lastCountTier = 0; oncounttruncate?.(0); } };
  });

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

  function knotenCode(source: string | undefined, fallback: (() => string | null)): string {
    if (source) return source;
    const fb = fallback();
    return fb ?? '';
  }

  let vonCode = $derived(knotenCode(eintrag.import.von, firstKnoten));
  let bisCode = $derived(knotenCode(eintrag.import.bis, lastKnoten));

  function formatStitch(von: string, bis: string, fmt: (code: string) => string): string {
    const v = von ? fmt(von) : '';
    const b = bis ? fmt(bis) : '';
    if (v && b) return `${v} → ${b}`;
    if (v) return `${v} → ?`;
    if (b) return `? → ${b}`;
    return '';
  }

  // Three tiers: "Bern (BN) → Rothrist (RTR)", "Bern → Rothrist", "BN → RTR"
  let stitchFull = $derived(() => formatStitch(vonCode, bisCode, (c) => {
    const name = STATIONEN[c];
    return name ? `${name} (${c})` : c;
  }));
  let stitchMedium = $derived(() => formatStitch(vonCode, bisCode, (c) => {
    return STATIONEN[c] ?? c;
  }));
  let stitchCompact = $derived(() => formatStitch(vonCode, bisCode, (c) => c));

  let otherUsedFiles = $derived(() => {
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
      <CloudDownload size={20} strokeWidth={2} />
    </button>
  </div>
</div>
<div class="signal-cell import-cell import-info-cell" class:empty={!hasFile}>
  <div class="import-info">
    {#if resolveResult?.error}
      <span class="import-error">{resolveResult.error}</span>
    {:else if hasFile && resolved}
      <!-- Hidden measurement spans for stitch truncation detection -->
      <span class="import-stitch stitch-measure" bind:this={stitchFullEl}>{stitchFull() || '—'}</span>
      <span class="import-stitch stitch-measure" bind:this={stitchMediumEl}>{stitchMedium() || '—'}</span>
      <span class="import-stitch">
        {#if stitchTier === 0}
          {stitchFull() || '—'}
        {:else if stitchTier === 1}
          {stitchMedium() || '—'}
        {:else}
          {stitchCompact() || '—'}
        {/if}
      </span>
      <span class="import-divider"></span>
      <!-- Hidden measurement spans for count truncation detection -->
      <span class="import-count count-measure" bind:this={countTextEl}>{countText() || '—'}</span>
      <span class="import-count count-measure count-icons" bind:this={countIconsEl}>
        {#each countItems() as item}
          <span class="count-icon-item">
            {item.count}
            <item.icon size={14} strokeWidth={2.5} />
          </span>
        {/each}
      </span>
      {#if countTier === 0}
        <span class="import-count">{countText() || '—'}</span>
      {:else}
        <span class="import-count count-icons" class:no-commas={countTier >= 2}>
          {#each countItems() as item}
            <span class="count-icon-item">
              {item.count}
              <item.icon size={14} strokeWidth={2.5} />
            </span>
          {/each}
          {#if !countItems().length}—{/if}
        </span>
      {/if}
    {/if}
  </div>
</div>

{#if showPicker}
  <Dateibrowser
    mode="select"
    lockedTab="strecken"
    usedFiles={otherUsedFiles()}
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
    padding: 0 var(--cell-padding);
    height: 100%;
  }
  .import-filename {
    font-size: var(--input-font-size);
    font-family: monospace;
    font-weight: var(--weight-medium);
    color: var(--color-text);
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  .import-placeholder {
    font-size: var(--input-font-size);
    font-family: monospace;
    color: var(--color-text-muted);
    user-select: none;
    pointer-events: none;
  }
  .import-folder-btn {
    width: var(--row-height);
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: none;
    border-left: 1px solid var(--color-border);
    border-radius: 0 calc(var(--card-radius) - 1px) calc(var(--card-radius) - 1px) 0;
    cursor: pointer;
    color: var(--color-import-text);
    height: 100%;
  }
  .import-info-cell.empty {
    background: var(--color-bg);
    pointer-events: none;
  }
  .import-info {
    display: flex;
    flex-direction: column;
    justify-content: center;
    height: 100%;
    overflow: hidden;
    position: relative;
  }
  .import-divider {
    border-top: 1px solid var(--color-border);
  }
  .import-count, .import-stitch, .import-error {
    font-size: var(--input-font-size);
    font-family: monospace;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    padding: 0 var(--cell-padding);
    display: flex;
    align-items: center;
    flex: 1;
  }
  .import-count { color: var(--color-text-secondary); }
  .stitch-measure, .count-measure {
    position: absolute;
    left: 0;
    right: 0;
    pointer-events: none;
    clip-path: inset(50%);
  }
  .count-icons {
    gap: 2px;
  }
  .count-icon-item {
    display: inline-flex;
    align-items: center;
    gap: 2px;
  }
  .count-icon-item + .count-icon-item::before {
    content: ',';
    margin-right: 2px;
  }
  .no-commas .count-icon-item + .count-icon-item::before {
    content: none;
  }
  .import-stitch { color: var(--color-import-text); }
  .import-error { color: var(--color-red); }
</style>

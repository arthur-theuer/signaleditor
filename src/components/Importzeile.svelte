<script lang="ts">
  import { FolderClosed, FolderOpen } from 'lucide-svelte';
  import type { Importeintrag, Eintrag } from '../lib/types';
  import { isSignaleintrag, isAbzweigungseintrag } from '../lib/types';
  import { STATIONEN } from '../lib/constants';
  import { resolveImport, cacheImport } from '../lib/sources';
  import { parseYAMLContent } from '../lib/yaml';
  import { loadFile } from '../lib/api';
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

  let vonInfo = $derived(
    eintrag.import.von ? `${eintrag.import.von} (${STATIONEN[eintrag.import.von] || '?'})` : ''
  );
  let bisInfo = $derived(
    eintrag.import.bis ? `${eintrag.import.bis} (${STATIONEN[eintrag.import.bis] || '?'})` : ''
  );
  let stitchInfo = $derived([vonInfo, bisInfo].filter(Boolean).join(' → '));

  let signalCount = $derived(
    resolveResult?.signale.filter(s => isSignaleintrag(s)).length ?? 0
  );
  let abzCount = $derived(
    resolveResult?.signale.filter(s => isAbzweigungseintrag(s)).length ?? 0
  );
  let countText = $derived(
    resolveResult
      ? resolveResult.error
        ? ''
        : `${signalCount} Signale${abzCount ? `, ${abzCount} Abzw.` : ''}`
      : ''
  );

  // Exclude own file from usedFiles passed to picker
  let otherUsedFiles = $derived(() => {
    const s = new Set(usedFiles);
    if (eintrag.import.datei) s.delete(eintrag.import.datei);
    return s;
  });

  // Resolve when datei changes
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
    <div class="import-main">
      {#if eintrag.import.datei}
        <span class="import-filename">{eintrag.import.datei}</span>
      {:else}
        <span class="import-placeholder">Datei auswählen</span>
      {/if}
    </div>
    <div class="import-info">
      {#if resolveResult?.error}
        <span class="import-error">{resolveResult.error}</span>
      {:else if eintrag.import.datei}
        <span class="import-count">{countText}</span>
        {#if stitchInfo}
          <span class="import-stitch">{stitchInfo}</span>
        {/if}
      {/if}
    </div>
    <button class="import-folder-btn hl" onclick={() => showPicker = true} title="Datei auswählen" tabindex={-1}>
      {#if eintrag.import.datei}
        <FolderOpen size={20} strokeWidth={2} />
      {:else}
        <FolderClosed size={20} strokeWidth={2} />
      {/if}
    </button>
  </div>
</div>

{#if showPicker}
  <Dateibrowser
    mode="select"
    lockedTab="videos"
    usedFiles={otherUsedFiles()}
    onload={handleFileSelect}
    onclose={() => showPicker = false}
  />
{/if}

<style>
  .import-cell { background: var(--color-import); }
  .import-inner {
    display: grid;
    grid-template-columns: 1fr auto;
    grid-template-rows: 1fr 1fr;
    height: 100%;
  }
  .import-main {
    display: flex;
    align-items: center;
    padding: 0 12px;
    grid-column: 1;
    grid-row: 1;
  }
  .import-filename {
    font-size: var(--input-font-size);
    font-family: monospace;
    font-weight: 500;
    color: var(--color-text);
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  .import-placeholder {
    font-size: var(--input-font-size);
    color: var(--color-text-muted);
  }
  .import-info {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 0 12px;
    font-size: var(--preview-font-size);
    font-family: monospace;
    color: var(--color-text-muted);
    border-top: 1px solid var(--color-border);
    grid-column: 1;
    grid-row: 2;
    overflow: hidden;
    white-space: nowrap;
  }
  .import-count {
    flex-shrink: 0;
    color: var(--color-text-secondary);
  }
  .import-stitch { color: var(--color-focus); }
  .import-error { color: var(--color-red); }
  .import-folder-btn {
    grid-column: 2;
    grid-row: 1 / -1;
    width: var(--row-height);
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: none;
    border-left: 1px solid var(--color-border);
    border-radius: 0 calc(var(--card-radius) - 1px) calc(var(--card-radius) - 1px) 0;
    cursor: pointer;
    color: var(--color-focus);
  }
</style>

<script lang="ts">
  import { FolderClosed, FolderOpen } from 'lucide-svelte';
  import type { Importeintrag, Eintrag } from '../lib/types';
  import { isSignaleintrag, isAbzweigungseintrag, isKnoteneintrag } from '../lib/types';
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
        : `${signalCount} Signale${abzCount ? `, ${abzCount} Abzweigungen` : ''}`
      : ''
  );

  // Derive stitch info: von → bis, using first Knoten as start if no explicit von
  let firstKnoten = $derived(() => {
    if (!resolveResult || resolveResult.error) return null;
    const first = resolveResult.signale[0];
    if (first && isKnoteneintrag(first)) return first.knoten;
    return null;
  });

  function knotenLabel(code: string): string {
    const name = STATIONEN[code];
    return name ? `${code} (${name})` : code;
  }

  let vonLabel = $derived(() => {
    if (eintrag.import.von) return knotenLabel(eintrag.import.von);
    const fk = firstKnoten();
    if (fk) return knotenLabel(fk);
    return '';
  });
  let bisLabel = $derived(
    eintrag.import.bis ? knotenLabel(eintrag.import.bis) : ''
  );
  let stitchInfo = $derived(() => {
    const von = vonLabel();
    return [von, bisLabel].filter(Boolean).join(' → ');
  });

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

<div class="signal-cell import-cell import-file-cell">
  <div class="import-inner">
    <div class="import-name">
      {#if eintrag.import.datei}
        <span class="import-filename">{eintrag.import.datei}</span>
      {:else}
        <span class="import-placeholder">Datei auswählen</span>
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
<div class="signal-cell import-cell import-info-cell">
  <div class="import-info">
    {#if resolveResult?.error}
      <span class="import-error">{resolveResult.error}</span>
    {:else if eintrag.import.datei}
      {#if countText}
        <span class="import-count">{countText}</span>
      {/if}
      {#if stitchInfo()}
        <span class="import-stitch">{stitchInfo()}</span>
      {/if}
    {/if}
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
    color: var(--color-text-muted);
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
  .import-info {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 2px;
    padding: 0 var(--cell-padding);
    height: 100%;
    overflow: hidden;
  }
  .import-count {
    font-size: var(--preview-font-size);
    font-family: monospace;
    color: var(--color-text-secondary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .import-stitch {
    font-size: var(--preview-font-size);
    font-family: monospace;
    color: var(--color-import-text);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .import-error {
    font-size: var(--preview-font-size);
    font-family: monospace;
    color: var(--color-red);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
</style>

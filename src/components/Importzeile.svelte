<script lang="ts">
  import type { Importeintrag, Eintrag } from '../lib/types';
  import { isSignaleintrag, isAbzweigungseintrag, isNotizeintrag, isKnoteneintrag } from '../lib/types';
  import { STATIONEN } from '../lib/constants';
  import { resolveImport, cacheImport } from '../lib/sources';
  import { parseYAMLContent, extractYAMLFromHTML } from '../lib/yaml';


  let {
    eintrag = $bindable(),
    onchange,
  }: {
    eintrag: Importeintrag;
    onchange: () => void;
  } = $props();

  let expanded = $state(false);
  type ResolveState = { signale: Eintrag[]; error: string | null };
  let resolveResult = $state<ResolveState | null>(null);
  let fileInput: HTMLInputElement;

  let vonInfo = $derived(
    eintrag.import.von ? `von: ${eintrag.import.von} (${STATIONEN[eintrag.import.von] || '?'})` : ''
  );
  let bisInfo = $derived(
    eintrag.import.bis ? `bis: ${eintrag.import.bis} (${STATIONEN[eintrag.import.bis] || '?'})` : ''
  );
  let stitchInfo = $derived([vonInfo, bisInfo].filter(Boolean).join(' | '));

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
      : '...'
  );

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



  function handleFileLoad(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      let content = reader.result as string;
      if (file.name.endsWith('.html')) {
        const yaml = extractYAMLFromHTML(content);
        if (yaml) content = yaml;
      }
      const parsed = parseYAMLContent(content);
      cacheImport(file.name, parsed);
      eintrag.import.datei = file.name;
      onchange();
    };
    reader.readAsText(file);
    input.value = '';
  }

  function abzArrow(s: import('../lib/types').Abzweigungseintrag): string {
    const abz = s.abzweigung;
    return (abz.seite === 'links') === (abz.von_nach === 'nach') ? '<<' : '>>';
  }
</script>

<div class="signal-cell import-cell" class:expanded>
  <div class="import-inner">
    <div class="import-top hl-wrap">
      <input
        type="text"
        class="import-datei"
        bind:value={eintrag.import.datei}
        oninput={onchange}
        placeholder="Datei (z.B. videos/652_rp_zh.yaml)"
        autocomplete="off"
        autocorrect="off"
        spellcheck="false"
      />
      <button class="import-load-btn" onclick={() => fileInput.click()} title="Datei laden" tabindex={-1}>📁</button>
      <input
        type="file"
        accept=".yaml,.yml,.html"
        style="display:none"
        bind:this={fileInput}
        onchange={handleFileLoad}
      />
    </div>
    <div class="import-info">
      {#if resolveResult?.error}
        <span class="import-error">{resolveResult.error}</span>
      {:else}
        <span class="import-count">{countText}</span>
      {/if}
      {#if stitchInfo}
        <span class="import-stitch">{stitchInfo}</span>
      {/if}
      {#if resolveResult && !resolveResult.error && resolveResult.signale.length > 0}
        <button class="import-expand-btn" onclick={() => expanded = !expanded} title="Signale anzeigen">
          {expanded ? '▲' : '▼'}
        </button>
      {/if}
    </div>
    {#if expanded && resolveResult && !resolveResult.error}
      <div class="import-resolved visible">
        {#each resolveResult.signale as s}
          {#if isAbzweigungseintrag(s)}
            <div class="import-resolved-row abz">{abzArrow(s)} {s.abzweigung.strecke} {s.abzweigung.von_nach} {s.abzweigung.richtung} {abzArrow(s)}</div>
          {:else if isNotizeintrag(s)}
            <div class="import-resolved-row notiz">{s.notiz || 'Notiz'}</div>
          {:else if isKnoteneintrag(s)}
            <div class="import-resolved-row knoten">{s.knoten}{STATIONEN[s.knoten] ? ` (${STATIONEN[s.knoten]})` : ''}</div>
          {:else if isSignaleintrag(s)}
            <div class="import-resolved-row">{[s.signal_1, s.signal_2].filter(Boolean).join(' | ') || '(leer)'}</div>
          {/if}
        {/each}
      </div>
    {/if}
  </div>
</div>

<style>
  .import-cell { background: #e3f2fd; }
  .import-inner { display: flex; flex-direction: column; height: 100%; }
  .import-top {
    display: flex;
    align-items: center;
    flex: 1;
    border-radius: calc(var(--card-radius) - 1px) calc(var(--card-radius) - 1px) 0 0;
  }
  .import-datei {
    flex: 1;
    padding: 0 12px;
    border: none;
    background: transparent;
    font-size: var(--input-font-size);
    font-family: monospace;
    height: 100%;
  }
  .import-datei:focus { outline: none; }
  .import-datei::placeholder { color: var(--color-text-muted); }
  .import-load-btn {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 16px;
    padding: 0 8px;
    height: 100%;
    display: flex;
    align-items: center;
  }
  .import-info {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 4px 12px;
    font-size: 11px;
    font-family: monospace;
    color: var(--color-text-muted);
    border-top: 1px solid var(--color-border);
    min-height: 24px;
  }
  .import-count { flex-shrink: 0; }
  .import-stitch { color: #1565c0; }
  .import-error { color: var(--color-red); }
  .import-expand-btn {
    margin-left: auto;
    background: none;
    border: none;
    cursor: pointer;
    font-size: 10px;
    color: var(--color-text-muted);
    padding: 2px 4px;
  }
  .import-resolved {
    border-top: 1px solid var(--color-border);
    max-height: 200px;
    overflow-y: auto;
    font-size: 11px;
    font-family: monospace;
  }
  .expanded { height: auto; }
  .import-resolved-row {
    padding: 2px 12px;
    border-bottom: 1px solid #eee;
  }
  .import-resolved-row.abz {
    color: #7b1fa2;
    font-style: italic;
  }
  .import-resolved-row.notiz {
    color: #f57f17;
    font-style: italic;
  }
  .import-resolved-row.knoten {
    color: #00695c;
    font-weight: 600;
  }
</style>

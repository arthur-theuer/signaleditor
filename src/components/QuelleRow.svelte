<script lang="ts">
  import type { Quelleneintrag, Eintrag } from '../lib/types';
  import { isSignaleintrag, isAbzweigungseintrag, isNotizeintrag, isKnoteneintrag } from '../lib/types';
  import { KNOTEN } from '../lib/constants';
  import { resolveQuelle, cacheQuelle } from '../lib/sources';
  import { parseYAMLContent, extractYAMLFromHTML } from '../lib/yaml';
  import { escapeHtml } from '../lib/colors';

  let {
    eintrag = $bindable(),
    onchange,
  }: {
    eintrag: Quelleneintrag;
    onchange: () => void;
  } = $props();

  let expanded = $state(false);
  type ResolveState = { signale: Eintrag[]; error: string | null };
  let resolveResult = $state<ResolveState | null>(null);
  let fileInput: HTMLInputElement;

  let vonInfo = $derived(
    eintrag.quelle.von ? `von: ${eintrag.quelle.von} (${KNOTEN[eintrag.quelle.von] || '?'})` : ''
  );
  let bisInfo = $derived(
    eintrag.quelle.bis ? `bis: ${eintrag.quelle.bis} (${KNOTEN[eintrag.quelle.bis] || '?'})` : ''
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
    const datei = eintrag.quelle.datei;
    if (!datei) {
      resolveResult = null;
      return;
    }
    resolveQuelle(eintrag.quelle).then(res => {
      resolveResult = res;
    }).catch(err => {
      resolveResult = { signale: [], error: (err as Error).message };
    });
  });

  function handleDateiInput(e: Event) {
    eintrag.quelle.datei = (e.target as HTMLInputElement).value;
    onchange();
  }

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
      cacheQuelle(file.name, parsed);
      eintrag.quelle.datei = file.name;
      onchange();
    };
    reader.readAsText(file);
    input.value = '';
  }

  function renderResolvedRow(s: Eintrag): string {
    if (isAbzweigungseintrag(s)) {
      const abz = s.abzweigung;
      const arrow = (abz.seite === 'links') === (abz.von_nach === 'nach') ? '&lt;&lt;' : '&gt;&gt;';
      return `<div class="quelle-resolved-row abz">${arrow} ${escapeHtml(abz.strecke)} ${abz.von_nach} ${escapeHtml(abz.richtung)} ${arrow}</div>`;
    } else if (isNotizeintrag(s)) {
      return `<div class="quelle-resolved-row" style="color:#f57f17;font-style:italic">${escapeHtml(s.notiz || 'Notiz')}</div>`;
    } else if (isKnoteneintrag(s)) {
      return `<div class="quelle-resolved-row" style="color:#00695c;font-weight:600">${escapeHtml(s.knoten)} ${KNOTEN[s.knoten] ? `(${escapeHtml(KNOTEN[s.knoten])})` : ''}</div>`;
    } else if (isSignaleintrag(s)) {
      const parts = [s.signal_1, s.signal_2].filter(Boolean);
      return `<div class="quelle-resolved-row">${escapeHtml(parts.join(' | ') || '(leer)')}</div>`;
    }
    return '';
  }
</script>

<div class="signal-cell quelle-cell" class:expanded>
  <div class="quelle-inner">
    <div class="quelle-top hl-wrap">
      <input
        type="text"
        class="quelle-datei"
        value={eintrag.quelle.datei}
        oninput={handleDateiInput}
        placeholder="Datei (z.B. videos/652_rp_zh.yaml)"
        autocomplete="off"
        autocorrect="off"
        spellcheck="false"
      />
      <button class="quelle-load-btn" onclick={() => fileInput.click()} title="Datei laden" tabindex={-1}>📁</button>
      <input
        type="file"
        accept=".yaml,.yml,.html"
        style="display:none"
        bind:this={fileInput}
        onchange={handleFileLoad}
      />
    </div>
    <div class="quelle-info">
      {#if resolveResult?.error}
        <span class="quelle-error">{resolveResult.error}</span>
      {:else}
        <span class="quelle-count">{countText}</span>
      {/if}
      {#if stitchInfo}
        <span class="quelle-stitch">{stitchInfo}</span>
      {/if}
      {#if resolveResult && !resolveResult.error && resolveResult.signale.length > 0}
        <button class="quelle-expand-btn" onclick={() => expanded = !expanded} title="Signale anzeigen">
          {expanded ? '▲' : '▼'}
        </button>
      {/if}
    </div>
    {#if expanded && resolveResult && !resolveResult.error}
      <div class="quelle-resolved visible">
        {#each resolveResult.signale as s}
          {@html renderResolvedRow(s)}
        {/each}
      </div>
    {/if}
  </div>
</div>

<style>
  .quelle-cell { background: #e3f2fd; height: calc(var(--row-height) * 2 + var(--card-gap)); }
  .quelle-inner { display: flex; flex-direction: column; height: 100%; }
  .quelle-top {
    display: flex;
    align-items: center;
    flex: 1;
    border-radius: calc(var(--card-radius) - 1px) calc(var(--card-radius) - 1px) 0 0;
  }
  .quelle-datei {
    flex: 1;
    padding: 0 12px;
    border: none;
    background: transparent;
    font-size: var(--input-font-size);
    font-family: monospace;
    height: 100%;
  }
  .quelle-datei:focus { outline: none; }
  .quelle-datei::placeholder { color: var(--color-text-muted); }
  .quelle-load-btn {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 16px;
    padding: 0 8px;
    height: 100%;
    display: flex;
    align-items: center;
  }
  .quelle-info {
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
  .quelle-count { flex-shrink: 0; }
  .quelle-stitch { color: #1565c0; }
  .quelle-error { color: var(--color-red); }
  .quelle-expand-btn {
    margin-left: auto;
    background: none;
    border: none;
    cursor: pointer;
    font-size: 10px;
    color: var(--color-text-muted);
    padding: 2px 4px;
  }
  .quelle-resolved {
    border-top: 1px solid var(--color-border);
    max-height: 200px;
    overflow-y: auto;
    font-size: 11px;
    font-family: monospace;
  }
  .expanded { height: auto; }
  :global(.quelle-resolved-row) {
    padding: 2px 12px;
    border-bottom: 1px solid #eee;
  }
  :global(.quelle-resolved-row.abz) {
    color: #7b1fa2;
    font-style: italic;
  }
</style>

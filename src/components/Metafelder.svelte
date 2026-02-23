<script lang="ts">
  import type { Editordaten, Streckenmeta, Routenmeta } from '../lib/types';
  import { isStreckendaten, dateiId } from '../lib/types';
  import { STATIONEN } from '../lib/constants';

  let {
    data = $bindable(),
    onchange,
    ontabout,
  }: {
    data: Editordaten;
    onchange: () => void;
    ontabout: () => void;
  } = $props();

  let id = $derived(dateiId(data));
  let isStrecke = $derived(isStreckendaten(data));
  let streckeMeta = $derived(isStrecke ? data.meta as Streckenmeta : null);
  let routenMeta = $derived(!isStrecke ? data.meta as Routenmeta : null);

  function autoArrow(e: Event) {
    const input = e.target as HTMLInputElement;
    const pos = input.selectionStart ?? input.value.length;
    const before = input.value;
    const replaced = before.replace(/->/g, '→');
    if (replaced !== before) {
      const diff = before.length - replaced.length;
      input.value = replaced;
      input.setSelectionRange(pos - diff, pos - diff);
    }
    data.meta.name = input.value;
    onchange();
  }

  function stationPreview(code: string, example: string): string {
    if (!code) return `z.B. ${example}`;
    return STATIONEN[code.toUpperCase()] || '';
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key !== 'Tab' || e.shiftKey) return;
    const target = e.target as HTMLElement;
    const lastId = 'meta-name';
    if (target.id === lastId) {
      e.preventDefault();
      ontabout();
    }
  }
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="meta-section" onkeydown={handleKeydown}>
  <div class="section-header">
    {isStrecke ? 'Streckendaten' : 'Routendaten'}
    {#if id}
      <span class="header-id">{id}</span>
    {/if}
  </div>
  <div class="meta-grid">
    {#if isStrecke && streckeMeta}
      <div class="meta-field meta-primary">
        <label for="meta-strecke">Strecke</label>
        <span class="hl-wrap">
          <input id="meta-strecke" type="text" bind:value={streckeMeta.strecke} oninput={onchange} placeholder="z.B. 500, 112b" />
        </span>
      </div>
    {:else if routenMeta}
      <div class="meta-field meta-primary">
        <label for="meta-linie">Linie</label>
        <span class="hl-wrap">
          <input id="meta-linie" type="text" bind:value={routenMeta.linie} oninput={onchange} placeholder="z.B. s9" />
        </span>
      </div>
    {/if}
    <div class="meta-field meta-secondary">
      <label for="meta-von">Von</label>
      <span class="hl-wrap">
        <input id="meta-von" type="text" bind:value={data.meta.von} oninput={onchange} placeholder="Code" class="code-input" />
        <span class="station-preview" class:has-value={data.meta.von && STATIONEN[data.meta.von.toUpperCase()]}>{stationPreview(data.meta.von, 'OL')}</span>
      </span>
    </div>
    <div class="meta-field meta-secondary">
      <label for="meta-nach">Nach</label>
      <span class="hl-wrap">
        <input id="meta-nach" type="text" bind:value={data.meta.nach} oninput={onchange} placeholder="Code" class="code-input" />
        <span class="station-preview" class:has-value={data.meta.nach && STATIONEN[data.meta.nach.toUpperCase()]}>{stationPreview(data.meta.nach, 'AA')}</span>
      </span>
    </div>
    <div class="meta-field meta-secondary">
      <label for="meta-via">Via</label>
      <span class="hl-wrap">
        <input id="meta-via" type="text" bind:value={data.meta.via} oninput={onchange} placeholder="z.B. VL, NBS" />
      </span>
    </div>
    <div class="meta-field meta-primary">
      <label for="meta-name">Name</label>
      <span class="hl-wrap">
        <input id="meta-name" type="text" bind:value={data.meta.name} oninput={autoArrow} placeholder="z.B. Olten → Aarau" />
      </span>
    </div>
  </div>
</div>

<style>
  .meta-section {
    background: var(--color-bg);
    border: var(--card-border);
    border-radius: var(--container-radius);
    overflow: hidden;
    margin-bottom: var(--page-gap);
  }
  .meta-grid {
    display: flex;
    flex-wrap: wrap;
    gap: var(--card-gap);
    padding: var(--card-gap);
    overflow: hidden;
  }
  .meta-field {
    flex: 1;
    min-width: min(150px, 100%);
    display: flex;
    flex-direction: column;
    background: var(--color-bg-raised);
    border: var(--card-border);
    border-radius: var(--card-radius);
  }
  @media (max-width: 900px) {
    .meta-primary {
      order: 0;
      flex: 0 1 calc(50% - var(--card-gap) / 2);
    }
    .meta-secondary {
      order: 1;
    }
  }
  .meta-field label {
    font-size: var(--preview-font-size);
    font-weight: var(--weight-semibold);
    text-transform: uppercase;
    color: var(--color-text-secondary);
    padding: 8px var(--cell-padding) 4px;
    background: var(--color-bg-subtle);
    border-bottom: 1px solid var(--color-border);
    border-radius: var(--card-radius) var(--card-radius) 0 0;
  }
  .meta-field :global(.hl-wrap) {
    display: flex;
    border-radius: 0 0 var(--card-radius) var(--card-radius);
  }
  .meta-field input {
    flex: 1;
    min-width: 0;
    padding: 0 var(--cell-padding);
    border: none;
    font-size: var(--input-font-size);
    font-family: monospace;
    height: var(--unit);
    line-height: var(--unit);
    border-radius: 0 0 var(--card-radius) var(--card-radius);
  }
  .meta-field input:focus { outline: none; }
  .code-input::placeholder {
    text-transform: none;
  }

  .code-input {
    width: var(--row-height);
    flex: none !important;
    text-transform: uppercase;
    text-align: center;
  }
  .station-preview {
    flex: 1;
    min-width: 0;
    display: flex;
    align-items: center;
    padding: 0 var(--cell-padding);
    border-left: 1px solid var(--color-border);
    font-size: var(--input-font-size);
    font-family: monospace;
    color: var(--color-text-muted);
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  .station-preview.has-value {
    color: var(--color-text-secondary);
  }
  .section-header {
    display: flex;
    align-items: center;
  }
  .header-id {
    font-weight: var(--weight-normal);
    color: var(--color-text-muted);
    font-size: var(--preview-font-size);
    margin-left: auto;
    font-family: monospace;
    text-transform: uppercase;
  }
</style>

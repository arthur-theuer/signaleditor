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
  <div class="meta-grid flex flex-col sm:flex-row sm:flex-wrap gap-card p-card">
    {#if isStrecke && streckeMeta}
      <div class="meta-field sm:order-0 sm:basis-[calc(50%-var(--spacing-card)/2)] sm:grow-0 md:basis-auto md:grow">
        <label for="meta-strecke">Strecke</label>
        <span class="hl-wrap">
          <input id="meta-strecke" type="text" bind:value={streckeMeta.strecke} oninput={onchange} placeholder="z.B. 500, 112b" />
        </span>
      </div>
    {:else if routenMeta}
      <div class="meta-field sm:order-0 sm:basis-[calc(50%-var(--spacing-card)/2)] sm:grow-0 md:basis-auto md:grow">
        <label for="meta-linie">Linie</label>
        <span class="hl-wrap">
          <input id="meta-linie" type="text" bind:value={routenMeta.linie} oninput={onchange} placeholder="z.B. s9" />
        </span>
      </div>
    {/if}
    <div class="meta-field sm:order-1 md:order-none">
      <label for="meta-von">Von</label>
      <span class="hl-wrap">
        <input id="meta-von" type="text" bind:value={data.meta.von} oninput={onchange} placeholder="Code" class="code-input" />
        <span class="station-preview" class:has-value={data.meta.von && STATIONEN[data.meta.von.toUpperCase()]}>{stationPreview(data.meta.von, 'OL')}</span>
      </span>
    </div>
    <div class="meta-field sm:order-1 md:order-none">
      <label for="meta-nach">Nach</label>
      <span class="hl-wrap">
        <input id="meta-nach" type="text" bind:value={data.meta.nach} oninput={onchange} placeholder="Code" class="code-input" />
        <span class="station-preview" class:has-value={data.meta.nach && STATIONEN[data.meta.nach.toUpperCase()]}>{stationPreview(data.meta.nach, 'AA')}</span>
      </span>
    </div>
    <div class="meta-field sm:order-1 md:order-none">
      <label for="meta-via">Via</label>
      <span class="hl-wrap">
        <input id="meta-via" type="text" bind:value={data.meta.via} oninput={onchange} placeholder="z.B. VL, NBS" />
      </span>
    </div>
    <div class="meta-field sm:order-0 sm:basis-[calc(50%-var(--spacing-card)/2)] sm:grow-0 md:basis-auto md:grow">
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
    border-radius: var(--radius-container);
    overflow: hidden;
    margin-bottom: var(--spacing-page);
  }
  .meta-field {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    background: var(--color-bg-raised);
    border: var(--card-border);
    border-radius: var(--radius-card);
  }
  .meta-field label {
    font-size: var(--text-preview);
    font-weight: var(--font-weight-semibold);
    text-transform: uppercase;
    color: var(--color-text-secondary);
    padding: 8px var(--spacing-cell) 4px;
    background: var(--color-bg-subtle);
    border-bottom: 1px solid var(--color-border);
    border-radius: var(--radius-card) var(--radius-card) 0 0;
  }
  .meta-field :global(.hl-wrap) {
    display: flex;
    border-radius: 0 0 var(--radius-card) var(--radius-card);
  }
  .meta-field input {
    flex: 1;
    min-width: 0;
    padding: 0 var(--spacing-cell);
    border: none;
    font-size: var(--text-input);
    font-family: monospace;
    height: var(--spacing-unit);
    line-height: var(--spacing-unit);
    border-radius: 0 0 var(--radius-card) var(--radius-card);
  }
  .meta-field input:focus { outline: none; }
  .code-input::placeholder {
    text-transform: none;
  }

  .code-input {
    width: var(--spacing-row);
    flex: none !important;
    text-transform: uppercase;
    text-align: center;
  }
  .station-preview {
    flex: 1;
    min-width: 0;
    display: flex;
    align-items: center;
    padding: 0 var(--spacing-cell);
    border-left: 1px solid var(--color-border);
    font-size: var(--text-input);
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
    font-weight: var(--font-weight-normal);
    color: var(--color-text-muted);
    font-size: var(--text-preview);
    margin-left: auto;
    font-family: monospace;
    text-transform: uppercase;
  }
</style>

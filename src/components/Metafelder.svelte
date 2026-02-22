<script lang="ts">
  import type { Editordaten } from '../lib/types';
  import { isVideodaten, dateiId } from '../lib/types';
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
  let isVideo = $derived(isVideodaten(data));

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
    const lastId = isVideo ? 'meta-video' : 'meta-name';
    if (target.id === lastId) {
      e.preventDefault();
      ontabout();
    }
  }
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="meta-section" onkeydown={handleKeydown}>
  <div class="section-header">
    {isVideo ? 'Video' : 'Strecke'}
    {#if id}
      <span class="header-id">{id}</span>
    {/if}
  </div>
  <div class="meta-grid">
    {#if isVideo}
      <div class="meta-field">
        <label for="meta-streckennummer">Streckennummer</label>
        <span class="hl-wrap">
          <input id="meta-streckennummer" type="text" bind:value={data.meta.streckennummer} oninput={onchange} placeholder="z.B. 500, 112b" />
        </span>
      </div>
    {:else}
      <div class="meta-field">
        <label for="meta-linie">Linie</label>
        <span class="hl-wrap">
          <input id="meta-linie" type="text" bind:value={data.meta.linie} oninput={onchange} placeholder="z.B. s9" />
        </span>
      </div>
    {/if}
    <div class="meta-field">
      <label for="meta-von">Von</label>
      <span class="hl-wrap">
        <input id="meta-von" type="text" bind:value={data.meta.von} oninput={onchange} placeholder="Code" class="code-input" />
        <span class="station-preview" class:has-value={data.meta.von && STATIONEN[data.meta.von.toUpperCase()]}>{stationPreview(data.meta.von, 'OL')}</span>
      </span>
    </div>
    <div class="meta-field">
      <label for="meta-nach">Nach</label>
      <span class="hl-wrap">
        <input id="meta-nach" type="text" bind:value={data.meta.nach} oninput={onchange} placeholder="Code" class="code-input" />
        <span class="station-preview" class:has-value={data.meta.nach && STATIONEN[data.meta.nach.toUpperCase()]}>{stationPreview(data.meta.nach, 'AA')}</span>
      </span>
    </div>
    <div class="meta-field">
      <label for="meta-via">Via</label>
      <span class="hl-wrap">
        <input id="meta-via" type="text" bind:value={data.meta.via} oninput={onchange} placeholder="z.B. VL, NBS" />
      </span>
    </div>
    <div class="meta-field">
      <label for="meta-name">Name</label>
      <span class="hl-wrap">
        <input id="meta-name" type="text" bind:value={data.meta.name} oninput={autoArrow} placeholder="z.B. Olten → Aarau" />
      </span>
    </div>
    {#if isVideo}
      <div class="meta-field">
        <label for="meta-video">Video</label>
        <span class="hl-wrap">
          <input id="meta-video" type="text" bind:value={data.meta.video} oninput={onchange} placeholder="URL" />
        </span>
      </div>
    {/if}

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
    gap: var(--card-gap);
    padding: var(--card-gap);
  }
  .meta-field {
    flex: 1;
    display: flex;
    flex-direction: column;
    background: var(--color-bg-raised);
    border: var(--card-border);
    border-radius: var(--card-radius);
  }
  .meta-field label {
    font-size: var(--preview-font-size);
    font-weight: var(--weight-semibold);
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
  }
</style>

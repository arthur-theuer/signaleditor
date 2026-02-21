<script lang="ts">
  import type { Editordaten } from '../lib/types';
  import { isVideodaten, dateiId } from '../lib/types';
  import { STATIONEN } from '../lib/constants';

  let {
    data = $bindable(),
    onchange,
  }: {
    data: Editordaten;
    onchange: () => void;
  } = $props();

  let id = $derived(dateiId(data));
  let isVideo = $derived(isVideodaten(data));

  function autoArrow(e: Event) {
    const input = e.target as HTMLInputElement;
    input.value = input.value.replace(/->/g, '→');
    data.meta.name = input.value;
    onchange();
  }

  function stationPreview(code: string): string {
    return STATIONEN[code.toUpperCase()] || '';
  }
</script>

<div class="meta-section">
  <div class="section-header">{isVideo ? 'Video' : 'Strecke'}</div>
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
        <input id="meta-von" type="text" bind:value={data.meta.von} oninput={onchange} placeholder="z.B. OL" class="code-input" />
        <span class="station-preview">{stationPreview(data.meta.von)}</span>
      </span>
    </div>
    <div class="meta-field">
      <label for="meta-nach">Nach</label>
      <span class="hl-wrap">
        <input id="meta-nach" type="text" bind:value={data.meta.nach} oninput={onchange} placeholder="z.B. AA" class="code-input" />
        <span class="station-preview">{stationPreview(data.meta.nach)}</span>
      </span>
    </div>
    {#if !isVideo}
      <div class="meta-field">
        <label for="meta-via">Via</label>
        <span class="hl-wrap">
          <input id="meta-via" type="text" bind:value={data.meta.via} oninput={onchange} placeholder="z.B. OL, LB" />
        </span>
      </div>
    {/if}
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
    <div class="meta-field meta-field-id">
      <!-- svelte-ignore a11y_label_has_associated_control -->
      <label>ID</label>
      <span class="id-preview">{id || '–'}</span>
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
    font-size: 11px;
    font-weight: 600;
    color: var(--color-text-secondary);
    padding: 8px 12px 4px;
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
    padding: 0 12px;
    border: none;
    font-size: var(--input-font-size);
    font-family: monospace;
    height: var(--unit);
    line-height: var(--unit);
    border-radius: 0 0 var(--card-radius) var(--card-radius);
  }
  .meta-field input:focus { outline: none; }
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
    padding: 0 12px;
    border-left: 1px solid var(--color-border);
    font-size: var(--input-font-size);
    font-family: monospace;
    color: var(--color-text-muted);
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  .meta-field-id {
    min-width: 0;
  }
  .id-preview {
    display: flex;
    align-items: center;
    padding: 0 12px;
    height: var(--unit);
    font-size: var(--input-font-size);
    font-family: monospace;
    color: var(--color-text-muted);
    white-space: nowrap;
  }
</style>

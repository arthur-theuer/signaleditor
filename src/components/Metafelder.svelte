<script lang="ts">
  import type { Strecke } from '../lib/types';

  let {
    strecke = $bindable(),
    onchange,
  }: {
    strecke: Strecke;
    onchange: () => void;
  } = $props();

  let videosText = $derived(strecke.streckenvideos.join(', '));

  function handleVideosInput(e: Event) {
    const value = (e.target as HTMLInputElement).value;
    strecke.streckenvideos = value.split(',').map(v => v.trim()).filter(v => v);
    onchange();
  }
</script>

<div class="meta-section">
  <div class="section-header">Strecke</div>
  <div class="meta-grid">
    <div class="meta-field">
      <label for="meta-id">Strecken-ID</label>
      <span class="hl-wrap">
        <input id="meta-id" type="text" bind:value={strecke.id} oninput={onchange} placeholder="z.B. s5_pf_zg" />
      </span>
    </div>
    <div class="meta-field">
      <label for="meta-name">Streckenname</label>
      <span class="hl-wrap">
        <input id="meta-name" type="text" bind:value={strecke.name} oninput={onchange} placeholder="z.B. Pfäffikon SZ → Zug" />
      </span>
    </div>
    <div class="meta-field">
      <label for="meta-linie">Linie</label>
      <span class="hl-wrap">
        <input id="meta-linie" type="text" bind:value={strecke.linie} oninput={onchange} placeholder="z.B. S5, S14" />
      </span>
    </div>
    <div class="meta-field">
      <label for="meta-videos">Streckenvideos</label>
      <span class="hl-wrap">
        <input id="meta-videos" type="text" value={videosText} oninput={handleVideosInput} placeholder="z.B. 752b, 652" />
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
</style>

<script lang="ts">
  import type { Knoteneintrag } from '../../lib/types';
  import { stationName } from '../../lib/station-search';
  import Stationsfeld from '../ui/Stationsfeld.svelte';

  let {
    eintrag = $bindable(),
    onchange,
  }: {
    eintrag: Knoteneintrag;
    onchange: () => void;
  } = $props();

  let name = $derived(stationName(eintrag.knoten));
  let error = $derived(!!eintrag.knoten && !name);
  let inputEl: HTMLInputElement | undefined = $state();
</script>

<div class="knoten-group">
  <div class="row-cell knoten-code-cell" onclick={() => inputEl?.focus()}>
    <span class={['knoten-code', { valid: !!name }]}>{eintrag.knoten || 'Code'}</span>
  </div>
  <div class={['row-cell knoten-search-cell hl-field', { error }]}>
    <Stationsfeld mode="code" bind:value={eintrag.knoten} bind:inputEl placeholder="z.B. Zürich" {onchange} />
  </div>
</div>

<style>
  .knoten-group {
    display: flex;
    gap: var(--spacing-card);
    min-width: 0;
  }
  .knoten-code-cell {
    background: var(--color-knoten);
    width: calc(2 * var(--spacing-unit));
    flex: none;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }
  .knoten-code {
    font-size: var(--text-input);
    font-family: var(--font-mono);
    color: var(--color-text-muted);
  }
  .knoten-code.valid {
    color: var(--color-text);
  }
  .knoten-search-cell {
    background: var(--color-knoten);
  }
</style>

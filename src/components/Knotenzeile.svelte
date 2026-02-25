<script lang="ts">
  import type { Knoteneintrag } from '../lib/types';
  import Stationsfeld from './ui/Stationsfeld.svelte';

  let {
    eintrag = $bindable(),
    onchange,
  }: {
    eintrag: Knoteneintrag;
    onchange: () => void;
  } = $props();
</script>

<div class="signal-cell knoten-cell">
  <div class="knoten-search-wrapper hl-field">
    <Stationsfeld mode="code" bind:value={eintrag.knoten} placeholder="z.B. Zürich" onchange={onchange} />
  </div>
</div>

<style>
  .knoten-cell { background: var(--color-knoten); overflow: visible; }
  .knoten-search-wrapper {
    flex: 1;
    min-width: 0;
    display: flex;
    height: 100%;
    border-radius: var(--radius-inner);
  }
</style>

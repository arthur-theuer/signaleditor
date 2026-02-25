<script lang="ts">
  import type { Knoteneintrag } from '../lib/types';
  import Stationssuche from './ui/Stationssuche.svelte';

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
    <Stationssuche bind:code={eintrag.knoten} placeholder="z.B. Zürich" onchange={onchange} />
  </div>
</div>

<style>
  .knoten-cell { background: var(--color-knoten); }
  .knoten-search-wrapper {
    flex: 1;
    min-width: 0;
    display: flex;
    height: 100%;
    border-radius: var(--radius-inner);
  }
</style>

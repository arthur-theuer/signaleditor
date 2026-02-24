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
  <div class="knoten-inner">
    <div class="knoten-search-wrapper hl-wrap">
      <Stationssuche bind:code={eintrag.knoten} placeholder="z.B. Zürich" onchange={onchange} />
    </div>
  </div>
</div>

<style>
  .knoten-cell { background: var(--color-knoten); }
  .knoten-inner { display: flex; height: 100%; }
  .knoten-search-wrapper {
    flex: 1;
    min-width: 0;
    display: flex;
    height: 100%;
    border-radius: calc(var(--radius-card) - 1px);
  }
</style>

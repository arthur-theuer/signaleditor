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

<div class="row-cell knoten-cell hl-field">
  <Stationsfeld mode="code" bind:value={eintrag.knoten} placeholder="z.B. Zürich" {onchange} />
</div>

<style>
  .knoten-cell {
    background: var(--color-knoten);
    overflow: visible;
  }
</style>

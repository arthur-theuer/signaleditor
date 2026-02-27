<script lang="ts">
  import Plusleiste from './Plusleiste.svelte';

  let {
    onInsertSignal,
    onInsertNotiz,
    onInsertAbzweigung,
    onInsertKnoten,
    onInsertImport,
  }: {
    onInsertSignal: () => void;
    onInsertNotiz: () => void;
    onInsertAbzweigung: () => void;
    onInsertKnoten: () => void;
    onInsertImport: () => void;
  } = $props();

  let open = $state(false);
  let zoneEl: HTMLDivElement;

  $effect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (!zoneEl.contains(e.target as Node)) open = false;
    }
    function handleKeydown(e: KeyboardEvent) {
      if (e.key === 'Escape') open = false;
    }
    document.addEventListener('click', handleClick, true);
    document.addEventListener('keydown', handleKeydown);
    return () => {
      document.removeEventListener('click', handleClick, true);
      document.removeEventListener('keydown', handleKeydown);
    };
  });
</script>

<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
<div class="insert-zone" class:open bind:this={zoneEl}>
  {#if open}
    <Plusleiste
      onAddSignal={onInsertSignal}
      onAddNotiz={onInsertNotiz}
      onAddAbzweigung={onInsertAbzweigung}
      onAddKnoten={onInsertKnoten}
      onAddImport={onInsertImport}
    />
  {:else}
    <div class="insert-line" onclick={() => (open = true)}></div>
  {/if}
</div>

<style>
  .insert-zone {
    position: relative;
    height: 0;
    z-index: 4;
  }
  .insert-zone.open {
    height: auto;
  }
  .insert-line {
    position: absolute;
    left: var(--spacing-card);
    right: var(--spacing-card);
    top: -1px;
    height: 2px;
    border-radius: 1px;
    cursor: pointer;
    opacity: 0;
    background: var(--color-focus);
    transition: opacity 0.15s;
  }
  .insert-zone:hover .insert-line {
    opacity: 1;
  }
</style>

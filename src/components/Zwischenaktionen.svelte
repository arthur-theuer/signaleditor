<script lang="ts">
  import { CirclePlus } from 'lucide-svelte';
  import { ICON } from '../lib/constants';
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
    <div class="insert-trigger" onclick={() => (open = true)}>
      <div class="insert-line"></div>
      <div class="insert-btn"><CirclePlus {...ICON} /></div>
    </div>
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
  .insert-trigger {
    position: absolute;
    left: 0;
    right: 0;
    top: -10px;
    height: 20px;
    cursor: pointer;
    display: flex;
    align-items: center;
  }
  .insert-line {
    position: absolute;
    left: var(--spacing-card);
    right: var(--spacing-card);
    height: 2px;
    border-radius: 1px;
    background: var(--color-focus);
    opacity: 0;
    transition: opacity 0.15s;
  }
  .insert-btn {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    color: var(--color-focus);
    opacity: 0;
    transition: opacity 0.15s;
    line-height: 0;
  }
  .insert-trigger:hover .insert-line,
  .insert-trigger:hover .insert-btn {
    opacity: 1;
  }
</style>

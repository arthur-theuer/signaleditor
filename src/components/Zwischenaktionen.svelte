<script lang="ts">
  import { CirclePlus } from 'lucide-svelte';
  import { on } from 'svelte/events';
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
    const offClick = on(document, 'click', (e) => {
      if (!zoneEl.contains(e.target as Node)) open = false;
    }, { capture: true });
    const offKey = on(document, 'keydown', (e) => {
      if (e.key === 'Escape') open = false;
    });
    return () => { offClick(); offKey(); };
  });
</script>

<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
<div class="insert-wrapper" bind:this={zoneEl}>
  {#if !open}
    <div class="insert-trigger" onclick={() => (open = true)}>
      <div class="insert-line"></div>
      <div class="insert-btn"><CirclePlus size={ICON.size} strokeWidth={3} /></div>
    </div>
  {/if}
  <div class={['insert-zone', { open }]}>
    <div class="insert-content">
      <Plusleiste
        onAddSignal={onInsertSignal}
        onAddNotiz={onInsertNotiz}
        onAddAbzweigung={onInsertAbzweigung}
        onAddKnoten={onInsertKnoten}
        onAddImport={onInsertImport}
      />
    </div>
  </div>
</div>

<style>
  .insert-wrapper {
    position: relative;
    z-index: 4;
  }
  .insert-zone {
    display: grid;
    grid-template-rows: 0fr;
    transition: grid-template-rows 150ms ease;
  }
  .insert-zone.open {
    grid-template-rows: 1fr;
  }
  .insert-content {
    overflow: hidden;
  }
  .insert-trigger {
    --inset-left: calc(2 * var(--spacing-card) + var(--spacing-unit));
    --inset-right: calc(3 * var(--spacing-card) + 2 * var(--spacing-unit));
    position: absolute;
    left: 0;
    right: 0;
    top: calc(-1 * var(--spacing-half-card));
    height: var(--spacing-card);
    cursor: pointer;
  }
  @media (max-width: 639px) {
    .insert-trigger {
      --inset-right: var(--inset-left);
    }
  }
  .insert-line {
    position: absolute;
    left: var(--inset-left);
    right: var(--inset-right);
    top: 50%;
    transform: translateY(-50%);
    height: 2px;
    border-radius: 1px;
    background: var(--color-focus);
    opacity: 0;
    transition: opacity 0.15s;
  }
  .insert-btn {
    position: absolute;
    left: calc(var(--inset-left) + (100% - var(--inset-left) - var(--inset-right)) / 2);
    top: 50%;
    transform: translate(-50%, -50%);
    color: var(--color-focus);
    background: var(--color-bg);
    border-radius: 50%;
    opacity: 0;
    transition: opacity 0.15s;
    line-height: 0;
    padding: 1px;
  }
  .insert-trigger:hover .insert-line,
  .insert-trigger:hover .insert-btn {
    opacity: 1;
  }
</style>

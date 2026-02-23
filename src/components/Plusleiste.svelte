<script lang="ts">
  import { DiamondPlus, SquarePen, Share2, Crosshair, Import } from 'lucide-svelte';

  let {
    onAddSignal,
    onAddNotiz,
    onAddAbzweigung,
    onAddKnoten,
    onAddImport,
    compact = 0,
    ontruncate,
  }: {
    onAddSignal: () => void;
    onAddNotiz: () => void;
    onAddAbzweigung: () => void;
    onAddKnoten: () => void;
    onAddImport: () => void;
    compact?: number;
    ontruncate?: (tier: number) => void;
  } = $props();

  let barEl = $state<HTMLElement | null>(null);
  let lastTier = -1;

  $effect(() => {
    const el = barEl;
    if (!el) { if (lastTier !== 0) { lastTier = 0; ontruncate?.(0); } return; }

    function check() {
      // If any button's content overflows, switch to icon-only
      const tier = el!.scrollWidth > el!.clientWidth ? 1 : 0;
      if (tier !== lastTier) { lastTier = tier; ontruncate?.(tier); }
    }

    const ro = new ResizeObserver(check);
    ro.observe(el);
    check();

    return () => { ro.disconnect(); if (lastTier !== 0) { lastTier = 0; ontruncate?.(0); } };
  });
</script>

<div class="add-bar-wrapper">
<!-- Hidden measurement bar to detect overflow -->
<div class="add-bar add-bar-measure" bind:this={barEl} aria-hidden="true">
  <span class="measure-btn">Signal</span>
  <span class="measure-btn">Notiz</span>
  <span class="measure-btn">Abzweigung</span>
  <span class="measure-btn">Knoten</span>
  <span class="measure-btn">Import</span>
</div>
<div class="add-bar" class:icon-only={compact >= 1}>
  <button class="add-signal hl" onclick={onAddSignal}><DiamondPlus size={16} strokeWidth={2.5} /><span>Signal</span></button>
  <button class="add-note hl" onclick={onAddNotiz}><SquarePen size={16} strokeWidth={2.5} /><span>Notiz</span></button>
  <button class="add-abzweigung hl" onclick={onAddAbzweigung}><Share2 size={16} strokeWidth={2.5} /><span>Abzweigung</span></button>
  <button class="add-knoten hl" onclick={onAddKnoten}><Crosshair size={16} strokeWidth={2.5} /><span>Knoten</span></button>
  <button class="add-import hl" onclick={onAddImport}><Import size={16} strokeWidth={2.5} /><span>Import</span></button>
</div>
</div>

<style>
  .add-bar {
    display: flex;
    gap: var(--card-gap);
    margin: var(--half-gap) var(--card-gap);
  }
  .add-bar button {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    height: calc(var(--row-height) / 2 - var(--card-gap) / 2);
    padding: 0 var(--cell-padding);
    border-radius: var(--card-radius);
    cursor: pointer;
    font-weight: var(--weight-semibold);
    font-size: var(--input-font-size);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-sm);
  }
  .add-signal {
    background: var(--color-bg-raised);
    color: var(--color-text-secondary);
    border: 1px solid var(--color-text-muted);
  }
  .add-note {
    background: var(--color-highlight);
    color: var(--color-highlight-text);
    border: 1px solid var(--color-highlight-text);
  }
  .add-abzweigung {
    background: var(--color-abzweigung);
    color: var(--color-abzweigung-text);
    border: 1px solid var(--color-abzweigung-text);
  }
  .add-knoten {
    background: var(--color-knoten);
    color: var(--color-knoten-text);
    border: 1px solid var(--color-knoten-text);
  }
  .add-import {
    background: var(--color-import);
    color: var(--color-import-text);
    border: 1px solid var(--color-import-text);
  }
  .add-bar-wrapper {
    position: relative;
  }
  .add-bar-measure {
    position: absolute;
    left: 0;
    right: 0;
    visibility: hidden;
    pointer-events: none;
    height: 0;
  }
  .measure-btn {
    flex: 1;
    padding: 0 var(--cell-padding);
    font-weight: var(--weight-semibold);
    font-size: var(--input-font-size);
    white-space: nowrap;
  }
  .icon-only button span { display: none; }
</style>

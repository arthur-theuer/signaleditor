<script lang="ts">
  import { DiamondPlus, SquarePen, Share2, Crosshair, FilePlus } from 'lucide-svelte';

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
</script>

<div class="insert-zone">
  <div class="insert-zone-target">
    <button class="insert-signal hl" onclick={onInsertSignal} tabindex={-1} title="Signal einfügen"><DiamondPlus size={16} strokeWidth={1.5} /></button>
    <button class="insert-note hl" onclick={onInsertNotiz} tabindex={-1} title="Notiz einfügen"><SquarePen size={16} strokeWidth={1.5} /></button>
    <button class="insert-abzweigung hl" onclick={onInsertAbzweigung} tabindex={-1} title="Abzweigung einfügen"><Share2 size={16} strokeWidth={1.5} /></button>
    <button class="insert-knoten hl" onclick={onInsertKnoten} tabindex={-1} title="Knoten einfügen"><Crosshair size={16} strokeWidth={1.5} /></button>
    <button class="insert-import hl" onclick={onInsertImport} tabindex={-1} title="Import einfügen"><FilePlus size={16} strokeWidth={1.5} /></button>
  </div>
</div>

<style>
  .insert-zone {
    position: relative;
    height: 0;
    z-index: 4;
  }
  .insert-zone-target {
    position: absolute;
    left: 50%;
    transform: translate(-50%, -50%);
    height: calc((var(--spacing-row) - var(--spacing-card)) / 2);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-card);
  }
  .insert-zone-target button {
    opacity: 0;
    pointer-events: none;
    width: calc((var(--spacing-row) - var(--spacing-card)) / 2);
    height: calc((var(--spacing-row) - var(--spacing-card)) / 2);
    display: flex;
    align-items: center;
    justify-content: center;
    border: var(--card-border);
    border-radius: var(--radius-card);
    cursor: pointer;
  }
  .insert-zone-target:hover button {
    opacity: 1;
    pointer-events: auto;
  }
  .insert-zone-target button:focus { outline: none; }
  .insert-signal { background: var(--color-bg-raised); color: var(--color-text-secondary); border-color: var(--color-text-muted); }
  .insert-note { background: var(--color-highlight); color: var(--color-highlight-text); border-color: var(--color-highlight-text); }
  .insert-abzweigung { background: var(--color-abzweigung); color: var(--color-abzweigung-text); border-color: var(--color-abzweigung-text); }
  .insert-knoten { background: var(--color-knoten); color: var(--color-knoten-text); border-color: var(--color-knoten-text); }
  .insert-import { background: var(--color-import); color: var(--color-import-text); border-color: var(--color-import-text); }
</style>

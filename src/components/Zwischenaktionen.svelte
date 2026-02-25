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
    <button class="insert-signal btn" onclick={onInsertSignal} tabindex={-1} title="Signal einfügen"><DiamondPlus size={16} strokeWidth={1.5} /></button>
    <button class="insert-note btn" onclick={onInsertNotiz} tabindex={-1} title="Notiz einfügen"><SquarePen size={16} strokeWidth={1.5} /></button>
    <button class="insert-abzweigung btn" onclick={onInsertAbzweigung} tabindex={-1} title="Abzweigung einfügen"><Share2 size={16} strokeWidth={1.5} /></button>
    <button class="insert-knoten btn" onclick={onInsertKnoten} tabindex={-1} title="Knoten einfügen"><Crosshair size={16} strokeWidth={1.5} /></button>
    <button class="insert-import btn" onclick={onInsertImport} tabindex={-1} title="Import einfügen"><FilePlus size={16} strokeWidth={1.5} /></button>
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
    height: var(--spacing-unit);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-card);
  }
  /* Extends .btn — hidden until parent hover */
  .insert-zone-target button {
    opacity: 0;
    pointer-events: none;
    width: var(--spacing-unit);
    height: var(--spacing-unit);
  }
  .insert-zone-target:hover button {
    opacity: 1;
    pointer-events: auto;
  }
  .insert-zone-target button:focus { outline: none; }
  .insert-signal { background: var(--color-bg-raised); color: var(--color-text-secondary); }
  .insert-note { background: var(--color-highlight); color: var(--color-highlight-text); }
  .insert-abzweigung { background: var(--color-abzweigung); color: var(--color-abzweigung-text); }
  .insert-knoten { background: var(--color-knoten); color: var(--color-knoten-text); }
  .insert-import { background: var(--color-import); color: var(--color-import-text); }
</style>

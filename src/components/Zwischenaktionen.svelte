<script lang="ts">
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
    <button class="insert-signal hl" onclick={onInsertSignal} tabindex={-1} title="Signal einfügen">S</button>
    <button class="insert-note hl" onclick={onInsertNotiz} tabindex={-1} title="Notiz einfügen">N</button>
    <button class="insert-abzweigung hl" onclick={onInsertAbzweigung} tabindex={-1} title="Abzweigung einfügen">A</button>
    <button class="insert-knoten hl" onclick={onInsertKnoten} tabindex={-1} title="Knoten einfügen">K</button>
    <button class="insert-import hl" onclick={onInsertImport} tabindex={-1} title="Import einfügen">I</button>
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
    height: calc((var(--row-height) - var(--card-gap)) / 2);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--card-gap);
  }
  .insert-zone-target button {
    opacity: 0;
    pointer-events: none;
    width: calc((var(--row-height) - var(--card-gap)) / 2);
    height: calc((var(--row-height) - var(--card-gap)) / 2);
    font-size: 16px;
    font-weight: 700;
    border: var(--card-border);
    border-radius: var(--card-radius);
    cursor: pointer;
  }
  .insert-zone-target:hover button {
    opacity: 1;
    pointer-events: auto;
  }
  .insert-zone-target button:focus { outline: none; }
  .insert-signal { background: var(--color-bg-raised); color: var(--color-text-secondary); }
  .insert-note { background: var(--color-highlight); color: #f57f17; border-color: #f9a825; }
  .insert-abzweigung { background: #f3e5f5; color: #7b1fa2; border-color: #ba68c8; }
  .insert-knoten { background: #e0f2f1; color: #00695c; border-color: #4db6ac; }
  .insert-import { background: #e3f2fd; color: #1565c0; border-color: #64b5f6; }
</style>

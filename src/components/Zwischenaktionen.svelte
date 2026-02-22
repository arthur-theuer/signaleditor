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
    font-size: var(--input-font-size);
    font-weight: var(--weight-semibold);
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
  .insert-note { background: var(--color-highlight); color: var(--color-highlight-text); border-color: var(--color-highlight-text); }
  .insert-abzweigung { background: var(--color-abzweigung); color: var(--color-abzweigung-text); border-color: var(--color-abzweigung-text); }
  .insert-knoten { background: var(--color-knoten); color: var(--color-knoten-text); border-color: var(--color-knoten-text); }
  .insert-import { background: var(--color-import); color: var(--color-import-text); border-color: var(--color-import-text); }
</style>

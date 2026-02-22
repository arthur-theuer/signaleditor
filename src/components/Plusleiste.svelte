<script lang="ts">
  let {
    onAddSignal,
    onAddNotiz,
    onAddAbzweigung,
    onAddKnoten,
    onAddImport,
  }: {
    onAddSignal: () => void;
    onAddNotiz: () => void;
    onAddAbzweigung: () => void;
    onAddKnoten: () => void;
    onAddImport: () => void;
  } = $props();
</script>

<div class="add-bar">
  <button class="add-signal hl" onclick={onAddSignal}>+ Signal</button>
  <button class="add-note hl" onclick={onAddNotiz}>+ Notiz</button>
  <button class="add-abzweigung hl" onclick={onAddAbzweigung}>+ Abzweigung</button>
  <button class="add-knoten hl" onclick={onAddKnoten}>+ Knoten</button>
  <button class="add-import hl" onclick={onAddImport}>+ Import</button>
</div>

<style>
  .add-bar {
    display: flex;
    gap: var(--card-gap);
    margin: var(--half-gap) var(--card-gap);
  }
  .add-bar button {
    flex: 1;
    padding: var(--cell-padding);
    border-radius: var(--card-radius);
    cursor: pointer;
    font-weight: var(--weight-semibold);
    font-size: var(--input-font-size);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
  }
  .add-signal {
    background: var(--color-bg-raised);
    color: var(--color-text-secondary);
    border: var(--card-border);
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
</style>

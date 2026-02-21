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
    padding: 12px;
    border-radius: var(--card-radius);
    cursor: pointer;
    font-weight: 600;
    font-size: 14px;
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
    color: #f57f17;
    border: 1px solid #f9a825;
  }
  .add-abzweigung {
    background: #f3e5f5;
    color: #7b1fa2;
    border: 1px solid #ba68c8;
  }
  .add-knoten {
    background: #e0f2f1;
    color: #00695c;
    border: 1px solid #4db6ac;
  }
  .add-import {
    background: #e3f2fd;
    color: #1565c0;
    border: 1px solid #64b5f6;
  }
</style>

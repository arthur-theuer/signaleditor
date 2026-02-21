<script lang="ts">
  let {
    onInsertSignal,
    onInsertNotiz,
    onInsertAbzweigung,
    onInsertKnoten,
    onInsertQuelle,
  }: {
    onInsertSignal: () => void;
    onInsertNotiz: () => void;
    onInsertAbzweigung: () => void;
    onInsertKnoten: () => void;
    onInsertQuelle: () => void;
  } = $props();
</script>

<div class="insert-zone">
  <div class="insert-zone-target">
    <button class="insert-signal hl" onclick={onInsertSignal}>+ Signal</button>
    <button class="insert-note hl" onclick={onInsertNotiz}>+ Notiz</button>
    <button class="insert-abzweigung hl" onclick={onInsertAbzweigung}>+ Abzw.</button>
    <button class="insert-knoten hl" onclick={onInsertKnoten}>+ Knoten</button>
    <button class="insert-quelle hl" onclick={onInsertQuelle}>+ Quelle</button>
  </div>
</div>

<style>
  .insert-zone {
    height: 0;
    position: relative;
    z-index: 5;
    margin: 0 var(--card-gap);
  }
  .insert-zone-target {
    position: absolute;
    top: -12px;
    left: 0;
    right: 0;
    height: 24px;
    display: flex;
    gap: 4px;
    justify-content: center;
    align-items: center;
    opacity: 0;

    pointer-events: none;
  }
  .insert-zone:hover .insert-zone-target {
    opacity: 1;
    pointer-events: auto;
  }
  .insert-zone-target button {
    font-size: 11px;
    font-weight: 600;
    padding: 2px 10px;
    border-radius: 10px;
    cursor: pointer;
    white-space: nowrap;
  }
  .insert-signal { background: var(--color-bg-raised); color: var(--color-text-secondary); border: var(--card-border); }
  .insert-note { background: var(--color-highlight); color: #f57f17; border-color: #f9a825; }
  .insert-abzweigung { background: #f3e5f5; color: #7b1fa2; border-color: #ba68c8; }
  .insert-knoten { background: #e0f2f1; color: #00695c; border-color: #4db6ac; }
  .insert-quelle { background: #e3f2fd; color: #1565c0; border-color: #64b5f6; }
</style>

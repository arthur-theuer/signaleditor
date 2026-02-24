<script lang="ts">
  import { DiamondPlus, SquarePen, Share2, Crosshair, FilePlus } from 'lucide-svelte';

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
  <button class="add-signal hl" onclick={onAddSignal}><DiamondPlus size={16} strokeWidth={1.5} /><span class="tier-full">Signal</span><span class="tier-medium">Sig.</span></button>
  <button class="add-note hl" onclick={onAddNotiz}><SquarePen size={16} strokeWidth={1.5} /><span class="tier-full">Notiz</span><span class="tier-medium">Not.</span></button>
  <button class="add-abzweigung hl" onclick={onAddAbzweigung}><Share2 size={16} strokeWidth={1.5} /><span class="tier-full">Abzweigung</span><span class="tier-medium">Abzw.</span></button>
  <button class="add-knoten hl" onclick={onAddKnoten}><Crosshair size={16} strokeWidth={1.5} /><span class="tier-full">Knoten</span><span class="tier-medium">Kn.</span></button>
  <button class="add-import hl" onclick={onAddImport}><FilePlus size={16} strokeWidth={1.5} /><span class="tier-full">Import</span><span class="tier-medium">Imp.</span></button>
</div>

<style>
  .add-bar {
    display: flex;
    gap: var(--spacing-card);
    margin: var(--spacing-half-card) var(--spacing-card);
  }
  .add-bar button {
    flex: 1;
    min-width: 0;
    height: calc(var(--spacing-row) / 2 - var(--spacing-card) / 2);
    padding: 0 var(--spacing-cell);
    border: var(--card-border);
    border-radius: var(--radius-card);
    cursor: pointer;
    font-weight: var(--font-weight-semibold);
    font-size: var(--text-input);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-sm);
    container-type: inline-size;
  }
  .add-bar button :global(svg) {
    flex-shrink: 0;
  }
  .add-signal {
    background: var(--color-bg-raised);
    color: var(--color-text-secondary);
    border-color: var(--color-text-muted);
  }
  .add-note {
    background: var(--color-highlight);
    color: var(--color-highlight-text);
    border-color: var(--color-highlight-text);
  }
  .add-abzweigung {
    background: var(--color-abzweigung);
    color: var(--color-abzweigung-text);
    border-color: var(--color-abzweigung-text);
  }
  .add-knoten {
    background: var(--color-knoten);
    color: var(--color-knoten-text);
    border-color: var(--color-knoten-text);
  }
  .add-import {
    background: var(--color-import);
    color: var(--color-import-text);
    border-color: var(--color-import-text);
  }
  /* Tier visibility: narrow (icon only) by default, wider tiers override */
  .tier-full, .tier-medium { display: none; }

  @container (min-width: 60px) {
    .tier-medium { display: inline; }
  }

  @container (min-width: 100px) {
    .tier-full { display: inline; }
    .tier-medium { display: none; }
  }
</style>

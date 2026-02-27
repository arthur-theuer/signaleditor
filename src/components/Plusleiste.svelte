<script lang="ts">
  import { DiamondPlus, SquarePen, Share2, Crosshair, FilePlus } from 'lucide-svelte';
  import { ICON } from '../lib/constants';

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
  <button class="add-signal btn" onclick={onAddSignal}
    ><DiamondPlus {...ICON} /><span class="tier-full">Signal</span><span class="tier-medium">Sig.</span></button
  >
  <button class="add-note btn" onclick={onAddNotiz}
    ><SquarePen {...ICON} /><span class="tier-full">Notiz</span><span class="tier-medium">Not.</span></button
  >
  <button class="add-abzweigung btn" onclick={onAddAbzweigung}
    ><Share2 {...ICON} /><span class="tier-full">Abzweigung</span><span class="tier-medium">Abzw.</span></button
  >
  <button class="add-knoten btn" onclick={onAddKnoten}
    ><Crosshair {...ICON} /><span class="tier-full">Knoten</span><span class="tier-medium">Kn.</span></button
  >
  <button class="add-import btn" onclick={onAddImport}
    ><FilePlus {...ICON} /><span class="tier-full">Import</span><span class="tier-medium">Imp.</span></button
  >
</div>

<style>
  .add-bar {
    display: flex;
    gap: var(--spacing-card);
    margin: var(--spacing-half-card) var(--spacing-card);
  }
  /* Extends .btn — plusleiste-specific overrides */
  .add-bar button {
    flex: 1;
    min-width: 0;
    height: var(--spacing-unit);
    padding: 0 var(--spacing-cell);
    font-weight: var(--font-weight-semibold);
    font-size: var(--text-input);
    gap: var(--spacing-sm);
    container-type: inline-size;
  }
  .add-bar button :global(svg) {
    flex-shrink: 0;
  }
  .add-signal {
    background: var(--color-bg-raised);
    color: var(--color-text-secondary);
  }
  .add-note {
    background: var(--color-highlight);
    color: var(--color-highlight-text);
  }
  .add-abzweigung {
    background: var(--color-abzweigung);
    color: var(--color-abzweigung-text);
  }
  .add-knoten {
    background: var(--color-knoten);
    color: var(--color-knoten-text);
  }
  .add-import {
    background: var(--color-import);
    color: var(--color-import-text);
  }
  /* Tier visibility: narrow (icon only) by default, wider tiers override */
  .tier-full,
  .tier-medium {
    display: none;
  }

  @container (min-width: 60px) {
    .tier-medium {
      display: inline;
    }
  }

  @container (min-width: 100px) {
    .tier-full {
      display: inline;
    }
    .tier-medium {
      display: none;
    }
  }
</style>

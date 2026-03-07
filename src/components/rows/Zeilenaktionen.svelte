<script lang="ts">
  import { Eraser, Trash2, EllipsisVertical } from 'lucide-svelte';
  import { on } from 'svelte/events';
  import { ICON } from '../../lib/constants';
  import Symbolknopf from '../ui/Symbolknopf.svelte';

  let {
    ondelete,
    onclear,
  }: {
    ondelete: () => void;
    onclear: () => void;
  } = $props();

  let menuOpen = $state(false);
  let menuEl: HTMLDivElement | undefined = $state();

  function handleClickOutside(e: MouseEvent) {
    if (menuEl && !menuEl.contains(e.target as Node)) {
      menuOpen = false;
    }
  }

  function handleAction(action: () => void) {
    action();
    menuOpen = false;
  }

  $effect(() => {
    if (menuOpen) {
      return on(document, 'click', handleClickOutside, { capture: true });
    }
  });
</script>

<div class="signal-actions" bind:this={menuEl}>
  {#if menuOpen}
    <Symbolknopf onclick={() => handleAction(onclear)} title="Leeren" color="clear" tabindex={-1} class="action-btn">
      <Eraser {...ICON} />
    </Symbolknopf>
    <Symbolknopf onclick={() => handleAction(ondelete)} title="Löschen" color="red" tabindex={-1} class="action-btn">
      <Trash2 {...ICON} />
    </Symbolknopf>
  {/if}
  <Symbolknopf onclick={() => (menuOpen = !menuOpen)} title="Aktionen" tabindex={-1} class="ellipsis-btn">
    <EllipsisVertical {...ICON} />
  </Symbolknopf>
  <Symbolknopf onclick={onclear} title="Leeren" color="clear" tabindex={-1} class="wide-btn">
    <Eraser {...ICON} />
  </Symbolknopf>
  <Symbolknopf onclick={ondelete} title="Löschen" color="red" tabindex={-1} class="wide-btn">
    <Trash2 {...ICON} />
  </Symbolknopf>
</div>

<style>
  .signal-actions {
    display: flex;
    gap: var(--spacing-card);
    flex-shrink: 0;
    height: var(--spacing-unit);
  }

  /* Wide: show inline buttons, hide ellipsis and expandable actions */
  .signal-actions :global(.ellipsis-btn) {
    display: none;
  }
  .signal-actions :global(.action-btn) {
    display: none;
  }

  @media (max-width: 639px) {
    .signal-actions :global(.wide-btn) {
      display: none;
    }
    .signal-actions :global(.ellipsis-btn) {
      display: flex;
    }
    .signal-actions :global(.action-btn) {
      display: flex;
    }
  }
</style>

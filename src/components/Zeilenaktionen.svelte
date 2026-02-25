<script lang="ts">
  import { Eraser, Trash2, EllipsisVertical } from 'lucide-svelte';
  import Symbolknopf from './ui/Symbolknopf.svelte';

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
      document.addEventListener('click', handleClickOutside, true);
      return () => document.removeEventListener('click', handleClickOutside, true);
    }
  });
</script>

<div class="signal-actions shrink-0 flex gap-card" bind:this={menuEl}>
  {#if menuOpen}
    <Symbolknopf onclick={() => handleAction(onclear)} title="Leeren" color="clear" tabindex={-1} class="action-btn">
      <Eraser size={16} strokeWidth={1.5} />
    </Symbolknopf>
    <Symbolknopf onclick={() => handleAction(ondelete)} title="Löschen" color="red" tabindex={-1} class="action-btn">
      <Trash2 size={16} strokeWidth={1.5} />
    </Symbolknopf>
  {/if}
  <Symbolknopf onclick={() => menuOpen = !menuOpen} title="Aktionen" tabindex={-1} class="ellipsis-btn">
    <EllipsisVertical size={16} strokeWidth={1.5} />
  </Symbolknopf>
  <Symbolknopf onclick={onclear} title="Leeren" color="clear" tabindex={-1} class="wide-btn">
    <Eraser size={16} strokeWidth={1.5} />
  </Symbolknopf>
  <Symbolknopf onclick={ondelete} title="Löschen" color="red" tabindex={-1} class="wide-btn">
    <Trash2 size={16} strokeWidth={1.5} />
  </Symbolknopf>
</div>

<style>
  .signal-actions {
    height: var(--spacing-unit);
  }

  /* Wide: show inline buttons, hide ellipsis and expandable actions */
  :global(.ellipsis-btn) { display: none; }
  :global(.action-btn) { display: none; }

  @media (max-width: 639px) {
    :global(.wide-btn) { display: none; }
    :global(.ellipsis-btn) { display: flex; }
    :global(.action-btn) { display: flex; }
  }
</style>

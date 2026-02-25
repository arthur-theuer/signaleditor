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

<!-- Wide: two buttons inline -->
<div class="signal-actions signal-actions-wide grid gap-card shrink-0">
  <Symbolknopf onclick={onclear} title="Leeren" color="clear" tabindex={-1}>
    <Eraser size={16} strokeWidth={1.5} />
  </Symbolknopf>
  <Symbolknopf onclick={ondelete} title="Löschen" color="red" tabindex={-1}>
    <Trash2 size={16} strokeWidth={1.5} />
  </Symbolknopf>
</div>

<!-- Narrow: ellipsis menu -->
<div class="signal-actions signal-actions-narrow shrink-0 flex gap-card" bind:this={menuEl}>
  {#if menuOpen}
    <Symbolknopf onclick={() => handleAction(onclear)} title="Leeren" color="clear" tabindex={-1}>
      <Eraser size={16} strokeWidth={1.5} />
    </Symbolknopf>
    <Symbolknopf onclick={() => handleAction(ondelete)} title="Löschen" color="red" tabindex={-1}>
      <Trash2 size={16} strokeWidth={1.5} />
    </Symbolknopf>
  {/if}
  <Symbolknopf onclick={() => menuOpen = !menuOpen} title="Aktionen" tabindex={-1}>
    <EllipsisVertical size={16} strokeWidth={1.5} />
  </Symbolknopf>
</div>

<style>
  .signal-actions {
    height: var(--spacing-unit);
  }
  .signal-actions-wide {
    grid-template-columns: repeat(2, 1fr);
  }
  .signal-actions-narrow {
    display: none;
  }

  @media (max-width: 639px) {
    .signal-actions-wide { display: none; }
    .signal-actions-narrow { display: block; }
  }
</style>

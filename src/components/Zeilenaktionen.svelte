<script lang="ts">
  import { Eraser, Trash2 } from 'lucide-svelte';
  import IconBtn from './IconBtn.svelte';

  let {
    ondelete,
    onclear,
  }: {
    ondelete: () => void;
    onclear: () => void;
  } = $props();
</script>

<div class="signal-actions grid gap-card shrink-0">
  <IconBtn onclick={onclear} title="Leeren" color="clear" tabindex={-1}>
    <Eraser size={16} strokeWidth={1.5} />
  </IconBtn>
  <IconBtn onclick={ondelete} title="Löschen" color="red" tabindex={-1}>
    <Trash2 size={16} strokeWidth={1.5} />
  </IconBtn>
</div>

<style>
  .signal-actions {
    grid-template-rows: repeat(2, 1fr);
    width: calc(var(--spacing-row) / 2 - var(--spacing-card) / 2);
    height: var(--spacing-row);
  }
</style>

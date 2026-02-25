<script lang="ts">
  import { Eraser, Trash2 } from 'lucide-svelte';
  import Symbolknopf from './ui/Symbolknopf.svelte';

  let {
    ondelete,
    onclear,
  }: {
    ondelete: () => void;
    onclear: () => void;
  } = $props();
</script>

<div class="signal-actions grid gap-card shrink-0">
  <Symbolknopf onclick={onclear} title="Leeren" color="clear" tabindex={-1}>
    <Eraser size={16} strokeWidth={1.5} />
  </Symbolknopf>
  <Symbolknopf onclick={ondelete} title="Löschen" color="red" tabindex={-1}>
    <Trash2 size={16} strokeWidth={1.5} />
  </Symbolknopf>
</div>

<style>
  .signal-actions {
    grid-template-columns: repeat(2, 1fr);
    height: var(--spacing-unit);
  }
</style>

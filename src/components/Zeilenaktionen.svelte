<script lang="ts">
  import { Eraser, Trash2 } from 'lucide-svelte';

  let {
    ondelete,
    onclear,
  }: {
    ondelete: () => void;
    onclear: () => void;
  } = $props();
</script>

<div class="signal-actions">
  <button class="clear hl" onclick={onclear} title="Leeren" tabindex={-1}>
    <Eraser size={16} strokeWidth={1.5} />
  </button>
  <button class="delete hl" onclick={ondelete} title="Löschen" tabindex={-1}>
    <Trash2 size={16} strokeWidth={1.5} />
  </button>
</div>

<style>
  .signal-actions {
    display: grid;
    grid-template-rows: repeat(2, 1fr);
    gap: var(--spacing-card);
    width: calc(var(--spacing-row) / 2 - var(--spacing-card) / 2);
    height: var(--spacing-row);
    flex-shrink: 0;
  }
  .signal-actions button {
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--color-bg-raised);
    border: var(--card-border);
    border-radius: var(--radius-card);
    cursor: pointer;
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  .clear { color: var(--color-clear); }
  .delete { color: var(--color-red); }
</style>

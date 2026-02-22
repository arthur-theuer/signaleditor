<script lang="ts">
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
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 21H8a2 2 0 0 1-1.42-.587l-3.994-3.999a2 2 0 0 1 0-2.828l10-10a2 2 0 0 1 2.829 0l5.999 6a2 2 0 0 1 0 2.828L12.834 21" />
      <path d="m5.082 11.09 8.828 8.828" />
    </svg>
  </button>
  <button class="delete hl" onclick={ondelete} title="Löschen" tabindex={-1}>
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M10 11v6" />
      <path d="M14 11v6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
      <path d="M3 6h18" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  </button>
</div>

<style>
  .signal-actions {
    display: grid;
    grid-template-rows: repeat(2, 1fr);
    gap: var(--card-gap);
    width: calc(var(--row-height) / 2 - var(--card-gap) / 2);
    height: var(--row-height);
    flex-shrink: 0;
  }
  .signal-actions button {
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--color-bg-raised);
    border: var(--card-border);
    border-radius: var(--card-radius);
    cursor: pointer;
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  .clear { color: var(--color-clear); }
  .delete { color: var(--color-red); }
</style>

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
  <button class="clear hl" onclick={onclear} title="Leeren" tabindex={-1}>⌫</button>
  <button class="delete hl" onclick={ondelete} title="Löschen" tabindex={-1}>✕</button>
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
    font-size: 16px;
    font-weight: 500;
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  .clear { color: var(--color-clear); font-size: 14px; }
  .delete { color: var(--color-red); }
</style>

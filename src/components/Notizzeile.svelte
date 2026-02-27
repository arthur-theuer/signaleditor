<script lang="ts">
  import type { Notizeintrag } from '../lib/types';

  let {
    eintrag = $bindable(),
    onchange,
  }: {
    eintrag: Notizeintrag;
    onchange: () => void;
  } = $props();
</script>

<div class="row-cell note-cell hl-field">
  <input
    type="text"
    class="note-input"
    bind:value={eintrag.notiz}
    oninput={onchange}
    placeholder="Notiz"
    autocomplete="none"
    autocorrect="off"
    spellcheck="false"
  />
</div>

<style>
  .note-cell {
    background: var(--color-highlight);
  }
  .note-input {
    flex: 1;
    min-width: 0;
    padding: 0 var(--spacing-cell);
    border: none;
    background: transparent;
    font-size: var(--text-input);
    font-family: var(--font-mono);
    border-radius: var(--radius-inner);
  }
  .note-input:focus {
    outline: none;
  }
  .note-input::placeholder {
    color: var(--color-text-muted);
  }
</style>

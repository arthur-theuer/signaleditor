<script lang="ts">
  import type { Notizeintrag } from '../../lib/types';

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
    class="note-input cell-input"
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
  /* note-input: base styles from .cell-input */
</style>

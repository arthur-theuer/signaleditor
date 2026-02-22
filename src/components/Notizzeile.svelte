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

<div class="signal-cell note-cell">
  <div class="note-wrapper hl-wrap">
    <div class="note-spacer"></div>
    <input
      type="text"
      class="note-input"
      bind:value={eintrag.notiz}
      oninput={onchange}
      placeholder="Notiz"
      autocomplete="off"
      autocorrect="off"
      spellcheck="false"
    />
    <div class="note-spacer"></div>
  </div>
</div>

<style>
  .note-cell { background: var(--color-highlight); }
  .note-wrapper {
    display: flex;
    flex-direction: column;
    height: 100%;
    border-radius: calc(var(--card-radius) - 1px);
  }
  .note-spacer { flex: var(--preview-flex); }
  .note-input {
    flex: var(--input-flex);
    padding: 0 var(--cell-padding);
    border: none;
    background: transparent;
    font-size: var(--input-font-size);
    font-family: monospace;
    display: flex;
    align-items: center;
  }
  .note-input:focus { outline: none; }
  .note-input::placeholder { color: var(--color-text-muted); }
</style>

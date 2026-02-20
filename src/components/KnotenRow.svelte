<script lang="ts">
  import type { Knoteneintrag } from '../lib/types';
  import { KNOTEN } from '../lib/constants';

  let {
    eintrag = $bindable(),
    onchange,
  }: {
    eintrag: Knoteneintrag;
    onchange: () => void;
  } = $props();

  let preview = $derived(KNOTEN[eintrag.knoten.toUpperCase()] || '');

  function handleInput(e: Event) {
    eintrag.knoten = (e.target as HTMLInputElement).value;
    onchange();
  }
</script>

<div class="signal-cell knoten-cell">
  <div class="knoten-inner">
    <div class="knoten-input-wrapper hl-wrap">
      <input
        type="text"
        class="knoten-input"
        value={eintrag.knoten}
        oninput={handleInput}
        placeholder="Code"
        autocomplete="off"
        autocorrect="off"
        spellcheck="false"
      />
    </div>
    <div class="knoten-preview">{preview}</div>
  </div>
</div>

<style>
  .knoten-cell { background: #e0f2f1; }
  .knoten-inner { display: flex; height: 100%; }
  .knoten-input-wrapper {
    width: var(--row-height);
    flex: none;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    border-radius: calc(var(--card-radius) - 1px) 0 0 calc(var(--card-radius) - 1px);
  }
  .knoten-input {
    border: none;
    background: transparent;
    font-size: var(--input-font-size);
    font-family: monospace;
    text-transform: uppercase;
    width: 100%;
    text-align: center;
    outline: none;
    color: var(--color-text);
  }
  .knoten-input::placeholder { color: var(--color-text-muted); text-transform: none; }
  .knoten-preview {
    flex: 1;
    min-width: 0;
    display: flex;
    align-items: center;
    padding: 0 12px;
    height: 100%;
    border-left: 1px solid var(--color-border);
    font-size: var(--input-font-size);
    font-family: monospace;
    color: var(--color-text-muted);
    pointer-events: none;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    border-radius: 0 calc(var(--card-radius) - 1px) calc(var(--card-radius) - 1px) 0;
  }
</style>

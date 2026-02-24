<script lang="ts">
  import type { Knoteneintrag } from '../lib/types';
  import { STATIONEN } from '../lib/constants';

  let {
    eintrag = $bindable(),
    onchange,
  }: {
    eintrag: Knoteneintrag;
    onchange: () => void;
  } = $props();

  let preview = $derived(STATIONEN[eintrag.knoten.toUpperCase()] || '');
</script>

<div class="signal-cell knoten-cell">
  <div class="knoten-inner">
    <div class="knoten-input-wrapper hl-wrap">
      <input
        type="text"
        class="knoten-input"
        bind:value={eintrag.knoten}
        oninput={(e) => { eintrag.knoten = eintrag.knoten.toUpperCase(); onchange(); }}
        placeholder="Code"
        autocomplete="off"
        autocorrect="off"
        spellcheck="false"
      />
    </div>
    <div class="knoten-preview" class:has-value={!!preview}>{preview || 'z.B. ZUE'}</div>
  </div>
</div>

<style>
  .knoten-cell { background: var(--color-knoten); }
  .knoten-inner { display: flex; height: 100%; }
  .knoten-input-wrapper {
    width: var(--spacing-row);
    flex: none;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    border-radius: calc(var(--radius-card) - 1px) 0 0 calc(var(--radius-card) - 1px);
  }
  .knoten-input {
    border: none;
    background: transparent;
    font-size: var(--text-input);
    font-family: var(--font-mono);
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
    padding: 0 var(--spacing-cell);
    height: 100%;
    border-left: 1px solid var(--color-border);
    font-size: var(--text-input);
    font-family: var(--font-mono);
    color: var(--color-text-muted);
    pointer-events: none;
  }
  .knoten-preview.has-value {
    color: var(--color-text-secondary);
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    border-radius: 0 calc(var(--radius-card) - 1px) calc(var(--radius-card) - 1px) 0;
  }
</style>

<script lang="ts">
  import type { Knoteneintrag } from '../lib/types';
  import { STATIONEN, STATION_BY_NAME, STATION_NAMES } from '../lib/constants';

  let {
    eintrag = $bindable(),
    onchange,
  }: {
    eintrag: Knoteneintrag;
    onchange: () => void;
  } = $props();

  let preview = $derived(STATIONEN[eintrag.knoten.toUpperCase()] || '');

  function handleNameSearch(e: Event) {
    const input = e.target as HTMLInputElement;
    const query = input.value.toLowerCase().trim();
    if (!query) return;
    const exact = STATION_BY_NAME[query];
    if (exact) { eintrag.knoten = exact; onchange(); return; }
    const match = STATION_NAMES.find(n => n.startsWith(query));
    if (match) { eintrag.knoten = STATION_BY_NAME[match]; onchange(); }
  }

  function handleNameKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      e.preventDefault();
      (e.target as HTMLInputElement).value = preview;
    } else if (e.key === 'Enter') {
      e.preventDefault();
      handleNameSearch(e);
      (e.target as HTMLInputElement).blur();
    }
  }
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
    <div class="knoten-name-wrapper hl-wrap">
      <input
        type="text"
        class="knoten-name-input"
        value={preview}
        class:has-value={!!preview}
        placeholder="z.B. Zürich"
        onchange={handleNameSearch}
        onkeydown={handleNameKeydown}
        autocomplete="off" autocorrect="off" spellcheck="false"
      />
    </div>
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
  .knoten-name-wrapper {
    flex: 1;
    min-width: 0;
    display: flex;
    height: 100%;
    border-left: 1px solid var(--color-border);
    border-radius: 0 calc(var(--radius-card) - 1px) calc(var(--radius-card) - 1px) 0;
  }
  .knoten-name-input {
    flex: 1;
    min-width: 0;
    border: none;
    background: transparent;
    padding: 0 var(--spacing-cell);
    font-size: var(--text-input);
    font-family: var(--font-mono);
    color: var(--color-text-muted);
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    border-radius: inherit;
  }
  .knoten-name-input:focus { outline: none; }
  .knoten-name-input.has-value {
    color: var(--color-text-secondary);
  }
</style>

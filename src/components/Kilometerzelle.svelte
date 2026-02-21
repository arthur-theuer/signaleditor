<script lang="ts">
  import type { Eintrag } from '../lib/types';

  let {
    eintrag = $bindable(),
    prevEintrag,
    showKm,
    onchange,
  }: {
    eintrag: Eintrag;
    prevEintrag: Eintrag | undefined;
    showKm: boolean;
    onchange: () => void;
  } = $props();

  let kmVal = $derived(eintrag.km !== undefined ? String(eintrag.km) : '');
  let prevKm = $derived(
    prevEintrag?.km !== undefined ? (prevEintrag.km + 0.1).toFixed(1) : 'km'
  );
  let nextKm = $derived(
    eintrag.km !== undefined ? (eintrag.km + 0.1).toFixed(1) : ''
  );
  let prevKmDisplay = $derived(
    eintrag.km !== undefined && eintrag.km - 0.1 >= 0
      ? (eintrag.km - 0.1).toFixed(1)
      : ''
  );

  function handleInput(e: Event) {
    const val = (e.target as HTMLInputElement).value;
    if (val === '') {
      eintrag.km = undefined;
    } else {
      const num = parseFloat(val);
      if (!isNaN(num)) eintrag.km = num;
    }
    onchange();
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      let val = eintrag.km;
      if (val === undefined) {
        val = prevEintrag?.km !== undefined ? prevEintrag.km + 0.1 : 0;
      }
      if (e.key === 'ArrowUp') {
        val = val + 0.1;
      } else {
        val = Math.max(0, val - 0.1);
      }
      eintrag.km = parseFloat(val.toFixed(1));
      onchange();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      eintrag.km = undefined;
      onchange();
    }
  }
</script>

<div class="km-cell" class:visible={showKm}>
  <div class="km-cell-inner hl-wrap">
    <div class="km-preview next">{nextKm}</div>
    <input
      type="text"
      class="km-input"
      value={kmVal}
      oninput={handleInput}
      onkeydown={handleKeydown}
      placeholder={prevKm}
    />
    <div class="km-preview prev">{prevKmDisplay}</div>
  </div>
</div>

<style>
  .km-cell {
    display: none;
    flex-direction: column;
    background: var(--color-bg-raised);
    border: var(--card-border);
    border-radius: var(--card-radius);
    width: var(--row-height);
    flex-shrink: 0;
  }
  .km-cell.visible { display: flex; }
  .km-cell-inner {
    display: flex;
    flex-direction: column;
    height: 100%;
    border-radius: calc(var(--card-radius) - 1px);
  }
  .km-preview {
    flex: var(--preview-flex);
    display: flex;
    justify-content: center;
    font-size: var(--preview-font-size);
    font-family: monospace;
    color: var(--color-text-muted);
    opacity: 0;
    padding: 0 8px;
    text-align: center;
    pointer-events: none;
  }
  .km-preview.next { order: -1; align-items: center; padding-top: 2px; }
  .km-preview.prev { order: 1; align-items: center; padding-bottom: 2px; }
  .km-cell-inner:focus-within .km-preview { opacity: 0.5; }
  .km-cell-inner:focus-within .km-preview.prev { border-bottom: 1px solid var(--color-border); }
  .km-cell-inner:focus-within .km-preview.next { border-top: 1px solid var(--color-border); }
  .km-input {
    flex: var(--input-flex);
    padding: 0 8px;
    border: none;
    background: transparent;
    font-size: var(--input-font-size);
    font-family: monospace;
    text-align: center;
    width: 100%;
    box-sizing: border-box;
  }
  .km-input:focus { outline: none; }
</style>

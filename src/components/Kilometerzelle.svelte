<script lang="ts">
  import type { Eintrag } from '../lib/types';

  let {
    eintrag = $bindable(),
    prevEintrag,
    onchange,
  }: {
    eintrag: Eintrag;
    prevEintrag: Eintrag | undefined;
    onchange: () => void;
  } = $props();

  let kmVal = $derived(eintrag.km !== undefined ? String(eintrag.km) : '');
  let prevKm = $derived(prevEintrag?.km !== undefined ? (prevEintrag.km + 0.1).toFixed(1) : 'km');

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

<div class="km-cell hl-field">
  <input
    type="text"
    class="km-input"
    value={kmVal}
    oninput={handleInput}
    onkeydown={handleKeydown}
    placeholder={prevKm}
    autocomplete="none"
    autocorrect="off"
    spellcheck="false"
  />
</div>

<style>
  .km-cell {
    display: flex;
    background: var(--color-bg-raised);
    border-radius: var(--radius-card);
    width: calc(1.5 * var(--spacing-unit));
    flex-shrink: 0;
  }
  .km-input {
    flex: 1;
    padding: 0 var(--spacing-md);
    border: none;
    background: transparent;
    font-size: var(--text-input);
    font-family: var(--font-mono);
    text-align: center;
    width: 100%;
    box-sizing: border-box;
  }
  .km-input:focus {
    outline: none;
  }
</style>

<script lang="ts">
  import type { Abzweigungseintrag, AbzweigungPfeil } from '../lib/types';

  let {
    eintrag = $bindable(),
    onchange,
  }: {
    eintrag: Abzweigungseintrag;
    onchange: () => void;
  } = $props();

  const PFEIL_CYCLE: AbzweigungPfeil[] = ['', '>>', '<<'];
  const VON_NACH_ENUM: Array<'von' | 'nach'> = ['von', 'nach'];

  function cycleArrow(side: 'links' | 'rechts') {
    const current = eintrag.abzweigung[side];
    const idx = PFEIL_CYCLE.indexOf(current);
    eintrag.abzweigung[side] = PFEIL_CYCLE[(idx + 1) % PFEIL_CYCLE.length];
    onchange();
  }

  function handleArrowKeydown(e: KeyboardEvent, side: 'links' | 'rechts') {
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      e.preventDefault();
      const current = eintrag.abzweigung[side];
      const idx = PFEIL_CYCLE.indexOf(current);
      eintrag.abzweigung[side] = PFEIL_CYCLE[(idx + 1) % PFEIL_CYCLE.length];
      onchange();
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      e.preventDefault();
      const current = eintrag.abzweigung[side];
      const idx = PFEIL_CYCLE.indexOf(current);
      eintrag.abzweigung[side] = PFEIL_CYCLE[(idx - 1 + PFEIL_CYCLE.length) % PFEIL_CYCLE.length];
      onchange();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      eintrag.abzweigung[side] = '';
      onchange();
    }
  }

  function cycleVonNach(direction: 1 | -1 = 1) {
    const idx = VON_NACH_ENUM.indexOf(eintrag.abzweigung.von_nach as 'von' | 'nach');
    eintrag.abzweigung.von_nach = VON_NACH_ENUM[(idx + direction + VON_NACH_ENUM.length) % VON_NACH_ENUM.length];
    onchange();
  }

  function handleVonNachKeydown(e: KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      cycleVonNach(1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      cycleVonNach(-1);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      eintrag.abzweigung.von_nach = '';
      onchange();
    } else if (e.key.length === 1) {
      e.preventDefault();
      const match = VON_NACH_ENUM.find((s) => s.startsWith(e.key.toLowerCase()));
      if (match) {
        eintrag.abzweigung.von_nach = match;
        onchange();
      }
    }
  }
</script>

<div class="row-cell abzweigung-cell abzweigung-arrow-cell hl-field">
  <button
    class="abzweigung-btn"
    onclick={() => cycleArrow('links')}
    onkeydown={(e) => handleArrowKeydown(e, 'links')}
  >
    {#if eintrag.abzweigung.links}
      {eintrag.abzweigung.links}
    {:else}
      <span class="placeholder">&lt;&gt;</span>
    {/if}
  </button>
</div>
<div class="row-cell abzweigung-cell abzweigung-text-cell hl-field">
  <input
    type="text"
    class="abzweigung-strecke"
    bind:value={eintrag.abzweigung.strecke}
    oninput={onchange}
    placeholder="Nummer"
    autocomplete="none"
    autocorrect="off"
    spellcheck="false"
  />
</div>
<div class="row-cell abzweigung-cell abzweigung-btn-cell hl-field">
  <button
    class="abzweigung-btn"
    onclick={() => cycleVonNach(1)}
    onkeydown={handleVonNachKeydown}
  >
    {#if eintrag.abzweigung.von_nach}
      {eintrag.abzweigung.von_nach}
    {:else}
      <span class="placeholder">von/nach</span>
    {/if}
  </button>
</div>
<div class="row-cell abzweigung-cell abzweigung-text-cell hl-field">
  <input
    type="text"
    class="abzweigung-richtung"
    bind:value={eintrag.abzweigung.richtung}
    oninput={onchange}
    placeholder="Richtung"
    autocomplete="none"
    autocorrect="off"
    spellcheck="false"
  />
</div>
<div class="row-cell abzweigung-cell abzweigung-arrow-cell hl-field">
  <button
    class="abzweigung-btn"
    onclick={() => cycleArrow('rechts')}
    onkeydown={(e) => handleArrowKeydown(e, 'rechts')}
  >
    {#if eintrag.abzweigung.rechts}
      {eintrag.abzweigung.rechts}
    {:else}
      <span class="placeholder">&lt;&gt;</span>
    {/if}
  </button>
</div>

<style>
  .abzweigung-cell {
    background: var(--color-abzweigung);
  }
  .abzweigung-arrow-cell {
    width: var(--spacing-unit);
    flex: none;
  }
  .abzweigung-text-cell {
    flex: 1;
  }
  .abzweigung-btn-cell {
    flex: 1;
  }
  .abzweigung-btn {
    width: 100%;
    height: 100%;
    border: none;
    background: transparent;
    font-size: var(--text-input);
    font-family: var(--font-mono);
    color: var(--color-text);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    outline: none;
  }
  .abzweigung-strecke,
  .abzweigung-richtung {
    flex: 1;
    min-width: 0;
    padding: 0 var(--spacing-cell);
    border: none;
    background: transparent;
    font-size: var(--text-input);
    font-family: var(--font-mono);
    color: var(--color-text);
    text-align: center;
    width: 100%;
    height: 100%;
    outline: none;
  }
  .abzweigung-strecke::placeholder,
  .abzweigung-richtung::placeholder {
    color: var(--color-text-muted);
  }
  .placeholder {
    color: var(--color-text-muted);
  }
</style>

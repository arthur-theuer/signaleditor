<script lang="ts">
  import type { Abzweigungseintrag } from '../lib/types';

  let {
    eintrag = $bindable(),
    onchange,
  }: {
    eintrag: Abzweigungseintrag;
    onchange: () => void;
  } = $props();

  let arrowGlyph = $derived(
    (eintrag.abzweigung.seite === 'links') === (eintrag.abzweigung.von_nach === 'nach') ? '<<' : '>>'
  );

  const VON_NACH_ENUM: Array<'von' | 'nach'> = ['von', 'nach'];

  function toggleSeite() {
    eintrag.abzweigung.seite = eintrag.abzweigung.seite === 'links' ? 'rechts' : 'links';
    onchange();
  }

  function cycleVonNach(direction: 1 | -1 = 1) {
    const idx = VON_NACH_ENUM.indexOf(eintrag.abzweigung.von_nach);
    eintrag.abzweigung.von_nach = VON_NACH_ENUM[(idx + direction + VON_NACH_ENUM.length) % VON_NACH_ENUM.length];
    onchange();
  }

  function handleArrowKeydown(e: KeyboardEvent) {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      toggleSeite();
    }
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
      const match = VON_NACH_ENUM.find(s => s.startsWith(e.key.toLowerCase()));
      if (match) {
        eintrag.abzweigung.von_nach = match;
        onchange();
      }
    }
  }
</script>

<div class="signal-cell abzweigung-cell">
  <div class="abzweigung-inner">
    <div class="abzweigung-field abzweigung-arrow-field hl-wrap">
      <button class="abzweigung-btn abzweigung-arrow" onclick={(e) => { (e.currentTarget as HTMLElement).focus(); toggleSeite(); }} onkeydown={handleArrowKeydown}>{arrowGlyph}</button>
    </div>
    <div class="abzweigung-field abzweigung-strecke-field hl-wrap">
      <input
        type="text"
        class="abzweigung-strecke"
        bind:value={eintrag.abzweigung.strecke}
        oninput={onchange}
        placeholder="Nummer"
        autocomplete="off"
        autocorrect="off"
        spellcheck="false"
      />
    </div>
    <div class="abzweigung-field abzweigung-vonnach-field hl-wrap">
      <button class="abzweigung-btn abzweigung-vonnach" onclick={(e) => { (e.currentTarget as HTMLElement).focus(); cycleVonNach(1); }} onkeydown={handleVonNachKeydown}>
        {#if eintrag.abzweigung.von_nach}
          {eintrag.abzweigung.von_nach}
        {:else}
          <span class="placeholder">von/nach</span>
        {/if}
      </button>
    </div>
    <div class="abzweigung-field abzweigung-richtung-field hl-wrap">
      <input
        type="text"
        class="abzweigung-richtung"
        bind:value={eintrag.abzweigung.richtung}
        oninput={onchange}
        placeholder="Richtung"
        autocomplete="off"
        autocorrect="off"
        spellcheck="false"
      />
    </div>
    <div class="abzweigung-field abzweigung-arrow-field hl-wrap">
      <button class="abzweigung-btn abzweigung-arrow" tabindex={-1} onclick={toggleSeite} onkeydown={handleArrowKeydown}>{arrowGlyph}</button>
    </div>
  </div>
</div>

<style>
  .abzweigung-cell { background: #f3e5f5; }
  .abzweigung-inner { display: flex; height: 100%; }
  .abzweigung-field {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
  }
  .abzweigung-field + .abzweigung-field { border-left: 1px solid var(--color-border); }
  .abzweigung-field input,
  .abzweigung-field .abzweigung-btn {
    border: none;
    background: transparent;
    font-size: var(--input-font-size);
    font-family: monospace;
    height: 100%;
    outline: none;
    color: var(--color-text);
    font-weight: normal;
  }
  .abzweigung-field input {
    padding: 0 12px;
    min-width: 0;
    width: 100%;
    text-align: center;
  }
  .abzweigung-field input::placeholder { color: var(--color-text-muted); }
  .abzweigung-btn {
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    width: 100%;
  }
  .abzweigung-arrow-field { width: var(--row-height); flex-shrink: 0; }
  .abzweigung-strecke-field { flex: 1; }
  .abzweigung-vonnach-field { flex: 1; }
  .abzweigung-richtung-field { flex: 1; }
  .placeholder { color: var(--color-text-muted); }

  /* Corner radii for sub-fields */
  .abzweigung-inner > :first-child { border-radius: calc(var(--card-radius) - 1px) 0 0 calc(var(--card-radius) - 1px); }
  .abzweigung-inner > :last-child { border-radius: 0 calc(var(--card-radius) - 1px) calc(var(--card-radius) - 1px) 0; }
</style>

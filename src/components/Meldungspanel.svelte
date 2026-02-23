<script lang="ts">
  import type { Eintrag } from '../lib/types';
  import type { MeldungRow } from '../lib/reports';
  import { generiereAlleMeldungen } from '../lib/reports';


  let { signale, onclose }: { signale: Eintrag[]; onclose: () => void } = $props();

  let meldungen: MeldungRow[] = $derived(generiereAlleMeldungen(signale));
</script>

<div class="meldungen-list">
  {#each meldungen as m, idx}
    <div class="meldung-row">
      {#if m.note !== undefined}
        <div class="meldung-row-inner muted">
          <div class="meldung-text muted-text">NOTIZ</div>
        </div>
      {:else if m.knoten}
        <div class="meldung-row-inner muted">
          <div class="meldung-text muted-text">KNOTEN</div>
        </div>
      {:else if m.abzweigung}
        <div class="meldung-row-inner muted">
          <div class="meldung-text muted-text">ABZWEIGUNG</div>
        </div>
      {:else if m.import}
        <div class="meldung-row-inner muted">
          <div class="meldung-text muted-text">QUELLE</div>
        </div>
      {:else if m.error === 'Kein Signal'}
        <div class="meldung-row-inner muted"></div>
      {:else if m.error}
        <div class="meldung-row-inner error">
          <div class="meldung-text meldung-error">{m.error}</div>
        </div>
      {:else if m.segments.length === 1}
        {@const seg = m.segments[0]}
        <div class="meldung-row-inner meldung-colored {seg.klasse}">
          <div class="meldung-text">
            <span class:fett={seg.fett}>{seg.meldung}</span>
          </div>
        </div>
      {:else}
        {@const primaryClass = m.segments[0].klasse}
        <div class="meldung-row-inner meldung-colored {primaryClass}">
          <div class="meldung-text">
            {#each m.segments as seg, si}
              {#if si > 0}<br />{/if}
              <span class={seg.klasse} class:fett={seg.fett}>{seg.meldung}</span>
            {/each}
          </div>
        </div>
      {/if}
    </div>
  {/each}
  <div class="close-bar">
    <button class="close-btn hl" onclick={onclose}>Schließen</button>
  </div>
</div>

<style>
  .meldungen-list { padding: var(--spacing-half-card) 0; }
  .meldung-row {
    min-height: calc(var(--spacing-row) + var(--spacing-card));
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: var(--spacing-half-card) var(--spacing-card);
    font-family: monospace;
    font-size: var(--text-input);
  }
  .meldung-row-inner {
    background: var(--color-bg-raised);
    border: var(--card-border);
    border-radius: var(--radius-card);
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 0 var(--spacing-cell);
    text-align: center;
  }
  .meldung-row-inner.muted {
    border-color: var(--color-border);
    background: var(--color-bg);
  }
  .meldung-row-inner.error {
    border-color: var(--color-red);
    background: var(--color-red-bg);
  }
  .meldung-text { font-weight: var(--font-weight-medium); }
  .muted-text { color: var(--color-text-muted); font-style: italic; }
  .meldung-error { color: var(--color-red); font-style: italic; }
  .fett { font-weight: var(--font-weight-bold); }

  /* Signal type colors (dynamic classes, need :global) */
  :global(.meldung-block),
  :global(.meldung-spurwechsel) { color: var(--color-meldung-block); }
  :global(.meldung-ausfahrt) { color: var(--color-meldung-ausfahrt); }
  :global(.meldung-wiederholung) { color: var(--color-meldung-wiederholung); }
  :global(.meldung-standard) { color: var(--color-meldung-standard); }
  :global(.meldung-bahnhof-a) { color: var(--color-meldung-bahnhof-a); }
  :global(.meldung-bahnhof-b) { color: var(--color-meldung-bahnhof-b); }

  /* Colored row border inherits from the color class */
  .meldung-colored { border-color: currentColor; }
  .close-bar {
    margin: var(--spacing-half-card) var(--spacing-card);
  }
  .close-btn {
    width: 100%;
    height: calc(var(--spacing-row) / 2 - var(--spacing-card) / 2);
    padding: 0 var(--spacing-cell);
    border-radius: var(--radius-card);
    cursor: pointer;
    font-weight: var(--font-weight-semibold);
    font-size: var(--text-input);
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--color-red-bg);
    color: var(--color-red);
    border: 1px solid var(--color-red);
  }
</style>

<script lang="ts">
  import type { Eintrag } from '../lib/types';
  import type { MeldungRow } from '../lib/reports';
  import { generiereAlleMeldungen } from '../lib/reports';
  import { colorToLightBg, averageColors } from '../lib/colors';

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
        {@const bgColor = colorToLightBg(seg.farbe)}
        <div class="meldung-row-inner" style="border-color: {seg.farbe}; background: {bgColor};">
          <div class="meldung-text">
            <span style="color: {seg.farbe}; {seg.fett ? 'font-weight: bold;' : ''}">{seg.meldung}</span>
          </div>
        </div>
      {:else}
        {@const colors = m.segments.map(s => s.farbe)}
        {@const bgColors = colors.map(c => colorToLightBg(c))}
        {@const avgColor = averageColors(colors)}
        <div class="meldung-row-inner" style="background: linear-gradient(to bottom, {bgColors.join(', ')}); border-color: {avgColor};">
          <div class="meldung-text">
            {#each m.segments as seg, si}
              {#if si > 0}<br />{/if}
              <span style="color: {seg.farbe}; {seg.fett ? 'font-weight: bold;' : ''}">{seg.meldung}</span>
            {/each}
          </div>
        </div>
      {/if}
    </div>
  {/each}
</div>

<div class="close-bar">
  <button class="close-btn hl" onclick={onclose}>Schließen</button>
</div>

<style>
  .meldungen-list { padding: var(--half-gap) 0; }
  .meldung-row {
    height: calc(var(--row-height) + var(--card-gap));
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: var(--half-gap) var(--card-gap);
    font-family: monospace;
    font-size: var(--input-font-size);
    box-sizing: border-box;
  }
  .meldung-row-inner {
    background: var(--color-bg-raised);
    border: var(--card-border);
    border-radius: var(--card-radius);
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 0 12px;
    text-align: center;
  }
  .meldung-row-inner.muted {
    border-color: #ddd;
    background: #f5f5f5;
  }
  .meldung-row-inner.error {
    border-color: var(--color-red-border);
    background: var(--color-red-bg);
  }
  .meldung-text { font-weight: 500; }
  .muted-text { color: #999; font-style: italic; }
  .meldung-error { color: var(--color-red); font-style: italic; }
  .close-bar {
    margin: var(--half-gap) var(--card-gap);
  }
  .close-btn {
    width: 100%;
    padding: 12px;
    border-radius: var(--card-radius);
    cursor: pointer;
    font-weight: 600;
    font-size: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--color-red-bg);
    color: var(--color-red);
    border: 1px solid var(--color-red-border);
  }
</style>

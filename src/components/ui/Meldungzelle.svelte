<script lang="ts">
  import type { MeldungRow } from '../../lib/reports';

  let { meldung }: { meldung: MeldungRow } = $props();
</script>

<div class="meldung-cell">
  {#if meldung.note !== undefined || meldung.knoten || meldung.abzweigung || meldung.import}
    <div class="meldung-inner muted">
      <div class="meldung-text muted-text">
        {meldung.note !== undefined ? 'NOTIZ' : meldung.knoten ? 'KNOTEN' : meldung.abzweigung ? 'ABZWEIGUNG' : 'QUELLE'}
      </div>
    </div>
  {:else if meldung.error === 'Kein Signal'}
    <div class="meldung-inner muted"></div>
  {:else if meldung.error}
    <div class="meldung-inner error">
      <div class="meldung-text meldung-error">{meldung.error}</div>
    </div>
  {:else if meldung.segments.length === 1}
    {@const seg = meldung.segments[0]}
    <div class="meldung-inner meldung-colored {seg.klasse}">
      <div class="meldung-text">
        <span class={{ fett: seg.fett }}>{seg.meldung}</span>
      </div>
    </div>
  {:else}
    {@const primaryClass = meldung.segments[0].klasse}
    <div class="meldung-inner meldung-colored {primaryClass}">
      <div class="meldung-text">
        {#each meldung.segments as seg, si}
          {#if si > 0}<br />{/if}
          <span class={[seg.klasse, { fett: seg.fett }]}>{seg.meldung}</span>
        {/each}
      </div>
    </div>
  {/if}
</div>

<style>
  .meldung-cell {
    display: flex;
    flex-direction: column;
    justify-content: center;
    font-family: var(--font-mono);
    font-size: var(--text-input);
    min-height: 0;
    flex: 1;
  }
  .meldung-inner {
    display: flex;
    flex: 1;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 0 var(--spacing-cell);
    background: var(--color-bg-raised);
    border: var(--border-subtle);
    border-radius: var(--radius-card);
    text-align: center;
  }
  .meldung-inner.muted {
    background: var(--color-bg);
  }
  .meldung-inner.error {
    border-color: var(--color-red);
    background: var(--color-red-bg);
  }
  .meldung-text {
    font-weight: var(--font-weight-medium);
  }
  .muted-text {
    color: var(--color-text-muted);
    font-style: italic;
  }
  .meldung-error {
    color: var(--color-red);
    font-style: italic;
  }
  .fett {
    font-weight: var(--font-weight-bold);
  }
  .meldung-colored {
    border-color: currentColor;
  }
</style>

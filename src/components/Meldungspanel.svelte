<script lang="ts">
  import { X } from 'lucide-svelte';
  import { ICON } from '../lib/constants';
  import Symbolknopf from './ui/Symbolknopf.svelte';
  import type { Eintrag } from '../lib/types';
  import type { MeldungRow } from '../lib/reports';
  import { generiereAlleMeldungen } from '../lib/reports';

  let { signale, onclose }: { signale: Eintrag[]; onclose: () => void } = $props();

  let meldungen: MeldungRow[] = $derived(generiereAlleMeldungen(signale));
</script>

<div class="meldung-list">
  {#each meldungen as m, idx}
    <div class="meldung-row">
      {#if m.note !== undefined || m.knoten || m.abzweigung || m.import}
        <div class="meldung-row-inner muted">
          <div class="meldung-text muted-text">
            {m.note !== undefined ? 'NOTIZ' : m.knoten ? 'KNOTEN' : m.abzweigung ? 'ABZWEIGUNG' : 'QUELLE'}
          </div>
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
  <div class="meldung-close">
    <Symbolknopf onclick={onclose} title="Meldungen schließen" color="red" bordered wide label="Schließen">
      <X {...ICON} />
    </Symbolknopf>
  </div>
</div>

<style>
  .meldung-list {
    padding: var(--spacing-half-card) 0;
  }
  .meldung-close {
    margin: var(--spacing-half-card) var(--spacing-card);
  }
  .meldung-row {
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: var(--spacing-half-card) var(--spacing-card);
    min-height: calc(var(--spacing-unit) + var(--spacing-card));
    font-family: var(--font-mono);
    font-size: var(--text-input);
  }
  .meldung-row-inner {
    display: flex;
    flex: 1;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 0 var(--spacing-cell);
    background: var(--color-bg-raised);
    border: var(--card-border);
    border-radius: var(--radius-card);
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

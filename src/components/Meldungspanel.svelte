<script lang="ts">
  import { X } from 'lucide-svelte';
  import type { Eintrag } from '../lib/types';
  import type { MeldungRow } from '../lib/reports';
  import { generiereAlleMeldungen } from '../lib/reports';


  let { signale, onclose }: { signale: Eintrag[]; onclose: () => void } = $props();

  let meldungen: MeldungRow[] = $derived(generiereAlleMeldungen(signale));
</script>

<div class="py-half-card">
  {#each meldungen as m, idx}
    <div class="meldung-row flex flex-col justify-center px-card py-half-card">
      {#if m.note !== undefined || m.knoten || m.abzweigung || m.import}
        <div class="meldung-row-inner muted flex flex-1 flex-col items-center justify-center px-cell">
          <div class="meldung-text muted-text">{m.note !== undefined ? 'NOTIZ' : m.knoten ? 'KNOTEN' : m.abzweigung ? 'ABZWEIGUNG' : 'QUELLE'}</div>
        </div>
      {:else if m.error === 'Kein Signal'}
        <div class="meldung-row-inner muted flex flex-1 flex-col items-center justify-center px-cell"></div>
      {:else if m.error}
        <div class="meldung-row-inner error flex flex-1 flex-col items-center justify-center px-cell">
          <div class="meldung-text meldung-error">{m.error}</div>
        </div>
      {:else if m.segments.length === 1}
        {@const seg = m.segments[0]}
        <div class="meldung-row-inner meldung-colored {seg.klasse} flex flex-1 flex-col items-center justify-center px-cell">
          <div class="meldung-text">
            <span class:fett={seg.fett}>{seg.meldung}</span>
          </div>
        </div>
      {:else}
        {@const primaryClass = m.segments[0].klasse}
        <div class="meldung-row-inner meldung-colored {primaryClass} flex flex-1 flex-col items-center justify-center px-cell">
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
  <div class="mx-card my-half-card">
    <button class="close-btn hl flex w-full items-center justify-center gap-card px-cell" onclick={onclose} title="Meldungen schließen">
      <X size={16} strokeWidth={2.5} />
      Schließen
    </button>
  </div>
</div>

<style>
  .meldung-row {
    min-height: calc(var(--spacing-row) + var(--spacing-card));
    font-family: var(--font-mono);
    font-size: var(--text-input);
  }
  .meldung-row-inner {
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
  .meldung-text { font-weight: var(--font-weight-medium); }
  .muted-text { color: var(--color-text-muted); font-style: italic; }
  .meldung-error { color: var(--color-red); font-style: italic; }
  .fett { font-weight: var(--font-weight-bold); }

  .meldung-colored { border-color: currentColor; }
  .close-btn {
    height: calc(var(--spacing-row) / 2 - var(--spacing-card) / 2);
    border-radius: var(--radius-card);
    cursor: pointer;
    font-weight: var(--font-weight-semibold);
    font-size: var(--text-input);
    background: var(--color-bg-raised);
    border: var(--card-border);
    color: var(--color-red);
    box-sizing: border-box;
  }
</style>

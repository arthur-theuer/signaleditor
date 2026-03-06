<script lang="ts">
  let {
    hasFile,
    error,
    stitchFull,
    stitchMedium,
    stitchCompact,
    countFull,
    countMedium,
    countShort,
  }: {
    hasFile: boolean;
    error: string | null;
    stitchFull: string;
    stitchMedium: string;
    stitchCompact: string;
    countFull: string;
    countMedium: string;
    countShort: string;
  } = $props();
</script>

<div class={['row-cell import-info-cell', { empty: !hasFile }]}>
  <div class="import-info">
    {#if error}
      <span class="import-error">{error}</span>
    {:else if hasFile && !error}
      <span class="import-stitch tier-full">{stitchFull || '—'}</span>
      <span class="import-stitch tier-medium">{stitchMedium || '—'}</span>
      <span class="import-stitch tier-compact">{stitchCompact || '—'}</span>
      <span class="import-divider"></span>
      <span class="import-count tier-full">{countFull || '—'}</span>
      <span class="import-count tier-medium">{countMedium || '—'}</span>
      <span class="import-count tier-compact">{countShort || '—'}</span>
    {/if}
  </div>
</div>

<style>
  .import-info-cell {
    background: var(--color-import);
    container-type: inline-size;
    overflow: hidden;
    display: flex;
    border: var(--cell-border);
    border-radius: var(--radius-card);
    position: relative;
    flex: 1;
    min-width: 0;
    height: var(--spacing-unit);
  }
  .import-info-cell.empty {
    background: var(--color-bg);
    pointer-events: none;
  }
  .import-info {
    display: flex;
    align-items: center;
    height: 100%;
    width: 100%;
    overflow: hidden;
  }
  .import-divider {
    border-left: 1px solid var(--color-border);
    align-self: stretch;
  }
  .import-count,
  .import-stitch,
  .import-error {
    font-size: var(--text-input);
    font-family: var(--font-mono);
    white-space: nowrap;
    overflow: hidden;
    padding: 0 var(--spacing-cell);
    flex: 1;
    min-width: 0;
  }
  .import-count {
    color: var(--color-text-secondary);
    flex: 1.5;
  }
  .import-stitch {
    color: var(--color-import-text);
  }
  .import-error {
    color: var(--color-red);
  }

  /* Tier visibility: compact shown by default, wider tiers override */
  .tier-full,
  .tier-medium {
    display: none;
  }
  .tier-compact {
    display: block;
  }

  @container (min-width: 300px) {
    .tier-medium {
      display: block;
    }
    .tier-compact {
      display: none;
    }
  }

  @container (min-width: 420px) {
    .tier-full {
      display: block;
    }
    .tier-medium {
      display: none;
    }
  }
</style>

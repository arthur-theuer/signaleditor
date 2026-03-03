<script lang="ts">
  let {
    fileName,
    saveStatus,
  }: {
    fileName: string;
    saveStatus: 'saved' | 'saving' | 'dirty' | 'idle';
  } = $props();
</script>

<span
  class={['file-indicator', { dirty: saveStatus === 'dirty', saving: saveStatus === 'saving', saved: saveStatus === 'saved' }]}
>
  <span class="status-dot"></span>
  <span class="file-name">{fileName}</span>
  <span class="status-label">
    {#if saveStatus === 'saving'}Speichern{:else if saveStatus === 'saved'}Gespeichert{:else if saveStatus === 'dirty'}Ungespeichert{/if}
  </span>
</span>

<style>
  .file-indicator {
    position: relative;
    display: flex;
    flex: 1;
    min-width: 0;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-sm);
    padding: 0 var(--spacing-md);
    height: var(--spacing-unit);
    font-size: var(--text-input);
    font-family: var(--font-mono);
    color: var(--color-text-secondary);
  }
  @media (min-width: 640px) {
    .file-indicator {
      justify-content: flex-start;
    }
  }
  .file-name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .status-dot {
    width: var(--spacing-md);
    height: var(--spacing-md);
    border-radius: 50%;
    flex-shrink: 0;
  }
  .file-indicator.dirty .status-dot {
    background: var(--color-red);
  }
  .file-indicator.saving .status-dot {
    background: var(--color-clear);
  }
  .file-indicator.saved .status-dot {
    background: var(--color-green);
  }
  .status-label {
    display: none;
    position: absolute;
    top: calc(100% + var(--spacing-card));
    left: 50%;
    transform: translateX(-50%);
    height: calc(var(--spacing-unit) / 2);
    align-items: center;
    justify-content: center;
    padding: 0 var(--spacing-cell);
    border-radius: var(--radius-container);
    font-size: var(--text-caption);
    font-family: var(--font-sans);
    font-weight: var(--font-weight-medium);
    white-space: nowrap;
    pointer-events: none;
    z-index: 1;
  }
  .file-indicator:hover .status-label {
    display: flex;
  }
  .file-indicator.dirty .status-label {
    background: var(--color-red-bg);
    color: var(--color-red);
    border: 1px solid var(--color-red);
  }
  .file-indicator.saving .status-label {
    background: var(--color-bg-raised);
    color: var(--color-clear);
    border: 1px solid var(--color-clear);
  }
  .file-indicator.saved .status-label {
    background: var(--color-green-bg);
    color: var(--color-green);
    border: 1px solid var(--color-green);
  }
</style>

<script lang="ts">
  import type { Editordaten } from '../lib/types';
  import { generateYAML } from '../lib/yaml';
  import { dateiId } from '../lib/types';

  let { data, onexport }: { data: Editordaten; onexport?: () => void } = $props();

  let yamlText = $derived(generateYAML(data));
  let copyLabel = $state('Kopieren');

  function copyYaml() {
    navigator.clipboard.writeText(yamlText).then(() => {
      copyLabel = 'Kopiert!';
      setTimeout(() => (copyLabel = 'Kopieren'), 1500);
    });
  }

  function downloadYaml() {
    const blob = new Blob([yamlText], { type: 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${dateiId(data) || 'signale'}.yaml`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    onexport?.();
  }
</script>

<div class="yaml-output">
  <pre>{yamlText}</pre>
  <div class="yaml-actions">
    <button class="yaml-btn btn" onclick={copyYaml} tabindex={-1}>{copyLabel}</button>
    <button class="yaml-btn btn" onclick={downloadYaml} tabindex={-1}>Herunterladen</button>
  </div>
</div>

<style>
  .yaml-output {
    position: relative;
    margin-bottom: var(--spacing-page);
    background: var(--color-bg-subtle);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-container);
  }
  .yaml-actions {
    position: absolute;
    top: var(--spacing-card);
    right: var(--spacing-card);
    display: flex;
    gap: var(--spacing-card);
  }
  pre {
    color: var(--color-text);
    padding: var(--spacing-xl);
    font-size: var(--text-caption);
    white-space: pre-wrap;
    max-height: calc(10 * var(--spacing-unit));
    overflow-y: auto;
    margin: 0;
  }
  /* Extends .btn */
  .yaml-btn {
    padding: var(--spacing-md) var(--spacing-cell);
    font-size: var(--text-input);
    font-weight: var(--font-weight-medium);
  }
</style>

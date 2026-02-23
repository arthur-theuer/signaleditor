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
      setTimeout(() => copyLabel = 'Kopieren', 1500);
    });
  }

  function downloadYaml() {
    const blob = new Blob([yamlText], { type: 'text/yaml' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${dateiId(data) || 'signale'}.yaml`;
    a.click();
    URL.revokeObjectURL(a.href);
    onexport?.();
  }
</script>

<div class="yaml-output">
  <pre>{yamlText}</pre>
  <div class="yaml-actions">
    <button class="yaml-btn" onclick={copyYaml} tabindex={-1}>{copyLabel}</button>
    <button class="yaml-btn" onclick={downloadYaml} tabindex={-1}>Herunterladen</button>
  </div>
</div>

<style>
  .yaml-output {
    position: relative;
    background: var(--color-code-bg);
    border: 1px solid var(--color-code-border);
    border-radius: var(--radius-container);
    margin-bottom: var(--spacing-page);
  }
  pre {
    color: var(--color-code-text);
    padding: var(--spacing-xl);
    font-family: monospace;
    font-size: var(--text-preview);
    white-space: pre-wrap;
    max-height: 400px;
    overflow-y: auto;
    margin: 0;
  }
  .yaml-actions {
    position: absolute;
    top: var(--spacing-card);
    right: var(--spacing-card);
    display: flex;
    gap: var(--spacing-card);
  }
  .yaml-btn {
    padding: var(--spacing-md) var(--spacing-cell);
    background: var(--color-code-btn-bg);
    color: var(--color-code-btn-text);
    border: 1px solid var(--color-code-btn-border);
    border-radius: var(--radius-card);
    cursor: pointer;
    font-size: var(--text-input);
    font-weight: var(--font-weight-medium);
  }
  .yaml-btn:hover {
    background: var(--color-code-btn-hover-bg);
    color: var(--color-code-btn-hover-text);
    border-color: var(--color-code-btn-hover-border);
  }
</style>

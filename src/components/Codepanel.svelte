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
    background: #1e1e1e;
    border: 1px solid #555;
    border-radius: var(--container-radius);
    margin-top: var(--page-gap);
    margin-bottom: var(--page-gap);
  }
  pre {
    color: #d4d4d4;
    padding: 16px;
    font-family: monospace;
    font-size: 12px;
    white-space: pre-wrap;
    max-height: 400px;
    overflow-y: auto;
    margin: 0;
  }
  .yaml-actions {
    position: absolute;
    top: var(--card-gap);
    right: var(--card-gap);
    display: flex;
    gap: var(--card-gap);
  }
  .yaml-btn {
    padding: 8px 12px;
    background: #333;
    color: #aaa;
    border: 1px solid #555;
    border-radius: var(--card-radius);
    cursor: pointer;
    font-size: 13px;
    font-weight: 500;
  }
  .yaml-btn:hover {
    background: #444;
    color: #ddd;
    border-color: #777;
  }
</style>

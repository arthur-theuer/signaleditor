<script lang="ts">
  import { listFiles, loadFile, deleteFile, type FileInfo } from '../lib/api';

  let {
    onload,
    onclose,
  }: {
    onload: (content: string, fileName: string, typ: 'videos' | 'strecken') => void;
    onclose: () => void;
  } = $props();

  let activeTab = $state<'videos' | 'strecken'>('videos');
  let files = $state<FileInfo[]>([]);
  let loading = $state(false);
  let error = $state<string | null>(null);

  async function refresh() {
    loading = true;
    error = null;
    try {
      files = await listFiles(activeTab);
    } catch (e: any) {
      error = e.message;
      files = [];
    } finally {
      loading = false;
    }
  }

  // Refresh when tab changes
  $effect(() => {
    activeTab;
    refresh();
  });

  async function handleLoad(file: FileInfo) {
    try {
      const content = await loadFile(activeTab, file.name);
      onload(content, file.name, activeTab);
    } catch (e: any) {
      alert(`Laden fehlgeschlagen: ${e.message}`);
    }
  }

  async function handleDelete(file: FileInfo) {
    if (!confirm(`"${file.name}" löschen?`)) return;
    try {
      await deleteFile(activeTab, file.name);
      await refresh();
    } catch (e: any) {
      alert(`Löschen fehlgeschlagen: ${e.message}`);
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') onclose();
  }

  function handleClickOutside(e: MouseEvent) {
    const panel = (e.target as HTMLElement).closest('.dateibrowser');
    if (!panel) onclose();
  }
</script>

<svelte:window onkeydown={handleKeydown} onclick={handleClickOutside} />

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="dateibrowser" onclick={(e) => e.stopPropagation()}>
  <div class="tabs">
    <button
      class="tab"
      class:active={activeTab === 'videos'}
      onclick={() => activeTab = 'videos'}
    >Videos</button>
    <button
      class="tab"
      class:active={activeTab === 'strecken'}
      onclick={() => activeTab = 'strecken'}
    >Strecken</button>
  </div>

  <div class="file-list">
    {#if loading}
      <div class="status">Laden...</div>
    {:else if error}
      <div class="status error">{error}</div>
    {:else if files.length === 0}
      <div class="status">Keine Dateien</div>
    {:else}
      {#each files as file}
        <div class="file-row">
          <button class="file-name" onclick={() => handleLoad(file)} title={file.name}>
            {file.name}
          </button>
          <button class="file-delete" onclick={() => handleDelete(file)} title="Löschen">✕</button>
        </div>
      {/each}
    {/if}
  </div>
</div>

<style>
  .dateibrowser {
    position: fixed;
    top: 70px;
    left: 50%;
    transform: translateX(-50%);
    width: 400px;
    max-height: 60vh;
    background: var(--color-bg-raised);
    border: var(--card-border);
    border-radius: var(--container-radius);
    z-index: 100;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  .tabs {
    display: flex;
    border-bottom: 1px solid var(--color-border);
  }
  .tab {
    flex: 1;
    padding: 10px 0;
    font-size: 13px;
    font-weight: 600;
    background: var(--color-bg-subtle);
    border: none;
    border-bottom: 2px solid transparent;
    cursor: pointer;
    color: var(--color-text-secondary);
  }
  .tab.active {
    background: var(--color-bg-raised);
    border-bottom-color: var(--color-focus);
    color: var(--color-text);
  }
  .file-list {
    overflow-y: auto;
    flex: 1;
  }
  .file-row {
    display: flex;
    align-items: center;
    border-bottom: 1px solid var(--color-border);
  }
  .file-row:last-child {
    border-bottom: none;
  }
  .file-name {
    flex: 1;
    padding: 10px 14px;
    font-size: 13px;
    font-family: monospace;
    text-align: left;
    background: none;
    border: none;
    cursor: pointer;
    color: var(--color-text);
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  .file-name:hover {
    background: var(--color-focus-bg);
    color: var(--color-focus);
  }
  .file-delete {
    width: 36px;
    height: 36px;
    padding: 0;
    margin-right: 4px;
    font-size: 14px;
    background: none;
    border: none;
    cursor: pointer;
    color: var(--color-text-muted);
    border-radius: var(--card-radius);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .file-delete:hover {
    background: var(--color-red-bg);
    color: var(--color-red);
  }
  .status {
    padding: 20px 14px;
    font-size: 13px;
    color: var(--color-text-muted);
    text-align: center;
  }
  .status.error {
    color: var(--color-red);
  }
</style>

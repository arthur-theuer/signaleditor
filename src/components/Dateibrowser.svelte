<script lang="ts">
  import { Trash2, Check } from 'lucide-svelte';
  import { listFiles, loadFile, deleteFile, type FileInfo } from '../lib/api';

  let {
    onload,
    onclose,
    mode = 'manage',
    lockedTab,
    usedFiles = new Set<string>(),
  }: {
    onload: (content: string, fileName: string, typ: 'videos' | 'strecken') => void;
    onclose: () => void;
    mode?: 'manage' | 'select';
    lockedTab?: 'videos' | 'strecken';
    usedFiles?: Set<string>;
  } = $props();

  let activeTab: 'videos' | 'strecken' = $state(lockedTab ?? 'videos');
  let files: FileInfo[] = $state([]);
  let loading = $state(false);
  let error: string | null = $state(null);

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
    if (!confirm(`"${file.name}" wirklich löschen?`)) return;
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

  function handleBackdropClick(e: MouseEvent) {
    if ((e.target as HTMLElement).classList.contains('dateibrowser-overlay')) {
      onclose();
    }
  }

  function isFileUsed(file: FileInfo): boolean {
    return usedFiles.has(file.name);
  }

  function formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleDateString('de-CH', { day: '2-digit', month: '2-digit', year: 'numeric' })
      + ' ' + d.toLocaleTimeString('de-CH', { hour: '2-digit', minute: '2-digit' });
  }
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="dateibrowser-overlay" onclick={handleBackdropClick}>
  <div class="dateibrowser">
    <div class="tab-header">
      <button
        class="tab-btn hl"
        class:active={activeTab === 'videos'}
        class:disabled={lockedTab !== undefined && lockedTab !== 'videos'}
        disabled={lockedTab !== undefined && lockedTab !== 'videos'}
        onclick={() => activeTab = 'videos'}
      >Videos</button>
      <button
        class="tab-btn hl"
        class:active={activeTab === 'strecken'}
        class:disabled={lockedTab !== undefined && lockedTab !== 'strecken'}
        disabled={lockedTab !== undefined && lockedTab !== 'strecken'}
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
          {@const used = mode === 'select' && isFileUsed(file)}
          <div class="file-row">
            <button
              class="file-card hl"
              class:used
              disabled={used}
              onclick={() => handleLoad(file)}
            >
              <span class="file-name">{file.name}</span>
              <span class="file-date">{formatDate(file.uploadedAt)}</span>
            </button>
            {#if mode === 'manage'}
              <button class="delete-btn hl" onclick={() => handleDelete(file)} title="Löschen">
                <Trash2 size={16} strokeWidth={2.5} />
              </button>
            {:else if used}
              <div class="used-indicator">
                <Check size={16} strokeWidth={2.5} />
              </div>
            {/if}
          </div>
        {/each}
      {/if}
    </div>
  </div>
</div>

<style>
  .dateibrowser-overlay {
    position: fixed;
    inset: 0;
    z-index: 100;
    background: rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .dateibrowser {
    width: 100%;
    max-width: 600px;
    max-height: 80vh;
    display: flex;
    flex-direction: column;
    background: var(--color-bg);
    border: var(--card-border);
    border-radius: var(--container-radius);
  }
  .tab-header {
    display: flex;
    margin: -1px -1px 0 -1px;
  }
  .tab-btn {
    flex: 1;
    padding: 14px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    background: var(--color-bg-raised);
    color: var(--color-text-secondary);
    border: var(--card-border);
  }
  .tab-btn:first-child {
    border-radius: var(--container-radius) 0 0 0;
    border-right: none;
  }
  .tab-btn:last-child {
    border-radius: 0 var(--container-radius) 0 0;
    border-left: none;
  }
  .tab-btn:hover::after {
    opacity: 0;
  }
  .tab-btn.active::after {
    opacity: 1;
  }
  .tab-btn.disabled {
    opacity: 0.4;
    cursor: default;
    pointer-events: none;
  }
  .file-list {
    height: 360px;
    overflow-y: auto;
    overflow-x: hidden;
    padding: var(--half-gap) 0;
  }
  .file-row {
    display: flex;
    gap: var(--card-gap);
    padding: var(--half-gap) var(--card-gap);
    align-items: stretch;
  }
  .file-card {
    flex: 1;
    height: var(--unit);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 16px;
    background: var(--color-bg-raised);
    border: var(--card-border);
    border-radius: var(--card-radius);
    cursor: pointer;
    font-size: 14px;
    text-align: left;
  }
  .file-card.used {
    opacity: 0.4;
    cursor: default;
    pointer-events: none;
  }
  .file-name {
    font-weight: 500;
    font-family: monospace;
  }
  .file-date {
    color: var(--color-text-secondary);
    font-size: 12px;
    white-space: nowrap;
    margin-left: 16px;
  }
  .delete-btn {
    width: var(--unit);
    height: var(--unit);
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--color-bg-raised);
    border: var(--card-border);
    border-radius: var(--card-radius);
    cursor: pointer;
    color: var(--color-red);
    flex-shrink: 0;
  }
  .used-indicator {
    width: var(--unit);
    height: var(--unit);
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--color-green-bg);
    border: 1px solid var(--color-green);
    border-radius: var(--card-radius);
    color: var(--color-green);
    flex-shrink: 0;
  }
  .status {
    padding: 24px;
    text-align: center;
    color: var(--color-text-secondary);
    font-size: 14px;
  }
  .status.error {
    color: var(--color-red);
  }
</style>

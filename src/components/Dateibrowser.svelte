<script lang="ts">
  import { Trash2, Check, Pencil } from 'lucide-svelte';
  import { listFiles, loadFile, deleteFile, renameFile, type FileInfo, type StoragePrefix } from '../lib/api';
  import { invalidateImportCache } from '../lib/sources';

  let {
    onload,
    onclose,
    mode = 'manage',
    lockedTab,
    usedFiles = new Set<string>(),
  }: {
    onload: (content: string, fileName: string, typ: StoragePrefix) => void;
    onclose: () => void;
    mode?: 'manage' | 'select';
    lockedTab?: StoragePrefix;
    usedFiles?: Set<string>;
  } = $props();

  let activeTab: StoragePrefix = $state(lockedTab ?? 'strecken');
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
      invalidateImportCache(file.name);
      await refresh();
    } catch (e: any) {
      alert(`Löschen fehlgeschlagen: ${e.message}`);
    }
  }

  let renamingFile: string | null = $state(null);
  let renameValue = $state('');

  function startRename(file: FileInfo) {
    renamingFile = file.name;
    // Strip .yaml extension for editing
    renameValue = file.name.replace(/\.ya?ml$/, '');
  }

  async function submitRename(file: FileInfo) {
    const newName = renameValue.trim();
    if (!newName || newName === file.name.replace(/\.ya?ml$/, '')) {
      renamingFile = null;
      return;
    }
    const ext = file.name.match(/\.ya?ml$/)?.[0] || '.yaml';
    const fullNewName = newName + ext;
    try {
      await renameFile(activeTab, file.name, fullNewName);
      invalidateImportCache(file.name);
      renamingFile = null;
      await refresh();
    } catch (e: any) {
      alert(`Umbenennen fehlgeschlagen: ${e.message}`);
    }
  }

  function cancelRename() {
    renamingFile = null;
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      if (renamingFile) { cancelRename(); e.stopPropagation(); }
      else onclose();
    }
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
        class:active={activeTab === 'strecken'}
        class:disabled={lockedTab !== undefined && lockedTab !== 'strecken'}
        disabled={lockedTab !== undefined && lockedTab !== 'strecken'}
        onclick={() => activeTab = 'strecken'}
      >Strecken</button>
      <button
        class="tab-btn hl"
        class:active={activeTab === 'routen'}
        class:disabled={lockedTab !== undefined && lockedTab !== 'routen'}
        disabled={lockedTab !== undefined && lockedTab !== 'routen'}
        onclick={() => activeTab = 'routen'}
      >Routen</button>
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
            {#if renamingFile === file.name}
              <div class="file-card rename-card">
                <input
                  class="rename-input"
                  type="text"
                  bind:value={renameValue}
                  onkeydown={(e) => { if (e.key === 'Enter') submitRename(file); if (e.key === 'Escape') { cancelRename(); e.stopPropagation(); } }}
                  autofocus
                  autocomplete="off" autocorrect="off" spellcheck="false"
                />
                <span class="rename-ext">{file.name.match(/\.ya?ml$/)?.[0] || '.yaml'}</span>
              </div>
              <button class="action-btn confirm-btn hl" onclick={() => submitRename(file)} title="Bestätigen">
                <Check size={16} strokeWidth={1.5} />
              </button>
            {:else}
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
                <button class="action-btn rename-btn hl" onclick={() => startRename(file)} title="Umbenennen">
                  <Pencil size={16} strokeWidth={1.5} />
                </button>
                <button class="action-btn delete-btn hl" onclick={() => handleDelete(file)} title="Löschen">
                  <Trash2 size={16} strokeWidth={1.5} />
                </button>
              {:else if used}
                <div class="used-indicator">
                  <Check size={16} strokeWidth={1.5} />
                </div>
              {/if}
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
    margin: 0 var(--spacing-page);
    max-height: 80vh;
    display: flex;
    flex-direction: column;
    background: var(--color-bg);
    border: var(--card-border);
    border-radius: var(--radius-container);
  }
  .tab-header {
    display: flex;
    margin: -1px -1px 0 -1px;
  }
  .tab-btn {
    flex: 1;
    padding: var(--spacing-cell);
    font-size: var(--text-input);
    font-weight: var(--font-weight-semibold);
    cursor: pointer;
    background: var(--color-bg-raised);
    color: var(--color-text-secondary);
    border: var(--card-border);
  }
  .tab-btn:first-child {
    border-radius: var(--radius-container) 0 0 0;
    border-right: none;
  }
  .tab-btn:last-child {
    border-radius: 0 var(--radius-container) 0 0;
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
    padding: var(--spacing-half-card) 0;
  }
  .file-row {
    display: flex;
    gap: var(--spacing-card);
    padding: var(--spacing-half-card) var(--spacing-card);
    align-items: stretch;
  }
  .file-card {
    flex: 1;
    height: var(--spacing-unit);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 var(--spacing-xl);
    background: var(--color-bg-raised);
    border: var(--card-border);
    border-radius: var(--radius-card);
    cursor: pointer;
    font-size: var(--text-input);
    text-align: left;
  }
  .file-card.used {
    opacity: 0.4;
    cursor: default;
    pointer-events: none;
  }
  .file-name {
    font-weight: var(--font-weight-medium);
    font-family: var(--font-mono);
  }
  .file-date {
    color: var(--color-text-secondary);
    font-size: var(--text-preview);
    white-space: nowrap;
    margin-left: var(--spacing-xl);
  }
  .action-btn {
    width: var(--spacing-unit);
    height: var(--spacing-unit);
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--color-bg-raised);
    border: var(--card-border);
    border-radius: var(--radius-card);
    cursor: pointer;
    flex-shrink: 0;
  }
  .delete-btn { color: var(--color-red); }
  .rename-btn { color: var(--color-text-secondary); }
  .confirm-btn { color: var(--color-green); }
  .rename-card {
    cursor: default;
  }
  .rename-input {
    flex: 1;
    min-width: 0;
    border: none;
    background: transparent;
    font-size: var(--text-input);
    font-family: var(--font-mono);
    font-weight: var(--font-weight-medium);
    outline: none;
  }
  .rename-ext {
    color: var(--color-text-muted);
    font-size: var(--text-input);
    font-family: var(--font-mono);
    white-space: nowrap;
  }
  .used-indicator {
    width: var(--spacing-unit);
    height: var(--spacing-unit);
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--color-green-bg);
    border: 1px solid var(--color-green);
    border-radius: var(--radius-card);
    color: var(--color-green);
    flex-shrink: 0;
  }
  .status {
    padding: var(--spacing-2xl);
    text-align: center;
    color: var(--color-text-secondary);
    font-size: var(--text-input);
  }
  .status.error {
    color: var(--color-red);
  }
</style>

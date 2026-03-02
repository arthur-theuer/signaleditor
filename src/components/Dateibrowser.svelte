<script lang="ts">
  import { Trash2, Check, Pencil, Milestone, Route, LoaderCircle } from 'lucide-svelte';
  import { ICON } from '../lib/constants';
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

  const initialTab = lockedTab ?? 'strecken';
  let activeTab: StoragePrefix = $state(initialTab);
  let filesPromise: Promise<FileInfo[]> = $state(listFiles(activeTab));

  $effect(() => {
    filesPromise = listFiles(activeTab);
  });

  function refresh() {
    filesPromise = listFiles(activeTab);
  }

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
      refresh();
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
      refresh();
    } catch (e: any) {
      alert(`Umbenennen fehlgeschlagen: ${e.message}`);
    }
  }

  function cancelRename() {
    renamingFile = null;
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      if (renamingFile) {
        cancelRename();
        e.stopPropagation();
      } else onclose();
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
    return (
      d.toLocaleDateString('de-CH', { day: '2-digit', month: '2-digit', year: 'numeric' }) +
      ' ' +
      d.toLocaleTimeString('de-CH', { hour: '2-digit', minute: '2-digit' })
    );
  }
</script>

<svelte:window onkeydown={handleKeydown} />

<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
<div class="dateibrowser-overlay" onclick={handleBackdropClick}>
  <div class="dateibrowser">
    <div class="tab-header">
      <button
        class={['tab-btn btn', { active: activeTab === 'strecken', disabled: lockedTab !== undefined && lockedTab !== 'strecken' }]}
        disabled={lockedTab !== undefined && lockedTab !== 'strecken'}
        onclick={() => (activeTab = 'strecken')}><Milestone {...ICON} /> Strecken</button
      >
      <button
        class={['tab-btn btn', { active: activeTab === 'routen', disabled: lockedTab !== undefined && lockedTab !== 'routen' }]}
        disabled={lockedTab !== undefined && lockedTab !== 'routen'}
        onclick={() => (activeTab = 'routen')}><Route {...ICON} /> Routen</button
      >
    </div>

    <div class="file-list">
      {#await filesPromise}
        <div class="status"><LoaderCircle {...ICON} class="spinner" /></div>
      {:then files}
        {#if files.length === 0}
          <div class="status">Keine Dateien</div>
        {:else}
          {#each files as file}
            {@const used = mode === 'select' && isFileUsed(file)}
            <div class="file-row">
              {#if renamingFile === file.name}
                <div class="file-card rename-card">
                  <!-- svelte-ignore a11y_autofocus -->
                  <input
                    class="rename-input"
                    type="text"
                    bind:value={renameValue}
                    onkeydown={(e) => {
                      if (e.key === 'Enter') submitRename(file);
                      if (e.key === 'Escape') {
                        cancelRename();
                        e.stopPropagation();
                      }
                    }}
                    autofocus
                    autocomplete="off"
                    autocorrect="off"
                    spellcheck="false"
                  />
                  <span class="rename-ext">{file.name.match(/\.ya?ml$/)?.[0] || '.yaml'}</span>
                </div>
                <button class="action-btn confirm-btn btn" onclick={() => submitRename(file)} title="Bestätigen">
                  <Check {...ICON} />
                </button>
              {:else}
                <button class={['file-card btn', { used }]} disabled={used} onclick={() => handleLoad(file)}>
                  <span class="file-name">{file.name}</span>
                  <span class="file-date">{formatDate(file.uploadedAt)}</span>
                </button>
                {#if mode === 'manage'}
                  <button class="action-btn rename-btn btn" onclick={() => startRename(file)} title="Umbenennen">
                    <Pencil {...ICON} />
                  </button>
                  <button class="action-btn delete-btn btn" onclick={() => handleDelete(file)} title="Löschen">
                    <Trash2 {...ICON} />
                  </button>
                {:else if used}
                  <div class="used-indicator">
                    <Check {...ICON} />
                  </div>
                {/if}
              {/if}
            </div>
          {/each}
        {/if}
      {:catch error}
        <div class="status error">{error.message}</div>
      {/await}
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
  /* Extends .btn — tab-specific overrides */
  .tab-btn {
    flex: 1;
    gap: var(--spacing-card);
    padding: var(--spacing-cell);
    font-size: var(--text-input);
    font-weight: var(--font-weight-semibold);
  }
  .tab-btn:first-child {
    border-radius: var(--radius-container) 0 0 0;
    border-right: none;
  }
  .tab-btn:last-child {
    border-radius: 0 var(--radius-container) 0 0;
    border-left: none;
  }
  .tab-btn:hover:not(:disabled) {
    color: var(--color-text);
  }
  .tab-btn.active {
    color: var(--color-focus);
    outline: 2px solid var(--color-focus);
    outline-offset: -2px;
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
  /* Extends .btn */
  .file-card {
    flex: 1;
    height: var(--spacing-unit);
    justify-content: space-between;
    padding: 0 var(--spacing-xl);
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
    font-size: var(--text-caption);
    white-space: nowrap;
    margin-left: var(--spacing-xl);
  }
  /* Extends .btn */
  .action-btn {
    width: var(--spacing-unit);
    height: var(--spacing-unit);
    flex-shrink: 0;
  }
  .delete-btn {
    color: var(--color-red);
  }
  .rename-btn {
    color: var(--color-text-secondary);
  }
  .confirm-btn {
    color: var(--color-green);
  }
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
  .status :global(.spinner) {
    animation: spin 1s linear infinite;
  }
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
  .status.error {
    color: var(--color-red);
  }
</style>

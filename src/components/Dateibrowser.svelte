<script lang="ts">
  import { Milestone, Route, LoaderCircle } from 'lucide-svelte';
  import { ICON } from '../lib/constants';
  import { listFiles, loadFile, deleteFile, renameFile, type FileInfo, type StoragePrefix } from '../lib/api';
  import { invalidateImportCache } from '../lib/sources';
  import Dateibrowsereintrag from './ui/Dateibrowsereintrag.svelte';

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

  async function handleRename(file: FileInfo, newName: string) {
    try {
      await renameFile(activeTab, file.name, newName);
      invalidateImportCache(file.name);
      refresh();
    } catch (e: any) {
      alert(`Umbenennen fehlgeschlagen: ${e.message}`);
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
        <div class="status loading"><LoaderCircle size={32} strokeWidth={1.5} class="spinner" /></div>
      {:then files}
        {#if files.length === 0}
          <div class="status">Keine Dateien</div>
        {:else}
          {#each files as file}
            <Dateibrowsereintrag
              {file}
              {mode}
              used={mode === 'select' && isFileUsed(file)}
              onload={() => handleLoad(file)}
              ondelete={() => handleDelete(file)}
              onrename={(newName) => handleRename(file, newName)}
            />
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

  .status {
    padding: var(--spacing-2xl);
    text-align: center;
    color: var(--color-text-secondary);
    font-size: var(--text-input);
  }
  .status.loading {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    padding: 0;
    box-sizing: border-box;
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

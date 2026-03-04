<script lang="ts">
  import { Trash2, Check, Pencil } from 'lucide-svelte';
  import { ICON } from '../../lib/constants';
  import type { FileInfo } from '../../lib/api';

  let {
    file,
    mode,
    used = false,
    onload,
    ondelete,
    onrename,
  }: {
    file: FileInfo;
    mode: 'manage' | 'select';
    used?: boolean;
    onload: () => void;
    ondelete: () => void;
    onrename: (newName: string) => void;
  } = $props();

  let renaming = $state(false);
  let renameValue = $state('');

  function startRename() {
    renaming = true;
    renameValue = file.name.replace(/\.ya?ml$/, '');
  }

  function submitRename() {
    const newName = renameValue.trim();
    if (!newName || newName === file.name.replace(/\.ya?ml$/, '')) {
      renaming = false;
      return;
    }
    const ext = file.name.match(/\.ya?ml$/)?.[0] || '.yaml';
    onrename(newName + ext);
    renaming = false;
  }

  function cancelRename() {
    renaming = false;
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

<div class="file-row">
  {#if renaming}
    <div class="file-card rename-card">
      <!-- svelte-ignore a11y_autofocus -->
      <input
        class="rename-input"
        type="text"
        bind:value={renameValue}
        onkeydown={(e) => {
          if (e.key === 'Enter') submitRename();
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
    <button class="file-action-btn confirm-btn btn" onclick={submitRename} title="Bestätigen">
      <Check {...ICON} />
    </button>
  {:else}
    <button class={['file-card btn', { used }]} disabled={used} onclick={onload}>
      <span class="file-name">{file.name}</span>
      <span class="file-date">{formatDate(file.uploadedAt)}</span>
    </button>
    {#if mode === 'manage'}
      <button class="file-action-btn rename-btn btn" onclick={startRename} title="Umbenennen">
        <Pencil {...ICON} />
      </button>
      <button class="file-action-btn delete-btn btn" onclick={ondelete} title="Löschen">
        <Trash2 {...ICON} />
      </button>
    {:else if used}
      <div class="used-indicator">
        <Check {...ICON} />
      </div>
    {/if}
  {/if}
</div>

<style>
  .file-row {
    display: flex;
    gap: var(--spacing-card);
    padding: var(--spacing-half-card) var(--spacing-card);
    align-items: stretch;
  }
  /* Extends .btn */
  .file-card {
    flex: 1;
    min-width: 0;
    height: var(--spacing-unit);
    justify-content: space-between;
    padding: 0 var(--spacing-xl);
    font-size: var(--text-input);
    text-align: left;
    overflow: hidden;
  }
  .file-card.used {
    opacity: 0.4;
    cursor: default;
    pointer-events: none;
  }
  .file-name {
    font-weight: var(--font-weight-medium);
    font-family: var(--font-mono);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .file-date {
    color: var(--color-text-secondary);
    font-size: var(--text-caption);
    white-space: nowrap;
    margin-left: var(--spacing-xl);
  }
  /* Extends .btn */
  .file-action-btn {
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
</style>

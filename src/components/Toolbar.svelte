<script lang="ts">
  import { Undo2, Redo2, Upload, Download, Save, Lock, LockOpen } from 'lucide-svelte';

  let {
    showKm,
    showYaml,
    showMeldungen,
    undoEnabled,
    redoEnabled,
    loggedIn,
    onToggleKm,
    onToggleYaml,
    onToggleMeldungen,
    onNew,
    onFileLoad,
    onUndo,
    onRedo,
    onExportMeldungen,
    onLogin,
    onLogout,
    onSave,
    onToggleDateien,
    showDateien,
    saving,
    dirty,
    currentFileName,
    saveStatus,
  }: {
    showKm: boolean;
    showYaml: boolean;
    showMeldungen: boolean;
    undoEnabled: boolean;
    redoEnabled: boolean;
    loggedIn: boolean;
    onToggleKm: () => void;
    onToggleYaml: () => void;
    onToggleMeldungen: () => void;
    onNew: (typ: 'video' | 'strecke') => void;
    onFileLoad: (event: Event) => void;
    onUndo: () => void;
    onRedo: () => void;
    onExportMeldungen: () => void;
    onLogin: () => void;
    onLogout: () => void;
    onSave: () => void;
    onToggleDateien: () => void;
    showDateien: boolean;
    saving: boolean;
    dirty: boolean;
    currentFileName: string | null;
    saveStatus: 'saved' | 'saving' | 'dirty' | 'idle';
  } = $props();

  let fileInput: HTMLInputElement;
</script>

<div class="header" class:logged-out={!loggedIn}>
  <h1>Signaleditor</h1>

  <button id="undoBtn" class="undo-redo-btn hl" disabled={!undoEnabled} onclick={onUndo} title="Rückgängig (Ctrl+Z)">
    <Undo2 size={20} strokeWidth={2} />
  </button>
  <button id="redoBtn" class="undo-redo-btn hl" disabled={!redoEnabled} onclick={onRedo} title="Wiederholen (Ctrl+Y)">
    <Redo2 size={20} strokeWidth={2} />
  </button>

  <input
    type="file"
    accept=".yaml,.yml,.html"
    style="display:none"
    bind:this={fileInput}
    onchange={onFileLoad}
  />
  <button class="hl" onclick={() => onNew('video')}>Neues Video</button>
  <button class="hl" onclick={() => onNew('strecke')}>Neue Strecke</button>
  <button class="icon-btn hl" onclick={() => fileInput.click()} title="Datei laden">
    <Upload size={20} strokeWidth={2} />
  </button>
  <button class="icon-btn download-btn hl" onclick={onExportMeldungen} title="Meldungen exportieren">
    <Download size={20} strokeWidth={2} />
  </button>

  {#if loggedIn}
    <button
      class="save-btn hl"
      onclick={onSave}
      disabled={saving || !dirty}
      title="Speichern (Ctrl+S)"
    >
      <Save size={20} strokeWidth={2} />
    </button>
    <button
      class="dateien-btn hl"
      class:active={showDateien}
      onclick={onToggleDateien}
      title="Dateien"
    >Dateien</button>
  {/if}

  <button
    class="lock-btn hl"
    class:unlocked={loggedIn}
    onclick={() => loggedIn ? onLogout() : onLogin()}
    title={loggedIn ? 'Abmelden' : 'Anmelden (Cloud)'}
  >
    {#if loggedIn}
      <LockOpen size={20} strokeWidth={2} />
    {:else}
      <Lock size={20} strokeWidth={2} />
    {/if}
  </button>

  {#if loggedIn && currentFileName}
    <span class="file-indicator">
      {#if saveStatus === 'saving'}
        <span class="save-status saving">Speichern...</span>
      {:else if saveStatus === 'saved'}
        <span class="save-status saved">Gespeichert</span>
      {:else if saveStatus === 'dirty'}
        <span class="dirty-dot"></span>
      {/if}
      {currentFileName}
    </span>
  {/if}

  <div style="flex: 1;"></div>

  <button class="toggle-btn hl" class:active={showKm} onclick={onToggleKm}>Kilometer</button>
  <button class="toggle-btn hl" class:active={showYaml} onclick={onToggleYaml}>Signaldatei</button>
  <button class="toggle-btn hl" class:active={showMeldungen} onclick={onToggleMeldungen}>Meldungen</button>
</div>

<style>
  .header {
    display: flex;
    gap: 8px;
    margin-bottom: var(--page-gap);
    align-items: center;
    flex-wrap: wrap;
    position: sticky;
    top: 0;
    z-index: 10;
    background: var(--color-bg);
    margin-left: calc(-1 * var(--page-gap));
    margin-right: calc(-1 * var(--page-gap));
    padding: var(--page-gap) var(--page-gap) 12px var(--page-gap);
  }
  .header.logged-out {
    background: var(--color-red-bg);
  }
  .header::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    top: 100%;
    height: 12px;
    background: linear-gradient(var(--color-bg), transparent);
    pointer-events: none;
  }
  .header.logged-out::after {
    background: linear-gradient(var(--color-red-bg), transparent);
  }
  .header h1 { margin-right: 16px; }
  .header button {
    background: var(--color-bg-subtle);
    color: var(--color-text);
    border: 1px solid var(--color-border);
    border-radius: var(--container-radius);
    cursor: pointer;
    font-size: var(--input-font-size);
    font-weight: var(--weight-medium);
    height: var(--unit);
    padding: 0 16px;
  }
  .header .toggle-btn {
    color: var(--color-red);
    border: 1px solid var(--color-red-border);
    background: var(--color-red-bg);
  }
  .header .toggle-btn.active {
    color: var(--color-green);
    background: var(--color-green-bg);
    border-color: var(--color-green);
  }
  .undo-redo-btn:disabled {
    opacity: 0.4;
    cursor: default;
  }
  .header button.undo-redo-btn,
  .header button.icon-btn,
  .header button.lock-btn,
  .header button.save-btn {
    width: var(--unit);
    height: var(--unit);
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--color-bg-raised);
    border: var(--card-border);
    border-radius: var(--container-radius);
    color: var(--color-text-secondary);
  }
  .lock-btn.unlocked {
    background: var(--color-green-bg);
    border-color: var(--color-green);
    color: var(--color-green);
  }
  .download-btn {
    color: var(--color-focus);
  }
  .save-btn {
    color: var(--color-focus);
  }
  .save-btn:disabled {
    opacity: 0.4;
    cursor: default;
  }
  .dateien-btn.active {
    background: var(--color-focus);
    color: var(--color-bg-raised);
    border-color: var(--color-focus-hover);
  }
  .file-indicator {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: var(--input-font-size);
    font-family: monospace;
    color: var(--color-text-secondary);
    padding: 0 8px;
  }
  .dirty-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--color-clear);
    flex-shrink: 0;
  }
  .save-status {
    font-size: var(--preview-font-size);
    font-weight: var(--weight-semibold);
    white-space: nowrap;
  }
  .save-status.saving {
    color: var(--color-clear);
  }
  .save-status.saved {
    color: var(--color-green);
  }
</style>

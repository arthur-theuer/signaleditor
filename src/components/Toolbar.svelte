<script lang="ts">
  import {
    Undo2, Redo2, Upload, Download, Save, Lock, LockOpen,
    Milestone, Route, FolderOpen, RulerDimensionLine, Code, Megaphone,
  } from 'lucide-svelte';

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
    onNew: (typ: 'strecke' | 'route') => void;
    onFileLoad: (event: Event) => void;
    onUndo: () => void;
    onRedo: () => void;
    onExportMeldungen: () => void;
    onLogin: (pin: string) => Promise<boolean>;
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
  let showPinInput = $state(false);
  let pinValue = $state('');
  let pinError = $state(false);
  let pinInputEl = $state<HTMLInputElement>();

  function handleLockClick() {
    if (loggedIn) {
      onLogout();
    } else {
      showPinInput = true;
      pinError = false;
      pinValue = '';
      setTimeout(() => pinInputEl?.focus(), 0);
    }
  }

  async function submitPin() {
    if (!pinValue) return;
    const ok = await onLogin(pinValue);
    if (ok) {
      showPinInput = false;
      pinValue = '';
      pinError = false;
    } else {
      pinError = true;
      pinValue = '';
      pinInputEl?.focus();
    }
  }

  function cancelPin() {
    showPinInput = false;
    pinValue = '';
    pinError = false;
  }
</script>

<div class="header" class:logged-out={!loggedIn}>
  <h1>Signaleditor</h1>

  <!-- Group: History -->
  <div class="btn-group">
    <button id="undoBtn" class="tb-btn hl" disabled={!undoEnabled} onclick={onUndo} title="Rückgängig (Ctrl+Z)">
      <Undo2 size={20} strokeWidth={2} /><span>Rückgängig</span>
    </button>
    <button id="redoBtn" class="tb-btn hl" disabled={!redoEnabled} onclick={onRedo} title="Wiederholen (Ctrl+Y)">
      <Redo2 size={20} strokeWidth={2} /><span>Wiederholen</span>
    </button>
  </div>

  <div class="separator"></div>

  <!-- Group: File -->
  <div class="btn-group">
    <input
      type="file"
      accept=".yaml,.yml,.html"
      style="display:none"
      bind:this={fileInput}
      onchange={onFileLoad}
    />
    <button class="tb-btn hl" onclick={() => onNew('strecke')} title="Neue Strecke">
      <Milestone size={20} strokeWidth={2} /><span>Strecke</span>
    </button>
    <button class="tb-btn hl" onclick={() => onNew('route')} title="Neue Route">
      <Route size={20} strokeWidth={2} /><span>Route</span>
    </button>
    <button class="tb-btn hl" onclick={() => fileInput.click()} title="Datei laden">
      <Upload size={20} strokeWidth={2} /><span>Laden</span>
    </button>
  </div>

  <div class="separator"></div>

  <!-- Group: Cloud -->
  <div class="btn-group">
    <button
      class="tb-btn lock-btn hl"
      class:unlocked={loggedIn}
      onclick={handleLockClick}
      title={loggedIn ? 'Abmelden' : 'Anmelden (Cloud)'}
    >
      {#if loggedIn}
        <LockOpen size={20} strokeWidth={2} /><span>Abmelden</span>
      {:else}
        <Lock size={20} strokeWidth={2} /><span>Anmelden</span>
      {/if}
    </button>
    {#if showPinInput}
      <input
        bind:this={pinInputEl}
        bind:value={pinValue}
        class="pin-input"
        class:error={pinError}
        type="password"
        placeholder="PIN"
        onkeydown={(e) => { if (e.key === 'Enter') submitPin(); if (e.key === 'Escape') cancelPin(); }}
        onblur={cancelPin}
      />
    {/if}
    {#if loggedIn}
      <button
        class="tb-btn save-btn hl"
        onclick={onSave}
        disabled={saving || !dirty}
        title="Speichern (Ctrl+S)"
      >
        <Save size={20} strokeWidth={2} /><span>Speichern</span>
      </button>
      <button
        class="tb-btn dateien-btn hl"
        class:active={showDateien}
        onclick={onToggleDateien}
        title="Dateien"
      >
        <FolderOpen size={20} strokeWidth={2} /><span>Dateien</span>
      </button>
    {/if}
  </div>

  {#if loggedIn && currentFileName}
    <span class="file-indicator" class:dirty={saveStatus === 'dirty'} class:saving={saveStatus === 'saving'} class:saved={saveStatus === 'saved'}>
      <span class="status-dot"></span>
      {currentFileName}
      <span class="status-label">
        {#if saveStatus === 'saving'}Speichern{:else if saveStatus === 'saved'}Gespeichert{:else if saveStatus === 'dirty'}Ungespeichert{/if}
      </span>
    </span>
  {/if}

  <div class="spacer"></div>

  <!-- Group: View toggles -->
  <div class="btn-group">
    <button class="tb-btn toggle-btn hl" class:active={showKm} onclick={onToggleKm} title="Kilometer">
      <RulerDimensionLine size={20} strokeWidth={2} /><span>Kilometer</span>
    </button>
    <button class="tb-btn toggle-btn hl" class:active={showYaml} onclick={onToggleYaml} title="Signaldatei">
      <Code size={20} strokeWidth={2} /><span>Signaldatei</span>
    </button>
    <button class="tb-btn toggle-btn hl" class:active={showMeldungen} onclick={onToggleMeldungen} title="Meldungen">
      <Megaphone size={20} strokeWidth={2} /><span>Meldungen</span>
    </button>
  </div>

  <div class="separator"></div>

  <!-- Group: Export -->
  <div class="btn-group">
    <button class="tb-btn download-btn hl" onclick={onExportMeldungen} title="Meldungen exportieren">
      <Download size={20} strokeWidth={2} /><span>Export</span>
    </button>
  </div>
</div>

<style>
  .header {
    display: flex;
    gap: var(--space-md);
    margin-bottom: var(--page-gap);
    align-items: center;
    flex-wrap: wrap;
    position: sticky;
    top: 0;
    z-index: 10;
    background: var(--color-bg);
    margin-left: calc(-1 * var(--page-gap));
    margin-right: calc(-1 * var(--page-gap));
    padding: var(--page-gap) var(--page-gap) var(--cell-padding) var(--page-gap);
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
    height: var(--space-lg);
    background: linear-gradient(var(--color-bg), transparent);
    pointer-events: none;
  }
  .header.logged-out::after {
    background: linear-gradient(var(--color-red-bg), transparent);
  }
  .header h1 { margin-right: var(--space-md); }

  /* Groups and separators */
  .btn-group {
    display: flex;
    align-items: center;
    gap: var(--card-gap);
  }
  .separator {
    width: 1px;
    height: var(--unit);
    background: var(--color-border);
    margin: 0 var(--space-xs);
  }
  .spacer { flex: 1; }

  /* Base toolbar button: fixed-size icon box, label appears as overlay */
  .tb-btn {
    position: relative;
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
    cursor: pointer;
    font-size: var(--input-font-size);
    font-weight: var(--weight-medium);
    white-space: nowrap;
    flex-shrink: 0;
  }
  .tb-btn span {
    display: none;
    position: absolute;
    top: calc(100% + var(--card-gap));
    left: 50%;
    transform: translateX(-50%);
    height: calc(var(--unit) / 2);
    align-items: center;
    justify-content: center;
    padding: 0 var(--cell-padding);
    background: inherit;
    color: inherit;
    border: var(--card-border);
    border-color: inherit;
    border-radius: var(--container-radius);
    font-size: var(--preview-font-size);
    z-index: 1;
    pointer-events: none;
  }
  .tb-btn:hover {
    z-index: 2;
  }
  .tb-btn:hover span {
    display: flex;
  }
  .tb-btn:disabled {
    opacity: 0.4;
    cursor: default;
  }

  /* Toggle buttons (view panels) */
  .toggle-btn {
    color: var(--color-red);
    border-color: var(--color-red);
    background: var(--color-red-bg);
  }
  .toggle-btn.active {
    color: var(--color-green);
    background: var(--color-green-bg);
    border-color: var(--color-green);
  }

  /* Lock */
  .lock-btn.unlocked {
    background: var(--color-green-bg);
    border-color: var(--color-green);
    color: var(--color-green);
  }


  /* PIN input */
  .pin-input {
    width: 100px;
    height: var(--unit);
    padding: 0 var(--cell-padding);
    border: var(--card-border);
    border-radius: var(--container-radius);
    background: var(--color-bg-raised);
    font-size: var(--input-font-size);
    font-family: monospace;
    color: var(--color-text);
    outline: none;
  }
  .pin-input:focus {
    border: 2px solid var(--color-focus);
    padding: 0 calc(var(--cell-padding) - 1px);
  }
  .pin-input.error {
    border: 2px solid var(--color-red);
    padding: 0 calc(var(--cell-padding) - 1px);
    color: var(--color-red);
  }
  .pin-input.error::placeholder {
    color: var(--color-red);
  }

  /* Save / Download */
  .save-btn { color: var(--color-focus); }
  .download-btn { color: var(--color-focus); }

  /* Dateien active */
  .dateien-btn.active {
    background: var(--color-focus);
    color: var(--color-bg-raised);
    border-color: var(--color-focus);
  }


  /* File status indicator */
  .file-indicator {
    position: relative;
    display: flex;
    align-items: center;
    height: var(--unit);
    gap: var(--space-sm);
    font-size: var(--input-font-size);
    font-family: monospace;
    color: var(--color-text-secondary);
    padding: 0 var(--space-md);
  }
  .status-dot {
    width: var(--space-md);
    height: var(--space-md);
    border-radius: 50%;
    flex-shrink: 0;
  }
  .file-indicator.dirty .status-dot { background: var(--color-red); }
  .file-indicator.saving .status-dot { background: var(--color-clear); }
  .file-indicator.saved .status-dot { background: var(--color-green); }
  .status-label {
    display: none;
    position: absolute;
    top: calc(100% + var(--card-gap));
    left: 50%;
    transform: translateX(-50%);
    height: calc(var(--unit) / 2);
    align-items: center;
    justify-content: center;
    padding: 0 var(--cell-padding);
    border-radius: var(--container-radius);
    font-size: var(--preview-font-size);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    white-space: nowrap;
    pointer-events: none;
    z-index: 1;
  }
  .file-indicator:hover .status-label { display: flex; }
  .file-indicator.dirty .status-label {
    background: var(--color-red-bg);
    color: var(--color-red);
    border: 1px solid var(--color-red);
  }
  .file-indicator.saving .status-label {
    background: var(--color-bg-raised);
    color: var(--color-clear);
    border: 1px solid var(--color-clear);
  }
  .file-indicator.saved .status-label {
    background: var(--color-green-bg);
    color: var(--color-green);
    border: 1px solid var(--color-green);
  }
</style>

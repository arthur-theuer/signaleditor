<script lang="ts">
  import {
    Undo2, Redo2, Upload, Download, Save, Lock, LockOpen,
    Milestone, Route, FolderOpen, FolderClosed, Code, Megaphone,
  } from 'lucide-svelte';
  import { tick } from 'svelte';

  let {
    showYaml,
    showMeldungen,
    meldungenAllowed,
    undoEnabled,
    redoEnabled,
    loggedIn,
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
    showYaml: boolean;
    showMeldungen: boolean;
    meldungenAllowed: boolean;
    undoEnabled: boolean;
    redoEnabled: boolean;
    loggedIn: boolean;
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

  async function handleLockClick() {
    if (loggedIn) {
      onLogout();
    } else {
      showPinInput = true;
      pinError = false;
      pinValue = '';
      await tick();
      pinInputEl?.focus();
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

<div class="header flex gap-md items-center flex-wrap sticky top-0 z-10 px-page py-cell mb-page" class:logged-out={!loggedIn}>
  <h1 class="hidden xl:block mr-md">Signaleditor</h1>

  <!-- Group: History -->
  <div class="flex items-center gap-card">
    <button id="undoBtn" class="tb-btn hl" disabled={!undoEnabled} onclick={onUndo} title="Rückgängig (Ctrl+Z)">
      <Undo2 size={20} strokeWidth={1.2} /><span class="tooltip">Rückgängig</span>
    </button>
    <button id="redoBtn" class="tb-btn hl" disabled={!redoEnabled} onclick={onRedo} title="Wiederholen (Ctrl+Y)">
      <Redo2 size={20} strokeWidth={1.2} /><span class="tooltip">Wiederholen</span>
    </button>
  </div>

  <div class="separator"></div>

  <!-- Group: File -->
  <div class="flex items-center gap-card">
    <input
      type="file"
      accept=".yaml,.yml,.html"
      style="display:none"
      bind:this={fileInput}
      onchange={onFileLoad}
    />
    <button class="tb-btn hl" onclick={() => onNew('strecke')} title="Neue Strecke">
      <Milestone size={20} strokeWidth={1.2} /><span class="tooltip">Strecke</span>
    </button>
    <button class="tb-btn hl" onclick={() => onNew('route')} title="Neue Route">
      <Route size={20} strokeWidth={1.2} /><span class="tooltip">Route</span>
    </button>
    <button class="tb-btn hl" onclick={() => fileInput.click()} title="Datei laden">
      <Upload size={20} strokeWidth={1.2} /><span class="tooltip">Laden</span>
    </button>
  </div>

  <div class="separator"></div>

  <div class="flex-1 flex items-center justify-center gap-md">
    <!-- Group: Cloud -->
    <div class="flex items-center gap-card">
      <button
        class="tb-btn lock-btn hl"
        class:unlocked={loggedIn}
        onclick={handleLockClick}
        title={loggedIn ? 'Abmelden' : 'Anmelden (Cloud)'}
      >
        {#if loggedIn}
          <LockOpen size={20} strokeWidth={1.2} /><span class="tooltip">Abmelden</span>
        {:else}
          <Lock size={20} strokeWidth={1.2} /><span class="tooltip">Anmelden</span>
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
          <Save size={20} strokeWidth={1.2} /><span class="tooltip">Speichern</span>
        </button>
        <button
          class="tb-btn dateien-btn hl"
          class:active={showDateien}
          onclick={onToggleDateien}
          title="Dateien"
        >
          {#if currentFileName}
            <FolderOpen size={20} strokeWidth={1.2} /><span class="tooltip">Dateien</span>
          {:else}
            <FolderClosed size={20} strokeWidth={1.2} /><span class="tooltip">Dateien</span>
          {/if}
        </button>
      {/if}
    </div>

    {#if loggedIn && currentFileName}
      <span class="file-indicator" class:dirty={saveStatus === 'dirty'} class:saving={saveStatus === 'saving'} class:saved={saveStatus === 'saved'}>
        <span class="status-dot"></span>
        {currentFileName}
        <span class="tooltip status-label">
          {#if saveStatus === 'saving'}Speichern{:else if saveStatus === 'saved'}Gespeichert{:else if saveStatus === 'dirty'}Ungespeichert{/if}
        </span>
      </span>
    {/if}
  </div>

  <div class="separator"></div>

  <!-- Group: View toggles (hidden at sm) -->
  <div class="hidden sm:flex items-center gap-card">
    <button class="tb-btn toggle-btn hl" class:active={showYaml} onclick={onToggleYaml} title="Signaldatei">
      <Code size={20} strokeWidth={1.2} /><span class="tooltip">Signaldatei</span>
    </button>
    <button class="tb-btn toggle-btn hl" class:active={showMeldungen} disabled={!meldungenAllowed} onclick={onToggleMeldungen} title="Meldungen">
      <Megaphone size={20} strokeWidth={1.2} /><span class="tooltip">Meldungen</span>
    </button>
  </div>

  <div class="separator hidden sm:block"></div>

  <!-- Group: Export -->
  <div class="flex items-center gap-card">
    <button class="tb-btn download-btn hl" onclick={onExportMeldungen} title="Meldungen exportieren">
      <Download size={20} strokeWidth={1.2} /><span class="tooltip">Export</span>
    </button>
  </div>
</div>

<style>
  .header {
    background: var(--color-bg);
    border-bottom: 1px solid var(--color-border);
  }
  .header.logged-out {
    background: var(--color-red-bg);
  }
  .header h1 { font-size: 1.5rem; font-weight: var(--font-weight-bold); }


  /* Separator */
  .separator {
    width: 1px;
    height: var(--spacing-unit);
    background: var(--color-border);
    margin: 0 var(--spacing-xs);
  }

  /* Base toolbar button: fixed-size icon box, label appears as overlay */
  .tb-btn {
    position: relative;
    width: var(--spacing-unit);
    height: var(--spacing-unit);
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--color-bg-raised);
    border: var(--card-border);
    border-radius: var(--radius-container);
    color: var(--color-text-secondary);
    cursor: pointer;
    font-size: var(--text-input);
    font-weight: var(--font-weight-medium);
    white-space: nowrap;
    flex-shrink: 0;
  }
  /* Shared tooltip: hidden by default, shown on parent hover */
  .tooltip {
    display: none;
    position: absolute;
    top: calc(100% + var(--spacing-card));
    left: 50%;
    transform: translateX(-50%);
    height: calc(var(--spacing-unit) / 2);
    align-items: center;
    justify-content: center;
    padding: 0 var(--spacing-cell);
    border-radius: var(--radius-container);
    font-size: var(--text-preview);
    font-family: var(--font-sans);
    white-space: nowrap;
    pointer-events: none;
    z-index: 1;
  }

  .tb-btn span {
    background: inherit;
    color: inherit;
    border: var(--card-border);
    border-color: inherit;
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
    height: var(--spacing-unit);
    padding: 0 var(--spacing-cell);
    border: var(--card-border);
    border-radius: var(--radius-container);
    background: var(--color-bg-raised);
    font-size: var(--text-input);
    font-family: monospace;
    color: var(--color-text);
    outline: none;
  }
  .pin-input:focus {
    border: 2px solid var(--color-focus);
    padding: 0 calc(var(--spacing-cell) - 1px);
  }
  .pin-input.error {
    border: 2px solid var(--color-red);
    padding: 0 calc(var(--spacing-cell) - 1px);
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
    height: var(--spacing-unit);
    gap: var(--spacing-sm);
    font-size: var(--text-input);
    font-family: monospace;
    color: var(--color-text-secondary);
    padding: 0 var(--spacing-md);
  }
  .status-dot {
    width: var(--spacing-md);
    height: var(--spacing-md);
    border-radius: 50%;
    flex-shrink: 0;
  }
  .file-indicator.dirty .status-dot { background: var(--color-red); }
  .file-indicator.saving .status-dot { background: var(--color-clear); }
  .file-indicator.saved .status-dot { background: var(--color-green); }
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

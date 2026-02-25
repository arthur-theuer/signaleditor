<script lang="ts">
  import {
    Undo2, Redo2, Upload, Download, Save, Lock, LockOpen,
    Milestone, Route, FolderOpen, FolderClosed, Code, Megaphone,
  } from 'lucide-svelte';
  import Hinweis from './ui/Hinweis.svelte';
  import Passwortfeld from './ui/Passwortfeld.svelte';

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
  let passwortfeld: Passwortfeld;

  function handleLockClick() {
    if (loggedIn) {
      onLogout();
    } else {
      passwortfeld.show();
    }
  }

  async function handlePinSubmit(pin: string) {
    const ok = await onLogin(pin);
    if (ok) {
      passwortfeld.hide();
    } else {
      passwortfeld.showError();
    }
  }

  const btnGroup = 'flex flex-col sm:flex-row items-center gap-card lg:gap-md';
</script>

<div class="header flex gap-card lg:gap-md items-center flex-wrap sticky top-0 z-10 py-cell mb-cell sm:mb-page" class:logged-out={!loggedIn}>
  <h1 class="hidden xl:block mr-md">Signaleditor</h1>

  <!-- Group: History -->
  <div class={btnGroup}>
    <button id="undoBtn" class="tb-btn hl" disabled={!undoEnabled} onclick={onUndo} title="Rückgängig (Ctrl+Z)">
      <Undo2 size={16} strokeWidth={1.5} /><Hinweis text="Rückgängig" />
    </button>
    <button id="redoBtn" class="tb-btn hl" disabled={!redoEnabled} onclick={onRedo} title="Wiederholen (Ctrl+Y)">
      <Redo2 size={16} strokeWidth={1.5} /><Hinweis text="Wiederholen" />
    </button>
  </div>

  <div class="separator mx-card"></div>

  <!-- Group: New -->
  <div class={btnGroup}>
    <button class="tb-btn hl" onclick={() => onNew('strecke')} title="Neue Strecke">
      <Milestone size={16} strokeWidth={1.5} /><Hinweis text="Strecke" />
    </button>
    <button class="tb-btn hl" onclick={() => onNew('route')} title="Neue Route">
      <Route size={16} strokeWidth={1.5} /><Hinweis text="Route" />
    </button>
  </div>

  <div class="separator mx-card"></div>

  <!-- Group: Local I/O -->
  <div class={btnGroup}>
    <input
      type="file"
      accept=".yaml,.yml,.html"
      style="display:none"
      bind:this={fileInput}
      onchange={onFileLoad}
    />
    <button class="tb-btn hl" onclick={() => fileInput.click()} title="Datei laden">
      <Upload size={16} strokeWidth={1.5} /><Hinweis text="Laden" />
    </button>
    <button class="tb-btn download-btn hl" onclick={onExportMeldungen} title="Meldungen exportieren">
      <Download size={16} strokeWidth={1.5} /><Hinweis text="Export" />
    </button>
  </div>

  <div class="separator mx-card hidden sm:block"></div>

  <!-- Group: View toggles (hidden at sm) -->
  <div class="hidden sm:flex items-center gap-card lg:gap-md">
    <button class="tb-btn toggle-btn hl" class:active={showYaml} onclick={onToggleYaml} title="Signaldatei">
      <Code size={16} strokeWidth={1.5} /><Hinweis text="Signaldatei" />
    </button>
    <button class="tb-btn toggle-btn hl" class:active={showMeldungen} disabled={!meldungenAllowed} onclick={onToggleMeldungen} title="Meldungen">
      <Megaphone size={16} strokeWidth={1.5} /><Hinweis text="Meldungen" />
    </button>
  </div>

  <!-- Group: Cloud -->
  {#if loggedIn}
    <div class="separator mx-card"></div>

    <div class={btnGroup}>
      <button
        class="tb-btn dateien-btn hl"
        class:active={showDateien}
        onclick={onToggleDateien}
        title="Dateien"
      >
        {#if currentFileName}
          <FolderOpen size={16} strokeWidth={1.5} /><Hinweis text="Dateien" />
        {:else}
          <FolderClosed size={16} strokeWidth={1.5} /><Hinweis text="Dateien" />
        {/if}
      </button>
      <button
        class="tb-btn save-btn hl"
        onclick={onSave}
        disabled={saving || !dirty}
        title="Speichern (Ctrl+S)"
      >
        <Save size={16} strokeWidth={1.5} /><Hinweis text="Speichern" />
      </button>
    </div>

    {#if currentFileName}
      <span class="file-indicator relative flex flex-1 min-w-0 items-center justify-center sm:justify-start gap-sm px-md" class:dirty={saveStatus === 'dirty'} class:saving={saveStatus === 'saving'} class:saved={saveStatus === 'saved'}>
        <span class="status-dot shrink-0"></span>
        <span class="file-name">{currentFileName}</span>
        <span class="status-label">
          {#if saveStatus === 'saving'}Speichern{:else if saveStatus === 'saved'}Gespeichert{:else if saveStatus === 'dirty'}Ungespeichert{/if}
        </span>
      </span>
    {:else}
      <div class="flex-1"></div>
    {/if}
  {/if}

  {#if !loggedIn}
    <div class="flex-1"></div>
  {/if}

  <!-- Lock with expanding PIN field -->
  <Passwortfeld bind:this={passwortfeld} unlocked={loggedIn} onsubmit={handlePinSubmit} onclick={handleLockClick}>
    {#if loggedIn}
      <LockOpen size={16} strokeWidth={1.5} />
    {:else}
      <Lock size={16} strokeWidth={1.5} />
    {/if}
  </Passwortfeld>
</div>

<style>
  .header {
    background: var(--color-bg);
    background-image: linear-gradient(var(--color-focus-bg), var(--color-focus-bg));
    border-bottom: 1px solid var(--color-border);
    padding-left: var(--spacing-cell);
    padding-right: var(--spacing-cell);
  }
  @media (min-width: 640px) {
    .header {
      padding-left: var(--inset-card);
      padding-right: var(--inset-card);
    }
  }
  .header.logged-out {
    background-image: linear-gradient(color-mix(in srgb, var(--color-red) 8%, transparent), color-mix(in srgb, var(--color-red) 8%, transparent));
  }
  .header h1 { font-size: 1.5rem; font-weight: var(--font-weight-bold); }


  /* Separator */
  .separator {
    width: 1px;
    align-self: stretch;
    background: var(--color-border);
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
  .tb-btn:hover {
    z-index: 2;
  }
  .tb-btn:disabled {
    cursor: default;
    color: var(--color-text-muted);
    background: var(--color-bg);
    border-color: var(--color-border);
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



  /* Cloud buttons */
  .save-btn { color: var(--color-focus); }
  .dateien-btn { color: var(--color-focus); }

  /* Dateien active */
  .dateien-btn.active {
    background: var(--color-focus);
    color: var(--color-bg-raised);
    border-color: var(--color-focus);
  }


  /* File status indicator */
  .file-indicator {
    height: var(--spacing-unit);
    font-size: var(--text-input);
    font-family: var(--font-mono);
    color: var(--color-text-secondary);
  }
  .file-name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .status-dot {
    width: var(--spacing-md);
    height: var(--spacing-md);
    border-radius: 50%;
  }
  .file-indicator.dirty .status-dot { background: var(--color-red); }
  .file-indicator.saving .status-dot { background: var(--color-clear); }
  .file-indicator.saved .status-dot { background: var(--color-green); }
  .status-label {
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
    font-weight: var(--font-weight-medium);
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

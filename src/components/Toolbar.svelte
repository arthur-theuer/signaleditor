<script lang="ts">
  import {
    Undo2,
    Redo2,
    Upload,
    Download,
    Save,
    Lock,
    LockOpen,
    Milestone,
    Route,
    FolderOpen,
    FolderClosed,
    Code,
    Megaphone,
  } from 'lucide-svelte';
  import { ICON } from '../lib/constants';
  import Passwortfeld from './ui/Passwortfeld.svelte';
  import Dateistatus from './ui/Dateistatus.svelte';

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

  const btnGroup = 'btn-group';
</script>

<div class={['header', { 'logged-out': !loggedIn }]}>
  <h1 class="app-title">Signaleditor</h1>

  <!-- Group: History -->
  <div class={btnGroup}>
    <button id="undoBtn" class="tb-btn btn" disabled={!undoEnabled} onclick={onUndo} title="Rückgängig (Ctrl+Z)">
      <Undo2 {...ICON} />
    </button>
    <button id="redoBtn" class="tb-btn btn" disabled={!redoEnabled} onclick={onRedo} title="Wiederholen (Ctrl+Y)">
      <Redo2 {...ICON} />
    </button>
  </div>

  <div class="separator"></div>

  <!-- Group: New -->
  <div class={btnGroup}>
    <button class="tb-btn btn" onclick={() => onNew('strecke')} title="Neue Strecke">
      <Milestone {...ICON} />
    </button>
    <button class="tb-btn btn" onclick={() => onNew('route')} title="Neue Route">
      <Route {...ICON} />
    </button>
  </div>

  <div class="separator"></div>

  <!-- Group: Local I/O -->
  <div class={btnGroup}>
    <input type="file" accept=".yaml,.yml,.html" style="display:none" bind:this={fileInput} onchange={onFileLoad} />
    <button class="tb-btn btn" onclick={() => fileInput.click()} title="Datei laden">
      <Upload {...ICON} />
    </button>
    <button class="tb-btn download-btn btn" onclick={onExportMeldungen} title="Meldungen exportieren">
      <Download {...ICON} />
    </button>
  </div>

  <div class="separator sm-only"></div>

  <!-- Group: View toggles (hidden at sm) -->
  <div class="toggle-group">
    <button class={['tb-btn toggle-btn btn', { active: showYaml }]} onclick={onToggleYaml} title="Signaldatei">
      <Code {...ICON} />
    </button>
    <button
      class={['tb-btn toggle-btn btn', { active: showMeldungen }]}
      disabled={!meldungenAllowed}
      onclick={onToggleMeldungen}
      title="Meldungen"
    >
      <Megaphone {...ICON} />
    </button>
  </div>

  <!-- Group: Cloud -->
  {#if loggedIn}
    <div class="separator"></div>

    <div class={btnGroup}>
      <button class={['tb-btn dateien-btn btn', { active: showDateien }]} onclick={onToggleDateien} title="Dateien">
        {#if currentFileName}
          <FolderOpen {...ICON} />
        {:else}
          <FolderClosed {...ICON} />
        {/if}
      </button>
      <button class="tb-btn save-btn btn" onclick={onSave} disabled={saving || !dirty} title="Speichern (Ctrl+S)">
        <Save {...ICON} />
      </button>
    </div>

    {#if currentFileName}
      <Dateistatus fileName={currentFileName} {saveStatus} />
    {:else}
      <div class="spacer"></div>
    {/if}
  {/if}

  {#if !loggedIn}
    <div class="spacer"></div>
  {/if}

  <!-- Lock with expanding PIN field -->
  <Passwortfeld bind:this={passwortfeld} unlocked={loggedIn} onsubmit={handlePinSubmit} onclick={handleLockClick}>
    {#if loggedIn}
      <LockOpen {...ICON} />
    {:else}
      <Lock {...ICON} />
    {/if}
  </Passwortfeld>
</div>

<style>
  .header {
    display: flex;
    gap: var(--spacing-card);
    align-items: center;
    flex-wrap: wrap;
    position: sticky;
    top: 0;
    z-index: 10;
    padding: var(--spacing-cell);
    margin-bottom: var(--spacing-cell);
    background: var(--color-bg);
    background-image: linear-gradient(var(--color-focus-bg), var(--color-focus-bg));
    border-bottom: 1px solid var(--color-border);
  }
  @media (min-width: 640px) {
    .header {
      padding-left: var(--inset-card);
      padding-right: var(--inset-card);
      margin-bottom: var(--spacing-page);
    }
  }
  @media (min-width: 1024px) {
    .header {
      gap: var(--spacing-md);
    }
  }
  .header.logged-out {
    background-image: linear-gradient(
      color-mix(in srgb, var(--color-red) 8%, transparent),
      color-mix(in srgb, var(--color-red) 8%, transparent)
    );
  }
  .app-title {
    display: none;
    font-size: var(--text-title);
    font-weight: var(--font-weight-bold);
    margin-right: var(--spacing-md);
  }
  @media (min-width: 1280px) {
    .app-title {
      display: block;
    }
  }

  .btn-group {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--spacing-card);
  }
  @media (min-width: 640px) {
    .btn-group {
      flex-direction: row;
    }
  }
  @media (min-width: 1024px) {
    .btn-group {
      gap: var(--spacing-md);
    }
  }
  .toggle-group {
    display: none;
    align-items: center;
    gap: var(--spacing-card);
  }
  @media (min-width: 640px) {
    .toggle-group {
      display: flex;
    }
  }
  @media (min-width: 1024px) {
    .toggle-group {
      gap: var(--spacing-md);
    }
  }
  .sm-only {
    display: none;
  }
  @media (min-width: 640px) {
    .sm-only {
      display: block;
    }
  }
  .separator {
    width: 1px;
    margin: 0 var(--spacing-card);
    align-self: stretch;
    background: var(--color-border);
  }

  /* Base toolbar button: fixed-size icon box, label appears as overlay */
  /* Extends .btn — toolbar-specific overrides */
  .tb-btn {
    width: var(--spacing-unit);
    height: var(--spacing-unit);
    border-radius: var(--radius-container);
    font-size: var(--text-input);
    font-weight: var(--font-weight-medium);
    white-space: nowrap;
    flex-shrink: 0;
  }
  .tb-btn:hover {
    z-index: 2;
  }
  .tb-btn:disabled {
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
  .spacer {
    flex: 1;
  }
  .save-btn {
    color: var(--color-focus);
  }
  .save-btn:disabled {
    color: var(--color-text-muted);
  }
  .dateien-btn {
    color: var(--color-focus);
  }

  /* Dateien active */
  .dateien-btn.active {
    background: var(--color-focus);
    color: var(--color-bg-raised);
    border-color: var(--color-focus);
  }


</style>

<script lang="ts">
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
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M9 14 4 9l5-5" />
      <path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5a5.5 5.5 0 0 1-5.5 5.5H11" />
    </svg>
  </button>
  <button id="redoBtn" class="undo-redo-btn hl" disabled={!redoEnabled} onclick={onRedo} title="Wiederholen (Ctrl+Y)">
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="m15 14 5-5-5-5" />
      <path d="M20 9H9.5A5.5 5.5 0 0 0 4 14.5A5.5 5.5 0 0 0 9.5 20H13" />
    </svg>
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
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 3v12" />
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <path d="m17 8-5-5-5 5" />
    </svg>
  </button>
  <button class="icon-btn download-btn hl" onclick={onExportMeldungen} title="Meldungen exportieren">
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 15V3" />
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <path d="m7 10 5 5 5-5" />
    </svg>
  </button>

  {#if loggedIn}
    <button
      class="save-btn hl"
      onclick={onSave}
      disabled={saving || !dirty}
      title="Speichern (Ctrl+S)"
    >
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
        <path d="M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7" />
        <path d="M7 3v4a1 1 0 0 0 1 1h7" />
      </svg>
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
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="16" r="1" />
      <rect x="3" y="10" width="18" height="12" rx="2" />
      {#if loggedIn}
        <path d="M7 10V7a5 5 0 0 1 9.33-2.5" />
      {:else}
        <path d="M7 10V7a5 5 0 0 1 10 0v3" />
      {/if}
    </svg>
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
    padding: var(--page-gap) 0 12px 0;
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
    font-size: 13px;
    font-weight: 500;
    height: 44px;
    padding: 0 16px;
  }
  .toggle-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    font-weight: 500;
    color: var(--color-red);
    cursor: pointer;
    padding: 0 16px;
    height: 44px;
    border: 1px solid var(--color-red-border);
    background: var(--color-red-bg);
  }
  .toggle-btn.active {
    color: var(--color-green);
    background: var(--color-green-bg);
    border-color: var(--color-green);
  }
  .undo-redo-btn {
    width: 44px;
    height: 44px;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .undo-redo-btn:disabled {
    opacity: 0.4;
    cursor: default;
  }
  .header button.icon-btn,
  .header button.lock-btn,
  .header button.save-btn {
    width: 44px;
    height: 44px;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--color-bg-raised);
    border: var(--card-border);
    border-radius: var(--card-radius);
    color: var(--color-text-secondary);
    box-shadow: 0 2px 6px rgba(0,0,0,0.08);
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
    color: white;
    border-color: var(--color-focus-hover);
  }
  .file-indicator {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
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
    font-size: 11px;
    font-weight: 600;
    white-space: nowrap;
  }
  .save-status.saving {
    color: var(--color-clear);
  }
  .save-status.saved {
    color: var(--color-green);
  }
</style>

<script lang="ts">
  let {
    showKm,
    showYaml,
    showMeldungen,
    onToggleKm,
    onToggleYaml,
    onToggleMeldungen,
    onNew,
    onFileLoad,
  }: {
    showKm: boolean;
    showYaml: boolean;
    showMeldungen: boolean;
    onToggleKm: () => void;
    onToggleYaml: () => void;
    onToggleMeldungen: () => void;
    onNew: () => void;
    onFileLoad: (event: Event) => void;
  } = $props();

  let fileInput: HTMLInputElement;
</script>

<div class="header">
  <h1>Signaleditor</h1>

  <!-- Undo/redo — Phase 4 -->
  <button class="undo-redo-btn hl" disabled title="Rückgängig (Ctrl+Z)">←</button>
  <button class="undo-redo-btn hl" disabled title="Wiederholen (Ctrl+Y)">→</button>

  <input
    type="file"
    accept=".yaml,.yml,.html"
    style="display:none"
    bind:this={fileInput}
    onchange={onFileLoad}
  />
  <button class="hl" onclick={onNew}>Neue Signaldatei</button>
  <button class="hl" onclick={() => fileInput.click()}>Signaldatei laden</button>
  <button class="hl" onclick={() => {}}>Signaldatei exportieren</button>
  <button class="primary-btn hl hl-primary" onclick={() => {}}>Meldungen exportieren</button>

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
  .header :global(.primary-btn) {
    background: var(--color-focus);
    color: white;
    border-color: var(--color-focus-hover);
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
    font-size: 18px;
  }
  .undo-redo-btn:disabled {
    opacity: 0.4;
    cursor: default;
  }
</style>

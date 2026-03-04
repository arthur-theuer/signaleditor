<script lang="ts">
  import type { Knoteneintrag } from './lib/types';
  import { isImporteintrag } from './lib/types';
  import { tick } from 'svelte';
  import { on } from 'svelte/events';
  import { autoStitchImporte } from './lib/sources';
  import { isLoggedIn, login, logout } from './lib/auth.svelte';
  import { focusWithoutScroll } from './lib/focus';
  import { RulerDimensionLine, X } from 'lucide-svelte';
  import { ICON } from './lib/constants';
  import { Editor } from './lib/useEditor.svelte';
  import { generiereAlleMeldungen } from './lib/reports';
  import Toolbar from './components/Toolbar.svelte';
  import Datenpanel from './components/Datenpanel.svelte';
  import Signalpanel from './components/Signalpanel.svelte';
  import Symbolknopf from './components/ui/Symbolknopf.svelte';
  import Codepanel from './components/Codepanel.svelte';
  import Dateibrowser from './components/Dateibrowser.svelte';
  // import Breakpoints from './components/debug/Breakpoints.svelte';

  const ed = new Editor();
  let meldungen = $derived(ed.showMeldungen ? generiereAlleMeldungen(ed.data.signale) : undefined);

  // Save undo state when any input receives focus (captures "before edit" state)
  $effect(() => {
    return on(document, 'focusin', () => ed.history.save(ed.data));
  });

  // Warn before leaving with unsaved changes
  $effect(() => {
    return on(window, 'beforeunload', (e) => {
      if (ed.dirty) e.preventDefault();
    });
  });

  // Disable side panels when viewport is too narrow for toggles
  $effect(() => {
    const bp = getComputedStyle(document.documentElement).getPropertyValue('--breakpoint-sm').trim() || '640px';
    const mq = window.matchMedia(`(max-width: ${bp})`);
    ed.panelsAllowed = !mq.matches;
    return on(mq, 'change', (e) => {
      ed.panelsAllowed = !e.matches;
    });
  });

  // Auto-stitch importe when datei values change
  $effect(() => {
    const importeDateien = ed.data.signale
      .filter(isImporteintrag)
      .map((s) => s.import.datei)
      .join(',');
    if (importeDateien) {
      autoStitchImporte(ed.data.signale);
    }
  });

  function handleUndo() {
    flashUndoRedoBtn('undoBtn');
    ed.handleUndo();
  }

  function handleRedo() {
    flashUndoRedoBtn('redoBtn');
    ed.handleRedo();
  }

  async function handleLogin(pin: string): Promise<boolean> {
    return await login(pin);
  }

  function handleLogout() {
    logout();
  }

  async function handleDatenTabOut() {
    if (ed.data.signale.length === 0) {
      ed.data.signale = [...ed.data.signale, { id: 0, knoten: '' } as Knoteneintrag];
      ed.markDirty();
    }
    await tick();
    const firstRow = document.querySelector<HTMLElement>('[data-row-index="0"]');
    if (!firstRow) return;
    const target = firstRow.querySelector<HTMLElement>(
      ed.showKm ? '.km-input' : '.signal-input, .note-input, .abzweigung-btn, .knoten-input, .import-folder-btn',
    );
    focusWithoutScroll(target);
  }

  function flashUndoRedoBtn(id: string) {
    const btn = document.getElementById(id) as HTMLButtonElement | null;
    if (!btn || btn.disabled) return;
    btn.classList.add('btn-flash');
    setTimeout(() => btn.classList.remove('btn-flash'), 100);
  }

  function handleGlobalKeydown(e: KeyboardEvent) {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      if (isLoggedIn()) ed.handleSave();
    } else if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
      e.preventDefault();
      handleUndo();
    } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
      e.preventDefault();
      handleRedo();
    }
  }
</script>

<svelte:window onkeydown={handleGlobalKeydown} />

<Toolbar
  showYaml={ed.showYaml}
  showMeldungen={ed.showMeldungen}
  meldungenAllowed={ed.panelsAllowed}
  undoEnabled={ed.history.canUndo}
  redoEnabled={ed.history.canRedo}
  loggedIn={isLoggedIn()}
  onToggleYaml={() => (ed.wantYaml = !ed.wantYaml)}
  onToggleMeldungen={() => (ed.wantMeldungen = !ed.wantMeldungen)}
  onNew={(typ) => ed.newFile(typ)}
  onFileLoad={(e) => ed.handleFileLoad(e)}
  onUndo={handleUndo}
  onRedo={handleRedo}
  onExportMeldungen={() => ed.handleExportMeldungen()}
  onLogin={handleLogin}
  onLogout={handleLogout}
  onSave={() => ed.handleSave()}
  onToggleDateien={() => (ed.showDateien = !ed.showDateien)}
  showDateien={ed.showDateien}
  saving={ed.saving}
  dirty={ed.dirty}
  currentFileName={ed.currentFileName}
  saveStatus={ed.saveStatus}
/>

{#if ed.showDateien}
  <Dateibrowser onload={(c, f, t) => ed.handleCloudLoad(c, f, t)} onclose={() => (ed.showDateien = false)} />
{/if}

<div class="content-pad">
  <Datenpanel bind:data={ed.data} ontabout={handleDatenTabOut} />
</div>

<div class="main-content content-pad">
  <div class="signals-container">
    <div class="header-row">
      <div class="section-header signale-header">
        Signale
        <Symbolknopf
          class="km-toggle"
          color="red"
          bordered
          active={ed.showKm}
          onclick={() => (ed.showKm = !ed.showKm)}
          title="Kilometer ein-/ausblenden"
        >
          <RulerDimensionLine {...ICON} />
        </Symbolknopf>
      </div>
      {#if ed.showMeldungen}
        <div class="section-header meldungen-header">
          Meldungen
          <Symbolknopf
            color="red"
            bordered
            active={false}
            onclick={() => (ed.wantMeldungen = false)}
            title="Meldungen schliessen"
          >
            <X {...ICON} />
          </Symbolknopf>
        </div>
      {/if}
    </div>
    <div class="signals-list">
      <Signalpanel bind:signale={ed.data.signale} showKm={ed.showKm} {meldungen} onchange={() => ed.markDirty()} />
    </div>
  </div>
</div>

{#if ed.showYaml}
  <div class="content-pad">
    <Codepanel data={ed.data} onexport={() => (ed.dirty = false)} />
  </div>
{/if}

<!-- <Breakpoints /> -->

<style>
  .content-pad {
    padding-left: var(--spacing-cell);
    padding-right: var(--spacing-cell);
  }
  @media (min-width: 640px) {
    .content-pad {
      padding-left: var(--spacing-page);
      padding-right: var(--spacing-page);
    }
  }
  .main-content {
    margin-bottom: var(--spacing-page);
  }
  .signals-container {
    background: var(--color-bg);
    border: var(--card-border);
    border-radius: var(--radius-container);
    container-type: inline-size;
  }
  .header-row {
    display: flex;
    gap: var(--spacing-cell);
  }
  .signale-header {
    flex: 1;
    min-width: 0;
    padding-right: var(--spacing-card);
    border-radius: var(--radius-container) var(--radius-container) 0 0;
  }
  .signale-header:not(:last-child) {
    border-radius: var(--radius-container) 0 0 0;
  }
  .signale-header :global(.km-toggle) {
    margin-left: auto;
  }
  .meldungen-header {
    flex-shrink: 0;
    width: 220px;
    border-radius: 0 var(--radius-container) 0 0;
    border-left: none;
  }
  .meldungen-header :global(button) {
    margin-left: auto;
  }
  @media (min-width: 768px) {
    .meldungen-header {
      width: 280px;
    }
  }
  .signals-list {
    padding: var(--spacing-half-card) 0;
  }
</style>

<script lang="ts">
  import type { Editordaten, Dateityp, Knoteneintrag } from './lib/types';
  import { emptyVideodaten, emptyStreckendaten, isImporteintrag } from './lib/types';
  import { tick } from 'svelte';
  import { parseYAMLContent, extractYAMLFromHTML } from './lib/yaml';
  import { History } from './lib/history.svelte';
  import { autoStitchImporte } from './lib/sources';
  import { generateYAML } from './lib/yaml';
  import { downloadMeldungenHTML } from './lib/reports';
  import { isLoggedIn, login, logout } from './lib/auth.svelte';
  import { dateiId, isVideodaten } from './lib/types';
  import { saveFile, createFile, type StoragePrefix } from './lib/api';
  import Toolbar from './components/Toolbar.svelte';
  import Metafelder from './components/Metafelder.svelte';
  import Signalpanel from './components/Signalpanel.svelte';

  import Codepanel from './components/Codepanel.svelte';
  import Meldungspanel from './components/Meldungspanel.svelte';
  import Dateibrowser from './components/Dateibrowser.svelte';

  let data: Editordaten = $state(emptyVideodaten());

  const history = new History();

  let dirty = $state(false);
  let showKm = $state(false);
  let showYaml = $state(false);
  let showMeldungen = $state(false);
  let currentFileName = $state<string | null>(null);
  let saving = $state(false);
  let showDateien = $state(false);
  let saveStatus = $state<'saved' | 'saving' | 'dirty' | 'idle'>('idle');
  let autoSaveTimer: ReturnType<typeof setTimeout> | null = null;

  function newFile(typ: Dateityp) {
    if (dirty && !confirm('Ungespeicherte Änderungen verwerfen?')) return;
    cancelAutoSave();
    data = typ === 'video' ? emptyVideodaten() : emptyStreckendaten();
    dirty = false;
    currentFileName = null;
    saveStatus = 'idle';
    history.clear();
  }

  function loadFile(content: string, filename: string) {
    if (filename.endsWith('.html')) {
      const yaml = extractYAMLFromHTML(content);
      if (yaml) {
        content = yaml;
      } else {
        alert('Keine eingebettete YAML-Daten gefunden');
        return;
      }
    }
    cancelAutoSave();
    data = parseYAMLContent(content);
    dirty = false;
    currentFileName = null;
    saveStatus = 'idle';
    history.clear();
    if (data.signale.some(s => s.km !== undefined)) {
      showKm = true;
    }
  }

  function handleFileLoad(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      loadFile(reader.result as string, file.name);
    };
    reader.readAsText(file);
    input.value = '';
  }

  function markDirty() {
    dirty = true;
    scheduleAutoSave();
  }

  function scheduleAutoSave() {
    if (autoSaveTimer) clearTimeout(autoSaveTimer);
    if (!isLoggedIn() || !currentFileName) {
      saveStatus = dirty ? 'dirty' : 'idle';
      return;
    }
    saveStatus = 'dirty';
    autoSaveTimer = setTimeout(() => {
      autoSaveTimer = null;
      handleSave();
    }, 3000);
  }

  function cancelAutoSave() {
    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer);
      autoSaveTimer = null;
    }
  }

  // Save undo state when any input receives focus (captures "before edit" state)
  $effect(() => {
    const handler = () => history.save(data);
    document.addEventListener('focusin', handler);
    return () => document.removeEventListener('focusin', handler);
  });

  function handleUndo() {
    flashUndoRedoBtn('undoBtn');
    const restored = history.undo(data);
    if (restored) { data = restored; }
  }

  function handleRedo() {
    flashUndoRedoBtn('redoBtn');
    const restored = history.redo(data);
    if (restored) { data = restored; }
  }

  async function handleLogin(pin: string): Promise<boolean> {
    return await login(pin);
  }

  function handleLogout() {
    logout();
  }

  async function handleSave() {
    if (!isLoggedIn() || saving) return;

    const id = dateiId(data);
    if (!id) {
      alert('Bitte zuerst alle Metadaten ausfüllen (ID kann nicht abgeleitet werden).');
      return;
    }

    const fileName = `${id}.yaml`;
    const typ: StoragePrefix = isVideodaten(data) ? 'videos' : 'strecken';
    const content = generateYAML(data);

    saving = true;
    saveStatus = 'saving';
    cancelAutoSave();
    try {
      if (currentFileName) {
        await saveFile(typ, currentFileName, content);
      } else {
        try {
          await createFile(typ, fileName, content);
        } catch (e: any) {
          if (e.message?.includes('already exists')) {
            if (!confirm(`Datei "${fileName}" existiert bereits. Überschreiben?`)) {
              saving = false;
              saveStatus = 'dirty';
              return;
            }
            await saveFile(typ, fileName, content);
          } else {
            throw e;
          }
        }
      }
      currentFileName = fileName;
      dirty = false;
      saveStatus = 'saved';
    } catch (e: any) {
      saveStatus = 'dirty';
      alert(`Speichern fehlgeschlagen: ${e.message}`);
    } finally {
      saving = false;
    }
  }

  function handleCloudLoad(content: string, fileName: string, typ: StoragePrefix) {
    if (dirty && !confirm('Ungespeicherte Änderungen verwerfen?')) return;
    cancelAutoSave();
    data = parseYAMLContent(content);
    currentFileName = fileName;
    dirty = false;
    saveStatus = 'saved';
    history.clear();
    showDateien = false;
    if (data.signale.some(s => s.km !== undefined)) {
      showKm = true;
    }
  }

  async function handleMetaTabOut() {
    const knoten: Knoteneintrag = { id: data.signale.length, knoten: '' };
    data.signale = [...data.signale, knoten];
    markDirty();
    await tick();
    // Focus the first input in the last row
    const rows = document.querySelectorAll('.signal-row, .knoten-row, .notiz-row, .abzweigung-row, .import-row');
    const lastRow = rows[rows.length - 1];
    if (lastRow) {
      const input = lastRow.querySelector<HTMLElement>('input, select, textarea');
      if (input) input.focus();
    }
  }

  function handleExportMeldungen() {
    const yamlContent = generateYAML(data);
    downloadMeldungenHTML(data, yamlContent);
    dirty = false;
  }

  // Warn before leaving with unsaved changes
  $effect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (dirty) {
        e.preventDefault();
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  });

  // Auto-stitch importe when datei values change
  $effect(() => {
    const importeDateien = data.signale
      .filter(isImporteintrag)
      .map(s => s.import.datei)
      .join(',');
    if (importeDateien) {
      autoStitchImporte(data.signale);
    }
  });

  function flashUndoRedoBtn(id: string) {
    const btn = document.getElementById(id) as HTMLButtonElement | null;
    if (!btn || btn.disabled) return;
    btn.classList.add('hl-flash');
    setTimeout(() => btn.classList.remove('hl-flash'), 100);
  }

  // Keyboard shortcuts
  $effect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (isLoggedIn()) handleSave();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        handleRedo();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  });
</script>

<Toolbar
  {showKm}
  {showYaml}
  {showMeldungen}
  undoEnabled={history.canUndo}
  redoEnabled={history.canRedo}
  loggedIn={isLoggedIn()}
  onToggleKm={() => showKm = !showKm}
  onToggleYaml={() => showYaml = !showYaml}
  onToggleMeldungen={() => showMeldungen = !showMeldungen}
  onNew={newFile}
  onFileLoad={handleFileLoad}
  onUndo={handleUndo}
  onRedo={handleRedo}
  onExportMeldungen={handleExportMeldungen}
  onLogin={handleLogin}
  onLogout={handleLogout}
  onSave={handleSave}
  onToggleDateien={() => showDateien = !showDateien}
  {showDateien}
  {saving}
  {dirty}
  {currentFileName}
  {saveStatus}
/>

{#if showDateien}
  <Dateibrowser onload={handleCloudLoad} onclose={() => showDateien = false} />
{/if}

<Metafelder bind:data={data} onchange={markDirty} ontabout={handleMetaTabOut} />

<div class="main-content">
  <div class="signals-container">
    <div class="section-header">Signale</div>
    <div class="signals-list">
      <Signalpanel bind:signale={data.signale} {showKm} onchange={markDirty} />
    </div>
  </div>

  {#if showMeldungen}
    <div class="meldungen-section">
      <div class="meldungen-panel">
        <div class="section-header">Meldungen</div>
        <Meldungspanel signale={data.signale} onclose={() => showMeldungen = false} />
      </div>
    </div>
  {/if}
</div>

{#if showYaml}
  <Codepanel {data} onexport={() => dirty = false} />
{/if}

<style>
  .main-content { display: flex; gap: 0; align-items: stretch; }
  .signals-container {
    flex: 1;
    min-width: 0;
    background: var(--color-bg);
    border: var(--card-border);
    border-radius: var(--container-radius);
    overflow: hidden;
  }
  .signals-list { padding: var(--half-gap) 0; }
  .meldungen-section {
    width: 280px;
    flex-shrink: 0;
    margin-left: 12px;
  }
  .meldungen-panel {
    background: var(--color-bg);
    border: var(--card-border);
    border-radius: var(--container-radius);
    overflow: hidden;
    height: 100%;
    box-sizing: border-box;
  }
</style>

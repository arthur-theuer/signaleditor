<script lang="ts">
  import type { Editordaten } from './lib/types';
  import { parseYAMLContent, extractYAMLFromHTML } from './lib/yaml';
  import { saveState, undo as historyUndo, redo as historyRedo, canUndo, canRedo, clearHistory } from './lib/history.svelte';
  import { isQuelleneintrag } from './lib/types';
  import { autoStitchQuellen } from './lib/sources';
  import { generateYAML } from './lib/yaml';
  import { downloadMeldungenHTML } from './lib/reports';
  import Toolbar from './components/Toolbar.svelte';
  import MetaFields from './components/MetaFields.svelte';
  import SignalList from './components/SignalList.svelte';

  import YamlPanel from './components/YamlPanel.svelte';
  import MeldungenPanel from './components/MeldungenPanel.svelte';

  let data: Editordaten = $state({
    strecke: { id: '', name: '', linie: '', streckenvideos: [] },
    signale: [],
  });

  let dirty = $state(false);
  let showKm = $state(false);
  let showYaml = $state(false);
  let showMeldungen = $state(false);

  function newFile() {
    if (dirty && !confirm('Ungespeicherte Änderungen verwerfen?')) return;
    data = {
      strecke: { id: '', name: '', linie: '', streckenvideos: [] },
      signale: [],
    };
    dirty = false;
    clearHistory();
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
    data = parseYAMLContent(content);
    dirty = false;
    clearHistory();
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
    saveState(data);
    dirty = true;
  }

  function handleUndo() {
    const restored = historyUndo(data);
    if (restored) { data = restored; }
  }

  function handleRedo() {
    const restored = historyRedo(data);
    if (restored) { data = restored; }
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

  // Auto-stitch quellen when datei values change
  $effect(() => {
    const quellenDateien = data.signale
      .filter(isQuelleneintrag)
      .map(s => s.quelle.datei)
      .join(',');
    if (quellenDateien) {
      autoStitchQuellen(data.signale);
    }
  });

  // Keyboard shortcuts
  $effect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
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
  undoEnabled={canUndo()}
  redoEnabled={canRedo()}
  onToggleKm={() => showKm = !showKm}
  onToggleYaml={() => showYaml = !showYaml}
  onToggleMeldungen={() => showMeldungen = !showMeldungen}
  onNew={newFile}
  onFileLoad={handleFileLoad}
  onUndo={handleUndo}
  onRedo={handleRedo}
  onExportMeldungen={handleExportMeldungen}
/>

<MetaFields bind:strecke={data.strecke} onchange={markDirty} />

<div class="main-content">
  <div class="signals-section">
    <div class="signals-container">
      <div class="section-header">Signale</div>
      <div class="signals-list">
        <SignalList bind:signale={data.signale} {showKm} onchange={markDirty} />
      </div>
    </div>

    {#if showYaml}
      <YamlPanel {data} onexport={() => dirty = false} />
    {/if}
  </div>

  {#if showMeldungen}
    <div class="meldungen-section">
      <div class="meldungen-panel">
        <div class="section-header">Meldungen</div>
        <MeldungenPanel signale={data.signale} />
      </div>
    </div>
  {/if}
</div>

<style>
  .main-content { display: flex; gap: 0; align-items: flex-start; }
  .signals-section { flex: 1; min-width: 0; }
  .signals-container {
    background: var(--color-bg);
    border: var(--card-border);
    border-radius: var(--container-radius);
    overflow: hidden;
  }
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
  }
</style>

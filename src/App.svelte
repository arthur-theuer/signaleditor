<script lang="ts">
  import type { Editordaten } from './lib/types';
  import { parseYAMLContent, extractYAMLFromHTML } from './lib/yaml';
  import Toolbar from './components/Toolbar.svelte';
  import MetaFields from './components/MetaFields.svelte';
  import AddBar from './components/AddBar.svelte';
  import YamlPanel from './components/YamlPanel.svelte';

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
</script>

<Toolbar
  {showKm}
  {showYaml}
  {showMeldungen}
  onToggleKm={() => showKm = !showKm}
  onToggleYaml={() => showYaml = !showYaml}
  onToggleMeldungen={() => showMeldungen = !showMeldungen}
  onNew={newFile}
  onFileLoad={handleFileLoad}
/>

<div class="main-content">
  <div class="signals-section">
    <MetaFields bind:strecke={data.strecke} onchange={markDirty} />

    <div class="signals-container">
      <div class="section-header">Signale</div>
      <div class="signals-list">
        {#if data.signale.length === 0}
          <div class="empty-state">Keine Signale vorhanden</div>
        {/if}
        <!-- Phase 3: SignalList component goes here -->
      </div>
      <AddBar
        onAddSignal={() => { data.signale = [...data.signale, { id: data.signale.length, signal_1: '', signal_2: '' }]; markDirty(); }}
        onAddNotiz={() => { data.signale = [...data.signale, { id: data.signale.length, notiz: '' }]; markDirty(); }}
        onAddAbzweigung={() => { data.signale = [...data.signale, { id: data.signale.length, abzweigung: { strecke: '', richtung: '', von_nach: 'von', seite: 'links' } }]; markDirty(); }}
        onAddKnoten={() => { data.signale = [...data.signale, { id: data.signale.length, knoten: '' }]; markDirty(); }}
        onAddQuelle={() => { data.signale = [...data.signale, { id: data.signale.length, quelle: { datei: '' } }]; markDirty(); }}
      />
    </div>

    {#if showYaml}
      <YamlPanel {data} />
    {/if}
  </div>

  {#if showMeldungen}
    <div class="meldungen-section visible">
      <div class="meldungen-panel">
        <div class="section-header">Meldungen</div>
        <!-- Phase 5: MeldungenPanel component goes here -->
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
  .signals-list:empty + :global(.add-bar) { margin-top: var(--card-gap); }
  .empty-state {
    padding: 24px;
    text-align: center;
    color: var(--color-text-muted);
    font-size: var(--input-font-size);
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

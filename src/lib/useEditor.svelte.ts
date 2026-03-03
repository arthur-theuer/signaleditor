import type { Editordaten, Dateityp } from './types';
import { emptyStreckendaten, emptyRoutendaten, isStreckendaten, dateiId } from './types';
import { parseYAMLContent, extractYAMLFromHTML, generateYAML } from './yaml';
import { History } from './history.svelte';
import { invalidateImportCache } from './sources';
import { downloadMeldungenHTML } from './reports';
import { isLoggedIn } from './auth.svelte';
import { saveFile, createFile, type StoragePrefix } from './api';

export class Editor {
  data: Editordaten = $state(emptyStreckendaten());
  dirty = $state(false);
  showKm = $state(false);
  wantYaml = $state(false);
  wantMeldungen = $state(false);
  panelsAllowed = $state(true);
  currentFileName = $state<string | null>(null);
  saving = $state(false);
  showDateien = $state(false);
  saveStatus = $state<'saved' | 'saving' | 'dirty' | 'idle'>('idle');

  readonly history = new History();

  get showYaml() {
    return this.wantYaml && this.panelsAllowed;
  }

  get showMeldungen() {
    return this.wantMeldungen && this.panelsAllowed;
  }

  private autoSaveTimer: ReturnType<typeof setTimeout> | null = null;

  newFile(typ: Dateityp) {
    if (this.dirty && !confirm('Ungespeicherte Änderungen verwerfen?')) return;
    this.cancelAutoSave();
    this.data = typ === 'strecke' ? emptyStreckendaten() : emptyRoutendaten();
    this.dirty = false;
    this.currentFileName = null;
    this.saveStatus = 'idle';
    this.history.clear();
  }

  loadFile(content: string, filename: string) {
    if (filename.endsWith('.html')) {
      const yaml = extractYAMLFromHTML(content);
      if (yaml) {
        content = yaml;
      } else {
        alert('Keine eingebettete YAML-Daten gefunden');
        return;
      }
    }
    this.cancelAutoSave();
    this.data = parseYAMLContent(content);
    this.dirty = false;
    this.currentFileName = null;
    this.saveStatus = 'idle';
    this.history.clear();
    if (this.data.signale.some((s) => s.km !== undefined)) {
      this.showKm = true;
    }
  }

  handleFileLoad(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      this.loadFile(reader.result as string, file.name);
    };
    reader.readAsText(file);
    input.value = '';
  }

  markDirty() {
    this.dirty = true;
    this.scheduleAutoSave();
  }

  private scheduleAutoSave() {
    if (this.autoSaveTimer) clearTimeout(this.autoSaveTimer);
    if (!isLoggedIn() || !this.currentFileName) {
      this.saveStatus = this.dirty ? 'dirty' : 'idle';
      return;
    }
    this.saveStatus = 'dirty';
    this.autoSaveTimer = setTimeout(() => {
      this.autoSaveTimer = null;
      this.handleSave();
    }, 3000);
  }

  cancelAutoSave() {
    if (this.autoSaveTimer) {
      clearTimeout(this.autoSaveTimer);
      this.autoSaveTimer = null;
    }
  }

  handleUndo() {
    const restored = this.history.undo(this.data);
    if (restored) {
      this.data = restored;
    }
  }

  handleRedo() {
    const restored = this.history.redo(this.data);
    if (restored) {
      this.data = restored;
    }
  }

  async handleSave() {
    if (!isLoggedIn() || this.saving) return;

    const id = dateiId(this.data);
    if (!id) {
      alert('Bitte zuerst alle Metadaten ausfüllen (ID kann nicht abgeleitet werden).');
      return;
    }

    const fileName = `${id}.yaml`;
    const typ: StoragePrefix = isStreckendaten(this.data) ? 'strecken' : 'routen';
    const content = generateYAML(this.data);

    this.saving = true;
    this.saveStatus = 'saving';
    this.cancelAutoSave();
    try {
      if (this.currentFileName) {
        await saveFile(typ, this.currentFileName, content);
      } else {
        try {
          await createFile(typ, fileName, content);
        } catch (e: any) {
          if (e.message?.includes('already exists')) {
            if (!confirm(`Datei "${fileName}" existiert bereits. Überschreiben?`)) {
              this.saving = false;
              this.saveStatus = 'dirty';
              return;
            }
            await saveFile(typ, fileName, content);
          } else {
            throw e;
          }
        }
      }
      this.currentFileName = fileName;
      this.dirty = false;
      this.saveStatus = 'saved';
      invalidateImportCache(fileName);
    } catch (e: any) {
      this.saveStatus = 'dirty';
      alert(`Speichern fehlgeschlagen: ${e.message}`);
    } finally {
      this.saving = false;
    }
  }

  handleCloudLoad(content: string, fileName: string, _typ: StoragePrefix) {
    if (this.dirty && !confirm('Ungespeicherte Änderungen verwerfen?')) return;
    this.cancelAutoSave();
    this.data = parseYAMLContent(content);
    this.currentFileName = fileName;
    this.dirty = false;
    this.saveStatus = 'saved';
    this.history.clear();
    this.showDateien = false;
    if (this.data.signale.some((s) => s.km !== undefined)) {
      this.showKm = true;
    }
  }

  handleExportMeldungen() {
    const yamlContent = generateYAML(this.data);
    downloadMeldungenHTML(this.data, yamlContent);
    this.dirty = false;
  }
}

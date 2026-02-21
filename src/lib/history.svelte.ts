import type { Editordaten } from './types';

const MAX_UNDO = 50;

export type FocusInfo = {
  rowIndex?: number;
  fieldSelector?: string;
  metaId?: string;
  selectionStart?: number;
  selectionEnd?: number;
} | null;

type HistoryEntry = {
  data: string;
  focus: FocusInfo;
};

export class History {
  undoStack = $state<HistoryEntry[]>([]);
  redoStack = $state<HistoryEntry[]>([]);
  private isUndoingOrRedoing = false;

  get canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  get canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  save(data: Editordaten): void {
    if (this.isUndoingOrRedoing) return;
    const dataStr = JSON.stringify(data);
    if (this.undoStack.length > 0 && this.undoStack[this.undoStack.length - 1].data === dataStr) return;
    const focus = getFocusInfo();
    this.undoStack.push({ data: dataStr, focus });
    if (this.undoStack.length > MAX_UNDO) this.undoStack.shift();
    this.redoStack = [];
  }

  undo(currentData: Editordaten): Editordaten | null {
    if (this.undoStack.length === 0) return null;
    this.isUndoingOrRedoing = true;
    const currentFocus = getFocusInfo();
    this.redoStack.push({ data: JSON.stringify(currentData), focus: currentFocus });
    const state = this.undoStack.pop()!;
    const restored = JSON.parse(state.data) as Editordaten;
    restoreFocus(state.focus);
    setTimeout(() => { this.isUndoingOrRedoing = false; }, 0);
    return restored;
  }

  redo(currentData: Editordaten): Editordaten | null {
    if (this.redoStack.length === 0) return null;
    this.isUndoingOrRedoing = true;
    const currentFocus = getFocusInfo();
    this.undoStack.push({ data: JSON.stringify(currentData), focus: currentFocus });
    const state = this.redoStack.pop()!;
    const restored = JSON.parse(state.data) as Editordaten;
    restoreFocus(state.focus);
    setTimeout(() => { this.isUndoingOrRedoing = false; }, 0);
    return restored;
  }

  clear(): void {
    this.undoStack = [];
    this.redoStack = [];
  }
}

function getFocusInfo(): FocusInfo {
  const el = document.activeElement as HTMLElement | null;
  if (!el) return null;

  if (el.id && el.id.startsWith('meta')) {
    const input = el as HTMLInputElement;
    return { metaId: el.id, selectionStart: input.selectionStart ?? undefined, selectionEnd: input.selectionEnd ?? undefined };
  }

  const row = el.closest<HTMLElement>('[data-row-index]');
  if (!row) return null;
  const rowIndex = parseInt(row.dataset.rowIndex!);

  const classes = ['.signal-input', '.name-input', '.bahnhof-input', '.km-input',
    '.note-input', '.knoten-input', '.abzweigung-btn', '.quelle-datei'];
  let fieldSelector: string | undefined;
  for (const cls of classes) {
    if (el.matches(cls)) { fieldSelector = cls; break; }
  }
  if (!fieldSelector) {
    const parent = el.closest('.abzweigung-field');
    if (parent) {
      const fieldClass = Array.from(parent.classList).find(c => c.startsWith('abzweigung-') && c !== 'abzweigung-field');
      if (fieldClass) fieldSelector = `.${fieldClass} input, .${fieldClass} button`;
    }
  }
  if (!fieldSelector) return null;

  const input = el as HTMLInputElement;
  return {
    rowIndex,
    fieldSelector,
    selectionStart: input.selectionStart ?? undefined,
    selectionEnd: input.selectionEnd ?? undefined,
  };
}

function restoreFocus(info: FocusInfo): void {
  if (!info) return;
  setTimeout(() => {
    let el: HTMLElement | null = null;
    if (info.metaId) {
      el = document.getElementById(info.metaId);
    } else if (info.rowIndex !== undefined && info.fieldSelector) {
      const row = document.querySelector<HTMLElement>(`[data-row-index="${info.rowIndex}"]`);
      if (row) el = row.querySelector<HTMLElement>(info.fieldSelector);
    }
    if (el) {
      el.focus();
      if (info.selectionStart !== undefined && 'setSelectionRange' in el) {
        (el as HTMLInputElement).setSelectionRange(info.selectionStart, info.selectionEnd ?? info.selectionStart);
      }
    }
  }, 0);
}

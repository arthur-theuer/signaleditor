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

let undoStack = $state<HistoryEntry[]>([]);
let redoStack = $state<HistoryEntry[]>([]);
let isUndoingOrRedoing = false;

export function canUndo(): boolean {
  return undoStack.length > 0;
}

export function canRedo(): boolean {
  return redoStack.length > 0;
}

export function getFocusInfo(): FocusInfo {
  const el = document.activeElement as HTMLElement | null;
  if (!el) return null;

  // Meta fields
  if (el.id && el.id.startsWith('meta')) {
    const input = el as HTMLInputElement;
    return { metaId: el.id, selectionStart: input.selectionStart ?? undefined, selectionEnd: input.selectionEnd ?? undefined };
  }

  // Signal row fields
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

export function restoreFocus(info: FocusInfo): void {
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

export function saveState(data: Editordaten): void {
  if (isUndoingOrRedoing) return;
  const dataStr = JSON.stringify(data);
  if (undoStack.length > 0 && undoStack[undoStack.length - 1].data === dataStr) return;
  const focus = getFocusInfo();
  undoStack.push({ data: dataStr, focus });
  if (undoStack.length > MAX_UNDO) undoStack.shift();
  redoStack = [];
}

export function undo(currentData: Editordaten): Editordaten | null {
  if (undoStack.length === 0) return null;
  isUndoingOrRedoing = true;
  const currentFocus = getFocusInfo();
  redoStack.push({ data: JSON.stringify(currentData), focus: currentFocus });
  const state = undoStack.pop()!;
  const restored = JSON.parse(state.data) as Editordaten;
  restoreFocus(state.focus);
  setTimeout(() => { isUndoingOrRedoing = false; }, 0);
  return restored;
}

export function redo(currentData: Editordaten): Editordaten | null {
  if (redoStack.length === 0) return null;
  isUndoingOrRedoing = true;
  const currentFocus = getFocusInfo();
  undoStack.push({ data: JSON.stringify(currentData), focus: currentFocus });
  const state = redoStack.pop()!;
  const restored = JSON.parse(state.data) as Editordaten;
  restoreFocus(state.focus);
  setTimeout(() => { isUndoingOrRedoing = false; }, 0);
  return restored;
}

export function clearHistory(): void {
  undoStack = [];
  redoStack = [];
}

import type { Editordaten } from './types';

const MAX_UNDO = 50;

type HistoryEntry = {
  data: string; // JSON-serialized Editordaten
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

export function saveState(data: Editordaten): void {
  if (isUndoingOrRedoing) return;
  const dataStr = JSON.stringify(data);
  // Don't save if state hasn't changed
  if (undoStack.length > 0 && undoStack[undoStack.length - 1].data === dataStr) return;
  undoStack.push({ data: dataStr });
  if (undoStack.length > MAX_UNDO) undoStack.shift();
  redoStack = [];
}

export function undo(currentData: Editordaten): Editordaten | null {
  if (undoStack.length === 0) return null;
  isUndoingOrRedoing = true;
  redoStack.push({ data: JSON.stringify(currentData) });
  const state = undoStack.pop()!;
  const restored = JSON.parse(state.data) as Editordaten;
  setTimeout(() => { isUndoingOrRedoing = false; }, 0);
  return restored;
}

export function redo(currentData: Editordaten): Editordaten | null {
  if (redoStack.length === 0) return null;
  isUndoingOrRedoing = true;
  undoStack.push({ data: JSON.stringify(currentData) });
  const state = redoStack.pop()!;
  const restored = JSON.parse(state.data) as Editordaten;
  setTimeout(() => { isUndoingOrRedoing = false; }, 0);
  return restored;
}

export function clearHistory(): void {
  undoStack = [];
  redoStack = [];
}

<script lang="ts">
  import { tick } from 'svelte';
  import type { Eintrag, Signaleintrag, Notizeintrag, Knoteneintrag, Abzweigungseintrag, Importeintrag } from '../lib/types';
  import { isSignaleintrag, isNotizeintrag, isKnoteneintrag, isAbzweigungseintrag, isImporteintrag } from '../lib/types';
  import { autofillRow, isRowEmpty } from '../lib/signals';
  import Signalzeile from './Signalzeile.svelte';
  import Notizzeile from './Notizzeile.svelte';
  import Knotenzeile from './Knotenzeile.svelte';
  import Abzweigungszeile from './Abzweigungszeile.svelte';
  import Importzeile from './Importzeile.svelte';
  import Kilometerzelle from './Kilometerzelle.svelte';
  import Zeilenaktionen from './Zeilenaktionen.svelte';
  import Zwischenaktionen from './Zwischenaktionen.svelte';
  import Plusleiste from './Plusleiste.svelte';

  let {
    signale = $bindable(),
    showKm,
    onchange,
  }: {
    signale: Eintrag[];
    showKm: boolean;
    onchange: () => void;
  } = $props();

  let listEl: HTMLDivElement;
  let scrollAnchor: HTMLDivElement;

  // Drag-and-drop state
  let dragIdx: number | null = $state(null);
  let dropTargetIdx: number | null = $state(null); // insertion index (drop before this row)
  let indicatorY: number | null = $state(null); // px offset from listEl top
  let dragHandle: number | null = $state(null);

  function handleDragStart(e: DragEvent, idx: number) {
    e.dataTransfer!.effectAllowed = 'move';
    e.dataTransfer!.setData('text/plain', String(idx));
    requestAnimationFrame(() => { dragIdx = idx; });
  }

  function handleDragOver(e: DragEvent, idx: number) {
    if (dragIdx === null || dragIdx === idx) {
      dropTargetIdx = null;
      indicatorY = null;
      return;
    }
    e.preventDefault();
    e.dataTransfer!.dropEffect = 'move';
    const row = getRowEl(idx);
    if (!row || !listEl) return;
    const rowRect = row.getBoundingClientRect();
    const listRect = listEl.getBoundingClientRect();
    const midY = rowRect.top + rowRect.height / 2;
    if (e.clientY < midY) {
      // Insert before this row — line at top edge of row
      dropTargetIdx = idx;
      indicatorY = rowRect.top - listRect.top;
    } else {
      // Insert after this row — line at bottom edge of row
      dropTargetIdx = idx + 1;
      indicatorY = rowRect.bottom - listRect.top;
    }
  }

  function handleDragLeave(e: DragEvent, idx: number) {
    const row = getRowEl(idx);
    if (row && !row.contains(e.relatedTarget as Node)) {
      dropTargetIdx = null;
      indicatorY = null;
    }
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    if (dragIdx === null || dropTargetIdx === null) return;
    let targetIdx = dropTargetIdx;
    if (targetIdx > dragIdx) targetIdx--;
    if (targetIdx === dragIdx) { resetDrag(); return; }
    const [moved] = signale.splice(dragIdx, 1);
    signale.splice(targetIdx, 0, moved);
    signale = [...signale];
    reindex();
    onchange();
    resetDrag();
  }

  function handleDragEnd() {
    resetDrag();
  }

  function resetDrag() {
    dragIdx = null;
    dropTargetIdx = null;
    indicatorY = null;
    dragHandle = null;
  }

  // Focusable field selector matching the original
  const FOCUSABLE_SELECTOR = [
    '.signal-input',
    '.name-wrapper.visible .name-input',
    '.bahnhof-wrapper.visible .bahnhof-input',
    '.km-cell.visible .km-input',
    '.note-input',
    '.abzweigung-arrow:not([tabindex="-1"])',
    '.abzweigung-strecke',
    '.abzweigung-vonnach',
    '.abzweigung-richtung',
    '.knoten-input',
    '.import-datei',
  ].join(', ');

  function getRowEl(idx: number): HTMLElement | null {
    return listEl?.querySelector(`[data-row-index="${idx}"]`) ?? null;
  }

  function getFocusableFields(rowEl: HTMLElement): HTMLElement[] {
    return Array.from(rowEl.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(el => {
      const cell = el.closest('.signal-cell');
      return !cell || !cell.classList.contains('disabled');
    });
  }

  function getFirstFieldInRow(rowEl: HTMLElement): HTMLElement | null {
    if (showKm) {
      const kmInput = rowEl.querySelector<HTMLElement>('.km-input');
      if (kmInput) return kmInput;
    }
    return rowEl.querySelector<HTMLElement>(
      '.signal-input, .note-input, .abzweigung-btn, .knoten-input, .import-datei'
    );
  }

  async function focusRowField(rowIdx: number, last = false) {
    await tick();
    const rowEl = getRowEl(rowIdx);
    if (!rowEl) return;
    if (last) {
      const fields = getFocusableFields(rowEl);
      if (fields.length > 0) fields[fields.length - 1].focus();
    } else {
      getFirstFieldInRow(rowEl)?.focus();
    }
  }

  async function addSignalWithAutofill() {
    const newSig: Signaleintrag = { id: signale.length, signal_1: '', signal_2: '' };
    if (signale.length > 0) {
      autofillRow(newSig, signale.length - 1, signale, showKm);
    }
    signale = [...signale, newSig];
    reindex();
    onchange();
    await focusRowField(signale.length - 1);
    scrollAnchor?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }

  function insertSignalAt(idx: number) {
    const newSig: Signaleintrag = { id: idx, signal_1: '', signal_2: '' };
    if (idx > 0) {
      autofillRow(newSig, idx - 1, signale, showKm);
    }
    signale = [...signale.slice(0, idx), newSig, ...signale.slice(idx)];
    reindex();
    onchange();
    focusRowField(idx);
  }

  function insertAt(idx: number, entry: Eintrag) {
    if (showKm && idx > 0) {
      const prev = signale[idx - 1];
      if (prev.km !== undefined) entry.km = parseFloat((prev.km + 0.1).toFixed(1));
    }
    signale = [...signale.slice(0, idx), entry, ...signale.slice(idx)];
    reindex();
    onchange();
    focusRowField(idx);
  }

  function deleteRow(idx: number) {
    signale = signale.filter((_, i) => i !== idx);
    reindex();
    onchange();
  }

  function clearRow(idx: number) {
    signale[idx] = { id: signale[idx].id, signal_1: '', signal_2: '' } as Signaleintrag;
    onchange();
    focusRowField(idx);
  }

  function reindex() {
    signale.forEach((s, i) => s.id = i);
  }

  // Tab navigation handler — delegated at list level
  // Explicitly manages all Tab presses to ensure correct field order,
  // since native Tab can skip buttons inside component boundaries.
  function handleKeydown(e: KeyboardEvent) {
    if (e.key !== 'Tab') return;

    const target = e.target as HTMLElement;
    const rowEl = target.closest<HTMLElement>('[data-row-index]');
    if (!rowEl) return;

    const rowIdx = parseInt(rowEl.dataset.rowIndex!);
    const fields = getFocusableFields(rowEl);
    const currentFieldIdx = fields.indexOf(target);
    if (currentFieldIdx === -1) return;

    if (!e.shiftKey) {
      if (currentFieldIdx === fields.length - 1) {
        // Tab on last field in row → next row or add new
        e.preventDefault();
        const isLastRow = rowIdx === signale.length - 1;
        if (isLastRow) {
          addSignalWithAutofill();
        } else {
          const nextIdx = rowIdx + 1;
          const nextSig = signale[nextIdx];
          if (nextSig && isSignaleintrag(nextSig) && isRowEmpty(nextSig)) {
            autofillRow(nextSig, rowIdx, signale, showKm);
            signale = [...signale];
            onchange();
          }
          focusRowField(nextIdx);
        }
      } else {
        // Tab on middle field → next field in same row
        e.preventDefault();
        fields[currentFieldIdx + 1].focus();
      }
    } else {
      if (currentFieldIdx === 0) {
        // Shift+Tab on first field → previous row
        if (rowIdx > 0) {
          e.preventDefault();
          focusRowField(rowIdx - 1, true);
        }
      } else {
        // Shift+Tab on middle field → previous field in same row
        e.preventDefault();
        fields[currentFieldIdx - 1].focus();
      }
    }
  }

  function makeNotiz(idx: number): Notizeintrag {
    return { id: idx, notiz: '' };
  }
  function makeAbzweigung(idx: number): Abzweigungseintrag {
    return { id: idx, abzweigung: { strecke: '', richtung: '', von_nach: '', seite: 'links' } };
  }
  function makeKnoten(idx: number): Knoteneintrag {
    return { id: idx, knoten: '' };
  }
  function makeImport(idx: number): Importeintrag {
    return { id: idx, quelle: { datei: '' } };
  }

  async function appendEntry(entry: Eintrag) {
    if (showKm && signale.length > 0) {
      const prev = signale[signale.length - 1];
      if (prev.km !== undefined) entry.km = parseFloat((prev.km + 0.1).toFixed(1));
    }
    signale = [...signale, entry];
    reindex();
    onchange();
    await focusRowField(signale.length - 1);
    scrollAnchor?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }


</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div bind:this={listEl} onkeydown={handleKeydown} class="signal-list-inner">
  {#each signale as eintrag, idx (eintrag.id)}
    <Zwischenaktionen
      onInsertSignal={() => insertSignalAt(idx)}
      onInsertNotiz={() => insertAt(idx, makeNotiz(idx))}
      onInsertAbzweigung={() => insertAt(idx, makeAbzweigung(idx))}
      onInsertKnoten={() => insertAt(idx, makeKnoten(idx))}
      onInsertImport={() => insertAt(idx, makeImport(idx))}
    />
    <div
      class="signal-row"
      class:drag-ready={dragHandle === idx}
      data-row-index={idx}
      draggable={dragHandle === idx}
      ondragstart={(e: DragEvent) => handleDragStart(e, idx)}
      ondragend={handleDragEnd}
      ondragover={(e: DragEvent) => handleDragOver(e, idx)}
      ondragleave={(e: DragEvent) => handleDragLeave(e, idx)}
      ondrop={handleDrop}
    >
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div
        class="signal-id"
        onmousedown={() => dragHandle = idx}
        onmouseup={() => dragHandle = null}
      >{idx}</div>

      <Kilometerzelle
        bind:eintrag={signale[idx]}
        prevEintrag={idx > 0 ? signale[idx - 1] : undefined}
        {showKm}
        {onchange}
      />

      {#if isSignaleintrag(eintrag)}
        <Signalzeile
          bind:eintrag={signale[idx] as Signaleintrag}
          {signale}
          rowIdx={idx}
          {onchange}
        />
      {:else if isNotizeintrag(eintrag)}
        <Notizzeile bind:eintrag={signale[idx] as Notizeintrag} {onchange} />
      {:else if isKnoteneintrag(eintrag)}
        <Knotenzeile bind:eintrag={signale[idx] as Knoteneintrag} {onchange} />
      {:else if isAbzweigungseintrag(eintrag)}
        <Abzweigungszeile bind:eintrag={signale[idx] as Abzweigungseintrag} {onchange} />
      {:else if isImporteintrag(eintrag)}
        <Importzeile bind:eintrag={signale[idx] as Importeintrag} {onchange} />
      {/if}

      <Zeilenaktionen
        ondelete={() => deleteRow(idx)}
        onclear={() => clearRow(idx)}
      />
    </div>
  {/each}
  <div bind:this={scrollAnchor} style="height: 0;"></div>
  {#if indicatorY !== null}
    <div class="drop-indicator" style="top: {indicatorY}px;"></div>
  {/if}
</div>
<Plusleiste
  onAddSignal={addSignalWithAutofill}
  onAddNotiz={() => appendEntry(makeNotiz(signale.length))}
  onAddAbzweigung={() => appendEntry(makeAbzweigung(signale.length))}
  onAddKnoten={() => appendEntry(makeKnoten(signale.length))}
  onAddImport={() => appendEntry(makeImport(signale.length))}
/>

<style>
  .signal-row {
    display: flex;
    gap: var(--card-gap);
    padding: var(--half-gap) var(--card-gap);
    align-items: stretch;
    min-height: calc(var(--row-height) + var(--card-gap));
  }
  .signal-id {
    display: flex;
    align-items: center;
    justify-content: center;
    width: var(--unit);
    flex-shrink: 0;
    font-size: 13px;
    font-weight: 700;
    color: var(--color-text-secondary);
    font-family: monospace;
    background: var(--color-bg-raised);
    border: var(--card-border);
    border-radius: var(--card-radius);
    user-select: none;
    cursor: grab;
  }
  .signal-id:active { cursor: grabbing; }
  .signal-list-inner { position: relative; }

  .signal-row.drag-ready :global(.signal-actions) { visibility: hidden; }
  .drop-indicator {
    position: absolute;
    left: var(--card-gap);
    right: var(--card-gap);
    height: 0;
    box-shadow: 0 0 0 1px var(--color-focus);
    border-radius: 1px;
    z-index: 5;
    pointer-events: none;
  }
</style>

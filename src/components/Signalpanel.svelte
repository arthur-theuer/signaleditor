<script lang="ts">
  import { tick } from 'svelte';
  import type {
    Eintrag,
    Signaleintrag,
    Notizeintrag,
    Knoteneintrag,
    Abzweigungseintrag,
    Importeintrag,
  } from '../lib/types';
  import {
    isSignaleintrag,
    isNotizeintrag,
    isKnoteneintrag,
    isAbzweigungseintrag,
    isImporteintrag,
  } from '../lib/types';
  import { autofillRow, isRowEmpty } from '../lib/signals';
  import { focusWithoutScroll } from '../lib/focus';
  import { DragDrop } from '../lib/useDragDrop.svelte';
  import Signalzeile from './Signalzeile.svelte';
  import Notizzeile from './Notizzeile.svelte';
  import Knotenzeile from './Knotenzeile.svelte';
  import Abzweigungszeile from './Abzweigungszeile.svelte';
  import Importzeile from './Importzeile.svelte';
  import Kilometerzelle from './Kilometerzelle.svelte';
  import Zeilenaktionen from './Zeilenaktionen.svelte';
  import Zwischenaktionen from './Zwischenaktionen.svelte';
  import Plusleiste from './Plusleiste.svelte';
  import Meldungzelle from './ui/Meldungzelle.svelte';
  import type { MeldungRow } from '../lib/reports';

  let {
    signale = $bindable(),
    showKm,
    meldungen,
    onchange,
  }: {
    signale: Eintrag[];
    showKm: boolean;
    meldungen?: MeldungRow[];
    onchange: () => void;
  } = $props();

  let usedImportFiles = $derived(
    new Set(
      signale
        .filter(isImporteintrag)
        .map((s) => s.import.datei)
        .filter(Boolean),
    ),
  );

  // Per-field-type tier tracking: each row reports a tier (0=full, 1=medium, 2=compact),
  let listEl: HTMLDivElement;

  // Drag-and-drop (mouse + touch)
  const drag = new DragDrop(
    () => listEl,
    (fromIdx, toIdx) => {
      const [moved] = signale.splice(fromIdx, 1);
      signale.splice(toIdx, 0, moved);
      signale = [...signale];
      reindex();
      onchange();
    },
  );

  // Focusable field selector matching the original
  const FOCUSABLE_SELECTOR = [
    '.signal-input',
    '.name-wrapper .name-input',
    '.bahnhof-wrapper .bahnhof-input',
    '.km-cell .km-input',
    '.note-input',
    '.abzweigung-btn',
    '.abzweigung-strecke',
    '.abzweigung-richtung',
    '.search-field',
    '.import-folder-btn',
  ].join(', ');

  function getRowEl(idx: number): HTMLElement | null {
    return listEl?.querySelector(`[data-row-index="${idx}"]`) ?? null;
  }

  function getFocusableFields(rowEl: HTMLElement): HTMLElement[] {
    return Array.from(rowEl.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter((el) => {
      const cell = el.closest('.row-cell');
      return !cell || !cell.classList.contains('disabled');
    });
  }

  function getFirstFieldInRow(rowEl: HTMLElement): HTMLElement | null {
    if (showKm) {
      const kmInput = rowEl.querySelector<HTMLElement>('.km-input');
      if (kmInput) return kmInput;
    }
    return rowEl.querySelector<HTMLElement>(
      '.signal-input, .note-input, .abzweigung-btn, .search-field, .import-folder-btn',
    );
  }

  /** Scroll so the row + one row of padding is visible. Accounts for sticky toolbar on scroll-up. */
  function scrollRowIntoView(rowIdx: number) {
    const rowEl = getRowEl(rowIdx);
    if (!rowEl) return;
    const rowRect = rowEl.getBoundingClientRect();
    const style = getComputedStyle(document.documentElement);
    const pageGap = parseFloat(style.getPropertyValue('--spacing-page'));
    const cardGap = parseFloat(style.getPropertyValue('--spacing-card'));
    const padding = rowRect.height + pageGap + cardGap;
    // Row below viewport: scroll down
    const overflowBottom = rowRect.bottom + padding - window.innerHeight;
    if (overflowBottom > 0) {
      window.scrollBy({ top: overflowBottom, behavior: 'smooth' });
      return;
    }
    // Row above viewport: scroll up (account for sticky toolbar)
    const toolbar = document.querySelector<HTMLElement>('.header');
    const toolbarHeight = toolbar ? toolbar.getBoundingClientRect().height : 0;
    const overflowTop = rowRect.top - toolbarHeight - pageGap - cardGap;
    if (overflowTop < 0) {
      window.scrollBy({ top: overflowTop, behavior: 'smooth' });
    }
  }

  async function focusRowField(rowIdx: number, last = false) {
    await tick();
    const rowEl = getRowEl(rowIdx);
    if (!rowEl) return;
    if (last) {
      const fields = getFocusableFields(rowEl);
      if (fields.length > 0) focusWithoutScroll(fields[fields.length - 1]);
    } else {
      focusWithoutScroll(getFirstFieldInRow(rowEl));
    }
    scrollRowIntoView(rowIdx);
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
    const entry = signale[idx];
    const id = entry.id;
    if (isNotizeintrag(entry)) {
      signale[idx] = { id, notiz: '' };
    } else if (isKnoteneintrag(entry)) {
      signale[idx] = { id, knoten: '' };
    } else if (isAbzweigungseintrag(entry)) {
      signale[idx] = { id, abzweigung: { strecke: '', richtung: '', von_nach: '', links: '', rechts: '' } };
    } else if (isImporteintrag(entry)) {
      signale[idx] = { id, import: { datei: '' } };
    } else {
      signale[idx] = { id, signal_1: '', signal_2: '' } as Signaleintrag;
    }
    onchange();
    focusRowField(idx);
  }

  function reindex() {
    signale.forEach((s, i) => (s.id = i));
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
        focusWithoutScroll(fields[currentFieldIdx + 1]);
        scrollRowIntoView(rowIdx);
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
        focusWithoutScroll(fields[currentFieldIdx - 1]);
        scrollRowIntoView(rowIdx);
      }
    }
  }

  function makeNotiz(idx: number): Notizeintrag {
    return { id: idx, notiz: '' };
  }
  function makeAbzweigung(idx: number): Abzweigungseintrag {
    return { id: idx, abzweigung: { strecke: '', richtung: '', von_nach: '', links: '', rechts: '' } };
  }
  function makeKnoten(idx: number): Knoteneintrag {
    return { id: idx, knoten: '' };
  }
  function makeImport(idx: number): Importeintrag {
    return { id: idx, import: { datei: '' } };
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
  }
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div bind:this={listEl} onkeydown={handleKeydown} class={['signal-list-inner', { 'has-km': showKm, 'has-mel': !!meldungen }]}>
  {#each signale as eintrag, idx (eintrag.id)}
    <Zwischenaktionen
      onInsertSignal={() => insertSignalAt(idx)}
      onInsertNotiz={() => insertAt(idx, makeNotiz(idx))}
      onInsertAbzweigung={() => insertAt(idx, makeAbzweigung(idx))}
      onInsertKnoten={() => insertAt(idx, makeKnoten(idx))}
      onInsertImport={() => insertAt(idx, makeImport(idx))}
    />
    <div
      class={['signal-row', { 'drag-ready': drag.dragHandle === idx, dragging: drag.dragIdx === idx }]}
      data-row-index={idx}
      draggable={drag.dragHandle === idx}
      ondragstart={(e: DragEvent) => drag.handleDragStart(e, idx)}
      ondragend={() => drag.handleDragEnd()}
      ondragover={(e: DragEvent) => drag.handleDragOver(e, idx)}
      ondragleave={(e: DragEvent) => drag.handleDragLeave(e, idx)}
      ondrop={(e: DragEvent) => drag.handleDrop(e)}
    >
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div
        class="signal-id"
        onmousedown={() => (drag.dragHandle = idx)}
        onmouseup={() => (drag.dragHandle = null)}
        ontouchstart={(e) => drag.handleTouchStart(e, idx)}
      >{idx}</div>

      {#if showKm && !isImporteintrag(eintrag)}
        <Kilometerzelle
          bind:eintrag={signale[idx]}
          prevEintrag={idx > 0 ? signale[idx - 1] : undefined}
          {onchange}
        />
      {/if}

      {#if isSignaleintrag(eintrag)}
        <Signalzeile bind:eintrag={signale[idx] as Signaleintrag} {signale} rowIdx={idx} {onchange} />
      {:else if isNotizeintrag(eintrag)}
        <Notizzeile bind:eintrag={signale[idx] as Notizeintrag} {onchange} />
      {:else if isKnoteneintrag(eintrag)}
        <Knotenzeile bind:eintrag={signale[idx] as Knoteneintrag} {onchange} />
      {:else if isAbzweigungseintrag(eintrag)}
        <Abzweigungszeile bind:eintrag={signale[idx] as Abzweigungseintrag} {onchange} />
      {:else if isImporteintrag(eintrag)}
        <Importzeile bind:eintrag={signale[idx] as Importeintrag} usedFiles={usedImportFiles} {onchange} />
      {/if}

      <Zeilenaktionen ondelete={() => deleteRow(idx)} onclear={() => clearRow(idx)} />

      {#if meldungen && meldungen[idx]}
        <div class="meldung-col">
          <Meldungzelle meldung={meldungen[idx]} />
        </div>
      {/if}
    </div>
  {/each}
  {#if drag.indicatorY !== null}
    <div class="drop-indicator" style="top: {drag.indicatorY}px;"></div>
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
  /* ── Grid container ── */
  .signal-list-inner {
    --km-width: calc(1.5 * var(--spacing-unit));
    --mel-width: 220px;
    position: relative;
    overflow-anchor: none;
    display: grid;
    column-gap: var(--spacing-card);
    grid-template-columns:
      [id] var(--spacing-unit)
      [s1] minmax(0, 1fr) [s1b] minmax(0, 1fr)
      [s2] minmax(0, 1fr) [s2b] minmax(0, 1fr)
      [act] auto;
  }
  .signal-list-inner.has-km {
    grid-template-columns:
      [id] var(--spacing-unit)
      [km] var(--km-width)
      [s1] minmax(0, 1fr) [s1b] minmax(0, 1fr)
      [s2] minmax(0, 1fr) [s2b] minmax(0, 1fr)
      [act] auto;
  }
  .signal-list-inner.has-mel {
    grid-template-columns:
      [id] var(--spacing-unit)
      [s1] minmax(0, 1fr) [s1b] minmax(0, 1fr)
      [s2] minmax(0, 1fr) [s2b] minmax(0, 1fr)
      [act] auto
      [mel] var(--mel-width);
  }
  .signal-list-inner.has-km.has-mel {
    grid-template-columns:
      [id] var(--spacing-unit)
      [km] var(--km-width)
      [s1] minmax(0, 1fr) [s1b] minmax(0, 1fr)
      [s2] minmax(0, 1fr) [s2b] minmax(0, 1fr)
      [act] auto
      [mel] var(--mel-width);
  }
  @media (min-width: 768px) {
    .signal-list-inner {
      --mel-width: 280px;
    }
  }

  /* Zwischenaktionen + drop indicator span all columns */
  .signal-list-inner :global(.insert-wrapper) { grid-column: 1 / -1; }

  /* ── Subgrid rows ── */
  .signal-row {
    display: grid;
    grid-template-columns: subgrid;
    grid-column: 1 / -1;
    padding: var(--spacing-card);
    align-items: stretch;
    min-height: calc(var(--spacing-unit) + 2 * var(--spacing-card));
    border-bottom: 1px solid var(--color-border);
  }

  /* ── Cell placement ── */
  .signal-id {
    display: flex;
    align-items: center;
    justify-content: center;
    user-select: none;
    touch-action: none;
    font-size: var(--text-input);
    font-weight: var(--font-weight-bold);
    color: var(--color-text-secondary);
    font-family: var(--font-mono);
    background: var(--color-bg-raised);
    border: var(--card-border);
    border-radius: var(--radius-card);
    cursor: grab;
  }
  .signal-id:active {
    cursor: grabbing;
  }

  /* Signal cells: main signals span 2 cols, shrink to 1 when alt present */
  .signal-row :global([data-field='signal_1'])  { grid-column: s1 / span 2; }
  .signal-row :global([data-field='signal_2'])  { grid-column: s2 / span 2; }
  .signal-row:has(:global([data-field='signal_1b'])) :global([data-field='signal_1']) { grid-column: s1 / span 1; }
  .signal-row :global([data-field='signal_1b']) { grid-column: s1b / span 1; }
  .signal-row:has(:global([data-field='signal_2b'])) :global([data-field='signal_2']) { grid-column: s2 / span 1; }
  .signal-row :global([data-field='signal_2b']) { grid-column: s2b / span 1; }

  /* Non-signal rows: span all signal columns */
  .signal-row :global(.note-cell)      { grid-column: s1 / act; }
  .signal-row :global(.knoten-group)   { grid-column: s1 / act; }
  .signal-row :global(.import-group)   { grid-column: s1 / act; }
  .signal-row :global(.abzw-group)     { grid-column: s1 / act; }

  /* Actions always in the last signal column */
  .signal-row :global(.signal-actions) { grid-column: act; }

  /* Meldung column */
  .meldung-col {
    grid-column: mel;
    display: flex;
    padding: var(--spacing-half-card) var(--spacing-card);
    border-left: 1px solid var(--color-border);
  }

  /* ── Drag state ── */
  .signal-row.dragging {
    opacity: 0.4;
  }
  .signal-row.drag-ready :global(.signal-actions) {
    visibility: hidden;
  }
  .drop-indicator {
    grid-column: 1 / -1;
    position: absolute;
    left: var(--spacing-card);
    right: var(--spacing-card);
    height: 0;
    z-index: 5;
    pointer-events: none;
    box-shadow: 0 0 0 1px var(--color-focus);
    border-radius: 1px;
  }
</style>

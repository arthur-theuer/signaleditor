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
  import { RulerDimensionLine, X, DiamondPlus, Megaphone, CirclePlus } from 'lucide-svelte';
  import { ICON } from '../lib/constants';
  import Symbolknopf from './ui/Symbolknopf.svelte';
  import { DragDrop } from '../lib/useDragDrop.svelte';
  import Signalzeile from './rows/Signalzeile.svelte';
  import Notizzeile from './rows/Notizzeile.svelte';
  import Knotenzeile from './rows/Knotenzeile.svelte';
  import Abzweigungszeile from './rows/Abzweigungszeile.svelte';
  import Importzeile from './rows/Importzeile.svelte';
  import Kilometerzelle from './rows/Kilometerzelle.svelte';
  import Zeilenaktionen from './rows/Zeilenaktionen.svelte';
  import Pluszeile from './rows/Pluszeile.svelte';
  import Meldungzelle from './ui/Meldungzelle.svelte';
  import type { MeldungRow } from '../lib/reports';

  let {
    signale = $bindable(),
    showKm,
    meldungen,
    onchange,
    onToggleKm,
    onCloseMeldungen,
  }: {
    signale: Eintrag[];
    showKm: boolean;
    meldungen?: MeldungRow[];
    onchange: () => void;
    onToggleKm: () => void;
    onCloseMeldungen?: () => void;
  } = $props();

  let usedImportFiles = $derived(
    new Set(
      signale
        .filter(isImporteintrag)
        .map((s) => s.import.datei)
        .filter(Boolean),
    ),
  );

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

  // ── Insert panel (between-row insertion) ──
  let insertPanel: { idx: number; x: number; y: number } | null = $state(null);
  let panelEl: HTMLDivElement;

  function openInsertPanel(idx: number, triggerEl: HTMLElement) {
    const rect = triggerEl.getBoundingClientRect();
    insertPanel = {
      idx,
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };
    requestAnimationFrame(() => panelEl?.showPopover());
  }

  function closeInsertPanel() {
    insertPanel = null;
    panelEl?.hidePopover();
  }

  $effect(() => {
    if (!insertPanel) return;
    const onScroll = () => closeInsertPanel();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeInsertPanel(); };
    window.addEventListener('scroll', onScroll, { capture: true });
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('scroll', onScroll, { capture: true });
      window.removeEventListener('keydown', onKey);
    };
  });

  // Focusable field selector matching the original
  const FOCUSABLE_SELECTOR = [
    '.signal-input',
    '.name-cell .name-input',
    '.bahnhof-cell .bahnhof-input',
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

  function autofillKm(entry: Eintrag, prevEntry?: Eintrag) {
    if (showKm && prevEntry?.km !== undefined) {
      entry.km = parseFloat((prevEntry.km + 0.1).toFixed(1));
    }
  }

  function insertAt(idx: number, entry: Eintrag) {
    autofillKm(entry, signale[idx - 1]);
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
    if (isNotizeintrag(entry)) {
      signale[idx] = makeNotiz(entry.id);
    } else if (isKnoteneintrag(entry)) {
      signale[idx] = makeKnoten(entry.id);
    } else if (isAbzweigungseintrag(entry)) {
      signale[idx] = makeAbzweigung(entry.id);
    } else if (isImporteintrag(entry)) {
      signale[idx] = makeImport(entry.id);
    } else {
      signale[idx] = { id: entry.id, signal_1: '', signal_2: '' } as Signaleintrag;
    }
    onchange();
    focusRowField(idx);
  }

  function reindex() {
    signale.forEach((s, i) => (s.id = i));
  }

  // Tab navigation handler — delegated at list level.
  // Uses tick() before querying fields so that child components
  // (e.g. Signalzelle setting signalFocused=false) can update
  // the DOM before we determine the next focusable field.
  async function handleKeydown(e: KeyboardEvent) {
    if (e.key !== 'Tab') return;

    const target = e.target as HTMLElement;
    const rowEl = target.closest<HTMLElement>('[data-row-index]');
    if (!rowEl) return;

    // preventDefault must be synchronous — before the await.
    e.preventDefault();

    // Let Svelte flush state changes from child keydown handlers
    // (e.g. Signalzelle revealing name/bahnhof fields).
    await tick();

    const rowIdx = parseInt(rowEl.dataset.rowIndex!);
    const fields = getFocusableFields(rowEl);
    const currentFieldIdx = fields.indexOf(target);

    if (!e.shiftKey) {
      if (currentFieldIdx === -1 || currentFieldIdx === fields.length - 1) {
        // Tab on last field (or field no longer in DOM) → next row or add new
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
        focusWithoutScroll(fields[currentFieldIdx + 1]);
        scrollRowIntoView(rowIdx);
      }
    } else {
      if (currentFieldIdx <= 0) {
        // Shift+Tab on first field (or field no longer in DOM) → previous row
        if (rowIdx > 0) {
          focusRowField(rowIdx - 1, true);
        }
      } else {
        // Shift+Tab on middle field → previous field in same row
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
    autofillKm(entry, signale[signale.length - 1]);
    signale = [...signale, entry];
    reindex();
    onchange();
    await focusRowField(signale.length - 1);
  }
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div bind:this={listEl} onkeydown={handleKeydown} class="signal-list-inner" class:has-km={showKm} class:has-mel={!!meldungen}>
  <div class="header-row">
    <div class="section-header signale-header">
      <DiamondPlus {...ICON} />
      <span>Signale</span>
      <Symbolknopf
        class="km-toggle"
        color="red"
        bordered
        active={showKm}
        onclick={onToggleKm}
        title="Kilometer ein-/ausblenden"
      >
        <RulerDimensionLine {...ICON} />
      </Symbolknopf>
    </div>
    {#if meldungen}
      <div class="section-header meldungen-header"><Megaphone {...ICON} /> Meldungen</div>
    {/if}
  </div>
  {#each signale as eintrag, idx (eintrag.id)}
    {#if idx > 0}
      <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
      <div class="insert-trigger" onclick={(e) => openInsertPanel(idx, e.currentTarget as HTMLElement)}>
        <div class="insert-line-cell"><div class="insert-line"></div></div>
        <div class="insert-icon"><CirclePlus size={ICON.size} strokeWidth={3} /></div>
      </div>
    {/if}
    <div
      class="entry-row"
      class:drag-ready={drag.dragHandle === idx}
      class:dragging={drag.dragIdx === idx}
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
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="insert-panel"
    popover="manual"
    bind:this={panelEl}
    style={insertPanel ? `left: ${insertPanel.x}px; top: ${insertPanel.y}px` : ''}
    onmouseleave={closeInsertPanel}
  >
    {#if insertPanel}
      <Pluszeile
        onAddSignal={() => { const i = insertPanel!.idx; closeInsertPanel(); insertSignalAt(i); }}
        onAddNotiz={() => { const i = insertPanel!.idx; closeInsertPanel(); insertAt(i, makeNotiz(i)); }}
        onAddAbzweigung={() => { const i = insertPanel!.idx; closeInsertPanel(); insertAt(i, makeAbzweigung(i)); }}
        onAddKnoten={() => { const i = insertPanel!.idx; closeInsertPanel(); insertAt(i, makeKnoten(i)); }}
        onAddImport={() => { const i = insertPanel!.idx; closeInsertPanel(); insertAt(i, makeImport(i)); }}
      />
    {/if}
  </div>

  {#if drag.indicatorY !== null}
    <div class="drop-indicator" style="top: {drag.indicatorY}px;"></div>
  {/if}
  <div class="bottom-row">
    <Pluszeile
      onAddSignal={addSignalWithAutofill}
      onAddNotiz={() => appendEntry(makeNotiz(signale.length))}
      onAddAbzweigung={() => appendEntry(makeAbzweigung(signale.length))}
      onAddKnoten={() => appendEntry(makeKnoten(signale.length))}
      onAddImport={() => appendEntry(makeImport(signale.length))}
    />
    {#if meldungen && onCloseMeldungen}
      <Symbolknopf label="Schliessen" onclick={onCloseMeldungen} class="close-mel-btn">
        <X {...ICON} />
      </Symbolknopf>
    {/if}
  </div>
</div>

<style>
  /* ── Grid container ── */
  /* All named lines are always present. Optional km/mel segments collapse
     to 0px when inactive, so grid-column references never hit implicit columns. */
  .signal-list-inner {
    --_km: 0px;
    --_km-gap: 0px;
    --_mel: 0px;
    --_mel-gap: 0px;
    position: relative;
    overflow-anchor: none;
    display: grid;
    grid-template-columns:
      [g-li] var(--spacing-card)
      [id] var(--spacing-unit) [g-ik] var(--spacing-card)
      [km] var(--_km) [g-ks] var(--_km-gap)
      [s1] minmax(0, 1fr) [g-ss] var(--spacing-card) [s2] minmax(0, 1fr)
      [g-sa] var(--spacing-card) [act] auto
      [g-am] var(--_mel-gap)
      [mel] var(--_mel)
      [g-mr] var(--spacing-card);
  }
  .signal-list-inner.has-km {
    --_km: var(--spacing-km);
    --_km-gap: var(--spacing-card);
  }
  .signal-list-inner.has-mel {
    --_mel: var(--mel-width);
    --_mel-gap: var(--spacing-card);
  }

  /* ── Header row ── */
  .header-row {
    display: grid;
    grid-template-columns: subgrid;
    grid-column: 1 / -1;
    padding-block-end: var(--spacing-half-card);
  }
  .signale-header {
    grid-column: 1 / -1;
    padding-inline: var(--spacing-card);
    padding-left: var(--spacing-cell);
  }
  .signale-header:not(:last-child) {
    grid-column: g-li / mel;
    border-radius: var(--radius-container) 0 0 0;
  }
  .signale-header :global(.km-toggle) {
    margin-left: auto;
  }
  .meldungen-header {
    grid-column: mel / -1;
    padding-inline: var(--spacing-card);
    padding-left: calc(var(--spacing-cell) - var(--spacing-card));
    border-radius: 0 var(--radius-container) 0 0;
  }

  /* ── Subgrid rows ── */
  .entry-row {
    display: grid;
    grid-template-columns: subgrid;
    grid-column: 1 / -1;
    padding-block: var(--spacing-half-card);
    align-items: stretch;
    min-height: var(--spacing-unit);
  }

  /* ── Cell placement ── */
  .signal-id {
    grid-column: id;
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
    border: var(--border-subtle);
    border-radius: var(--radius-card);
    cursor: grab;
  }
  .signal-id:active {
    cursor: grabbing;
  }

  .entry-row :global(.km-cell) { grid-column: km; }

  /* Signal groups */
  .entry-row :global(.signal-group-1) { grid-column: s1; }
  .entry-row :global(.signal-group-2) { grid-column: s2; }

  /* Non-signal rows: span all signal columns */
  .entry-row :global(.note-cell)      { grid-column: s1 / g-sa; }
  .entry-row :global(.knoten-group)   { grid-column: s1 / g-sa; }
  .entry-row :global(.import-group)   { grid-column: km / g-sa; }
  .entry-row :global(.abzw-group)     { grid-column: s1 / g-sa; }

  /* Actions always in the last signal column */
  .entry-row :global(.signal-actions) { grid-column: act; }

  /* Meldung column */
  .meldung-col {
    grid-column: mel;
    display: flex;
  }

  /* Bottom row: Pluszeile + close button */
  .bottom-row {
    display: grid;
    grid-template-columns: subgrid;
    grid-column: 1 / -1;
    padding-block: var(--spacing-half-card);
    padding-block-end: var(--spacing-card);
    align-items: stretch;
  }
  .bottom-row :global(.add-bar) {
    grid-column: id / g-am;
    margin: 0;
  }
  .bottom-row :global(.close-mel-btn) {
    grid-column: mel;
    background: var(--color-red-bg);
    color: var(--color-red);
  }

  /* ── Insert trigger (between rows) ── */
  .insert-trigger {
    display: grid;
    grid-template-columns: subgrid;
    grid-column: 1 / -1;
    height: 0;
    overflow: visible;
    cursor: pointer;
    position: relative;
  }
  /* Invisible hover zone overlapping adjacent row padding */
  .insert-trigger::before {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    top: calc(-1 * var(--spacing-half-card));
    height: calc(2 * var(--spacing-half-card));
    z-index: 1;
  }
  .insert-line-cell {
    grid-column: 1 / -1;
    position: relative;
  }
  .insert-line {
    position: absolute;
    left: 0;
    right: 0;
    top: -1px;
    height: 2px;
    border-radius: 1px;
    background: var(--color-focus);
    opacity: 0;
    transition: opacity 0.15s;
  }
  .insert-icon {
    grid-column: g-ss;
    position: relative;
    z-index: 2;
    color: var(--color-focus);
    background: var(--color-bg);
    border-radius: 50%;
    opacity: 0;
    transition: opacity 0.15s;
    line-height: 0;
    padding: 1px;
    transform: translateY(-50%);
    width: max-content;
    justify-self: center;
  }
  .insert-trigger:hover .insert-line,
  .insert-trigger:hover .insert-icon {
    opacity: 1;
  }

  /* ── Insert panel (floating popover) ── */
  .insert-panel {
    position: fixed;
    transform: translate(-50%, -50%);
    margin: 0;
    padding: var(--spacing-card);
    border: var(--border-subtle);
    border-radius: var(--radius-card);
    background: var(--color-bg-raised);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  .insert-panel :global(.add-bar) {
    margin: 0;
  }

  /* ── Drag state ── */
  .entry-row.dragging {
    opacity: 0.4;
  }
  .entry-row.drag-ready :global(.signal-actions) {
    visibility: hidden;
  }
  .drop-indicator {
    grid-column: 1 / -1;
    position: absolute;
    left: 0;
    right: 0;
    height: 0;
    z-index: 5;
    pointer-events: none;
    box-shadow: 0 0 0 1px var(--color-focus);
    border-radius: 1px;
  }
</style>

<script lang="ts">
  import type { Eintrag, Signaleintrag, Notizeintrag, Knoteneintrag, Abzweigungseintrag, Quelleneintrag } from '../lib/types';
  import { isSignaleintrag, isNotizeintrag, isKnoteneintrag, isAbzweigungseintrag, isQuelleneintrag } from '../lib/types';
  import { autofillRow, isRowEmpty } from '../lib/signals';
  import SignalRow from './SignalRow.svelte';
  import NoteRow from './NoteRow.svelte';
  import KnotenRow from './KnotenRow.svelte';
  import AbzweigungRow from './AbzweigungRow.svelte';
  import QuelleRow from './QuelleRow.svelte';
  import KmCell from './KmCell.svelte';
  import RowActions from './RowActions.svelte';
  import InsertZone from './InsertZone.svelte';
  import AddBar from './AddBar.svelte';

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

  // Focusable field selector matching the original
  const FOCUSABLE_SELECTOR = [
    '.signal-input',
    '.name-wrapper.visible .name-input',
    '.bahnhof-wrapper.visible .bahnhof-input',
    '.km-cell.visible .km-input',
    '.note-input',
    '.abzweigung-btn',
    '.abzweigung-field input',
    '.knoten-input',
    '.quelle-datei',
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
      '.signal-input, .note-input, .abzweigung-btn, .knoten-input, .quelle-datei'
    );
  }

  function focusRowField(rowIdx: number, last = false) {
    // Use tick to wait for Svelte to render
    setTimeout(() => {
      const rowEl = getRowEl(rowIdx);
      if (!rowEl) return;
      if (last) {
        const fields = getFocusableFields(rowEl);
        if (fields.length > 0) fields[fields.length - 1].focus();
      } else {
        getFirstFieldInRow(rowEl)?.focus();
      }
    }, 10);
  }

  function addSignalWithAutofill() {
    const newSig: Signaleintrag = { id: signale.length, signal_1: '', signal_2: '' };
    if (signale.length > 0) {
      autofillRow(newSig, signale.length - 1, signale, showKm);
    }
    signale = [...signale, newSig];
    reindex();
    onchange();
    focusRowField(signale.length - 1);
    setTimeout(() => scrollAnchor?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }), 20);
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
    const e = signale[idx];
    if (isSignaleintrag(e)) {
      signale[idx] = { id: e.id, signal_1: '', signal_2: '' } as Signaleintrag;
    } else if (isNotizeintrag(e)) {
      signale[idx] = { id: e.id, notiz: '' } as Notizeintrag;
    } else if (isKnoteneintrag(e)) {
      signale[idx] = { id: e.id, knoten: '' } as Knoteneintrag;
    } else if (isAbzweigungseintrag(e)) {
      signale[idx] = { id: e.id, abzweigung: { strecke: '', richtung: '', von_nach: 'von', seite: 'links' } } as Abzweigungseintrag;
    } else if (isQuelleneintrag(e)) {
      signale[idx] = { id: e.id, quelle: { datei: '' } } as Quelleneintrag;
    }
    onchange();
  }

  function reindex() {
    signale.forEach((s, i) => s.id = i);
  }

  // Tab navigation handler — delegated at list level
  function handleKeydown(e: KeyboardEvent) {
    if (e.key !== 'Tab') return;

    const target = e.target as HTMLElement;
    const rowEl = target.closest<HTMLElement>('[data-row-index]');
    if (!rowEl) return;

    const rowIdx = parseInt(rowEl.dataset.rowIndex!);
    const fields = getFocusableFields(rowEl);
    const currentFieldIdx = fields.indexOf(target);
    if (currentFieldIdx === -1) return;

    if (!e.shiftKey && currentFieldIdx === fields.length - 1) {
      // Tab on last field in row
      e.preventDefault();
      const isLastRow = rowIdx === signale.length - 1;
      if (isLastRow) {
        addSignalWithAutofill();
      } else {
        // Move to next row, autofill if empty
        const nextIdx = rowIdx + 1;
        const nextSig = signale[nextIdx];
        if (nextSig && isSignaleintrag(nextSig) && isRowEmpty(nextSig)) {
          autofillRow(nextSig, rowIdx, signale, showKm);
          signale = [...signale]; // trigger reactivity
          onchange();
        }
        focusRowField(nextIdx);
      }
    } else if (e.shiftKey && currentFieldIdx === 0) {
      // Shift+Tab on first field in row
      if (rowIdx > 0) {
        e.preventDefault();
        focusRowField(rowIdx - 1, true);
      }
    }
  }

  function makeNotiz(idx: number): Notizeintrag {
    return { id: idx, notiz: '' };
  }
  function makeAbzweigung(idx: number): Abzweigungseintrag {
    return { id: idx, abzweigung: { strecke: '', richtung: '', von_nach: 'von', seite: 'links' } };
  }
  function makeKnoten(idx: number): Knoteneintrag {
    return { id: idx, knoten: '' };
  }
  function makeQuelle(idx: number): Quelleneintrag {
    return { id: idx, quelle: { datei: '' } };
  }

  function appendEntry(entry: Eintrag) {
    signale = [...signale, entry];
    reindex();
    onchange();
    focusRowField(signale.length - 1);
    setTimeout(() => scrollAnchor?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }), 20);
  }


</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div bind:this={listEl} onkeydown={handleKeydown}>
  {#each signale as eintrag, idx (eintrag.id)}
    <InsertZone
      onInsertSignal={() => insertSignalAt(idx)}
      onInsertNotiz={() => insertAt(idx, makeNotiz(idx))}
      onInsertAbzweigung={() => insertAt(idx, makeAbzweigung(idx))}
      onInsertKnoten={() => insertAt(idx, makeKnoten(idx))}
      onInsertQuelle={() => insertAt(idx, makeQuelle(idx))}
    />
    <div class="signal-row" class:first={idx === 0} class:last={idx === signale.length - 1} data-row-index={idx}>
      <div class="signal-id">{idx}</div>

      <KmCell
        bind:eintrag={signale[idx]}
        prevEintrag={idx > 0 ? signale[idx - 1] : undefined}
        {showKm}
        {onchange}
      />

      {#if isSignaleintrag(eintrag)}
        <SignalRow
          bind:eintrag={signale[idx] as Signaleintrag}
          {signale}
          rowIdx={idx}
          {onchange}
        />
      {:else if isNotizeintrag(eintrag)}
        <NoteRow bind:eintrag={signale[idx] as Notizeintrag} {onchange} />
      {:else if isKnoteneintrag(eintrag)}
        <KnotenRow bind:eintrag={signale[idx] as Knoteneintrag} {onchange} />
      {:else if isAbzweigungseintrag(eintrag)}
        <AbzweigungRow bind:eintrag={signale[idx] as Abzweigungseintrag} {onchange} />
      {:else if isQuelleneintrag(eintrag)}
        <QuelleRow bind:eintrag={signale[idx] as Quelleneintrag} {onchange} />
      {/if}

      <RowActions
        ondelete={() => deleteRow(idx)}
        onclear={() => clearRow(idx)}
      />
    </div>
  {/each}
  <div bind:this={scrollAnchor} style="height: 0;"></div>
</div>
<AddBar
  onAddSignal={addSignalWithAutofill}
  onAddNotiz={() => appendEntry(makeNotiz(signale.length))}
  onAddAbzweigung={() => appendEntry(makeAbzweigung(signale.length))}
  onAddKnoten={() => appendEntry(makeKnoten(signale.length))}
  onAddQuelle={() => appendEntry(makeQuelle(signale.length))}
/>

<style>
  .signal-row {
    display: flex;
    gap: var(--card-gap);
    padding: var(--row-gap) var(--card-gap);
    align-items: stretch;
    min-height: calc(var(--row-height) + var(--row-gap) * 2);
  }
  .signal-row.first { padding-top: var(--card-gap); min-height: calc(var(--row-height) + var(--card-gap) + var(--row-gap)); }
  .signal-row.last { padding-bottom: var(--card-gap); min-height: calc(var(--row-height) + var(--row-gap) + var(--card-gap)); }
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
  }
</style>

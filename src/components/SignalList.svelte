<script lang="ts">
  import type { Eintrag, Signaleintrag, Notizeintrag, Knoteneintrag, Abzweigungseintrag, Quelleneintrag } from '../lib/types';
  import { isSignaleintrag, isNotizeintrag, isKnoteneintrag, isAbzweigungseintrag, isQuelleneintrag } from '../lib/types';
  import SignalRow from './SignalRow.svelte';
  import NoteRow from './NoteRow.svelte';
  import KnotenRow from './KnotenRow.svelte';
  import AbzweigungRow from './AbzweigungRow.svelte';
  import QuelleRow from './QuelleRow.svelte';
  import KmCell from './KmCell.svelte';
  import RowActions from './RowActions.svelte';
  import InsertZone from './InsertZone.svelte';

  let {
    signale = $bindable(),
    showKm,
    onchange,
  }: {
    signale: Eintrag[];
    showKm: boolean;
    onchange: () => void;
  } = $props();

  function insertAt(idx: number, entry: Eintrag) {
    signale = [...signale.slice(0, idx), entry, ...signale.slice(idx)];
    reindex();
    onchange();
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

  function makeSignal(idx: number): Signaleintrag {
    return { id: idx, signal_1: '', signal_2: '' };
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
</script>

{#each signale as eintrag, idx (eintrag.id)}
  <InsertZone
    onInsertSignal={() => insertAt(idx, makeSignal(idx))}
    onInsertNotiz={() => insertAt(idx, makeNotiz(idx))}
    onInsertAbzweigung={() => insertAt(idx, makeAbzweigung(idx))}
    onInsertKnoten={() => insertAt(idx, makeKnoten(idx))}
    onInsertQuelle={() => insertAt(idx, makeQuelle(idx))}
  />
  <div class="signal-row">
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

<style>
  .signal-row {
    display: flex;
    gap: var(--card-gap);
    padding: var(--row-gap) var(--card-gap);
    align-items: stretch;
    min-height: calc(var(--row-height) + var(--row-gap) * 2);
  }
  .signal-row:first-child { padding-top: var(--card-gap); }
  .signal-row:last-child { padding-bottom: var(--card-gap); }
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

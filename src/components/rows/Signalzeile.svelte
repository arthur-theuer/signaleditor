<script lang="ts">
  import type { Signaleintrag, Eintrag } from '../../lib/types';
  import { isWiederholungssignal, isVorsignal, extractSignalBase, validateRow } from '../../lib/signals';
  import Signalzelle from './Signalzelle.svelte';

  let {
    eintrag = $bindable(),
    signale,
    rowIdx,
    onchange,
  }: {
    eintrag: Signaleintrag;
    signale: Eintrag[];
    rowIdx: number;
    onchange: () => void;
  } = $props();

  let isWdh = $derived(isWiederholungssignal(eintrag.signal_1));
  let isVs = $derived(isVorsignal(eintrag.signal_1));
  let signal2Disabled = $derived(isWdh || isVs);
  let has1b = $derived(!isWdh && eintrag.signal_1b !== undefined);
  let has2b = $derived(!signal2Disabled && eintrag.signal_2b !== undefined);
  let validation = $derived(validateRow(eintrag, signale, rowIdx));

  function toggleAlt(mainNum: 1 | 2) {
    const altField = `signal_${mainNum}b` as 'signal_1b' | 'signal_2b';
    if (eintrag[altField] !== undefined) {
      delete eintrag[altField];
    } else {
      eintrag[altField] = '';
    }
    onchange();
  }

  let prevBase = extractSignalBase(eintrag.signal_1) || '';

  function handleSignalChange() {
    const base = extractSignalBase(eintrag.signal_1) || '';
    const typeChanged = base !== prevBase;
    prevBase = base;

    if (isWiederholungssignal(eintrag.signal_1)) {
      eintrag.signal_2 = '';
      eintrag.signal_1b = undefined;
      eintrag.signal_2b = undefined;
      eintrag.bahnhof = undefined;
    } else if (isVorsignal(eintrag.signal_1)) {
      eintrag.signal_2 = '';
      eintrag.signal_2b = undefined;
    }
    // Block chain: clear Block-Vorsignal from signal_2 when signal_1 type changes away from Blocksignal
    if (typeChanged && !base.startsWith('Blocksignal') && extractSignalBase(eintrag.signal_2 || '') === 'Block-Vorsignal zu') {
      eintrag.signal_2 = '';
    }
    onchange();
  }
</script>

<div class="signal-group-1">
  <Signalzelle
    bind:value={eintrag.signal_1}
    field="signal_1"
    {rowIdx}
    {signale}
    bind:bahnhof={eintrag.bahnhof}
    isMainSignal={true}
    isAltActive={has1b}
    onToggleAlt={() => toggleAlt(1)}
    onchange={handleSignalChange}
    error={validation.signal_1}
    nameError={validation.name_1}
  />
  {#if has1b}
    <Signalzelle
      bind:value={eintrag.signal_1b}
      field="signal_1b"
      {rowIdx}
      {signale}
      bind:bahnhof={eintrag.bahnhof}
      {onchange}
      error={validation.signal_1b}
      nameError={validation.name_1b}
    />
  {/if}
</div>

<div class="signal-group-2">
  <Signalzelle
    bind:value={eintrag.signal_2}
    field="signal_2"
    {rowIdx}
    {signale}
    bind:bahnhof={eintrag.bahnhof}
    isMainSignal={!signal2Disabled}
    isAltActive={has2b}
    disabled={signal2Disabled}
    onToggleAlt={() => toggleAlt(2)}
    {onchange}
    error={validation.signal_2}
  />
  {#if has2b}
    <Signalzelle
      bind:value={eintrag.signal_2b}
      field="signal_2b"
      {rowIdx}
      {signale}
      bind:bahnhof={eintrag.bahnhof}
      {onchange}
      error={validation.signal_2b}
    />
  {/if}
</div>

<style>
  .signal-group-1,
  .signal-group-2 {
    display: flex;
    min-width: 0;
    gap: var(--spacing-card);
  }
</style>

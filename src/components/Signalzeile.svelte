<script lang="ts">
  import type { Signaleintrag, Eintrag } from '../lib/types';
  import { isWiederholungssignal, isVorsignal, extractSignalBase } from '../lib/signals';
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
  let has1b = $derived(!signal2Disabled && eintrag.signal_1b !== undefined);
  let has2b = $derived(!signal2Disabled && eintrag.signal_2b !== undefined);

  function toggleAlt(mainNum: 1 | 2) {
    const altField = `signal_${mainNum}b` as 'signal_1b' | 'signal_2b';
    if (eintrag[altField] !== undefined) {
      delete eintrag[altField];
    } else {
      eintrag[altField] = '';
    }
    onchange();
  }

  function handleSignalChange() {
    if (isWiederholungssignal(eintrag.signal_1)) {
      eintrag.signal_2 = '';
      delete eintrag.signal_1b;
      delete eintrag.signal_2b;
      eintrag.bahnhof = undefined;
    } else if (isVorsignal(eintrag.signal_1)) {
      eintrag.signal_2 = '';
      delete eintrag.signal_2b;
    }
    // Block chain: clear Block-Vorsignal from signal_2 when signal_1 is no longer Blocksignal
    const base = extractSignalBase(eintrag.signal_1) || '';
    if (!base.startsWith('Blocksignal') && extractSignalBase(eintrag.signal_2 || '') === 'Block-Vorsignal zu') {
      eintrag.signal_2 = '';
    }
    onchange();
  }
</script>

<!-- signal_1 -->
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
/>

<!-- signal_1b (alt) -->
{#if has1b}
  <Signalzelle
    bind:value={eintrag.signal_1b}
    field="signal_1b"
    {rowIdx}
    {signale}
    bind:bahnhof={eintrag.bahnhof}
    onchange={onchange}
  />
{/if}

<!-- signal_2 -->
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
  onchange={onchange}
/>

<!-- signal_2b (alt) -->
{#if has2b}
  <Signalzelle
    bind:value={eintrag.signal_2b}
    field="signal_2b"
    {rowIdx}
    {signale}
    bind:bahnhof={eintrag.bahnhof}
    onchange={onchange}
  />
{/if}

<script lang="ts">
  import type { Signaleintrag, Eintrag } from '../lib/types';
  import { isWiederholungssignal } from '../lib/signals';
  import SignalCell from './SignalCell.svelte';

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
  let has1b = $derived(!isWdh && eintrag.signal_1b !== undefined);
  let has2b = $derived(!isWdh && eintrag.signal_2b !== undefined);

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
    // Handle Wiederholungssignal: clear signal_2 and alts
    if (isWiederholungssignal(eintrag.signal_1)) {
      eintrag.signal_2 = '';
      delete eintrag.signal_1b;
      delete eintrag.signal_2b;
      eintrag.bahnhof = undefined;
    }
    onchange();
  }
</script>

<!-- signal_1 -->
<SignalCell
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
  <SignalCell
    bind:value={eintrag.signal_1b}
    field="signal_1b"
    {rowIdx}
    {signale}
    bind:bahnhof={eintrag.bahnhof}
    onchange={onchange}
  />
{/if}

<!-- signal_2 -->
<SignalCell
  bind:value={eintrag.signal_2}
  field="signal_2"
  {rowIdx}
  {signale}
  bind:bahnhof={eintrag.bahnhof}
  isMainSignal={!isWdh}
  isAltActive={has2b}
  disabled={isWdh}
  onToggleAlt={() => toggleAlt(2)}
  onchange={onchange}
/>

<!-- signal_2b (alt) -->
{#if has2b}
  <SignalCell
    bind:value={eintrag.signal_2b}
    field="signal_2b"
    {rowIdx}
    {signale}
    bind:bahnhof={eintrag.bahnhof}
    onchange={onchange}
  />
{/if}

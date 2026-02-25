<script lang="ts">
  import type { Signaleintrag, Eintrag } from '../lib/types';
  import { isWiederholungssignal, isVorsignal, extractSignalBase, signalNeedsBahnhof, extractName } from '../lib/signals';
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
  let needsBahnhof = $derived(signalNeedsBahnhof(extractSignalBase(eintrag.signal_1) || ''));

  function handleBahnhofInput(e: Event) {
    eintrag.bahnhof = (e.target as HTMLInputElement).value;
    onchange();
  }

  function handleBahnhofFocus() {
    if (eintrag.bahnhof) return;
    const nameVal = extractName(eintrag.signal_1 ?? '').trim();
    if (nameVal) {
      eintrag.bahnhof = nameVal;
      onchange();
    }
  }

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
    onchange={onchange}
  />
{/if}

<!-- bahnhof (separate cell, only for Einfahr-Vorsignal) -->
{#if needsBahnhof}
  <div class="signal-cell bahnhof-cell hl-wrap">
    <input
      type="text"
      class="bahnhof-input"
      value={eintrag.bahnhof || ''}
      oninput={handleBahnhofInput}
      onfocus={handleBahnhofFocus}
      placeholder="Kurzname"
      autocomplete="off"
      autocorrect="off"
      spellcheck="false"
    />
  </div>
{/if}

<!-- signal_2 -->
<Signalzelle
  bind:value={eintrag.signal_2}
  field="signal_2"
  {rowIdx}
  {signale}
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
    onchange={onchange}
  />
{/if}

<style>
  .bahnhof-cell {
    flex: 0.5;
    background: var(--color-highlight);
  }
  .bahnhof-input {
    flex: 1;
    min-width: 0;
    border: none;
    background: transparent;
    padding: 0 var(--spacing-cell);
    font-size: var(--text-input);
    font-family: var(--font-mono);
    box-sizing: border-box;
    border-radius: inherit;
    outline: none;
    height: 100%;
  }
  .bahnhof-input::placeholder { color: var(--color-text-muted); }
</style>

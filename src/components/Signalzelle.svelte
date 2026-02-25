<script lang="ts">
  import { Diff } from 'lucide-svelte';
  import { extractSignalBase, extractName, signalNeedsName, signalNeedsStationSearch, signalNeedsBahnhof, getEnumForField } from '../lib/signals';
  import { SIGNAL_ABBREV } from '../lib/constants';
  import Stationsname from './ui/Stationsname.svelte';
  import type { Eintrag } from '../lib/types';

  let {
    value = $bindable(),
    field,
    rowIdx,
    signale,
    bahnhof = $bindable(),
    isMainSignal = false,
    isAltActive = false,
    disabled = false,
    onToggleAlt,
    onchange,
  }: {
    value: string | undefined;
    field: string;
    rowIdx: number;
    signale: Eintrag[];
    bahnhof?: string;
    isMainSignal?: boolean;
    isAltActive?: boolean;
    disabled?: boolean;
    onToggleAlt?: () => void;
    onchange: () => void;
  } = $props();

  let typeAheadBuffer = '';
  let typeAheadTimeout: ReturnType<typeof setTimeout>;

  let base = $derived(extractSignalBase(value ?? '') || '');
  let needsName = $derived(signalNeedsName(base));
  let useStationSearch = $derived(signalNeedsStationSearch(base));
  let needsBahnhof = $derived(signalNeedsBahnhof(base));
  let enumList = $derived(getEnumForField(field, rowIdx, signale));

  let currentIdx = $derived(base ? enumList.indexOf(base) : -1);
  let prevSignal = $derived(
    currentIdx >= 0 ? enumList[(currentIdx - 1 + enumList.length) % enumList.length] :
    enumList[enumList.length - 1] ?? ''
  );
  let nextSignal = $derived(
    currentIdx >= 0 ? enumList[(currentIdx + 1) % enumList.length] :
    enumList[0] ?? ''
  );

  function abbrev(s: string): string { return SIGNAL_ABBREV[s] ?? s; }

  // Derive placeholder
  let fieldNum = $derived(field.replace('signal_', ''));
  let isAlt = $derived(field.endsWith('b'));
  let placeholder = $derived(isAlt ? `Signal ${fieldNum}` : `Signal ${fieldNum}${isAltActive ? 'a' : ''}`);

  function setSignal(newBase: string) {
    const oldName = extractName(value ?? '');
    const newNeedsName = signalNeedsName(newBase);
    if (newNeedsName && oldName) {
      value = `${newBase} ${oldName}`;
    } else {
      value = newBase;
    }
    onchange();
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      typeAheadBuffer = '';
      const idx = (currentIdx + 1) % enumList.length;
      setSignal(enumList[idx]);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      typeAheadBuffer = '';
      const idx = (currentIdx - 1 + enumList.length) % enumList.length;
      setSignal(enumList[idx]);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      typeAheadBuffer = '';
      value = '';
      onchange();
    } else if (e.key === 'Backspace') {
      e.preventDefault();
      typeAheadBuffer = typeAheadBuffer.slice(0, -1);
    } else if (e.key.length === 1 && e.key.match(/[a-zA-Z\-]/)) {
      e.preventDefault();
      typeAheadBuffer += e.key.toLowerCase();
      clearTimeout(typeAheadTimeout);
      typeAheadTimeout = setTimeout(() => { typeAheadBuffer = ''; }, 1000);
      const match = enumList.find(s => s.toLowerCase().startsWith(typeAheadBuffer));
      if (match) setSignal(match);
    }
  }

  let stationName = $state('');
  // Keep stationName in sync with the derived name
  $effect(() => { stationName = extractName(value ?? ''); });

  function handleNameChange() {
    value = stationName ? `${base} ${stationName}` : base;
    onchange();
  }

  function handleBahnhofInput(e: Event) {
    bahnhof = (e.target as HTMLInputElement).value;
    onchange();
  }

  function handleSignalFocus(e: FocusEvent) {
    const input = e.target as HTMLInputElement;
    requestAnimationFrame(() => input.setSelectionRange(0, 0));
  }

  function handleBahnhofFocus() {
    if (bahnhof) return;
    const nameVal = extractName(value ?? '').trim();
    if (nameVal) {
      bahnhof = nameVal;
      onchange();
    }
  }
</script>

<div class="signal-cell flex flex-col relative flex-1 min-w-0" class:has-name={needsName && !disabled} class:has-bahnhof={needsBahnhof && !disabled} class:disabled>
  <div class="signal-cell-inner flex h-full shrink-0">
    <div class="signal-input-wrapper flex-1 flex flex-col min-w-0 h-full hl-wrap">
      <div class="signal-preview prev whitespace-nowrap overflow-hidden text-ellipsis pointer-events-none px-cell"><span class="tier-full">{disabled ? '' : prevSignal}</span><span class="tier-abbrev">{disabled ? '' : abbrev(prevSignal)}</span></div>
      <div class="signal-input-slot">
        <input
          type="text"
          class="signal-input px-cell"
          readonly
          value={disabled ? '' : base}
          placeholder={disabled ? '' : placeholder}
          onkeydown={handleKeydown}
          onfocus={handleSignalFocus}
          tabindex={disabled ? -1 : 0}
        />
        <div class="signal-abbrev px-cell">{disabled ? '' : abbrev(base)}</div>
      </div>
      <div class="signal-preview next whitespace-nowrap overflow-hidden text-ellipsis pointer-events-none px-cell"><span class="tier-full">{disabled ? '' : nextSignal}</span><span class="tier-abbrev">{disabled ? '' : abbrev(nextSignal)}</span></div>
    </div>
    {#if needsName || stationName}
      <div class="name-wrapper hl-wrap" class:visible={needsName}>
        <div class="name-spacer"></div>
        {#if useStationSearch}
          <Stationsname bind:name={stationName} onchange={handleNameChange} />
        {:else}
          <input
            type="text"
            class="name-input px-cell"
            value={stationName}
            oninput={(e) => { stationName = (e.target as HTMLInputElement).value; handleNameChange(); }}
            placeholder="Name"
            autocomplete="off"
            autocorrect="off"
            spellcheck="false"
          />
        {/if}
        <div class="name-spacer"></div>
      </div>
    {/if}
    {#if isMainSignal && onToggleAlt}
      <button
        class="alt-toggle-btn absolute right-0 flex items-center justify-center w-unit h-unit p-0 z-1"
        class:active={isAltActive}
        onclick={onToggleAlt}
        title="Alternativsignal"
        tabindex={-1}
      ><Diff size={16} strokeWidth={1.5} /></button>
    {/if}
  </div>
  {#if needsBahnhof}
    <div class="bahnhof-wrapper hl-wrap visible">
      <input
        type="text"
        class="bahnhof-input w-full flex-1 px-cell"
        value={bahnhof || ''}
        oninput={handleBahnhofInput}
        onfocus={handleBahnhofFocus}
        placeholder="Kurzname"
        autocomplete="off"
        autocorrect="off"
        spellcheck="false"
      />
    </div>
  {/if}
</div>

<style>
  /* Base .signal-cell styles are in app.css */
  .signal-input-wrapper {
    border-radius: calc(var(--radius-card) - 1px);
    container-type: inline-size;
  }
  .has-name .signal-input-wrapper {
    width: 50%;
    flex: none;
    border-radius: calc(var(--radius-card) - 1px) 0 0 calc(var(--radius-card) - 1px);
  }
  .has-bahnhof .signal-input-wrapper {
    border-radius: calc(var(--radius-card) - 1px) calc(var(--radius-card) - 1px) 0 0;
  }
  .has-name.has-bahnhof .signal-input-wrapper {
    border-radius: calc(var(--radius-card) - 1px) 0 0 0;
  }

  .signal-preview {
    flex: var(--preview-flex);
    display: flex;
    font-size: var(--text-preview);
    font-family: var(--font-mono);
    color: var(--color-text-muted);
    opacity: 0;
  }
  .signal-input-wrapper:focus-within .signal-preview { opacity: 0.5; }
  .signal-input-wrapper:focus-within .signal-preview.prev { border-bottom: 1px solid var(--color-border); }
  .signal-input-wrapper:focus-within .signal-preview.next { border-top: 1px solid var(--color-border); }
  .signal-preview.prev { order: -1; align-items: center; padding-top: 2px; }
  .signal-preview.next { order: 1; align-items: center; padding-bottom: 2px; }

  .signal-input {
    flex: var(--input-flex);
    border: none;
    background: transparent;
    font-size: var(--text-input);
    font-family: var(--font-mono);
    cursor: pointer;
    display: flex;
    align-items: center;
  }
  .signal-input:focus { outline: none; }
  .signal-input::placeholder { color: var(--color-text-muted); }

  .name-wrapper {
    display: none;
    width: 50%;
    flex-direction: column;
    border-left: 1px solid var(--color-border);
    background: transparent;
    height: 100%;
    border-radius: 0 calc(var(--radius-card) - 1px) calc(var(--radius-card) - 1px) 0;
  }
  .name-wrapper.visible { display: flex; }
  .has-bahnhof .name-wrapper { border-radius: 0 calc(var(--radius-card) - 1px) 0 0; }
  .name-spacer { flex: var(--preview-flex); pointer-events: none; }
  .name-wrapper :global(.search-field) {
    flex: var(--input-flex);
  }
  .name-input {
    flex: var(--input-flex);
    min-width: 0;
    border: none;
    background: transparent;
    padding: 0 var(--spacing-cell);
    font-size: var(--text-input);
    font-family: var(--font-mono);
    color: var(--color-text-secondary);
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    outline: none;
    height: 100%;
  }
  .name-input::placeholder { color: var(--color-text-muted); }

  .has-bahnhof .signal-cell-inner { height: var(--spacing-unit); }
  .has-bahnhof .signal-input-wrapper { height: var(--spacing-unit); }
  .has-bahnhof .signal-preview { display: none; }
  .has-bahnhof .name-wrapper { height: var(--spacing-unit); }
  .has-bahnhof .name-spacer { display: none; }

  .bahnhof-wrapper {
    display: none;
    border-top: 1px solid var(--color-border);
    flex: 1;
    border-radius: 0 0 calc(var(--radius-card) - 1px) calc(var(--radius-card) - 1px);
  }
  .bahnhof-wrapper.visible { display: flex; }
  .bahnhof-input {
    border: none;
    background: var(--color-highlight);
    font-size: var(--text-input);
    font-family: var(--font-mono);
    box-sizing: border-box;
    border-radius: inherit;
  }
  .bahnhof-input:focus { outline: none; }
  .bahnhof-input::placeholder { color: var(--color-text-muted); }

  .alt-toggle-btn {
    top: 50%;
    transform: translateY(-50%);
    border: none;
    border-radius: 0;
    background: none;
    color: inherit;
    cursor: pointer;
    opacity: 0;
  }
  .has-bahnhof .alt-toggle-btn { top: 0; transform: none; }
  .signal-cell:hover .alt-toggle-btn { opacity: 0.6; }
  .signal-cell:hover .alt-toggle-btn:hover { opacity: 1; }
  .alt-toggle-btn.active { opacity: 0.4 !important; color: var(--color-text-muted); }

  /* Input + abbreviation overlay share the same flex slot */
  .signal-input-slot {
    flex: var(--input-flex);
    position: relative;
    display: flex;
  }
  .signal-input-slot .signal-input {
    flex: 1;
    min-width: 0;
  }
  .signal-abbrev {
    position: absolute;
    inset: 0;
    background: transparent;
    font-size: var(--text-input);
    font-family: var(--font-mono);
    display: none;
    align-items: center;
    pointer-events: none;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* Default: show full text, hide abbreviations */
  .tier-abbrev { display: none; }

  @container (max-width: 170px) {
    .tier-full { display: none; }
    .tier-abbrev { display: inline; }
    .signal-input { color: transparent; }
    .signal-input::placeholder { color: transparent; }
    .signal-abbrev { display: flex; }
  }
</style>

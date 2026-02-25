<script lang="ts">
  import { Diff } from 'lucide-svelte';
  import { extractSignalBase, extractName, signalNeedsName, signalNeedsStationSearch, signalNeedsBahnhof, getEnumForField } from '../lib/signals';
  import { ICON, SIGNAL_ABBREV, SIGNAL_SHORT } from '../lib/constants';
  import Stationsfeld from './ui/Stationsfeld.svelte';
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

  let typeAheadBuffer = $state('');
  let typeAheadTimeout: ReturnType<typeof setTimeout>;
  let dropdownOpen = $state(false);
  let dropdownIndex = $state(0);

  let base = $derived(extractSignalBase(value ?? '') || '');
  let needsName = $derived(signalNeedsName(base));
  let useStationSearch = $derived(signalNeedsStationSearch(base));
  let needsBahnhof = $derived(signalNeedsBahnhof(base));
  let enumList = $derived(getEnumForField(field, rowIdx, signale));

  let currentIdx = $derived(base ? enumList.indexOf(base) : -1);

  function abbrev(s: string): string { return SIGNAL_ABBREV[s] ?? s; }

  // Prefix-anchored fuzzy: first char must match at index 0
  function fuzzyMatch(text: string, query: string): boolean {
    const t = text.toLowerCase();
    let pos = 0;
    for (let i = 0; i < query.length; i++) {
      const idx = t.indexOf(query[i], pos);
      if (idx === -1) return false;
      if (i === 0 && idx !== 0) return false;
      pos = idx + 1;
    }
    return true;
  }

  let fuzzyMatches = $derived(
    typeAheadBuffer ? enumList.filter(s => fuzzyMatch(s, typeAheadBuffer)) : []
  );

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

  function resetBuffer() {
    typeAheadBuffer = '';
    dropdownOpen = false;
    dropdownIndex = 0;
    clearTimeout(typeAheadTimeout);
  }

  function startCooldown() {
    clearTimeout(typeAheadTimeout);
    typeAheadTimeout = setTimeout(() => resetBuffer(), 1000);
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (dropdownOpen && fuzzyMatches.length > 0) {
        // Navigate within dropdown
        dropdownIndex = (dropdownIndex + 1) % fuzzyMatches.length;
        setSignal(fuzzyMatches[dropdownIndex]);
        startCooldown();
      } else {
        // No buffer: cycle through enum
        resetBuffer();
        const idx = (currentIdx + 1) % enumList.length;
        setSignal(enumList[idx]);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (dropdownOpen && fuzzyMatches.length > 0) {
        dropdownIndex = (dropdownIndex - 1 + fuzzyMatches.length) % fuzzyMatches.length;
        setSignal(fuzzyMatches[dropdownIndex]);
        startCooldown();
      } else {
        resetBuffer();
        const idx = (currentIdx - 1 + enumList.length) % enumList.length;
        setSignal(enumList[idx]);
      }
    } else if (e.key === 'Tab' || e.key === 'Enter') {
      if (dropdownOpen) {
        // Confirm current selection
        resetBuffer();
        // Don't prevent default for Tab — let focus advance naturally
        if (e.key === 'Enter') e.preventDefault();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      if (dropdownOpen) {
        resetBuffer();
      } else {
        value = '';
        bahnhofRevealed = false;
        onchange();
      }
    } else if (e.key === 'Backspace') {
      e.preventDefault();
      if (typeAheadBuffer.length > 1) {
        typeAheadBuffer = typeAheadBuffer.slice(0, -1);
        // Re-match and select best
        if (fuzzyMatches.length > 0) {
          dropdownIndex = 0;
          setSignal(fuzzyMatches[0]);
          dropdownOpen = fuzzyMatches.length > 1;
        }
        startCooldown();
      } else {
        resetBuffer();
      }
    } else if (e.key.length === 1 && e.key.match(/[a-zA-Z\-]/)) {
      e.preventDefault();
      typeAheadBuffer += e.key.toLowerCase();
      // Use fuzzyMatches derived value won't update until next tick,
      // so compute inline for immediate response
      const matches = enumList.filter(s => fuzzyMatch(s, typeAheadBuffer));
      if (matches.length > 0) {
        dropdownIndex = 0;
        setSignal(matches[0]);
        dropdownOpen = matches.length > 1;
      }
      startCooldown();
    }
  }

  let stationName = $state('');
  let bahnhofRevealed = $state(false);
  // Keep stationName in sync with the derived name
  $effect(() => { stationName = extractName(value ?? ''); });
  // Reveal bahnhof if it already has a value
  $effect(() => { if (needsBahnhof && bahnhof) bahnhofRevealed = true; });

  let showBahnhof = $derived(needsBahnhof && bahnhofRevealed);

  function handleNameChange() {
    value = stationName ? `${base} ${stationName}` : base;
    onchange();
  }

  function handleNameFocus() {
    if (needsBahnhof) bahnhofRevealed = true;
  }

  function handleBahnhofInput(e: Event) {
    bahnhof = (e.target as HTMLInputElement).value;
    onchange();
  }

  function handleBahnhofFocus() {
    if (bahnhof) return;
    const nameVal = extractName(value ?? '').trim();
    if (nameVal) {
      bahnhof = nameVal;
      onchange();
    }
  }

  function handleSignalFocus(e: FocusEvent) {
    const input = e.target as HTMLInputElement;
    requestAnimationFrame(() => input.setSelectionRange(0, 0));
  }

  function handleSignalBlur() {
    resetBuffer();
  }


</script>

<div class="row-cell" class:has-name={needsName && !disabled} class:has-bahnhof={showBahnhof && !disabled} class:disabled>
  <div class="signal-input-wrapper hl-field">
    <div class="signal-input-slot">
      <input
        type="text"
        class="signal-input"
        readonly
        value={disabled ? '' : base}
        placeholder={disabled ? '' : placeholder}
        onkeydown={handleKeydown}
        onfocus={handleSignalFocus}
        onblur={handleSignalBlur}
        tabindex={disabled ? -1 : 0}
        autocomplete="none"
        autocorrect="off"
        spellcheck="false"
      />
      <div class="signal-abbrev">{disabled ? '' : abbrev(base)}</div>
      <div class="signal-short">{disabled ? '' : (SIGNAL_SHORT[base] ?? abbrev(base))}</div>
    </div>
    {#if dropdownOpen && fuzzyMatches.length > 1}
      <div class="dropdown">
        {#each fuzzyMatches as match, i}
          <div
            class="dropdown-item"
            class:active={i === dropdownIndex}
          >{match}</div>
        {/each}
      </div>
    {/if}
  </div>
  {#if needsName || stationName}
    <div class="name-wrapper hl-field" class:visible={needsName} onfocusin={handleNameFocus}>
      {#if useStationSearch}
        <Stationsfeld mode="name" bind:value={stationName} onchange={handleNameChange} />
      {:else}
        <input
          type="text"
          class="name-input"
          value={stationName}
          oninput={(e) => { stationName = (e.target as HTMLInputElement).value; handleNameChange(); }}
          placeholder="Name"
          autocomplete="none"
          autocorrect="off"
          spellcheck="false"
        />
      {/if}
    </div>
  {/if}

  {#if showBahnhof}
    <div class="bahnhof-wrapper hl-field visible">
      <input
        type="text"
        class="bahnhof-input"
        value={bahnhof || ''}
        oninput={handleBahnhofInput}
        onfocus={handleBahnhofFocus}
        placeholder="Kurzname"
        autocomplete="none"
        autocorrect="off"
        spellcheck="false"
      />
    </div>
  {/if}
  {#if isMainSignal && onToggleAlt}
    <button
      class="alt-toggle-btn"
      class:active={isAltActive}
      onclick={onToggleAlt}
      title="Alternativsignal"
      tabindex={-1}
    ><Diff {...ICON} /></button>
  {/if}
</div>

<style>
  /* Override overflow: hidden from .row-cell — dropdown needs to overflow */
  .row-cell { overflow: visible; }
  .signal-input-wrapper {
    flex: 1;
    display: flex;
    min-width: 0;
    height: 100%;
    border-radius: var(--radius-inner);
    container-type: inline-size;
  }
  .has-name .signal-input-wrapper {
    flex: 1;
    border-radius: var(--radius-inner) 0 0 var(--radius-inner);
  }
  .signal-input {
    flex: 1;
    border: none;
    background: transparent;
    padding: 0 var(--spacing-cell);
    font-size: var(--text-input);
    font-family: var(--font-mono);
    cursor: pointer;
    display: flex;
    align-items: center;
    -webkit-user-select: none;
    user-select: none;
    caret-color: transparent;
  }
  .signal-input:focus { outline: none; }
  .signal-input::placeholder { color: var(--color-text-muted); }

  /* Dropdown items — container and radius-flattening in app.css (.dropdown) */
  .dropdown-item {
    padding: var(--spacing-xs) var(--spacing-cell);
    font-size: var(--text-caption);
    font-family: var(--font-mono);
    color: var(--color-text);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    -webkit-user-select: none;
    user-select: none;
  }

  .name-wrapper {
    display: none;
    flex: 1;
    min-width: 0;
    border-left: 1px solid var(--color-border);
    background: transparent;
    height: 100%;
    border-radius: 0 var(--radius-inner) var(--radius-inner) 0;
  }
  .name-wrapper.visible { display: flex; }
  .has-bahnhof .name-wrapper { border-radius: 0; }
  .name-input {
    flex: 1;
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

  .bahnhof-wrapper {
    display: none;
    border-left: 1px solid var(--color-border);
    flex: 1;
    border-radius: 0 var(--radius-inner) var(--radius-inner) 0;
  }
  .bahnhof-wrapper.visible { display: flex; }
  .bahnhof-input {
    width: 100%;
    flex: 1;
    border: none;
    background: var(--color-highlight);
    padding: 0 var(--spacing-cell);
    font-size: var(--text-input);
    font-family: var(--font-mono);
    box-sizing: border-box;
    border-radius: inherit;
  }
  .bahnhof-input:focus { outline: none; }
  .bahnhof-input::placeholder { color: var(--color-text-muted); }

  .alt-toggle-btn {
    position: absolute;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    align-items: center;
    justify-content: center;
    width: var(--spacing-unit);
    height: var(--spacing-unit);
    padding: 0;
    z-index: 1;
    border: none;
    border-radius: 0;
    background: none;
    color: inherit;
    cursor: pointer;
    opacity: 0;
  }
  .row-cell:hover .alt-toggle-btn { opacity: 0.6; }
  .row-cell:hover .alt-toggle-btn:hover { opacity: 1; }
  .alt-toggle-btn.active { opacity: 0.4 !important; color: var(--color-text-muted); }

  /* Input + abbreviation overlay share the same flex slot */
  .signal-input-slot {
    flex: 1;
    position: relative;
    display: flex;
    min-width: 0;
  }
  .signal-abbrev, .signal-short {
    position: absolute;
    inset: 0;
    background: transparent;
    padding: 0 var(--spacing-cell);
    font-size: var(--text-input);
    font-family: var(--font-mono);
    display: none;
    align-items: center;
    pointer-events: none;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  @container (max-width: 170px) {
    .signal-input { color: transparent; }
    .signal-input::placeholder { color: transparent; }
    .signal-abbrev { display: flex; }
  }

  /* Collapse signal enum when bahnhof is revealed */
  .has-bahnhof .signal-input-wrapper {
    flex: none;
    width: calc(3ch + 2 * var(--spacing-cell));
    font-family: var(--font-mono);
    font-size: var(--text-input);
  }
  .has-bahnhof .signal-input { color: transparent; }
  .has-bahnhof .signal-input::placeholder { color: transparent; }
  .has-bahnhof .signal-abbrev { display: none; }
  .has-bahnhof .signal-short { display: flex; }
</style>

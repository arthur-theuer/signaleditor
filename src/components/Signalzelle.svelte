<script lang="ts">
  import { Diff } from 'lucide-svelte';
  import { extractSignalBase, extractName, signalNeedsName, signalNeedsBahnhof, getEnumForField } from '../lib/signals';
  import { useTypeAhead } from '../lib/useTypeAhead.svelte';
  import { ICON, SIGNAL_ABBREV, SIGNAL_SHORT } from '../lib/constants';
  import Signalname from './Signalname.svelte';
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

  let base = $derived(extractSignalBase(value ?? '') || '');
  let needsName = $derived(signalNeedsName(base));
  let needsBahnhof = $derived(signalNeedsBahnhof(base));
  let enumList = $derived(getEnumForField(field, rowIdx, signale));

  function abbrev(s: string): string { return SIGNAL_ABBREV[s] ?? s; }

  let fieldNum = $derived(field.replace('signal_', ''));
  let isAlt = $derived(field.endsWith('b'));
  let placeholder = $derived(isAlt ? `Signal ${fieldNum}` : `Signal ${fieldNum}${isAltActive ? 'a' : ''}`);

  const typeAhead = useTypeAhead(() => enumList, () => base);

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

  let bahnhofRevealed = $state(false);
  $effect(() => { if (needsBahnhof && bahnhof) bahnhofRevealed = true; });
  let showBahnhof = $derived(needsBahnhof && bahnhofRevealed);
  let shortLabel = $derived(showBahnhof ? (SIGNAL_SHORT[base] ?? abbrev(base)) : abbrev(base));

  function handleKeydown(e: KeyboardEvent) {
    const result = typeAhead.handleKeydown(e);
    if (result === null) return;
    if (result === '') {
      value = '';
      bahnhofRevealed = false;
      onchange();
    } else {
      setSignal(result);
    }
  }

  function handleNameChange(newName: string) {
    value = newName ? `${base} ${newName}` : base;
    onchange();
  }

  function handleNameFocus() {
    if (needsBahnhof) bahnhofRevealed = true;
  }

  function handleSignalFocus(e: FocusEvent) {
    const input = e.target as HTMLInputElement;
    requestAnimationFrame(() => input.setSelectionRange(0, 0));
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
        onblur={typeAhead.reset}
        tabindex={disabled ? -1 : 0}
        autocomplete="none"
        autocorrect="off"
        spellcheck="false"
      />
      <div class="signal-abbrev">{disabled ? '' : shortLabel}</div>
    </div>
    {#if typeAhead.state.dropdownOpen && typeAhead.state.fuzzyMatches.length > 1}
      <div class="dropdown">
        {#each typeAhead.state.fuzzyMatches as match, i}
          <div
            class="dropdown-item"
            class:active={i === typeAhead.state.dropdownIndex}
          >{match}</div>
        {/each}
      </div>
    {/if}
  </div>
  <Signalname
    {base}
    value={value ?? ''}
    bind:bahnhof
    {showBahnhof}
    onchange={handleNameChange}
    onbahnhofchange={onchange}
    onfocusin={handleNameFocus}
  />
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
  .signal-abbrev {
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
  .has-bahnhof .signal-abbrev { display: flex; }
</style>

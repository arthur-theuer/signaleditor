<script lang="ts">
  import { Diff } from 'lucide-svelte';
  import { extractSignalBase, extractName, signalNeedsName, signalNeedsBahnhof, getEnumForField } from '../../lib/signals';
  import { filterEnum } from '../../lib/signalSearch';
  import { ICON } from '../../lib/constants';
  import { withStableScroll } from '../../lib/focus';
  import Signalname from './Signalname.svelte';
  import type { Eintrag } from '../../lib/types';

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

  let fieldNum = $derived(field.replace('signal_', ''));
  let isAlt = $derived(field.endsWith('b'));
  let placeholder = $derived(isAlt ? `Signal ${fieldNum}` : `Signal ${fieldNum}${isAltActive ? 'a' : ''}`);

  // Search state
  let inputEl: HTMLInputElement | undefined = $state();
  let query = $state('');
  let matches: string[] = $state([]);
  let dropdownOpen = $state(false);
  let dropdownIndex = $state(0);
  let displayValue = $derived(dropdownOpen ? query : base || '');

  // Name/bahnhof are hidden while the signal input is focused.
  // Set to false in the Tab keydown handler (before the event bubbles
  // to Signalpanel) so that name/bahnhof render in time for
  // Signalpanel's tick()-deferred field query.
  let signalFocused = $state(false);

  // Deferred reveal: bahnhof field only appears once a bahnhof value
  // exists or the name field is focused (see handleNameFocus). Prevents
  // layout shift during arrow-key cycling where needsBahnhof flickers.
  let bahnhofRevealed = $state(false);
  $effect(() => {
    if (needsBahnhof && bahnhof) bahnhofRevealed = true;
  });

  let showBahnhof = $derived(needsBahnhof && bahnhofRevealed && !signalFocused);
  let showExtras = $derived(!disabled && !signalFocused);

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

  function closeDropdown() {
    dropdownOpen = false;
    dropdownIndex = 0;
    matches = [];
  }

  function handleInput() {
    if (!query) {
      withStableScroll(() => {
        value = '';
        bahnhofRevealed = false;
        onchange();
      });
      closeDropdown();
      return;
    }
    matches = filterEnum(enumList, query);
    if (matches.length > 0) {
      dropdownIndex = 0;
      dropdownOpen = true;
    } else {
      closeDropdown();
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    const currentIdx = base ? enumList.indexOf(base) : -1;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (dropdownOpen && matches.length > 0) {
        dropdownIndex = (dropdownIndex + 1) % matches.length;
        query = matches[dropdownIndex];
        setSignal(matches[dropdownIndex]);
      } else {
        const next = enumList[(currentIdx + 1) % enumList.length];
        withStableScroll(() => {
          setSignal(next);
          query = next;
        });
      }
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (dropdownOpen && matches.length > 0) {
        dropdownIndex = (dropdownIndex - 1 + matches.length) % matches.length;
        query = matches[dropdownIndex];
        setSignal(matches[dropdownIndex]);
      } else {
        const prev = enumList[(currentIdx - 1 + enumList.length) % enumList.length];
        withStableScroll(() => {
          setSignal(prev);
          query = prev;
        });
      }
      return;
    }

    if (e.key === 'Enter') {
      if (dropdownOpen && matches.length > 0) {
        e.preventDefault();
        withStableScroll(() => setSignal(matches[dropdownIndex]));
        closeDropdown();
      }
      return;
    }

    if (e.key === 'Tab') {
      if (dropdownOpen && matches.length > 0) {
        withStableScroll(() => setSignal(matches[dropdownIndex]));
      }
      closeDropdown();
      // Reveal name/bahnhof before the event bubbles to Signalpanel,
      // so its tick()-deferred field query finds them in the DOM.
      signalFocused = false;
      // Don't preventDefault — let Signalpanel handle navigation.
      return;
    }

    if (e.key === 'Escape') {
      e.preventDefault();
      if (dropdownOpen) {
        closeDropdown();
        query = base;
      } else {
        withStableScroll(() => {
          value = '';
          bahnhofRevealed = false;
          onchange();
          query = '';
        });
      }
      return;
    }
  }

  function handleNameChange(newName: string) {
    value = newName ? `${base} ${newName}` : base;
    onchange();
  }

  function handleNameFocus() {
    if (needsBahnhof) bahnhofRevealed = true;
  }

  function handleSignalFocus() {
    signalFocused = true;
    query = base;
    inputEl?.select();
  }

  function handleSignalBlur() {
    signalFocused = false;
    closeDropdown();
  }
</script>

<div class={['row-cell signal-cell hl-field', { disabled }]}>
    <input
      bind:this={inputEl}
      type="text"
      class="signal-input cell-input"
      value={displayValue}
      placeholder={disabled ? '' : placeholder}
      oninput={(e) => { query = (e.target as HTMLInputElement).value; handleInput(); }}
      onkeydown={handleKeydown}
      onfocus={handleSignalFocus}
      onblur={handleSignalBlur}
      tabindex={disabled ? -1 : 0}
      {disabled}
      autocomplete="off"
      autocorrect="off"
      spellcheck="false"
    />
  {#if dropdownOpen && matches.length > 0}
    <div class="dropdown">
      {#each matches as match, i}
        <div class={['dropdown-item', { active: i === dropdownIndex }]}>{match}</div>
      {/each}
    </div>
  {/if}
  {#if isMainSignal && onToggleAlt}
    <button
      class={['alt-toggle-btn', { active: isAltActive }]}
      onclick={onToggleAlt}
      title="Alternativsignal"
      tabindex={-1}><Diff {...ICON} /></button
    >
  {/if}
</div>
{#if showExtras}
  <Signalname
    {base}
    value={value ?? ''}
    bind:bahnhof
    {showBahnhof}
    onchange={handleNameChange}
    onbahnhofchange={onchange}
    onfocusin={handleNameFocus}
  />
{/if}

<style>
  /* outline: none handled by .hl-field > input in components.css */

  /* Dropdown items — container styles in components.css (.dropdown) */
  .dropdown-item {
    padding: var(--spacing-xs) var(--spacing-cell);
    font-size: var(--text-caption);
    font-family: var(--font-mono);
    color: var(--color-text);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    user-select: none;
  }
  .dropdown-item.active {
    background: var(--color-focus-bg);
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
  .signal-cell:hover .alt-toggle-btn {
    opacity: 0.6;
  }
  .signal-cell:hover .alt-toggle-btn:hover {
    opacity: 1;
  }
  .signal-cell:hover .alt-toggle-btn.active,
  .alt-toggle-btn.active {
    opacity: 0.4;
    color: var(--color-text-muted);
  }


</style>

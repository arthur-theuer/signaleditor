<script lang="ts">
  import { Search } from 'lucide-svelte';
  import { STATIONEN } from '../../lib/constants';

  let {
    code = $bindable(),
    placeholder = '',
    onchange,
  }: {
    code: string;
    placeholder?: string;
    onchange?: () => void;
  } = $props();

  let query = $state('');
  let open = $state(false);
  let activeIndex = $state(0);
  let searchInput: HTMLInputElement | undefined = $state();

  // Strip diacritics: ü→u, ö→o, ä→a, é→e etc.
  function fold(s: string): string {
    return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  }

  const entries = Object.entries(STATIONEN).map(([c, n]) => ({
    code: c,
    name: n,
    nameFolded: fold(n),
    codeFolded: fold(c),
  }));

  let resolvedName = $derived(STATIONEN[code] || '');
  let validCode = $derived(!!resolvedName);

  let results = $derived.by(() => {
    const q = fold(query.trim());
    if (!q) return [];
    const prefix: typeof entries = [];
    const substring: typeof entries = [];
    for (const e of entries) {
      if (e.nameFolded.startsWith(q) || e.codeFolded.startsWith(q)) {
        prefix.push(e);
      } else if (e.nameFolded.includes(q) || e.codeFolded.includes(q)) {
        substring.push(e);
      }
    }
    return [...prefix, ...substring].slice(0, 6);
  });

  function highlightMatch(text: string, q: string): string {
    if (!q) return text;
    const idx = fold(text).indexOf(fold(q));
    if (idx === -1) return text;
    return `${text.slice(0, idx)}<mark>${text.slice(idx, idx + q.length)}</mark>${text.slice(idx + q.length)}`;
  }

  function select(entry: { code: string }) {
    code = entry.code;
    query = '';
    open = false;
    onchange?.();
  }

  function handleFocus() {
    if (validCode) {
      query = resolvedName;
      searchInput?.select();
    }
    open = true;
    activeIndex = 0;
  }

  function handleBlur() {
    setTimeout(() => {
      open = false;
      query = '';
    }, 150);
  }

  function handleInput() {
    open = true;
    activeIndex = 0;
  }

  function focusNextTabbable() {
    if (!searchInput) return;
    const all = Array.from(
      document.querySelectorAll<HTMLElement>(
        'input:not([tabindex="-1"]):not([disabled]), button:not([tabindex="-1"]):not([disabled]), select:not([tabindex="-1"]):not([disabled]), [tabindex]:not([tabindex="-1"]):not([disabled])'
      )
    ).filter(el => el.offsetParent !== null);
    const idx = all.indexOf(searchInput);
    if (idx >= 0 && idx < all.length - 1) all[idx + 1].focus();
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (results.length) activeIndex = (activeIndex + 1) % results.length;
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (results.length) activeIndex = (activeIndex - 1 + results.length) % results.length;
    } else if (e.key === 'Tab' && !e.shiftKey) {
      if (open && results.length) {
        e.preventDefault();
        select(results[activeIndex]);
        focusNextTabbable();
      }
    } else if (e.key === 'Enter') {
      if (open && results.length) {
        e.preventDefault();
        select(results[activeIndex]);
        searchInput?.blur();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      code = '';
      query = '';
      open = false;
      onchange?.();
    }
  }
</script>

<div class="station-field">
  <span class="code-col" class:has-code={validCode}>{code || 'Code'}</span>
  <div class="name-col">
    <input
      bind:this={searchInput}
      type="text"
      class="search-field"
      class:has-value={validCode && !open}
      value={open ? query : (resolvedName || '')}
      oninput={(e) => { query = (e.target as HTMLInputElement).value; handleInput(); }}
      onfocus={handleFocus}
      onblur={handleBlur}
      onkeydown={handleKeydown}
      placeholder={placeholder}
      autocomplete="off"
      autocorrect="off"
      spellcheck="false"
    />
    {#if !validCode}
      <span class="search-icon"><Search size={16} strokeWidth={1.5} /></span>
    {/if}
  </div>
</div>
{#if open && results.length > 0}
  <div class="dropdown">
    {#each results as entry, i}
      <button
        class="dropdown-item"
        class:active={i === activeIndex}
        onmousedown={() => select(entry)}
        onmouseenter={() => activeIndex = i}
        tabindex={-1}
      >
        <span class="code-col">{@html highlightMatch(entry.code, query.trim())}</span>
        <span class="name-col">{@html highlightMatch(entry.name, query.trim())}</span>
      </button>
    {/each}
  </div>
{/if}

<style>
  .station-field {
    display: flex;
    height: 100%;
    width: 100%;
  }

  /* Shared two-column layout for field and dropdown rows */
  .code-col {
    width: var(--spacing-row);
    flex: none;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: var(--text-input);
    font-family: var(--font-mono);
    color: var(--color-text-muted);
  }
  .code-col.has-code {
    color: var(--color-text);
  }
  .name-col {
    flex: 1;
    min-width: 0;
    display: flex;
    align-items: center;
    position: relative;
    border-left: 1px solid var(--color-border);
  }

  .search-field {
    flex: 1;
    min-width: 0;
    border: none;
    background: transparent;
    padding: 0 var(--spacing-cell);
    font-size: var(--text-input);
    font-family: var(--font-mono);
    color: var(--color-text-muted);
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    outline: none;
    height: 100%;
  }
  .search-field.has-value {
    color: var(--color-text-secondary);
  }

  .search-icon {
    position: absolute;
    right: var(--spacing-cell);
    display: flex;
    align-items: center;
    color: var(--color-text-muted);
    pointer-events: none;
  }
  .station-field:focus-within .search-icon :global(svg) {
    stroke-width: 3;
  }

  /*
   * Dropdown: positioned from .hl-wrap (nearest positioned ancestor).
   * Uses 2px focus-colored border that merges with the .hl-wrap::after
   * focus ring — the ::after (z-index 3) covers the dropdown's top
   * border, creating a seamless connected appearance.
   * The -1px side offsets match the ::after's inset: -1px pattern.
   */
  .dropdown {
    position: absolute;
    top: 100%;
    left: -1px;
    right: -1px;
    z-index: 2;
    background: var(--color-bg-raised);
    border: var(--card-border);
    border-radius: 0 0 var(--radius-card) var(--radius-card);
    overflow: hidden;
  }

  /* Remove parent bottom rounding when dropdown is open */
  :global(.hl-wrap:has(.dropdown)) {
    border-bottom-left-radius: 0 !important;
    border-bottom-right-radius: 0 !important;
  }
  :global(.hl-wrap:has(.dropdown))::after {
    border-bottom-left-radius: 0 !important;
    border-bottom-right-radius: 0 !important;
  }

  .dropdown-item {
    display: flex;
    align-items: center;
    width: 100%;
    padding: var(--spacing-xs) 0;
    border: none;
    background: transparent;
    font-size: var(--text-preview);
    font-family: var(--font-mono);
    color: var(--color-text);
    cursor: pointer;
    text-align: left;
  }
  .dropdown-item .code-col {
    font-size: var(--text-preview);
  }
  .dropdown-item .name-col {
    padding: 0 var(--spacing-cell);
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  .dropdown-item.active {
    background: var(--color-focus-bg);
  }

  .dropdown-item :global(mark) {
    background: transparent;
    color: var(--color-focus);
    font-weight: var(--font-weight-bold);
    padding: 0;
  }
</style>

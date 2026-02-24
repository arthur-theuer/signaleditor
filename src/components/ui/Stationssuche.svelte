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

  const entries: { code: string; name: string; nameLower: string; codeLower: string }[] =
    Object.entries(STATIONEN).map(([c, n]) => ({
      code: c,
      name: n,
      nameLower: n.toLowerCase(),
      codeLower: c.toLowerCase(),
    }));

  let resolvedName = $derived(STATIONEN[code.toUpperCase()] || '');
  let validCode = $derived(!!resolvedName);

  let results = $derived.by(() => {
    const q = query.toLowerCase().trim();
    if (!q) return [];
    const prefix: typeof entries = [];
    const substring: typeof entries = [];
    for (const e of entries) {
      if (e.nameLower.startsWith(q) || e.codeLower.startsWith(q)) {
        prefix.push(e);
      } else if (e.nameLower.includes(q) || e.codeLower.includes(q)) {
        substring.push(e);
      }
    }
    return [...prefix, ...substring].slice(0, 6);
  });

  function highlightMatch(text: string, q: string): string {
    if (!q) return text;
    const idx = text.toLowerCase().indexOf(q.toLowerCase());
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

<div class="station-search">
  <span class="code-preview" class:has-code={validCode}>{code.toUpperCase() || ''}</span>
  <div class="search-field-wrapper">
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
            <span class="item-name">{@html highlightMatch(entry.name, query.trim())}</span>
            <span class="item-code">{@html highlightMatch(entry.code, query.trim())}</span>
          </button>
        {/each}
      </div>
    {/if}
  </div>
</div>

<style>
  .station-search {
    display: flex;
    height: 100%;
    width: 100%;
  }

  .code-preview {
    width: var(--spacing-row);
    flex: none;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: var(--text-input);
    font-family: var(--font-mono);
    text-transform: uppercase;
    color: var(--color-text-muted);
  }
  .code-preview.has-code {
    color: var(--color-text);
  }

  .search-field-wrapper {
    flex: 1;
    min-width: 0;
    position: relative;
    display: flex;
    align-items: center;
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
  .search-field-wrapper:focus-within .search-icon :global(svg) {
    stroke-width: 3;
  }

  .dropdown {
    position: absolute;
    top: 100%;
    left: -1px;
    right: 0;
    z-index: 50;
    background: var(--color-bg-raised);
    border: var(--card-border);
    border-radius: var(--radius-card);
    overflow: hidden;
    margin-top: var(--spacing-card);
  }

  .dropdown-item {
    display: flex;
    align-items: center;
    width: 100%;
    padding: var(--spacing-xs) var(--spacing-cell);
    border: none;
    background: transparent;
    font-size: var(--text-preview);
    font-family: var(--font-mono);
    color: var(--color-text);
    cursor: pointer;
    text-align: left;
    gap: var(--spacing-cell);
  }
  .dropdown-item.active {
    background: var(--color-focus-bg);
  }

  .item-name {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  .item-code {
    flex: none;
    color: var(--color-text-muted);
  }

  .dropdown-item :global(mark) {
    background: var(--color-focus-bg);
    color: inherit;
    border-radius: 1px;
    padding: 0;
  }
</style>

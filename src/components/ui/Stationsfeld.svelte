<script lang="ts">
  import { Search } from 'lucide-svelte';
  import { ICON, STATIONEN } from '../../lib/constants';
  import { search, highlight, codeForName, type Result } from '../../lib/station-search';
  import { focusWithoutScroll } from '../../lib/focus';

  let {
    mode,
    value = $bindable(),
    placeholder = '',
    onchange,
  }: {
    mode: 'code' | 'name';
    value: string;
    placeholder?: string;
    onchange?: () => void;
  } = $props();

  let query = $state('');
  let open = $state(false);
  let activeIndex = $state(0);
  let searchInput: HTMLInputElement | undefined = $state();

  let resolvedName = $derived(mode === 'code' ? STATIONEN[value]?.[0] || '' : '');
  let valid = $derived(mode === 'code' ? !!resolvedName : !!codeForName(value));
  let results: Result[] = $derived(search(query));

  function select(entry: Result) {
    value = mode === 'code' ? entry.code : entry.name;
    query = '';
    open = false;
    onchange?.();
  }

  function handleFocus() {
    if (mode === 'code' && valid) {
      query = resolvedName;
      searchInput?.select();
    } else if (mode === 'name' && value) {
      query = value;
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
        'input:not([tabindex="-1"]):not([disabled]), button:not([tabindex="-1"]):not([disabled]), select:not([tabindex="-1"]):not([disabled]), [tabindex]:not([tabindex="-1"]):not([disabled])',
      ),
    ).filter((el) => el.offsetParent !== null);
    const idx = all.indexOf(searchInput);
    if (idx >= 0 && idx < all.length - 1) focusWithoutScroll(all[idx + 1]);
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
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      value = '';
      query = '';
      open = false;
      onchange?.();
    }
  }
</script>

{#if mode === 'code'}
  <div class="station-field">
    <span class="code-col" class:has-code={valid}>{value || 'Code'}</span>
    <div class="name-col">
      <input
        bind:this={searchInput}
        type="text"
        class="search-field"
        class:has-value={valid && !open}
        value={open ? query : resolvedName || ''}
        oninput={(e) => {
          query = (e.target as HTMLInputElement).value;
          handleInput();
        }}
        onfocus={handleFocus}
        onblur={handleBlur}
        onkeydown={handleKeydown}
        {placeholder}
        autocomplete="off"
        autocorrect="off"
        spellcheck="false"
      />
      {#if !valid}
        <span class="search-icon"><Search {...ICON} /></span>
      {/if}
    </div>
  </div>
{:else}
  <input
    bind:this={searchInput}
    type="text"
    class="search-field name-input"
    class:has-value={valid && !open}
    value={open ? query : value || ''}
    oninput={(e) => {
      query = (e.target as HTMLInputElement).value;
      handleInput();
    }}
    onfocus={handleFocus}
    onblur={handleBlur}
    onkeydown={handleKeydown}
    {placeholder}
    autocomplete="off"
    autocorrect="off"
    spellcheck="false"
  />
{/if}
{#if open && results.length > 0}
  <div class="dropdown">
    {#each results as entry, i}
      <button
        class="dropdown-item"
        class:active={i === activeIndex}
        onmousedown={() => select(entry)}
        onmouseenter={() => (activeIndex = i)}
        tabindex={-1}
      >
        {#if mode === 'code'}
          <span class="code-col">{@html highlight(entry.code, entry.codeIndices)}</span>
          <span class="name-col">{@html highlight(entry.name, entry.nameIndices)}</span>
        {:else}
          <span class="item-name">{@html highlight(entry.name, entry.nameIndices)}</span>
          <span class="item-code">{@html highlight(entry.code, entry.codeIndices)}</span>
        {/if}
      </button>
    {/each}
  </div>
{/if}

<style>
  /* Code mode: two-column layout */
  .station-field {
    display: flex;
    height: 100%;
    width: 100%;
  }

  .code-col {
    width: calc(2 * var(--spacing-unit));
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

  /* Shared input style */
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

  /* Search icon (code mode only) */
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

  /* Dropdown items — container styles in app.css (.dropdown) */
  .dropdown-item {
    display: flex;
    align-items: center;
    width: 100%;
    padding: var(--spacing-xs) 0;
    border: none;
    background: transparent;
    font-size: var(--text-caption);
    font-family: var(--font-mono);
    color: var(--color-text);
    cursor: pointer;
    text-align: left;
  }
  .dropdown-item.active {
    background: var(--color-focus-bg);
  }
  .dropdown-item .code-col {
    font-size: var(--text-caption);
  }
  .dropdown-item .name-col {
    display: block;
    padding: 0 var(--spacing-cell);
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  /* Name mode dropdown items */
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
    text-align: right;
  }
  .dropdown-item:has(.item-name) {
    padding: var(--spacing-xs) var(--spacing-cell);
    gap: var(--spacing-cell);
  }

  .dropdown-item :global(mark) {
    background: transparent;
    color: var(--color-focus);
    font-weight: var(--font-weight-bold);
    padding: 0;
  }
</style>

<script lang="ts">
  import { search, highlight, codeForName, type Result } from '../../lib/station-search';

  let {
    name = $bindable(),
    placeholder = 'Name',
    onchange,
  }: {
    name: string;
    placeholder?: string;
    onchange?: () => void;
  } = $props();

  let query = $state('');
  let open = $state(false);
  let activeIndex = $state(0);
  let searchInput: HTMLInputElement | undefined = $state();

  let validName = $derived(!!codeForName(name));
  let results: Result[] = $derived(search(query));

  function select(entry: Result) {
    name = entry.name;
    query = '';
    open = false;
    onchange?.();
  }

  function handleFocus() {
    if (name) {
      query = name;
      searchInput?.select();
    }
    open = true;
    activeIndex = 0;
  }

  function handleBlur() {
    setTimeout(() => { open = false; query = ''; }, 150);
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
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      name = '';
      query = '';
      open = false;
      onchange?.();
    }
  }
</script>

<input
  bind:this={searchInput}
  type="text"
  class="search-field name-input"
  class:has-value={validName && !open}
  value={open ? query : (name || '')}
  oninput={(e) => { query = (e.target as HTMLInputElement).value; handleInput(); }}
  onfocus={handleFocus}
  onblur={handleBlur}
  onkeydown={handleKeydown}
  placeholder={placeholder}
  autocomplete="none"
  autocorrect="off"
  spellcheck="false"
/>
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
        <span class="item-name">{@html highlight(entry.name, entry.nameIndices)}</span>
        <span class="item-code">{@html highlight(entry.code, entry.codeIndices)}</span>
      </button>
    {/each}
  </div>
{/if}

<style>
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

  :global(.hl-field:has(.dropdown)),
  :global(.hl-field:has(.dropdown))::after {
    border-bottom-left-radius: 0 !important;
    border-bottom-right-radius: 0 !important;
  }

  .dropdown-item {
    display: flex;
    align-items: center;
    width: 100%;
    padding: var(--spacing-xs) var(--spacing-cell);
    border: none;
    background: transparent;
    font-size: var(--text-caption);
    font-family: var(--font-mono);
    color: var(--color-text);
    cursor: pointer;
    text-align: left;
    gap: var(--spacing-cell);
  }
  .dropdown-item.active {
    background: var(--color-focus-bg);
  }

  .item-code {
    flex: none;
    color: var(--color-text-muted);
    text-align: right;
  }
  .item-name {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .dropdown-item :global(mark) {
    background: transparent;
    color: var(--color-focus);
    font-weight: var(--font-weight-bold);
    padding: 0;
  }
</style>

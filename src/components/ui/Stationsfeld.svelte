<script lang="ts">
  import { search, highlight, codeForName, stationName, type Result } from '../../lib/station-search';

  let {
    mode,
    value = $bindable(),
    inputEl = $bindable(undefined),
    placeholder = '',
    onchange,
  }: {
    mode: 'code' | 'name';
    value: string;
    inputEl?: HTMLInputElement;
    placeholder?: string;
    onchange?: () => void;
  } = $props();

  let query = $state('');
  let open = $state(false);
  let activeIndex = $state(0);

  let resolvedName = $derived(mode === 'code' ? stationName(value) : '');
  let valid = $derived(mode === 'code' ? !!resolvedName : !!codeForName(value));
  let results: Result[] = $derived(search(query));
  let displayValue = $derived(
    open ? query : mode === 'code' ? resolvedName || '' : value || '',
  );

  function select(entry: Result) {
    value = mode === 'code' ? entry.code : entry.name;
    query = '';
    open = false;
    onchange?.();
  }

  function handleFocus() {
    if (mode === 'code' && valid) {
      query = resolvedName;
      inputEl?.select();
    } else if (mode === 'name' && value) {
      query = value;
      inputEl?.select();
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

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (results.length) activeIndex = (activeIndex + 1) % results.length;
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (results.length) activeIndex = (activeIndex - 1 + results.length) % results.length;
    } else if (e.key === 'Tab' && !e.shiftKey) {
      if (open && results.length) {
        select(results[activeIndex]);
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

<input
  bind:this={inputEl}
  type="text"
  class={['search-field', { 'name-input': mode === 'name', 'has-value': valid && !open }]}
  value={displayValue}
  oninput={(e) => {
    query = (e.target as HTMLInputElement).value;
    handleInput();
  }}
  onfocus={handleFocus}
  onblur={handleBlur}
  onkeydown={handleKeydown}
  {placeholder}
  autocomplete="none"
  autocorrect="off"
  spellcheck="false"
/>
{#if open && results.length > 0}
  <div class="dropdown">
    {#each results as entry, i}
      <button
        class={['dropdown-item', { active: i === activeIndex }]}
        onmousedown={() => select(entry)}
        onmouseenter={() => (activeIndex = i)}
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

  /* Dropdown items — container styles in components.css (.dropdown) */
  .dropdown-item {
    display: flex;
    align-items: center;
    width: 100%;
    padding: var(--spacing-xs) var(--spacing-cell);
    gap: var(--spacing-cell);
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

  .dropdown-item :global(mark) {
    background: transparent;
    color: var(--color-focus);
    font-weight: var(--font-weight-bold);
    padding: 0;
  }
</style>

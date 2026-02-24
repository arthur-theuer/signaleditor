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

  // --- search state ---
  let query = $state('');
  let open = $state(false);
  let activeIndex = $state(0);
  let nameInput: HTMLInputElement | undefined = $state();

  // Precomputed lowercase entries for search
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
    // Partition into prefix matches and substring-only matches
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
    const lower = text.toLowerCase();
    const idx = lower.indexOf(q.toLowerCase());
    if (idx === -1) return text;
    const before = text.slice(0, idx);
    const match = text.slice(idx, idx + q.length);
    const after = text.slice(idx + q.length);
    return `${before}<mark>${match}</mark>${after}`;
  }

  function select(entry: { code: string }) {
    code = entry.code;
    query = '';
    open = false;
    onchange?.();
  }

  function handleCodeInput() {
    code = code.toUpperCase();
    onchange?.();
  }

  function handleCodeKeydown(e: KeyboardEvent) {
    // Tab-skip: if code is valid, skip the name field
    if (e.key === 'Tab' && !e.shiftKey && validCode) {
      // Let default Tab behavior proceed — name field has tabindex -1
    }
  }

  function handleNameFocus() {
    if (validCode) {
      // Pre-fill with resolved name so user can see what they're replacing
      query = resolvedName;
      nameInput?.select();
    }
    open = true;
    activeIndex = 0;
  }

  function handleNameBlur() {
    // Delay to allow click on dropdown item
    setTimeout(() => {
      open = false;
      query = '';
    }, 150);
  }

  function handleNameInput() {
    open = true;
    activeIndex = 0;
  }

  function handleNameKeydown(e: KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (results.length) activeIndex = (activeIndex + 1) % results.length;
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (results.length) activeIndex = (activeIndex - 1 + results.length) % results.length;
    } else if (e.key === 'Enter' || (e.key === 'Tab' && !e.shiftKey)) {
      if (open && results.length) {
        e.preventDefault();
        select(results[activeIndex]);
        nameInput?.blur();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      open = false;
      query = '';
      nameInput?.blur();
    }
  }
</script>

<div class="station-search">
  <input
    type="text"
    class="code-field"
    bind:value={code}
    oninput={handleCodeInput}
    onkeydown={handleCodeKeydown}
    placeholder="Code"
    autocomplete="off"
    autocorrect="off"
    spellcheck="false"
  />
  <div class="name-field-wrapper">
    <input
      bind:this={nameInput}
      type="text"
      class="name-field"
      class:has-value={validCode && !open}
      tabindex={validCode ? -1 : 0}
      value={open ? query : (resolvedName || '')}
      oninput={(e) => { query = (e.target as HTMLInputElement).value; handleNameInput(); }}
      onfocus={handleNameFocus}
      onblur={handleNameBlur}
      onkeydown={handleNameKeydown}
      placeholder={placeholder}
      autocomplete="off"
      autocorrect="off"
      spellcheck="false"
    />
    {#if !validCode}
      <span class="search-icon"><Search size={14} strokeWidth={1.5} /></span>
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
    height: var(--spacing-unit);
    width: 100%;
  }

  .code-field {
    width: var(--spacing-row);
    flex: none;
    border: none;
    background: transparent;
    font-size: var(--text-input);
    font-family: var(--font-mono);
    text-transform: uppercase;
    text-align: center;
    outline: none;
    color: var(--color-text);
    height: 100%;
  }
  .code-field::placeholder {
    text-transform: none;
    color: var(--color-text-muted);
  }

  .name-field-wrapper {
    flex: 1;
    min-width: 0;
    position: relative;
    display: flex;
    align-items: center;
    border-left: 1px solid var(--color-border);
  }

  .name-field {
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
  .name-field.has-value {
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
  /* Thicken icon on focus, matching global button:hover svg pattern */
  .name-field-wrapper:focus-within .search-icon :global(svg) {
    stroke-width: 2.5;
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
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    overflow: hidden;
    margin-top: 2px;
  }

  .dropdown-item {
    display: flex;
    align-items: center;
    width: 100%;
    padding: 6px var(--spacing-cell);
    border: none;
    background: transparent;
    font-size: var(--text-input);
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
    font-size: 12px;
  }

  .dropdown-item :global(mark) {
    background: var(--color-focus-bg);
    color: inherit;
    border-radius: 1px;
    padding: 0;
  }
</style>

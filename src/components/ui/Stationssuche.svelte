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

  // Return matched character indices for a substring match, or null
  function substringIndices(folded: string, q: string): number[] | null {
    const idx = folded.indexOf(q);
    if (idx === -1) return null;
    return Array.from({ length: q.length }, (_, i) => idx + i);
  }

  // Return matched character indices for a fuzzy match, or null.
  // Greedy left-to-right: each query char must appear after the previous.
  function fuzzyIndices(folded: string, q: string): number[] | null {
    const indices: number[] = [];
    let pos = 0;
    for (const ch of q) {
      const idx = folded.indexOf(ch, pos);
      if (idx === -1) return null;
      indices.push(idx);
      pos = idx + 1;
    }
    return indices;
  }

  // Render text with matched indices wrapped in <mark>.
  // Groups consecutive indices into single <mark> spans.
  function highlight(text: string, indices: number[]): string {
    if (!indices.length) return text;
    const set = new Set(indices);
    let result = '';
    let inMark = false;
    for (let i = 0; i < text.length; i++) {
      if (set.has(i) && !inMark) { result += '<mark>'; inMark = true; }
      else if (!set.has(i) && inMark) { result += '</mark>'; inMark = false; }
      result += text[i];
    }
    if (inMark) result += '</mark>';
    return result;
  }

  type Entry = { code: string; name: string; nameFolded: string; codeFolded: string };
  type Result = Entry & { nameIndices: number[]; codeIndices: number[] };

  const entries: Entry[] = Object.entries(STATIONEN).map(([c, n]) => ({
    code: c,
    name: n,
    nameFolded: fold(n),
    codeFolded: fold(c),
  }));

  let resolvedName = $derived(STATIONEN[code] || '');
  let validCode = $derived(!!resolvedName);

  let results: Result[] = $derived.by(() => {
    const q = fold(query.trim());
    if (!q) return [];
    const exact: Result[] = [];
    const prefix: Result[] = [];
    const substring: Result[] = [];
    const fuzzy: Result[] = [];
    for (const e of entries) {
      const ni = substringIndices(e.nameFolded, q);
      const ci = substringIndices(e.codeFolded, q);
      if (e.nameFolded === q || e.codeFolded === q) {
        exact.push({ ...e, nameIndices: ni || [], codeIndices: ci || [] });
      } else if (e.nameFolded.startsWith(q) || e.codeFolded.startsWith(q)) {
        prefix.push({ ...e, nameIndices: ni || [], codeIndices: ci || [] });
      } else if (ni || ci) {
        substring.push({ ...e, nameIndices: ni || [], codeIndices: ci || [] });
      } else {
        const nf = fuzzyIndices(e.nameFolded, q);
        const cf = fuzzyIndices(e.codeFolded, q);
        if (nf || cf) {
          fuzzy.push({ ...e, nameIndices: nf || [], codeIndices: cf || [] });
        }
      }
    }
    // Sort fuzzy by match compactness (tighter span = better)
    fuzzy.sort((a, b) => {
      const spanA = Math.min(
        a.nameIndices.length ? a.nameIndices[a.nameIndices.length - 1] - a.nameIndices[0] : Infinity,
        a.codeIndices.length ? a.codeIndices[a.codeIndices.length - 1] - a.codeIndices[0] : Infinity,
      );
      const spanB = Math.min(
        b.nameIndices.length ? b.nameIndices[b.nameIndices.length - 1] - b.nameIndices[0] : Infinity,
        b.codeIndices.length ? b.codeIndices[b.codeIndices.length - 1] - b.codeIndices[0] : Infinity,
      );
      return spanA - spanB;
    });
    return [...exact, ...prefix, ...substring, ...fuzzy].slice(0, 6);
  });

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
        <span class="code-col">{@html highlight(entry.code, entry.codeIndices)}</span>
        <span class="name-col">{@html highlight(entry.name, entry.nameIndices)}</span>
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

  /* Remove bottom rounding from all ancestors when dropdown is open */
  :global(.hl-wrap:has(.dropdown)),
  :global(.hl-wrap:has(.dropdown))::after,
  :global(.daten-field:has(.dropdown)),
  :global(.signal-cell:has(.dropdown)),
  :global(.knoten-search-wrapper:has(.dropdown)) {
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
    display: block;
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

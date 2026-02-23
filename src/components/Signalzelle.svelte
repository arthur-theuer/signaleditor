<script lang="ts">
  import { Diff } from 'lucide-svelte';
  import { extractSignalBase, extractName, signalNeedsName, signalNeedsBahnhof, getEnumForField } from '../lib/signals';
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

  let typeAheadBuffer = '';
  let typeAheadTimeout: ReturnType<typeof setTimeout>;

  let base = $derived(extractSignalBase(value ?? '') || '');
  let name = $derived(extractName(value ?? ''));
  let needsName = $derived(signalNeedsName(base));
  let needsBahnhof = $derived(signalNeedsBahnhof(base));
  let enumList = $derived(getEnumForField(field, rowIdx, signale));

  let currentIdx = $derived(base ? enumList.indexOf(base) : -1);
  let prevSignal = $derived(
    currentIdx >= 0 ? enumList[(currentIdx - 1 + enumList.length) % enumList.length] :
    enumList[enumList.length - 1] ?? ''
  );
  let nextSignal = $derived(
    currentIdx >= 0 ? enumList[(currentIdx + 1) % enumList.length] :
    enumList[0] ?? ''
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

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      typeAheadBuffer = '';
      const idx = (currentIdx + 1) % enumList.length;
      setSignal(enumList[idx]);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      typeAheadBuffer = '';
      const idx = (currentIdx - 1 + enumList.length) % enumList.length;
      setSignal(enumList[idx]);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      typeAheadBuffer = '';
      value = '';
      onchange();
    } else if (e.key === 'Backspace') {
      e.preventDefault();
      typeAheadBuffer = typeAheadBuffer.slice(0, -1);
    } else if (e.key.length === 1 && e.key.match(/[a-zA-Z\-]/)) {
      e.preventDefault();
      typeAheadBuffer += e.key.toLowerCase();
      clearTimeout(typeAheadTimeout);
      typeAheadTimeout = setTimeout(() => { typeAheadBuffer = ''; }, 1000);
      const match = enumList.find(s => s.toLowerCase().startsWith(typeAheadBuffer));
      if (match) setSignal(match);
    }
  }

  function handleNameInput(e: Event) {
    const newName = (e.target as HTMLInputElement).value;
    value = newName ? `${base} ${newName}` : base;
    onchange();
  }

  function handleBahnhofInput(e: Event) {
    bahnhof = (e.target as HTMLInputElement).value;
    onchange();
  }

  function handleSignalFocus(e: FocusEvent) {
    const input = e.target as HTMLInputElement;
    requestAnimationFrame(() => input.setSelectionRange(0, 0));
  }

  function handleBahnhofFocus() {
    if (bahnhof) return;
    const nameVal = extractName(value ?? '').trim();
    if (nameVal) {
      bahnhof = nameVal;
      onchange();
    }
  }
</script>

<div class="signal-cell" class:has-name={needsName && !disabled} class:has-bahnhof={needsBahnhof && !disabled} class:disabled>
  <div class="signal-cell-inner">
    <div class="signal-input-wrapper hl-wrap">
      <div class="signal-preview prev">{disabled ? '' : prevSignal}</div>
      <input
        type="text"
        class="signal-input"
        readonly
        value={disabled ? '' : base}
        placeholder={disabled ? '' : placeholder}
        onkeydown={handleKeydown}
        onfocus={handleSignalFocus}
        tabindex={disabled ? -1 : 0}
      />
      <div class="signal-preview next">{disabled ? '' : nextSignal}</div>
    </div>
    {#if needsName || name}
      <div class="name-wrapper hl-wrap" class:visible={needsName}>
        <div class="name-spacer"></div>
        <input
          type="text"
          class="name-input"
          value={name}
          oninput={handleNameInput}
          placeholder="Name"
          autocomplete="off"
          autocorrect="off"
          spellcheck="false"
        />
        <div class="name-spacer"></div>
      </div>
    {/if}
    {#if isMainSignal && onToggleAlt}
      <button
        class="alt-toggle-btn"
        class:active={isAltActive}
        onclick={onToggleAlt}
        title="Alternativsignal"
        tabindex={-1}
      ><Diff size={16} strokeWidth={2.5} /></button>
    {/if}
  </div>
  {#if needsBahnhof}
    <div class="bahnhof-wrapper hl-wrap visible">
      <input
        type="text"
        class="bahnhof-input"
        value={bahnhof || ''}
        oninput={handleBahnhofInput}
        onfocus={handleBahnhofFocus}
        placeholder="Kurzname"
        autocomplete="off"
        autocorrect="off"
        spellcheck="false"
      />
    </div>
  {/if}
</div>

<style>
  /* Base .signal-cell styles are in app.css */
  .signal-cell-inner { display: flex; height: 100%; flex-shrink: 0; }
  .signal-input-wrapper {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
    height: 100%;
    border-radius: calc(var(--card-radius) - 1px);
  }
  .has-name .signal-input-wrapper {
    width: 50%;
    flex: none;
    border-radius: calc(var(--card-radius) - 1px) 0 0 calc(var(--card-radius) - 1px);
  }
  .has-bahnhof .signal-input-wrapper {
    border-radius: calc(var(--card-radius) - 1px) calc(var(--card-radius) - 1px) 0 0;
  }
  .has-name.has-bahnhof .signal-input-wrapper {
    border-radius: calc(var(--card-radius) - 1px) 0 0 0;
  }

  .signal-preview {
    flex: var(--preview-flex);
    display: flex;
    font-size: var(--preview-font-size);
    font-family: monospace;
    color: var(--color-text-muted);
    opacity: 0;
    padding: 0 var(--cell-padding);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    pointer-events: none;
  }
  .signal-input-wrapper:focus-within .signal-preview { opacity: 0.5; }
  .signal-input-wrapper:focus-within .signal-preview.prev { border-bottom: 1px solid var(--color-border); }
  .signal-input-wrapper:focus-within .signal-preview.next { border-top: 1px solid var(--color-border); }
  .signal-preview.prev { order: -1; align-items: center; padding-top: 2px; }
  .signal-preview.next { order: 1; align-items: center; padding-bottom: 2px; }

  .signal-input {
    flex: var(--input-flex);
    padding: 0 var(--cell-padding);
    border: none;
    background: transparent;
    font-size: var(--input-font-size);
    font-family: monospace;
    cursor: pointer;
    display: flex;
    align-items: center;
  }
  .signal-input:focus { outline: none; }
  .signal-input::placeholder { color: var(--color-text-muted); }

  .name-wrapper {
    display: none;
    width: 50%;
    flex-direction: column;
    border-left: 1px solid var(--color-border);
    background: transparent;
    height: 100%;
    border-radius: 0 calc(var(--card-radius) - 1px) calc(var(--card-radius) - 1px) 0;
  }
  .name-wrapper.visible { display: flex; }
  .has-bahnhof .name-wrapper { border-radius: 0 calc(var(--card-radius) - 1px) 0 0; }
  .name-spacer { flex: var(--preview-flex); pointer-events: none; }
  .name-input {
    flex: var(--input-flex);
    padding: 0 var(--cell-padding);
    border: none;
    background: transparent;
    font-size: var(--input-font-size);
    font-family: monospace;
    display: flex;
    align-items: center;
  }
  .name-input:focus { outline: none; }

  .has-bahnhof .signal-cell-inner { height: var(--unit); }
  .has-bahnhof .signal-input-wrapper { height: var(--unit); }
  .has-bahnhof .signal-preview { display: none; }
  .has-bahnhof .name-wrapper { height: var(--unit); }
  .has-bahnhof .name-spacer { display: none; }

  .bahnhof-wrapper {
    display: none;
    border-top: 1px solid var(--color-border);
    flex: 1;
    border-radius: 0 0 calc(var(--card-radius) - 1px) calc(var(--card-radius) - 1px);
  }
  .bahnhof-wrapper.visible { display: flex; }
  .bahnhof-input {
    width: 100%;
    padding: 0 var(--cell-padding);
    border: none;
    background: var(--color-highlight);
    font-size: var(--input-font-size);
    font-family: monospace;
    flex: 1;
    box-sizing: border-box;
    border-radius: inherit;
  }
  .bahnhof-input:focus { outline: none; }
  .bahnhof-input::placeholder { color: var(--color-text-muted); }

  .alt-toggle-btn {
    position: absolute;
    top: 50%;
    right: 0;
    transform: translateY(-50%);
    width: var(--unit);
    height: var(--unit);
    border: none;
    border-radius: 0;
    background: none;
    color: inherit;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    padding: 0;
    z-index: 1;
  }
  .has-bahnhof .alt-toggle-btn { top: 0; transform: none; }
  .signal-cell:hover .alt-toggle-btn { opacity: 0.6; }
  .signal-cell:hover .alt-toggle-btn:hover { opacity: 1; }
  .alt-toggle-btn.active { opacity: 0.4 !important; color: var(--color-text-muted); }
</style>

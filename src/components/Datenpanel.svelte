<script lang="ts">
  import type { Editordaten, Streckenmeta, Routenmeta } from '../lib/types';
  import { isStreckendaten, dateiId } from '../lib/types';
  import { Milestone, Route } from 'lucide-svelte';
  import { ICON } from '../lib/constants';
  import { stationName } from '../lib/station-search';
  import Stationsfeld from './ui/Stationsfeld.svelte';

  let {
    data = $bindable(),
    onchange,
    ontabout,
  }: {
    data: Editordaten;
    onchange: () => void;
    ontabout: () => void;
  } = $props();

  let id = $derived(dateiId(data));
  let isStrecke = $derived(isStreckendaten(data));
  let streckeMeta = $derived(isStrecke ? (data.meta as Streckenmeta) : null);
  let routenMeta = $derived(!isStrecke ? (data.meta as Routenmeta) : null);

  // Primary field (Strecke or Linie) — derived to avoid template duplication
  let primaryLabel = $derived(isStrecke ? 'Strecke' : 'Linie');
  let primaryId = $derived(isStrecke ? 'meta-strecke' : 'meta-linie');
  let primaryPlaceholder = $derived(isStrecke ? 'z.B. 500, 112b' : 'z.B. S9, IR15');
  let primaryValue = $derived(isStrecke ? (streckeMeta?.strecke ?? '') : (routenMeta?.linie ?? ''));

  function handlePrimaryInput(e: Event) {
    const val = (e.target as HTMLInputElement).value;
    if (isStrecke && streckeMeta) streckeMeta.strecke = val;
    else if (routenMeta) routenMeta.linie = val;
  }

  function autoArrow(e: Event, setter: (val: string) => void) {
    const input = e.target as HTMLInputElement;
    const pos = input.selectionStart ?? input.value.length;
    const before = input.value;
    const replaced = before.replace(/->/g, '→').replace(/<-/g, '←');
    if (replaced !== before) {
      const diff = before.length - replaced.length;
      input.value = replaced;
      input.setSelectionRange(pos - diff, pos - diff);
    }
    setter(input.value);
  }

  const primaryClass = 'daten-field daten-primary';
  const secondaryClass = 'daten-field daten-secondary';

  function handleKeydown(e: KeyboardEvent) {
    if (e.key !== 'Tab' || e.shiftKey) return;
    const target = e.target as HTMLElement;
    const lastId = 'meta-name';
    if (target.id === lastId) {
      e.preventDefault();
      ontabout();
    }
  }
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="daten-section" onkeydown={handleKeydown} oninput={onchange}>
  <div class="section-header">
    {#if isStrecke}<Milestone {...ICON} />{:else}<Route {...ICON} />{/if}
    {isStrecke ? 'Streckendaten' : 'Routendaten'}
    {#if id}
      <span class="header-id">{id}</span>
    {/if}
  </div>
  <div class="daten-fields">
    <div class={primaryClass}>
      <label for={primaryId}>{primaryLabel}</label>
      <span class="hl-field">
        <input
          id={primaryId}
          type="text"
          value={primaryValue}
          oninput={handlePrimaryInput}
          placeholder={primaryPlaceholder}
          autocomplete="none"
          autocorrect="off"
          spellcheck="false"
        />
      </span>
    </div>
    <div class={secondaryClass}>
      <label for="meta-von">Von</label>
      <span class="hl-field station-code-field">
        <span class={['station-code', { valid: !!stationName(data.meta.von) }]}>{data.meta.von || 'Code'}</span>
        <Stationsfeld mode="code" bind:value={data.meta.von} placeholder="z.B. Olten" />
      </span>
    </div>
    <div class={secondaryClass}>
      <label for="meta-nach">Nach</label>
      <span class="hl-field station-code-field">
        <span class={['station-code', { valid: !!stationName(data.meta.nach) }]}>{data.meta.nach || 'Code'}</span>
        <Stationsfeld mode="code" bind:value={data.meta.nach} placeholder="z.B. Aarau" />
      </span>
    </div>
    <div class={secondaryClass}>
      <label for="meta-via">Via</label>
      <span class="hl-field">
        <input
          id="meta-via"
          type="text"
          bind:value={data.meta.via}
          oninput={(e) => autoArrow(e, (v) => (data.meta.via = v))}
          placeholder="z.B. VL, NBS"
          autocomplete="none"
          autocorrect="off"
          spellcheck="false"
        />
      </span>
    </div>
    <div class={primaryClass}>
      <label for="meta-name">Name</label>
      <span class="hl-field">
        <input
          id="meta-name"
          type="text"
          bind:value={data.meta.name}
          oninput={(e) => autoArrow(e, (v) => (data.meta.name = v))}
          placeholder="z.B. Olten → Aarau"
          autocomplete="none"
          autocorrect="off"
          spellcheck="false"
        />
      </span>
    </div>
  </div>
</div>

<style>
  .daten-section {
    margin-bottom: var(--spacing-page);
    background: var(--color-bg);
    border: var(--border-subtle);
    border-radius: var(--radius-container);
  }
  .daten-fields {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-card);
    padding: var(--spacing-card);
  }
  @media (min-width: 640px) {
    .daten-fields {
      flex-direction: row;
      flex-wrap: wrap;
    }
  }
  .daten-field {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-width: 0;
    background: var(--color-bg-raised);
    border: var(--border-subtle);
    border-radius: var(--radius-card);
  }
  @media (min-width: 640px) {
    .daten-primary {
      order: 0;
      flex: none;
      flex-basis: calc(50% - var(--spacing-card) / 2);
    }
    .daten-secondary {
      order: 1;
    }
  }
  @media (min-width: 1024px) {
    .daten-primary {
      flex: 1;
    }
    .daten-secondary {
      order: unset;
    }
  }
  .daten-field label {
    font-size: var(--text-caption);
    font-weight: var(--font-weight-semibold);
    text-transform: uppercase;
    color: var(--color-text-secondary);
    padding: var(--spacing-md) var(--spacing-cell) var(--spacing-xs);
    background: var(--color-bg-subtle);
    border-bottom: 1px solid var(--color-border);
    border-radius: var(--radius-card) var(--radius-card) 0 0;
  }
  .daten-field :global(.hl-field) {
    display: flex;
    height: var(--spacing-unit);
    border-radius: 0 0 var(--radius-card) var(--radius-card);
  }
  .daten-field input {
    flex: 1;
    min-width: 0;
    padding: 0 var(--spacing-cell);
    border: none;
    background: transparent;
    font-size: var(--text-input);
    font-family: var(--font-mono);
    height: var(--spacing-unit);
    line-height: var(--spacing-unit);
    border-radius: 0 0 var(--radius-card) var(--radius-card);
  }
  .daten-field input:focus {
    outline: none;
  }
  .station-code-field {
    position: relative;
  }
  .station-code {
    width: calc(2 * var(--spacing-unit));
    flex: none;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: var(--text-input);
    font-family: var(--font-mono);
    color: var(--color-text-muted);
    border-right: 1px solid var(--color-border);
  }
  .station-code.valid {
    color: var(--color-text);
  }
  .header-id {
    font-weight: var(--font-weight-normal);
    color: var(--color-text-muted);
    font-size: var(--text-input);
    margin-left: auto;
    font-family: var(--font-mono);
  }
</style>

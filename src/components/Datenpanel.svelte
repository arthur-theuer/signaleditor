<script lang="ts">
  import type { Editordaten, Streckenmeta, Routenmeta } from '../lib/types';
  import { isStreckendaten, dateiId } from '../lib/types';
  import Stationssuche from './ui/Stationssuche.svelte';

  let {
    data = $bindable(),
    ontabout,
  }: {
    data: Editordaten;
    ontabout: () => void;
  } = $props();

  let id = $derived(dateiId(data));
  let isStrecke = $derived(isStreckendaten(data));
  let streckeMeta = $derived(isStrecke ? data.meta as Streckenmeta : null);
  let routenMeta = $derived(!isStrecke ? data.meta as Routenmeta : null);

  // Primary field (Strecke or Linie) — derived to avoid template duplication
  let primaryLabel = $derived(isStrecke ? 'Strecke' : 'Linie');
  let primaryId = $derived(isStrecke ? 'meta-strecke' : 'meta-linie');
  let primaryPlaceholder = $derived(isStrecke ? 'z.B. 500, 112b' : 'z.B. S9, IR15');
  let primaryValue = $derived(isStrecke ? streckeMeta?.strecke ?? '' : routenMeta?.linie ?? '');

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

  const primaryClass = 'daten-field flex flex-col flex-1 min-w-0 sm:order-0 sm:flex-none sm:basis-[calc(50%-var(--spacing-card)/2)] lg:flex-1';
  const secondaryClass = 'daten-field flex flex-col flex-1 min-w-0 sm:order-1 lg:order-none';

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
<div class="daten-section mb-page" onkeydown={handleKeydown}>
  <div class="section-header">
    {isStrecke ? 'Streckendaten' : 'Routendaten'}
    {#if id}
      <span class="header-id">{id}</span>
    {/if}
  </div>
  <div class="flex flex-col sm:flex-row sm:flex-wrap gap-card p-card">
    <div class={primaryClass}>
      <label for={primaryId}>{primaryLabel}</label>
      <span class="hl-wrap">
        <input id={primaryId} type="text" value={primaryValue} oninput={handlePrimaryInput} placeholder={primaryPlaceholder} autocomplete="none" />
      </span>
    </div>
    <div class={secondaryClass}>
      <label for="meta-von">Von</label>
      <span class="hl-wrap">
        <Stationssuche bind:code={data.meta.von} placeholder="z.B. Olten" />
      </span>
    </div>
    <div class={secondaryClass}>
      <label for="meta-nach">Nach</label>
      <span class="hl-wrap">
        <Stationssuche bind:code={data.meta.nach} placeholder="z.B. Aarau" />
      </span>
    </div>
    <div class={secondaryClass}>
      <label for="meta-via">Via</label>
      <span class="hl-wrap">
        <input id="meta-via" type="text" bind:value={data.meta.via} oninput={(e) => autoArrow(e, v => data.meta.via = v)} placeholder="z.B. VL, NBS" autocomplete="none" />
      </span>
    </div>
    <div class={primaryClass}>
      <label for="meta-name">Name</label>
      <span class="hl-wrap">
        <input id="meta-name" type="text" bind:value={data.meta.name} oninput={(e) => autoArrow(e, v => data.meta.name = v)} placeholder="z.B. Olten → Aarau" autocomplete="none" />
      </span>
    </div>
  </div>
</div>

<style>
  /* Appearance only — layout is handled by Tailwind classes */
  .daten-section {
    background: var(--color-bg);
    border: var(--card-border);
    border-radius: var(--radius-container);
  }
  .daten-field {
    background: var(--color-bg-raised);
    border: var(--card-border);
    border-radius: var(--radius-card);
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
  .daten-field :global(.hl-wrap) {
    display: flex;
    height: var(--spacing-unit);
    border-radius: 0 0 var(--radius-card) var(--radius-card);
  }
  .daten-field input {
    flex: 1;
    min-width: 0;
    padding: 0 var(--spacing-cell);
    border: none;
    font-size: var(--text-input);
    font-family: var(--font-mono);
    height: var(--spacing-unit);
    line-height: var(--spacing-unit);
    border-radius: 0 0 var(--radius-card) var(--radius-card);
  }
  .daten-field input:focus { outline: none; }
  .header-id {
    font-weight: var(--font-weight-normal);
    color: var(--color-text-muted);
    font-size: var(--text-input);
    margin-left: auto;
    font-family: var(--font-mono);
    text-transform: uppercase;
  }
</style>

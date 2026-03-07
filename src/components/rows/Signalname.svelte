<script lang="ts">
  import { extractName, signalNeedsName, signalNeedsStationSearch } from '../../lib/signals';
  import Stationsfeld from '../ui/Stationsfeld.svelte';

  let {
    base,
    value,
    bahnhof = $bindable(),
    showBahnhof,
    onchange,
    onbahnhofchange,
    onfocusin,
  }: {
    base: string;
    value: string;
    bahnhof?: string;
    showBahnhof: boolean;
    onchange: (name: string) => void;
    onbahnhofchange: () => void;
    onfocusin?: () => void;
  } = $props();

  let needsName = $derived(signalNeedsName(base));
  let useStationSearch = $derived(signalNeedsStationSearch(base));

  let stationName = $state('');
  $effect(() => {
    stationName = extractName(value);
  });

  function handleNameInput(e: Event) {
    stationName = (e.target as HTMLInputElement).value;
    onchange(stationName);
  }

  function handleStationChange() {
    onchange(stationName);
  }

  function handleBahnhofInput(e: Event) {
    bahnhof = (e.target as HTMLInputElement).value;
    onbahnhofchange();
  }

  function handleBahnhofFocus() {
    if (bahnhof) return;
    const nameVal = extractName(value).trim();
    if (nameVal) {
      bahnhof = nameVal;
      onbahnhofchange();
    }
  }
</script>

{#if needsName || stationName}
  <div class="row-cell name-cell hl-field" {onfocusin}>
    {#if useStationSearch}
      <Stationsfeld mode="name" bind:value={stationName} onchange={handleStationChange} placeholder="Name" />
    {:else}
      <input
        type="text"
        class="name-input"
        value={stationName}
        oninput={handleNameInput}
        placeholder="Name"
        autocomplete="none"
        autocorrect="off"
        spellcheck="false"
      />
    {/if}
  </div>
{/if}

{#if showBahnhof}
  <div class="row-cell bahnhof-cell hl-field">
    <input
      type="text"
      class="bahnhof-input"
      value={bahnhof || ''}
      oninput={handleBahnhofInput}
      onfocus={handleBahnhofFocus}
      placeholder="Kurzname"
      autocomplete="none"
      autocorrect="off"
      spellcheck="false"
    />
  </div>
{/if}

<style>
  .name-input {
    flex: 1;
    min-width: 0;
    border: none;
    background: transparent;
    padding: 0 var(--spacing-cell);
    font-size: var(--text-input);
    font-family: var(--font-mono);
    color: var(--color-text-secondary);
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    outline: none;
    height: 100%;
  }
  .name-input::placeholder {
    color: var(--color-text-muted);
  }

  .bahnhof-cell {
    background: var(--color-highlight);
  }
  .bahnhof-input {
    flex: 1;
    min-width: 0;
    border: none;
    background: transparent;
    padding: 0 var(--spacing-cell);
    font-size: var(--text-input);
    font-family: var(--font-mono);
    outline: none;
    height: 100%;
  }
  .bahnhof-input::placeholder {
    color: var(--color-text-muted);
  }
</style>

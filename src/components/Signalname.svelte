<script lang="ts">
  import { extractName, signalNeedsName, signalNeedsStationSearch } from '../lib/signals';
  import Stationsfeld from './ui/Stationsfeld.svelte';

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
  <div class="name-wrapper hl-field" class:visible={needsName} class:has-bahnhof={showBahnhof} {onfocusin}>
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
  <div class="bahnhof-wrapper hl-field visible">
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
  .name-wrapper {
    display: none;
    flex: 1;
    min-width: 0;
    border-left: 1px solid var(--color-border);
    background: transparent;
    height: 100%;
    border-radius: 0 var(--radius-inner) var(--radius-inner) 0;
  }
  .name-wrapper.visible {
    display: flex;
  }
  .name-wrapper.has-bahnhof {
    border-radius: 0;
  }

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

  .bahnhof-wrapper {
    display: none;
    border-left: 1px solid var(--color-border);
    flex: 1;
    border-radius: 0 var(--radius-inner) var(--radius-inner) 0;
  }
  .bahnhof-wrapper.visible {
    display: flex;
  }
  .bahnhof-input {
    width: 100%;
    flex: 1;
    border: none;
    background: var(--color-highlight);
    padding: 0 var(--spacing-cell);
    font-size: var(--text-input);
    font-family: var(--font-mono);
    box-sizing: border-box;
    border-radius: inherit;
  }
  .bahnhof-input:focus {
    outline: none;
  }
  .bahnhof-input::placeholder {
    color: var(--color-text-muted);
  }
</style>

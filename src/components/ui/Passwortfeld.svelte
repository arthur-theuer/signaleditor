<script lang="ts">
  import { tick } from 'svelte';

  let {
    open = $bindable(false),
    onsubmit,
    oncancel,
  }: {
    open: boolean;
    onsubmit: (value: string) => void;
    oncancel: () => void;
  } = $props();

  let value = $state('');
  let error = $state(false);
  let inputEl = $state<HTMLInputElement>();

  export async function show() {
    error = false;
    value = '';
    open = true;
    await tick();
    inputEl?.focus();
  }

  export function showError() {
    error = true;
    value = '';
    inputEl?.focus();
  }

  export function hide() {
    open = false;
    value = '';
    error = false;
  }

  function submit() {
    if (value) onsubmit(value);
  }

  function cancel() {
    hide();
    oncancel();
  }
</script>

<div class="passwortfeld" class:open class:error>
  <div class="cell">
    <input
      bind:this={inputEl}
      bind:value
      type="password"
      placeholder="PIN"
      tabindex={open ? 0 : -1}
      onkeydown={(e) => { if (e.key === 'Enter') submit(); if (e.key === 'Escape') cancel(); }}
      onblur={cancel}
    />
  </div>
</div>

<style>
  .passwortfeld {
    display: grid;
    grid-template-columns: 0fr;
    transition: grid-template-columns 200ms ease;
    flex-shrink: 0;
  }
  .passwortfeld.open {
    grid-template-columns: 1fr;
  }
  .cell {
    overflow: hidden;
  }
  .cell input {
    width: 80px;
    height: calc(var(--spacing-row) / 2 - var(--spacing-card) / 2);
    border: var(--card-border);
    border-right: none;
    border-radius: var(--radius-container) 0 0 var(--radius-container);
    background: var(--color-bg-raised);
    font-size: var(--text-input);
    font-family: var(--font-mono);
    color: var(--color-text);
    text-align: center;
    outline: none;
    padding: 0 var(--spacing-cell);
    box-sizing: border-box;
  }
  .passwortfeld.open .cell input {
    border-color: var(--color-focus);
  }
  .error .cell input {
    color: var(--color-red);
    border-color: var(--color-red) !important;
  }
  .error .cell input::placeholder {
    color: var(--color-red);
  }
</style>

<script lang="ts">
  import { tick } from 'svelte';
  import type { Snippet } from 'svelte';

  let {
    open = $bindable(false),
    unlocked = false,
    onsubmit,
    onclick,
    children,
  }: {
    open?: boolean;
    unlocked?: boolean;
    onsubmit: (value: string) => void;
    onclick: () => void;
    children: Snippet;
  } = $props();

  let value = $state('');
  let error = $state(false);
  let inputEl = $state<HTMLInputElement>();

  export async function show() {
    error = false;
    value = '';
    open = true;
    await tick();
    inputEl?.focus({ preventScroll: true });
  }

  export function showError() {
    error = true;
    value = '';
    inputEl?.focus({ preventScroll: true });
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
  }
</script>

<div class="pill" class:open class:error class:unlocked>
  <button class="icon" {onclick}>
    {@render children()}
  </button>
  <div class="field">
    <input
      bind:this={inputEl}
      bind:value
      type="password"
      placeholder="PIN"
      tabindex={open ? 0 : -1}
      onkeydown={(e) => {
        if (e.key === 'Enter') submit();
        if (e.key === 'Escape') cancel();
      }}
      onblur={cancel}
      autocomplete="off"
      autocorrect="off"
      spellcheck="false"
    />
  </div>
</div>

<style>
  .pill {
    display: flex;
    align-items: center;
    height: var(--spacing-unit);
    border: var(--card-border);
    border-radius: var(--radius-container);
    background: var(--color-bg-raised);
    flex-shrink: 0;
    transition:
      box-shadow 200ms ease,
      border-color 200ms ease;
  }
  .pill:not(.unlocked) {
    color: var(--color-red);
    border-color: var(--color-red);
  }
  .pill:hover:not(.open) {
    outline: 2px solid currentColor;
    outline-offset: -2px;
    cursor: pointer;
  }
  .pill.unlocked {
    background: var(--color-green-bg);
    border-color: var(--color-green);
    color: var(--color-green);
  }
  .pill.open {
    border-color: var(--color-focus);
    box-shadow: 0 0 0 1px var(--color-focus);
  }
  .pill.error {
    border-color: var(--color-red);
    box-shadow: 0 0 0 1px var(--color-red);
  }
  .icon {
    height: 100%;
    aspect-ratio: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    border: none;
    background: transparent;
    color: inherit;
    cursor: pointer;
    flex-shrink: 0;
  }
  .field {
    width: 0;
    overflow: hidden;
    transition: width 200ms ease;
  }
  .open .field {
    width: 80px;
  }
  .field input {
    width: 80px;
    height: 100%;
    border: none;
    border-left: 1px solid var(--color-border);
    background: transparent;
    font-size: var(--text-input);
    font-family: var(--font-mono);
    color: var(--color-text);
    text-align: center;
    outline: none;
    padding: 0 var(--spacing-cell);
    box-sizing: border-box;
  }
  .error .field input {
    color: var(--color-red);
  }
  .error .field input::placeholder {
    color: var(--color-red);
  }
</style>

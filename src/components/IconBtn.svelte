<script lang="ts">
  import type { Snippet } from 'svelte';

  let {
    onclick,
    title,
    label,
    color = 'default',
    active = false,
    disabled = false,
    wide = false,
    tabindex,
    id,
    children,
    class: extraClass = '',
  }: {
    onclick?: (e: MouseEvent) => void;
    title?: string;
    label?: string;
    color?: 'default' | 'red' | 'green' | 'clear';
    active?: boolean;
    disabled?: boolean;
    wide?: boolean;
    tabindex?: number;
    id?: string;
    children: Snippet;
    class?: string;
  } = $props();
</script>

<button
  class="icon-btn hl {color} {extraClass}"
  class:active
  class:wide
  class:has-label={!!label}
  {onclick}
  {title}
  {disabled}
  {tabindex}
  {id}
>
  {@render children()}
  {#if label}<span class="icon-btn-label">{label}</span>{/if}
</button>

<style>
  .icon-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-card);
    padding: 0;
    background: var(--color-bg-raised);
    border: var(--card-border);
    border-radius: var(--radius-card);
    cursor: pointer;
    box-sizing: border-box;
    color: var(--color-text-secondary);
  }

  /* Square sizing for icon-only buttons */
  .icon-btn:not(.has-label):not(.wide) {
    width: calc(var(--spacing-row) / 2 - var(--spacing-card) / 2);
    height: calc(var(--spacing-row) / 2 - var(--spacing-card) / 2);
  }

  /* Buttons with labels get height but flexible width */
  .icon-btn.has-label {
    height: calc(var(--spacing-row) / 2 - var(--spacing-card) / 2);
    padding: 0 var(--spacing-cell);
  }

  /* Full-width variant */
  .icon-btn.wide {
    width: 100%;
    height: calc(var(--spacing-row) / 2 - var(--spacing-card) / 2);
    padding: 0 var(--spacing-cell);
  }

  .icon-btn-label {
    font-size: var(--text-input);
    font-weight: var(--font-weight-semibold);
  }

  /* Color variants */
  .icon-btn.red { color: var(--color-red); }
  .icon-btn.clear { color: var(--color-clear); }
  .icon-btn.green { color: var(--color-green); }

  /* Colored border for toggle/action buttons */
  .icon-btn.red { border-color: var(--color-red); }
  .icon-btn.green { border-color: var(--color-green); }

  /* Active state for toggles */
  .icon-btn.red.active {
    color: var(--color-green);
    border-color: var(--color-green);
  }

  .icon-btn:disabled {
    opacity: 0.4;
    cursor: default;
  }
</style>

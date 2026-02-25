<script lang="ts">
  import type { Snippet } from 'svelte';

  let {
    onclick,
    title,
    label,
    color = 'default',
    bordered = false,
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
    bordered?: boolean;
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
  class="symbolknopf hl {color} {extraClass}"
  class:bordered
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
  {#if label}<span class="symbolknopf-label">{label}</span>{/if}
</button>

<style>
  .symbolknopf {
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
  .symbolknopf:not(.has-label):not(.wide) {
    width: var(--spacing-unit);
    height: var(--spacing-unit);
  }

  /* Buttons with labels get height but flexible width */
  .symbolknopf.has-label {
    height: var(--spacing-unit);
    padding: 0 var(--spacing-cell);
  }

  /* Full-width variant */
  .symbolknopf.wide {
    width: 100%;
    height: var(--spacing-unit);
    padding: 0 var(--spacing-cell);
  }

  .symbolknopf-label {
    font-size: var(--text-input);
    font-weight: var(--font-weight-semibold);
  }

  /* Color variants (icon color only) */
  .symbolknopf.red { color: var(--color-red); }
  .symbolknopf.clear { color: var(--color-clear); }
  .symbolknopf.green { color: var(--color-green); }

  /* Colored border + background when explicitly requested */
  .symbolknopf.bordered.red { border-color: var(--color-red); background: var(--color-red-bg); }
  .symbolknopf.bordered.green { border-color: var(--color-green); background: var(--color-green-bg); }

  /* Active state for toggles */
  .symbolknopf.bordered.active {
    color: var(--color-green);
    border-color: var(--color-green);
    background: var(--color-green-bg);
  }

  .symbolknopf:disabled {
    cursor: default;
    color: var(--color-text-muted);
    background: var(--color-bg);
    border-color: var(--color-border);
  }
</style>

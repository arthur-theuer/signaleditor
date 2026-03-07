<script lang="ts">
  import { X } from 'lucide-svelte';
  import { ICON } from '../lib/constants';

  let { onclick }: { onclick: () => void } = $props();
</script>

<button class="close-mel-btn" {onclick}><X {...ICON} />Schliessen</button>

<style>
  .close-mel-btn {
    height: var(--spacing-unit);
    padding: 0 var(--spacing-cell);
    gap: var(--spacing-sm);
    border: var(--border-subtle);
    border-radius: var(--radius-card);
    cursor: pointer;
    font-weight: var(--font-weight-semibold);
    font-size: var(--text-input);
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--color-red-bg);
    color: var(--color-red);
  }
  .close-mel-btn:hover {
    outline: 2px solid var(--color-red);
    outline-offset: -2px;
  }
</style>

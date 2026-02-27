<script lang="ts">
  let w = $state(0);
  let label = $derived(
    w >= 1536 ? '2xl' : w >= 1280 ? 'xl' : w >= 1024 ? 'lg' : w >= 768 ? 'md' : w >= 640 ? 'sm' : 'xs',
  );
</script>

<svelte:window bind:innerWidth={w} />

<div class="breakpoint-badge">
  {w}px · <strong>{label}</strong>
</div>

<style>
  .breakpoint-badge {
    position: fixed;
    bottom: 8px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 50;
    border-radius: var(--radius-card);
    background: var(--color-bg-raised);
    border: var(--card-border);
    padding: var(--spacing-xs) var(--spacing-cell);
    font-family: var(--font-mono);
    font-size: var(--text-caption);
    color: var(--color-text-secondary);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  }
</style>

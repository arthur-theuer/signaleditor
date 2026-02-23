<script lang="ts">
  let w = $state(0);
  let label = $derived(
    w >= 1400 ? 'lg' :
    w >= 900  ? 'md' :
    w >= 700  ? 'sm' : '—'
  );
</script>

<svelte:window bind:innerWidth={w} />

<div class="fixed bottom-2 left-2 z-50 rounded-card bg-bg-raised border border-border
            px-cell py-xs font-mono text-preview text-text-secondary shadow-sm">
  {w}px · <strong>{label}</strong>
</div>

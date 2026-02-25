<script lang="ts">
  let w = $state(0);
  let label = $derived(
    w >= 1536 ? '2xl' :
    w >= 1280 ? 'xl' :
    w >= 1024 ? 'lg' :
    w >= 768  ? 'md' :
    w >= 640  ? 'sm' : 'xs'
  );
</script>

<svelte:window bind:innerWidth={w} />

<div class="fixed bottom-2 left-1/2 -translate-x-1/2 z-50 rounded-card bg-bg-raised border border-border
            px-cell py-xs font-mono text-caption text-text-secondary shadow-sm">
  {w}px · <strong>{label}</strong>
</div>

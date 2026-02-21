<script lang="ts">
  import '../app.css';
  import { onMount } from 'svelte';
  import type { Snippet } from 'svelte';

  let { children }: { children: Snippet } = $props();

  // Click anywhere on an .hl-wrap to focus its contained input
  onMount(() => {
    function handleClick(e: MouseEvent) {
      const target = e.target as HTMLElement;
      if (target.matches('input, select, button, textarea')) return;
      const wrapper = target.closest('.hl-wrap');
      if (!wrapper) return;
      const input = wrapper.querySelector<HTMLElement>('input, select, textarea, button');
      if (input) input.focus();
    }
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  });
</script>

{@render children()}

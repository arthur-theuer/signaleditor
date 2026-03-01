<script lang="ts">
  import '../app.css';
  import type { Snippet } from 'svelte';
  import { inject } from '@vercel/analytics';
  import { injectSpeedInsights } from '@vercel/speed-insights';
  import { focusWithoutScroll } from '../lib/focus';

  inject();
  injectSpeedInsights();

  let { children }: { children: Snippet } = $props();

  // Click anywhere on an .hl-field to focus its contained input
  $effect(() => {
    function handleClick(e: MouseEvent) {
      const target = e.target as HTMLElement;
      if (target.matches('input, select, button, textarea')) return;
      const wrapper = target.closest('.hl-field');
      if (!wrapper) return;
      const input = wrapper.querySelector<HTMLElement>('input, select, textarea, button');
      focusWithoutScroll(input);
    }
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  });
</script>

{@render children()}

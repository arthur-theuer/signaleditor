<script lang="ts">
  let { text }: { text: string } = $props();
</script>

<span class="hinweis">{text}</span>

<style>
  .hinweis {
    display: none;
    position: absolute;
    top: calc(100% + var(--spacing-card));
    left: 50%;
    transform: translateX(-50%);
    height: calc(var(--spacing-unit) / 2);
    align-items: center;
    justify-content: center;
    padding: 0 var(--spacing-cell);
    border-radius: var(--radius-container);
    font-size: var(--text-caption);
    font-family: var(--font-sans);
    font-weight: var(--font-weight-medium);
    white-space: nowrap;
    pointer-events: none;
    z-index: 4;
    background: inherit;
    color: inherit;
    border: 1px solid;
    border-color: inherit;
  }
</style>

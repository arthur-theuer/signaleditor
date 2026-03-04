/**
 * Focus an element without triggering browser scroll.
 * Wraps .focus({ preventScroll: true }) so callers don't need to remember the option.
 */
export function focusWithoutScroll(el: HTMLElement | null | undefined): void {
  el?.focus({ preventScroll: true });
}

/**
 * Run a callback that may cause layout shifts without the browser
 * scrolling the focused element. Restores scroll position across
 * several frames to handle Safari's native scroll reset.
 */
export function withStableScroll(fn: () => void): void {
  const scrollY = window.scrollY;
  fn();
  let frames = 0;
  const restore = () => {
    if (window.scrollY !== scrollY) window.scrollTo(0, scrollY);
    if (++frames < 5) requestAnimationFrame(restore);
  };
  requestAnimationFrame(restore);
}

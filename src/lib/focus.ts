/**
 * Focus an element without triggering browser scroll.
 * Wraps .focus({ preventScroll: true }) so callers don't need to remember the option.
 */
export function focusWithoutScroll(el: HTMLElement | null | undefined): void {
  el?.focus({ preventScroll: true });
}

/**
 * Run a callback that may cause layout shifts without the browser
 * scrolling the focused element. Locks the scroll position by
 * temporarily setting overflow:hidden on <html>, then restores it.
 */
export function withStableScroll(fn: () => void): void {
  const html = document.documentElement;
  const body = document.body;
  const scrollY = window.scrollY;
  html.style.overflow = 'hidden';
  body.style.overflow = 'hidden';
  fn();
  requestAnimationFrame(() => {
    html.style.overflow = '';
    body.style.overflow = '';
    window.scrollTo(0, scrollY);
  });
}

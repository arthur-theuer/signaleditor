/**
 * Focus an element without triggering browser scroll.
 * Wraps .focus({ preventScroll: true }) so callers don't need to remember the option.
 */
export function focusWithoutScroll(el: HTMLElement | null | undefined): void {
  el?.focus({ preventScroll: true });
}

/**
 * Run a callback that may cause layout shifts without the browser
 * scrolling the focused element. Freezes the viewport with position:fixed
 * during the update to prevent Safari's native scroll reset.
 */
export function withStableScroll(fn: () => void): void {
  const body = document.body;
  const scrollY = window.scrollY;

  // Freeze viewport: position:fixed prevents any scroll change
  body.style.position = 'fixed';
  body.style.top = `-${scrollY}px`;
  body.style.left = '0';
  body.style.right = '0';

  fn();

  requestAnimationFrame(() => {
    body.style.position = '';
    body.style.top = '';
    body.style.left = '';
    body.style.right = '';
    window.scrollTo(0, scrollY);
  });
}

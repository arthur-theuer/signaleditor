# TODO

## Toolbar Rework

The toolbar layout needs a redesign pass. Current issues:
- Button sizing and spacing could be more consistent
- Group related actions more clearly (file ops, view toggles, undo/redo)
- Consider responsive behavior for narrow viewports

## Dark Mode

Add automatic dark mode support via `prefers-color-scheme`. Requires:
- Duplicate all color tokens under a `@media (prefers-color-scheme: dark)` block
- Codepanel already uses a dark palette — reuse those values as a starting point
- The HTML export in `reports.ts` uses hardcoded colors and won't inherit dark mode; decide whether to add inline dark mode styles or keep it light-only

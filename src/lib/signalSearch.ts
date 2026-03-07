/**
 * Pure utility functions for signal enum search and matching.
 */

/** Prefix-anchored fuzzy: first char must match at index 0 */
export function fuzzyMatch(text: string, query: string): boolean {
  const t = text.toLowerCase();
  let pos = 0;
  for (let i = 0; i < query.length; i++) {
    const idx = t.indexOf(query[i], pos);
    if (idx === -1) return false;
    if (i === 0 && idx !== 0) return false;
    pos = idx + 1;
  }
  return true;
}

/** Filter and sort: prefix matches first, then fuzzy-only */
export function filterEnum(enumList: readonly string[], query: string): string[] {
  if (!query) return [];
  const q = query.toLowerCase();
  const matches = enumList.filter((s) => fuzzyMatch(s, q));
  const prefix = matches.filter((s) => s.toLowerCase().startsWith(q));
  const rest = matches.filter((s) => !s.toLowerCase().startsWith(q));
  return [...prefix, ...rest];
}

/**
 * Search-based signal selection with dropdown and arrow cycling.
 *
 * The input value is visible to the user (no hidden buffer).
 * Typing filters the enum list; arrow keys cycle without dropdown
 * when no search query is active.
 */

/** Prefix-anchored fuzzy: first char must match at index 0 */
function fuzzyMatch(text: string, query: string): boolean {
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

/** Sort matches so prefix hits come before fuzzy-only hits */
function prefixFirst(matches: string[], query: string): string[] {
  const q = query.toLowerCase();
  const prefix = matches.filter((s) => s.toLowerCase().startsWith(q));
  const rest = matches.filter((s) => !s.toLowerCase().startsWith(q));
  return [...prefix, ...rest];
}

export class TypeAhead {
  query = $state('');
  dropdownOpen = $state(false);
  dropdownIndex = $state(0);
  private getEnumList: () => readonly string[];
  private getCurrentBase: () => string;

  fuzzyMatches = $derived(
    this.query
      ? prefixFirst(
          this.getEnumList().filter((s) => fuzzyMatch(s, this.query)),
          this.query,
        )
      : [],
  );

  constructor(getEnumList: () => readonly string[], getCurrentBase: () => string) {
    this.getEnumList = getEnumList;
    this.getCurrentBase = getCurrentBase;
  }

  reset = () => {
    this.query = '';
    this.dropdownOpen = false;
    this.dropdownIndex = 0;
  };

  /**
   * Handle input event — user typed or deleted characters.
   * Returns the top match to select, or null if no match.
   */
  handleInput = (query: string): string | null => {
    this.query = query;
    if (!query) {
      this.dropdownOpen = false;
      this.dropdownIndex = 0;
      return null;
    }
    const matches = this.fuzzyMatches;
    if (matches.length > 0) {
      this.dropdownIndex = 0;
      this.dropdownOpen = true;
      return matches[0];
    }
    this.dropdownOpen = false;
    return null;
  };

  /**
   * Handle a keydown event on the signal input.
   * Returns the new signal base to select, '' to clear, or null for no change.
   */
  handleKeydown = (e: KeyboardEvent): string | null => {
    const enumList = this.getEnumList();
    const currentBase = this.getCurrentBase();
    const currentIdx = currentBase ? enumList.indexOf(currentBase) : -1;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (this.dropdownOpen && this.fuzzyMatches.length > 0) {
        this.dropdownIndex = (this.dropdownIndex + 1) % this.fuzzyMatches.length;
        return this.fuzzyMatches[this.dropdownIndex];
      } else {
        return enumList[(currentIdx + 1) % enumList.length];
      }
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (this.dropdownOpen && this.fuzzyMatches.length > 0) {
        this.dropdownIndex = (this.dropdownIndex - 1 + this.fuzzyMatches.length) % this.fuzzyMatches.length;
        return this.fuzzyMatches[this.dropdownIndex];
      } else {
        return enumList[(currentIdx - 1 + enumList.length) % enumList.length];
      }
    }

    if (e.key === 'Tab' || e.key === 'Enter') {
      if (this.dropdownOpen) {
        this.reset();
        if (e.key === 'Enter') e.preventDefault();
      }
      return null;
    }

    if (e.key === 'Escape') {
      e.preventDefault();
      if (this.dropdownOpen) {
        this.reset();
        return null;
      }
      return '';
    }

    return null;
  };
}

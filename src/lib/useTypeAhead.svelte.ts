/**
 * Type-ahead selection logic for cycling through an enum list
 * with prefix-anchored fuzzy matching and dropdown state.
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

export class TypeAhead {
  buffer = $state('');
  dropdownOpen = $state(false);
  dropdownIndex = $state(0);
  private timeout: ReturnType<typeof setTimeout> | undefined;
  private getEnumList: () => readonly string[];
  private getCurrentBase: () => string;

  fuzzyMatches = $derived(this.buffer ? this.getEnumList().filter((s) => fuzzyMatch(s, this.buffer)) : []);

  constructor(getEnumList: () => readonly string[], getCurrentBase: () => string) {
    this.getEnumList = getEnumList;
    this.getCurrentBase = getCurrentBase;
  }

  reset = () => {
    this.buffer = '';
    this.dropdownOpen = false;
    this.dropdownIndex = 0;
    clearTimeout(this.timeout);
  };

  private startCooldown() {
    clearTimeout(this.timeout);
    this.timeout = setTimeout(() => this.reset(), 1000);
  }

  /**
   * Handle a keydown event on the signal input.
   * Returns the new signal base to select, or null if no change.
   */
  handleKeydown = (e: KeyboardEvent): string | null => {
    const enumList = this.getEnumList();
    const currentBase = this.getCurrentBase();
    const currentIdx = currentBase ? enumList.indexOf(currentBase) : -1;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (this.dropdownOpen && this.fuzzyMatches.length > 0) {
        this.dropdownIndex = (this.dropdownIndex + 1) % this.fuzzyMatches.length;
        this.startCooldown();
        return this.fuzzyMatches[this.dropdownIndex];
      } else {
        this.reset();
        return enumList[(currentIdx + 1) % enumList.length];
      }
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (this.dropdownOpen && this.fuzzyMatches.length > 0) {
        this.dropdownIndex = (this.dropdownIndex - 1 + this.fuzzyMatches.length) % this.fuzzyMatches.length;
        this.startCooldown();
        return this.fuzzyMatches[this.dropdownIndex];
      } else {
        this.reset();
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

    if (e.key === 'Backspace') {
      e.preventDefault();
      if (this.buffer.length > 1) {
        this.buffer = this.buffer.slice(0, -1);
        const matches = enumList.filter((s) => fuzzyMatch(s, this.buffer));
        if (matches.length > 0) {
          this.dropdownIndex = 0;
          this.dropdownOpen = matches.length > 1;
          this.startCooldown();
          return matches[0];
        }
        this.startCooldown();
      } else {
        this.reset();
      }
      return null;
    }

    if (e.key.length === 1 && e.key.match(/[a-zA-Z\-]/)) {
      e.preventDefault();
      this.buffer += e.key.toLowerCase();
      const matches = enumList.filter((s) => fuzzyMatch(s, this.buffer));
      if (matches.length > 0) {
        this.dropdownIndex = 0;
        this.dropdownOpen = matches.length > 1;
        this.startCooldown();
        return matches[0];
      }
      this.startCooldown();
      return null;
    }

    return null;
  };
}

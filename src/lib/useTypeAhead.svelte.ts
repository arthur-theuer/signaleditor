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

type TypeAheadState = {
  buffer: string;
  dropdownOpen: boolean;
  dropdownIndex: number;
  fuzzyMatches: string[];
};

type TypeAheadResult = {
  readonly state: TypeAheadState;
  handleKeydown: (e: KeyboardEvent) => string | null;
  reset: () => void;
};

export function useTypeAhead(
  getEnumList: () => readonly string[],
  getCurrentBase: () => string,
): TypeAheadResult {
  let buffer = $state('');
  let dropdownOpen = $state(false);
  let dropdownIndex = $state(0);
  let timeout: ReturnType<typeof setTimeout>;

  let fuzzyMatches = $derived(
    buffer ? getEnumList().filter(s => fuzzyMatch(s, buffer)) : []
  );

  function reset() {
    buffer = '';
    dropdownOpen = false;
    dropdownIndex = 0;
    clearTimeout(timeout);
  }

  function startCooldown() {
    clearTimeout(timeout);
    timeout = setTimeout(() => reset(), 1000);
  }

  /**
   * Handle a keydown event on the signal input.
   * Returns the new signal base to select, or null if no change.
   */
  function handleKeydown(e: KeyboardEvent): string | null {
    const enumList = getEnumList();
    const currentBase = getCurrentBase();
    const currentIdx = currentBase ? enumList.indexOf(currentBase) : -1;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (dropdownOpen && fuzzyMatches.length > 0) {
        dropdownIndex = (dropdownIndex + 1) % fuzzyMatches.length;
        startCooldown();
        return fuzzyMatches[dropdownIndex];
      } else {
        reset();
        return enumList[(currentIdx + 1) % enumList.length];
      }
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (dropdownOpen && fuzzyMatches.length > 0) {
        dropdownIndex = (dropdownIndex - 1 + fuzzyMatches.length) % fuzzyMatches.length;
        startCooldown();
        return fuzzyMatches[dropdownIndex];
      } else {
        reset();
        return enumList[(currentIdx - 1 + enumList.length) % enumList.length];
      }
    }

    if (e.key === 'Tab' || e.key === 'Enter') {
      if (dropdownOpen) {
        reset();
        if (e.key === 'Enter') e.preventDefault();
      }
      return null;
    }

    if (e.key === 'Escape') {
      e.preventDefault();
      if (dropdownOpen) {
        reset();
        return null;
      }
      // Return empty string to signal "clear the value"
      return '';
    }

    if (e.key === 'Backspace') {
      e.preventDefault();
      if (buffer.length > 1) {
        buffer = buffer.slice(0, -1);
        const matches = enumList.filter(s => fuzzyMatch(s, buffer));
        if (matches.length > 0) {
          dropdownIndex = 0;
          dropdownOpen = matches.length > 1;
          startCooldown();
          return matches[0];
        }
        startCooldown();
      } else {
        reset();
      }
      return null;
    }

    if (e.key.length === 1 && e.key.match(/[a-zA-Z\-]/)) {
      e.preventDefault();
      buffer += e.key.toLowerCase();
      const matches = enumList.filter(s => fuzzyMatch(s, buffer));
      if (matches.length > 0) {
        dropdownIndex = 0;
        dropdownOpen = matches.length > 1;
        startCooldown();
        return matches[0];
      }
      startCooldown();
      return null;
    }

    return null;
  }

  return {
    get state() {
      return {
        get buffer() { return buffer; },
        get dropdownOpen() { return dropdownOpen; },
        get dropdownIndex() { return dropdownIndex; },
        get fuzzyMatches() { return fuzzyMatches; },
      };
    },
    handleKeydown,
    reset,
  };
}

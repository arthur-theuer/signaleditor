import { STATIONEN } from './constants';

// Strip diacritics: ü→u, ö→o, ä→a, é→e etc.
export function fold(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

// Return matched character indices for a substring match, or null
function substringIndices(folded: string, q: string): number[] | null {
  const idx = folded.indexOf(q);
  if (idx === -1) return null;
  return Array.from({ length: q.length }, (_, i) => idx + i);
}

// Return matched character indices for a fuzzy match, or null.
// Greedy left-to-right: each query char must appear after the previous.
function fuzzyIndices(folded: string, q: string): number[] | null {
  const indices: number[] = [];
  let pos = 0;
  for (const ch of q) {
    const idx = folded.indexOf(ch, pos);
    if (idx === -1) return null;
    indices.push(idx);
    pos = idx + 1;
  }
  return indices;
}

// Render text with matched indices wrapped in <mark>.
// Groups consecutive indices into single <mark> spans.
export function highlight(text: string, indices: number[]): string {
  if (!indices.length) return text;
  const set = new Set(indices);
  let result = '';
  let inMark = false;
  for (let i = 0; i < text.length; i++) {
    if (set.has(i) && !inMark) {
      result += '<mark>';
      inMark = true;
    } else if (!set.has(i) && inMark) {
      result += '</mark>';
      inMark = false;
    }
    result += text[i];
  }
  if (inMark) result += '</mark>';
  return result;
}

export type Entry = { code: string; name: string; nameFolded: string; codeFolded: string; trainStop: boolean };
export type Result = Entry & { nameIndices: number[]; codeIndices: number[] };

export const entries: Entry[] = Object.entries(STATIONEN).map(([c, [n, t]]) => ({
  code: c,
  name: n,
  nameFolded: fold(n),
  codeFolded: fold(c),
  trainStop: t,
}));

// Reverse lookup: station name (folded) → code
const nameToCode: Record<string, string> = {};
for (const e of entries) nameToCode[e.nameFolded] = e.code;

export function codeForName(name: string): string | undefined {
  return nameToCode[fold(name)];
}

export function stationName(code: string): string {
  return STATIONEN[code]?.[0] || '';
}

// Four-tier search: exact → prefix → substring → fuzzy
export function search(rawQuery: string, max = 6): Result[] {
  const q = fold(rawQuery.trim());
  if (!q) return [];
  const exact: Result[] = [];
  const prefix: Result[] = [];
  const substring: Result[] = [];
  const fuzzy: Result[] = [];
  for (const e of entries) {
    const ni = substringIndices(e.nameFolded, q);
    const ci = substringIndices(e.codeFolded, q);
    if (e.nameFolded === q || e.codeFolded === q) {
      exact.push({ ...e, nameIndices: ni || [], codeIndices: ci || [] });
    } else if (e.nameFolded.startsWith(q) || e.codeFolded.startsWith(q)) {
      prefix.push({ ...e, nameIndices: ni || [], codeIndices: ci || [] });
    } else if (ni || ci) {
      substring.push({ ...e, nameIndices: ni || [], codeIndices: ci || [] });
    } else {
      const nf = fuzzyIndices(e.nameFolded, q);
      const cf = fuzzyIndices(e.codeFolded, q);
      if (nf || cf) {
        fuzzy.push({ ...e, nameIndices: nf || [], codeIndices: cf || [] });
      }
    }
  }
  fuzzy.sort((a, b) => {
    const spanA = Math.min(
      a.nameIndices.length ? a.nameIndices[a.nameIndices.length - 1] - a.nameIndices[0] : Infinity,
      a.codeIndices.length ? a.codeIndices[a.codeIndices.length - 1] - a.codeIndices[0] : Infinity,
    );
    const spanB = Math.min(
      b.nameIndices.length ? b.nameIndices[b.nameIndices.length - 1] - b.nameIndices[0] : Infinity,
      b.codeIndices.length ? b.codeIndices[b.codeIndices.length - 1] - b.codeIndices[0] : Infinity,
    );
    return spanA - spanB;
  });
  const all = [...exact, ...prefix, ...substring, ...fuzzy];
  // Show only train stops; fall back to traffic points if no train results
  const trainResults = all.filter((r) => r.trainStop);
  return (trainResults.length > 0 ? trainResults : all).slice(0, max);
}

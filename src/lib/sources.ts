import type { Eintrag, Import, Editordaten, Signaleintrag } from './types';
import { isImporteintrag, isKnoteneintrag, isSignaleintrag } from './types';
import { parseYAMLContent, extractYAMLFromHTML } from './yaml';
import { loadFile } from './api';
import { isVorsignal, isWiederholungssignal, extractSignalBase, extractName } from './signals';
import { VORSIGNAL_TO_HAUPTSIGNAL, HAUPTSIGNAL_TO_VORSIGNAL } from './constants';

const importCache: Record<string, Editordaten> = {};

/** Remove a file from the import cache so the next resolve re-fetches it */
export function invalidateImportCache(datei: string): void {
  delete importCache[datei];
}

/** Clear the entire import cache */
export function clearImportCache(): void {
  for (const key of Object.keys(importCache)) delete importCache[key];
}

export type ResolveResult = {
  signale: Eintrag[];
  meta?: Editordaten['meta'];
  error: string | null;
};

export async function resolveImport(imp: Import): Promise<ResolveResult> {
  const datei = imp.datei;
  if (!datei) return { error: 'Kein Dateipfad angegeben', signale: [] };

  try {
    let parsed = importCache[datei];
    if (!parsed) {
      let content = await loadFile('strecken', datei);

      if (datei.endsWith('.html')) {
        const yamlContent = extractYAMLFromHTML(content);
        if (yamlContent) {
          content = yamlContent;
        } else {
          throw new Error('Keine eingebettete YAML-Daten gefunden');
        }
      }

      parsed = parseYAMLContent(content);
      importCache[datei] = parsed;
    }

    let signale = parsed.signale;

    if (imp.von) {
      const idx = signale.findIndex((s) => isKnoteneintrag(s) && s.knoten === imp.von);
      if (idx === -1) return { error: `Knoten "${imp.von}" nicht gefunden`, signale: [] };
      signale = signale.slice(idx);
    }

    if (imp.bis) {
      const idx = signale.findIndex((s) => isKnoteneintrag(s) && s.knoten === imp.bis);
      if (idx === -1) return { error: `Knoten "${imp.bis}" nicht gefunden`, signale: [] };
      signale = signale.slice(0, idx + 1);
    }

    return { signale, meta: parsed.meta, error: null };
  } catch (e) {
    return { error: (e as Error).message, signale: [] };
  }
}

/** Cache a manually loaded file (e.g., via FileReader) */
export function cacheImport(datei: string, data: Editordaten): void {
  importCache[datei] = data;
}

export async function autoStitchImporte(
  signale: Eintrag[],
  meta?: { von: string; nach: string },
): Promise<void> {
  const importIndices = signale.map((s, i) => (isImporteintrag(s) ? i : -1)).filter((i) => i !== -1);

  // Clear existing stitch points before recalculating
  for (const i of importIndices) {
    const e = signale[i];
    if (isImporteintrag(e)) {
      e.import.von = undefined;
      e.import.bis = undefined;
    }
  }

  // Stitch consecutive import pairs
  for (let k = 0; k < importIndices.length - 1; k++) {
    const idxA = importIndices[k];
    const idxB = importIndices[k + 1];
    const eA = signale[idxA];
    const eB = signale[idxB];
    if (!isImporteintrag(eA) || !isImporteintrag(eB)) continue;

    const qA = eA.import;
    const qB = eB.import;

    if (!qA.datei || !qB.datei) continue;

    const [resA, resB] = await Promise.all([resolveImport({ datei: qA.datei }), resolveImport({ datei: qB.datei })]);

    if (resA.error || resB.error) continue;

    const knotenAList = resA.signale
      .filter((s) => isKnoteneintrag(s))
      .map((s) => (s as { knoten: string }).knoten);
    const knotenBList = resB.signale
      .filter((s) => isKnoteneintrag(s))
      .map((s) => (s as { knoten: string }).knoten);
    const knotenASet = new Set(knotenAList);
    const knotenBSet = new Set(knotenBList);

    // Candidate 1: last shared knoten in A
    let candidate1: string | undefined;
    for (let i = knotenAList.length - 1; i >= 0; i--) {
      if (knotenBSet.has(knotenAList[i])) {
        candidate1 = knotenAList[i];
        break;
      }
    }

    // Candidate 2: earliest shared knoten in B
    let candidate2: string | undefined;
    for (const k of knotenBList) {
      if (knotenASet.has(k)) {
        candidate2 = k;
        break;
      }
    }

    // Pick the candidate that doesn't collapse either segment to a single knoten.
    // A collapses when the stitch point equals A's start; B collapses when it equals B's end.
    if (candidate1 || candidate2) {
      const effectiveAStart = qA.von || knotenAList[0];
      const bEnd = knotenBList[knotenBList.length - 1];

      const c1Ok = candidate1 && candidate1 !== effectiveAStart && candidate1 !== bEnd;
      const c2Ok = candidate2 && candidate2 !== effectiveAStart && candidate2 !== bEnd;

      const stitch = c1Ok ? candidate1 : c2Ok ? candidate2 : (candidate2 ?? candidate1);

      if (stitch) {
        qA.bis = stitch;
        qB.von = stitch;
      }
    }
  }

  // Trim first import to meta.von, last import to meta.nach
  if (meta && importIndices.length > 0) {
    const firstE = signale[importIndices[0]];
    const lastE = signale[importIndices[importIndices.length - 1]];

    if (meta.von && isImporteintrag(firstE) && firstE.import.datei && !firstE.import.von) {
      const res = await resolveImport({ datei: firstE.import.datei });
      if (!res.error) {
        const knoten = res.signale.filter((s) => isKnoteneintrag(s)).map((s) => (s as { knoten: string }).knoten);
        if (knoten.includes(meta.von)) {
          firstE.import.von = meta.von;
        }
      }
    }

    if (meta.nach && isImporteintrag(lastE) && lastE.import.datei && !lastE.import.bis) {
      const res = await resolveImport({ datei: lastE.import.datei });
      if (!res.error) {
        const knoten = res.signale.filter((s) => isKnoteneintrag(s)).map((s) => (s as { knoten: string }).knoten);
        if (knoten.includes(meta.nach)) {
          lastE.import.bis = meta.nach;
        }
      }
    }
  }
}

export type ResolveFlat = {
  signale: Eintrag[];
  /** Indices into signale that were auto-adjusted during stitch validation */
  stitchOverrides: Set<number>;
};

/** Flatten signale by resolving imp entries, deduplicating shared knoten at stitch boundaries */
export async function resolveSignaleForMeldungen(signale: Eintrag[]): Promise<ResolveFlat> {
  const flat: Eintrag[] = [];
  const stitchKnotenIndices: number[] = [];

  for (const sig of signale) {
    if (isImporteintrag(sig)) {
      const res = await resolveImport(sig.import);
      if (res.error) {
        flat.push(sig);
      } else {
        for (const s of res.signale) {
          if (isKnoteneintrag(s) && flat.length > 0) {
            const prev = flat[flat.length - 1];
            if (isKnoteneintrag(prev) && prev.knoten === s.knoten) {
              if (!prev.km && s.km) prev.km = s.km;
              stitchKnotenIndices.push(flat.length - 1);
              continue;
            }
          }
          flat.push(s);
        }
      }
    } else {
      flat.push(sig);
    }
  }

  const stitchOverrides = adjustVorsignaleAtStitchPoints(flat, stitchKnotenIndices);
  return { signale: flat, stitchOverrides };
}

/**
 * At each stitch-point Knoten, compare the Vorsignal before it with the
 * Hauptsignal after it. If they don't match, adjust the Vorsignal (and
 * its alternate) to correspond to the actual Hauptsignal.
 * Returns the set of flat-array indices that were modified.
 */
function adjustVorsignaleAtStitchPoints(flat: Eintrag[], stitchIndices: number[]): Set<number> {
  const overrides = new Set<number>();

  for (const knotenIdx of stitchIndices) {
    // Find last Signaleintrag before the Knoten (skip non-signal, Wiederholungssignal)
    let beforeIdx = -1;
    for (let i = knotenIdx - 1; i >= 0; i--) {
      const s = flat[i];
      if (!isSignaleintrag(s)) continue;
      if (isWiederholungssignal(s.signal_1)) continue;
      beforeIdx = i;
      break;
    }
    if (beforeIdx === -1) continue;

    const before = flat[beforeIdx] as Signaleintrag;

    // Determine which field holds the Vorsignal
    const vsField: 'signal_2' | 'signal_1' | null =
      before.signal_2 && isVorsignal(before.signal_2)
        ? 'signal_2'
        : isVorsignal(before.signal_1)
          ? 'signal_1'
          : null;
    if (!vsField) continue;

    // Find first Signaleintrag after the Knoten
    let afterIdx = -1;
    for (let i = knotenIdx + 1; i < flat.length; i++) {
      const s = flat[i];
      if (!isSignaleintrag(s)) continue;
      if (isWiederholungssignal(s.signal_1)) continue;
      afterIdx = i;
      break;
    }
    if (afterIdx === -1) continue;

    const after = flat[afterIdx] as Signaleintrag;
    const hauptBase = extractSignalBase(after.signal_1);
    if (!hauptBase) continue;

    // Check if current Vorsignal already predicts this Hauptsignal
    const currentVsBase = extractSignalBase(before[vsField]!);
    if (!currentVsBase) continue;
    const predicted = VORSIGNAL_TO_HAUPTSIGNAL[currentVsBase];
    if (predicted && predicted.signal === hauptBase) continue; // already correct

    // Look up the correct Vorsignal for this Hauptsignal
    const correctVs = HAUPTSIGNAL_TO_VORSIGNAL[hauptBase];
    if (!correctVs) continue;

    // Build the replacement Vorsignal with name from the Hauptsignal
    const hauptName = correctVs.keepName ? extractName(after.signal_1) : '';
    const newVsValue = hauptName ? `${correctVs.vorsignal} ${hauptName}` : correctVs.vorsignal;

    // Clone entry to avoid mutating import cache
    const cloned: Signaleintrag = { ...before };
    cloned[vsField] = newVsValue;

    // Adjust alternate field too
    const altField = vsField === 'signal_2' ? 'signal_2b' : 'signal_1b';
    const afterAlt = after.signal_1b;
    if (afterAlt && cloned[altField] !== undefined) {
      const altHauptBase = extractSignalBase(afterAlt);
      if (altHauptBase) {
        const altCorrectVs = HAUPTSIGNAL_TO_VORSIGNAL[altHauptBase];
        if (altCorrectVs) {
          const altName = altCorrectVs.keepName ? extractName(afterAlt) : '';
          cloned[altField] = altName ? `${altCorrectVs.vorsignal} ${altName}` : altCorrectVs.vorsignal;
        }
      }
    } else if (!afterAlt && cloned[altField]) {
      // After has no alternate Hauptsignal, clear the alternate Vorsignal
      cloned[altField] = undefined;
    }

    flat[beforeIdx] = cloned;
    overrides.add(beforeIdx);
  }

  return overrides;
}

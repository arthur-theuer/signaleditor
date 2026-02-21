import type { Eintrag, Import, Strecke, Editordaten } from './types';
import { isImporteintrag, isKnoteneintrag } from './types';
import { parseYAMLContent, extractYAMLFromHTML } from './yaml';

const importCache: Record<string, Editordaten> = {};

export type ResolveResult = {
  signale: Eintrag[];
  strecke?: Strecke;
  error: string | null;
};

export async function resolveImport(imp: Import): Promise<ResolveResult> {
  const datei = imp.datei;
  if (!datei) return { error: 'Kein Dateipfad angegeben', signale: [] };

  try {
    let parsed = importCache[datei];
    if (!parsed) {
      const resp = await fetch('strecken/' + datei);
      if (!resp.ok) throw new Error(`${resp.status} ${resp.statusText}`);
      let content = await resp.text();

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
      const idx = signale.findIndex(s => isKnoteneintrag(s) && s.knoten === imp.von);
      if (idx === -1) return { error: `Knoten "${imp.von}" nicht gefunden`, signale: [] };
      signale = signale.slice(idx);
    }

    if (imp.bis) {
      const idx = signale.findIndex(s => isKnoteneintrag(s) && s.knoten === imp.bis);
      if (idx === -1) return { error: `Knoten "${imp.bis}" nicht gefunden`, signale: [] };
      signale = signale.slice(0, idx + 1);
    }

    return { signale, strecke: parsed.strecke, error: null };
  } catch (e) {
    return { error: (e as Error).message, signale: [] };
  }
}

/** Cache a manually loaded file (e.g., via FileReader) */
export function cacheImport(datei: string, data: Editordaten): void {
  importCache[datei] = data;
}

export async function autoStitchImporte(signale: Eintrag[]): Promise<void> {
  const importIndices = signale
    .map((s, i) => (isImporteintrag(s) ? i : -1))
    .filter(i => i !== -1);

  for (let k = 0; k < importIndices.length - 1; k++) {
    const idxA = importIndices[k];
    const idxB = importIndices[k + 1];
    const eA = signale[idxA];
    const eB = signale[idxB];
    if (!isImporteintrag(eA) || !isImporteintrag(eB)) continue;

    const qA = eA.import;
    const qB = eB.import;

    if (!qA.datei || !qB.datei) continue;

    const [resA, resB] = await Promise.all([
      resolveImport({ datei: qA.datei }),
      resolveImport({ datei: qB.datei }),
    ]);

    if (resA.error || resB.error) continue;

    const knotenA = resA.signale
      .filter(s => isKnoteneintrag(s))
      .map(s => (s as { knoten: string }).knoten);
    const knotenB = new Set(
      resB.signale
        .filter(s => isKnoteneintrag(s))
        .map(s => (s as { knoten: string }).knoten),
    );

    for (let i = knotenA.length - 1; i >= 0; i--) {
      if (knotenB.has(knotenA[i])) {
        qA.bis = knotenA[i];
        qB.von = knotenA[i];
        break;
      }
    }
  }
}

/** Flatten signale by resolving imp entries, deduplicating shared knoten at stitch boundaries */
export async function resolveSignaleForMeldungen(signale: Eintrag[]): Promise<Eintrag[]> {
  const flat: Eintrag[] = [];
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
  return flat;
}

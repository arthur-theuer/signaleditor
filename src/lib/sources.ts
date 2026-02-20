import type { Eintrag, Quelle, Strecke, Editordaten } from './types';
import { isQuelleneintrag, isKnoteneintrag } from './types';
import { parseYAMLContent, extractYAMLFromHTML } from './yaml';

const quelleCache: Record<string, Editordaten> = {};

export type ResolveResult = {
  signale: Eintrag[];
  strecke?: Strecke;
  error: string | null;
};

export async function resolveQuelle(quelle: Quelle): Promise<ResolveResult> {
  const datei = quelle.datei;
  if (!datei) return { error: 'Kein Dateipfad angegeben', signale: [] };

  try {
    let parsed = quelleCache[datei];
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
      quelleCache[datei] = parsed;
    }

    let signale = parsed.signale;

    if (quelle.von) {
      const idx = signale.findIndex(s => isKnoteneintrag(s) && s.knoten === quelle.von);
      if (idx === -1) return { error: `Knoten "${quelle.von}" nicht gefunden`, signale: [] };
      signale = signale.slice(idx);
    }

    if (quelle.bis) {
      const idx = signale.findIndex(s => isKnoteneintrag(s) && s.knoten === quelle.bis);
      if (idx === -1) return { error: `Knoten "${quelle.bis}" nicht gefunden`, signale: [] };
      signale = signale.slice(0, idx + 1);
    }

    return { signale, strecke: parsed.strecke, error: null };
  } catch (e) {
    return { error: (e as Error).message, signale: [] };
  }
}

/** Cache a manually loaded file (e.g., via FileReader) */
export function cacheQuelle(datei: string, data: Editordaten): void {
  quelleCache[datei] = data;
}

export async function autoStitchQuellen(signale: Eintrag[]): Promise<void> {
  const quelleIndices = signale
    .map((s, i) => (isQuelleneintrag(s) ? i : -1))
    .filter(i => i !== -1);

  for (let k = 0; k < quelleIndices.length - 1; k++) {
    const idxA = quelleIndices[k];
    const idxB = quelleIndices[k + 1];
    const eA = signale[idxA];
    const eB = signale[idxB];
    if (!isQuelleneintrag(eA) || !isQuelleneintrag(eB)) continue;

    const qA = eA.quelle;
    const qB = eB.quelle;

    if (!qA.datei || !qB.datei) continue;

    const [resA, resB] = await Promise.all([
      resolveQuelle({ datei: qA.datei }),
      resolveQuelle({ datei: qB.datei }),
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

/** Flatten signale by resolving quelle entries, deduplicating shared knoten at stitch boundaries */
export async function resolveSignaleForMeldungen(signale: Eintrag[]): Promise<Eintrag[]> {
  const flat: Eintrag[] = [];
  for (const sig of signale) {
    if (isQuelleneintrag(sig)) {
      const res = await resolveQuelle(sig.quelle);
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

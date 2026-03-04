import type { Eintrag, Editordaten } from './types';
import { dateiId } from './types';
import { isSignaleintrag, isNotizeintrag, isKnoteneintrag, isAbzweigungseintrag, isImporteintrag } from './types';
import { STATIONEN, MELDUNG_FARBEN, BAHNHOF_FARBEN } from './constants';
import { meldungAusSignaleintrag } from './meldungen';
import { resolveSignaleForMeldungen } from './sources';

export type ColoredSegment = {
  meldung: string;
  farbe: string;
  klasse: string;
  fett: boolean;
};

export type MeldungRow = {
  id: number;
  km?: number;
  signalname: string;
  signal_1_display: string;
  signal_2_display: string;
  segments: ColoredSegment[];
  error: string | null;
  note?: string;
  knoten?: string;
  abzweigung?: string;
  import?: string;
};

export function generiereAlleMeldungen(signale: Eintrag[]): MeldungRow[] {
  const meldungen: MeldungRow[] = [];
  let bahnhofFarbschalter = true;
  let imBahnhof = true;
  let bahnhofFarbe: string = BAHNHOF_FARBEN[1];
  let bahnhofKlasse: string = 'meldung-bahnhof-b';

  function colorForSignaltyp(signaltyp: string | null): { farbe: string; klasse: string; fett: boolean } {
    if (signaltyp === 'einfahrt') {
      imBahnhof = true;
      bahnhofKlasse = bahnhofFarbschalter ? 'meldung-bahnhof-a' : 'meldung-bahnhof-b';
      bahnhofFarbe = bahnhofFarbschalter ? BAHNHOF_FARBEN[0] : BAHNHOF_FARBEN[1];
      bahnhofFarbschalter = !bahnhofFarbschalter;
      return { farbe: bahnhofFarbe, klasse: bahnhofKlasse, fett: true };
    } else if (imBahnhof && signaltyp === 'ausfahrt') {
      const f = bahnhofFarbe;
      imBahnhof = false;
      return { farbe: f, klasse: bahnhofKlasse, fett: false };
    } else if (imBahnhof) {
      return { farbe: bahnhofFarbe, klasse: bahnhofKlasse, fett: false };
    } else {
      const typ = signaltyp ?? 'standard';
      const klasse = `meldung-${MELDUNG_FARBEN[typ] ? typ : 'standard'}`;
      return { farbe: MELDUNG_FARBEN[typ] || MELDUNG_FARBEN.standard, klasse, fett: false };
    }
  }

  for (const sig of signale) {
    if (isNotizeintrag(sig)) {
      meldungen.push({
        id: sig.id,
        km: sig.km,
        note: sig.notiz,
        signalname: '',
        signal_1_display: '',
        signal_2_display: '',
        segments: [],
        error: 'Kein Signal',
      });
      continue;
    }

    if (isKnoteneintrag(sig)) {
      const resolved = STATIONEN[sig.knoten]?.[0];
      const name = resolved ? `${resolved} (${sig.knoten})` : sig.knoten;
      meldungen.push({
        id: sig.id,
        km: sig.km,
        knoten: name,
        signalname: '',
        signal_1_display: '',
        signal_2_display: '',
        segments: [],
        error: 'Kein Signal',
      });
      continue;
    }

    if (isAbzweigungseintrag(sig)) {
      const abz = sig.abzweigung;
      const label = [abz.links, abz.strecke, abz.von_nach, abz.richtung, abz.rechts].filter(Boolean).join(' ');
      meldungen.push({
        id: sig.id,
        km: sig.km,
        abzweigung: label,
        signalname: '',
        signal_1_display: '',
        signal_2_display: '',
        segments: [],
        error: 'Kein Signal',
      });
      continue;
    }

    if (isImporteintrag(sig)) {
      meldungen.push({
        id: sig.id,
        km: sig.km,
        import: sig.import.datei || '(leer)',
        signalname: '',
        signal_1_display: '',
        signal_2_display: '',
        segments: [],
        error: 'Kein Signal',
      });
      continue;
    }

    if (!isSignaleintrag(sig)) continue;

    const result = meldungAusSignaleintrag(sig);
    const s1Display = [sig.signal_1, sig.signal_1b].filter(Boolean).join(' / ');
    const s2Display = [sig.signal_2, sig.signal_2b].filter(Boolean).join(' / ');

    if (result.error) {
      meldungen.push({
        id: sig.id,
        km: sig.km,
        signalname: result.signalname,
        signal_1_display: s1Display,
        signal_2_display: s2Display,
        segments: [],
        error: result.error,
      });
      continue;
    }

    const coloredSegments = result.segments.map((seg) => {
      const { farbe, klasse, fett } = colorForSignaltyp(seg.signaltyp);
      return { meldung: seg.meldung, farbe, klasse, fett };
    });

    meldungen.push({
      id: sig.id,
      km: sig.km,
      signalname: result.signalname,
      signal_1_display: s1Display,
      signal_2_display: s2Display,
      segments: coloredSegments,
      error: null,
    });
  }

  return meldungen;
}

export async function generiereAlleMeldungenResolved(signale: Eintrag[]): Promise<MeldungRow[]> {
  const resolved = await resolveSignaleForMeldungen(signale);
  return generiereAlleMeldungen(resolved);
}

export async function downloadMeldungenHTML(data: Editordaten, yamlContent: string): Promise<void> {
  const meldungen = await generiereAlleMeldungenResolved(data.signale);
  const streckenName = data.meta.name || dateiId(data) || 'Strecke';
  const hasKm = meldungen.some((m) => m.km !== undefined);

  // Collect knoten that should appear in the export: stitch points + route endpoints
  const knotenToKeep = new Set<string>();
  for (const s of data.signale) {
    if (isImporteintrag(s)) {
      if (s.import.von) knotenToKeep.add(s.import.von);
      if (s.import.bis) knotenToKeep.add(s.import.bis);
    }
  }
  if (data.meta.von) knotenToKeep.add(data.meta.von);
  if (data.meta.nach) knotenToKeep.add(data.meta.nach);

  function esc(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  const rows = meldungen
    .map((m) => {
      const idCell = `<td class="col-id">${m.id}</td>`;
      const kmCell = hasKm ? `<td class="col-km">${m.km !== undefined ? m.km : ''}</td>` : '';

      if (m.note !== undefined) {
        return `<tr>${idCell}${kmCell}<td colspan="3" style="color:#f57f17;font-style:italic">${esc(m.note)}</td></tr>`;
      }
      if (m.abzweigung || m.import) {
        return null;
      }
      if (m.knoten) {
        // Keep knoten that are stitch points or route endpoints
        const code = m.knoten.match(/\(([A-Za-z]+)\)$/)?.[1] ?? m.knoten;
        if (!knotenToKeep.has(code)) return null;
        return `<tr>${idCell}${kmCell}<td colspan="3" style="color:#00695c;font-weight:bold">${esc(m.knoten)}</td></tr>`;
      }

      const meldungCell = m.error
        ? `<em>${esc(m.error)}</em>`
        : m.segments
            .map(
              (seg) =>
                `<span style="color:${seg.farbe};${seg.fett ? 'font-weight:bold;' : ''}">${esc(seg.meldung)}</span>`,
            )
            .join('<br>');

      return `<tr>${idCell}${kmCell}<td class="signal">${esc(m.signal_1_display)}</td><td class="signal">${esc(m.signal_2_display)}</td><td class="meldung">${meldungCell}</td></tr>`;
    })
    .filter(Boolean)
    .join('\n');

  const html = `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Meldungen - ${esc(streckenName)}</title>
<style>
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;margin:20px;background:#f5f5f5}
h1{font-size:18px;margin-bottom:20px}
table{border-collapse:collapse;background:white;box-shadow:0 1px 3px rgba(0,0,0,.1)}
th,td{border:1px solid #ddd;padding:8px 12px;text-align:left;vertical-align:middle}
th{background:#fafafa;font-weight:600}
.col-id,.col-km,.meldung{text-align:center}
.col-km{color:#999}
.signal{color:#666}
</style>
</head>
<body>
<h1>Meldungen: ${esc(streckenName)}</h1>
<table>
<thead><tr><th class="col-id">ID</th>${hasKm ? '<th class="col-km">km</th>' : ''}<th>Signal 1</th><th>Signal 2</th><th class="meldung">Meldung</th></tr></thead>
<tbody>
${rows}
</tbody>
</table>
<script type="application/yaml" id="embedded-yaml">
${yamlContent}
<\/script>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${dateiId(data) || 'meldungen'}.html`;
  a.click();
  URL.revokeObjectURL(a.href);
}

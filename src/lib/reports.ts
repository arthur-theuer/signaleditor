import type { Eintrag } from './types';
import {
  isSignaleintrag,
  isNotizeintrag,
  isKnoteneintrag,
  isAbzweigungseintrag,
  isQuelleneintrag,
} from './types';
import { KNOTEN, MELDUNG_FARBEN, BAHNHOF_FARBEN } from './constants';
import { meldungAusSignaleintrag } from './signals';
import { resolveSignaleForMeldungen } from './sources';

export type ColoredSegment = {
  meldung: string;
  farbe: string;
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
  quelle?: string;
};

export function generiereAlleMeldungenSync(signale: Eintrag[]): MeldungRow[] {
  const meldungen: MeldungRow[] = [];
  let bahnhofFarbschalter = true;
  let imBahnhof = true;
  let bahnhofFarbe: string = BAHNHOF_FARBEN[1];

  function colorForSignaltyp(signaltyp: string | null): { farbe: string; fett: boolean } {
    if (signaltyp === 'einfahrt') {
      imBahnhof = true;
      bahnhofFarbe = bahnhofFarbschalter ? BAHNHOF_FARBEN[0] : BAHNHOF_FARBEN[1];
      bahnhofFarbschalter = !bahnhofFarbschalter;
      return { farbe: bahnhofFarbe, fett: true };
    } else if (imBahnhof && signaltyp === 'ausfahrt') {
      const f = bahnhofFarbe;
      imBahnhof = false;
      return { farbe: f, fett: false };
    } else if (imBahnhof) {
      return { farbe: bahnhofFarbe, fett: false };
    } else {
      return { farbe: MELDUNG_FARBEN[signaltyp ?? ''] || MELDUNG_FARBEN.standard, fett: false };
    }
  }

  for (const sig of signale) {
    if (isNotizeintrag(sig)) {
      meldungen.push({
        id: sig.id, km: sig.km, note: sig.notiz,
        signalname: '', signal_1_display: '', signal_2_display: '',
        segments: [], error: 'Kein Signal',
      });
      continue;
    }

    if (isKnoteneintrag(sig)) {
      const resolved = KNOTEN[sig.knoten];
      const name = resolved ? `${resolved} (${sig.knoten})` : sig.knoten;
      meldungen.push({
        id: sig.id, km: sig.km, knoten: name,
        signalname: '', signal_1_display: '', signal_2_display: '',
        segments: [], error: 'Kein Signal',
      });
      continue;
    }

    if (isAbzweigungseintrag(sig)) {
      const abz = sig.abzweigung;
      const arrow = (abz.seite === 'links') === (abz.von_nach === 'nach') ? '<<' : '>>';
      const label = [arrow, abz.strecke, abz.von_nach, abz.richtung, arrow].filter(Boolean).join(' ');
      meldungen.push({
        id: sig.id, km: sig.km, abzweigung: label,
        signalname: '', signal_1_display: '', signal_2_display: '',
        segments: [], error: 'Kein Signal',
      });
      continue;
    }

    if (isQuelleneintrag(sig)) {
      meldungen.push({
        id: sig.id, km: sig.km, quelle: sig.quelle.datei || '(leer)',
        signalname: '', signal_1_display: '', signal_2_display: '',
        segments: [], error: 'Kein Signal',
      });
      continue;
    }

    if (!isSignaleintrag(sig)) continue;

    const result = meldungAusSignaleintrag(sig);
    const s1Display = [sig.signal_1, sig.signal_1b].filter(Boolean).join(' / ');
    const s2Display = [sig.signal_2, sig.signal_2b].filter(Boolean).join(' / ');

    if (result.error) {
      meldungen.push({
        id: sig.id, km: sig.km, signalname: result.signalname,
        signal_1_display: s1Display, signal_2_display: s2Display,
        segments: [], error: result.error,
      });
      continue;
    }

    const coloredSegments = result.segments.map(seg => {
      const { farbe, fett } = colorForSignaltyp(seg.signaltyp);
      return { meldung: seg.meldung, farbe, fett };
    });

    meldungen.push({
      id: sig.id, km: sig.km, signalname: result.signalname,
      signal_1_display: s1Display, signal_2_display: s2Display,
      segments: coloredSegments, error: null,
    });
  }

  return meldungen;
}

export function generiereAlleMeldungen(signale: Eintrag[]): MeldungRow[] {
  return generiereAlleMeldungenSync(signale);
}

export async function generiereAlleMeldungenResolved(signale: Eintrag[]): Promise<MeldungRow[]> {
  const resolved = await resolveSignaleForMeldungen(signale);
  return generiereAlleMeldungenSync(resolved);
}

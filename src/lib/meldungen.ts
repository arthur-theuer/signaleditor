import type { Signaleintrag } from './types';
import { SIGNALTYPEN, MELDUNGEN } from './constants';

export function detectSignaltyp(signal: string): [boolean, string | null] {
  const istVorsignal = signal.includes('Vorsignal') || signal.includes('Wiederholungssignal');
  for (const [begriff, signaltyp] of SIGNALTYPEN) {
    if (signal.includes(begriff)) {
      return [istVorsignal, signaltyp];
    }
  }
  return [false, null];
}

export type MeldungSegment = {
  meldung: string;
  signaltyp: string | null;
};

export type MeldungResult = {
  signalname: string;
  segments: MeldungSegment[];
  error: string | null;
};

export function buildMeldung(eintrag: Signaleintrag): MeldungResult {
  const signale: string[] = [];
  if (eintrag.signal_1) signale.push(eintrag.signal_1);
  if (eintrag.signal_2) signale.push(eintrag.signal_2);

  if (signale.length === 0) {
    return { signalname: '', segments: [], error: 'Kein Signal' };
  }

  const bahnhof = eintrag.bahnhof || '';

  let mainMeldung = 'Offen/zu!';
  let mainTyp: string | null = null;

  for (const s of signale) {
    const [istVorsignal, typ] = detectSignaltyp(s);
    if (!typ) continue;
    mainTyp = typ;
    if (istVorsignal) {
      mainMeldung = MELDUNGEN[typ].replace('{bahnhof}', bahnhof);
      break;
    } else if (signale.length === 1) {
      mainMeldung = 'Offen/zu!';
    }
  }

  const segments: MeldungSegment[] = [{ meldung: mainMeldung, signaltyp: mainTyp }];

  const altSignale: string[] = [];
  if (eintrag.signal_1b) altSignale.push(eintrag.signal_1b);
  if (eintrag.signal_2b) altSignale.push(eintrag.signal_2b);

  for (const s of altSignale) {
    const [istVorsignal, typ] = detectSignaltyp(s);
    if (!typ) continue;
    if (istVorsignal) {
      const altMeldung = MELDUNGEN[typ].replace('{bahnhof}', bahnhof);
      segments.push({ meldung: altMeldung, signaltyp: typ });
      break;
    }
  }

  const s1Parts = [eintrag.signal_1, eintrag.signal_1b].filter(Boolean);
  const s2Parts = [eintrag.signal_2, eintrag.signal_2b].filter(Boolean);
  const signalname = [s1Parts.join(' / '), s2Parts.join(' / ')].filter(Boolean).join(' / ');

  return { signalname, segments, error: null };
}

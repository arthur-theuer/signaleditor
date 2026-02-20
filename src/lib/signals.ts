import type { Eintrag, Signaleintrag } from './types';
import { isSignaleintrag, isNotizeintrag, isAbzweigungseintrag } from './types';
import {
  SIGNAL_ENUM,
  HAUPTSIGNAL_ENUM,
  VORSIGNAL_ENUM,
  SIGNALTYPEN,
  MELDUNGEN,
  REQUIRES_NAME,
  REQUIRES_BAHNHOF,
  VORSIGNAL_TO_HAUPTSIGNAL,
} from './constants';

export function erkenneSignaltyp(signal: string): [boolean, string | null] {
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

export function meldungAusSignaleintrag(eintrag: Signaleintrag): MeldungResult {
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
    const [istVorsignal, typ] = erkenneSignaltyp(s);
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
    const [istVorsignal, typ] = erkenneSignaltyp(s);
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

export function extractSignalBase(signal: string | undefined): string | null {
  if (!signal) return null;
  for (const s of SIGNAL_ENUM) {
    if (signal.startsWith(s)) return s;
  }
  return null;
}

export function extractName(signal: string): string {
  const base = extractSignalBase(signal);
  if (!base || !signalNeedsName(base)) return '';
  return signal.slice(base.length).trim();
}

export function signalNeedsName(signal: string): boolean {
  return REQUIRES_NAME.some(s => signal.startsWith(s));
}

export function signalNeedsBahnhof(signal: string): boolean {
  return REQUIRES_BAHNHOF.some(s => signal.startsWith(s));
}

export function isWiederholungssignal(signal: string | undefined): boolean {
  return extractSignalBase(signal) === 'Wiederholungssignal';
}

export function isVorsignal(signal: string | undefined): boolean {
  const base = extractSignalBase(signal);
  return base ? base.includes('Vorsignal') : false;
}

export type SignalPrediction = {
  signal: string;
  name: string;
  signal2?: string;
  alt?: { signal: string; name: string } | null;
};

export function predictNextSignal(prevSignals: Signaleintrag): SignalPrediction | null {
  let mainPrediction: SignalPrediction | null = null;
  for (const sig of [prevSignals.signal_2, prevSignals.signal_1]) {
    if (!sig) continue;
    const base = extractSignalBase(sig);
    if (!base) continue;
    const mapping = VORSIGNAL_TO_HAUPTSIGNAL[base];
    if (mapping) {
      const name = mapping.keepName ? extractName(sig) : '';
      mainPrediction = { signal: mapping.signal, name };
      break;
    }
  }

  let altPrediction: { signal: string; name: string } | null = null;
  for (const sig of [prevSignals.signal_2b, prevSignals.signal_1b]) {
    if (!sig) continue;
    const base = extractSignalBase(sig);
    if (!base) continue;
    const mapping = VORSIGNAL_TO_HAUPTSIGNAL[base];
    if (mapping) {
      const name = mapping.keepName ? extractName(sig) : '';
      altPrediction = { signal: mapping.signal, name };
      break;
    }
  }

  if (mainPrediction) {
    mainPrediction.alt = altPrediction;
    if (
      mainPrediction.signal === 'Blocksignal' &&
      (extractSignalBase(prevSignals.signal_2) === 'Block-Vorsignal zu' ||
        (!prevSignals.signal_2 && extractSignalBase(prevSignals.signal_1) === 'Block-Vorsignal zu'))
    ) {
      mainPrediction.signal2 = 'Block-Vorsignal zu';
    }
    return mainPrediction;
  }
  return null;
}

export function getEnumForField(
  field: string,
  rowIdx: number | undefined,
  signale: Eintrag[],
): readonly string[] {
  if (field === 'signal_2' || field === 'signal_2b') return VORSIGNAL_ENUM;

  let lastSignal: string | null = null;
  if (rowIdx !== undefined) {
    for (let i = rowIdx - 1; i >= 0; i--) {
      const s = signale[i];
      if (!isSignaleintrag(s)) continue;
      if (isWiederholungssignal(s.signal_1)) continue;
      lastSignal = s.signal_2 || s.signal_1;
      break;
    }
  }

  if (lastSignal && isVorsignal(lastSignal)) {
    return [...HAUPTSIGNAL_ENUM, 'Wiederholungssignal', ...VORSIGNAL_ENUM];
  } else if (lastSignal) {
    return [...VORSIGNAL_ENUM, 'Wiederholungssignal', ...HAUPTSIGNAL_ENUM];
  }
  return SIGNAL_ENUM;
}

export function autofillRow(
  sig: Signaleintrag,
  sourceIdx: number,
  signale: Eintrag[],
  showKm: boolean,
): void {
  let predictionSource: Signaleintrag | null = null;
  for (let i = sourceIdx; i >= 0; i--) {
    const s = signale[i];
    if (!isSignaleintrag(s)) continue;
    if (isWiederholungssignal(s.signal_1)) continue;
    predictionSource = s;
    break;
  }

  if (predictionSource) {
    const prediction = predictNextSignal(predictionSource);
    if (prediction) {
      sig.signal_1 = prediction.name
        ? `${prediction.signal} ${prediction.name}`
        : prediction.signal;
      if (signalNeedsBahnhof(prediction.signal)) {
        sig.bahnhof = prediction.name;
      }
      if (prediction.alt) {
        sig.signal_1b = prediction.alt.name
          ? `${prediction.alt.signal} ${prediction.alt.name}`
          : prediction.alt.signal;
        if (signalNeedsBahnhof(prediction.alt.signal) && prediction.alt.name) {
          sig.bahnhof = sig.bahnhof || prediction.alt.name;
        }
      }
      if (prediction.signal2) {
        sig.signal_2 = prediction.signal2;
      }
    }
  }

  if (showKm && sourceIdx >= 0) {
    const prev = signale[sourceIdx];
    if (prev.km !== undefined) {
      sig.km = parseFloat((prev.km + 0.1).toFixed(1));
    }
  }
}

export function isRowEmpty(eintrag: Eintrag): boolean {
  if (isNotizeintrag(eintrag)) return false;
  if (isAbzweigungseintrag(eintrag)) return false;
  if ('quelle' in eintrag) return false;
  if ('knoten' in eintrag) return false;
  if (!isSignaleintrag(eintrag)) return false;
  return !eintrag.signal_1 && !eintrag.signal_2 && !eintrag.signal_1b && !eintrag.signal_2b;
}

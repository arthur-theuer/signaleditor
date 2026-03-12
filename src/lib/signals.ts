import type { Eintrag, Signaleintrag } from './types';
import { isSignaleintrag, isNotizeintrag, isAbzweigungseintrag } from './types';
import {
  SIGNAL_ENUM,
  HAUPTSIGNAL_ENUM,
  VORSIGNAL_ENUM,
  REQUIRES_NAME,
  REQUIRES_STATION_SEARCH,
  REQUIRES_BAHNHOF,
  VORSIGNAL_TO_HAUPTSIGNAL,
  STATIONEN,
} from './constants';

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
  // Keep trailing whitespace so the $effect in Signalname doesn't eat spaces while typing.
  // Leading space (separator between base and name) is always stripped.
  return signal.slice(base.length).replace(/^ /, '');
}

export function signalNeedsName(signal: string): boolean {
  return REQUIRES_NAME.some((s) => signal.startsWith(s));
}

export function signalNeedsStationSearch(signal: string): boolean {
  return REQUIRES_STATION_SEARCH.some((s) => signal.startsWith(s));
}

export function signalNeedsBahnhof(signal: string): boolean {
  return REQUIRES_BAHNHOF.some((s) => signal.startsWith(s));
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

export function getEnumForField(field: string, rowIdx: number | undefined, signale: Eintrag[]): readonly string[] {
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

export function autofillRow(sig: Signaleintrag, sourceIdx: number, signale: Eintrag[], showKm: boolean): void {
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
      sig.signal_1 = prediction.name ? `${prediction.signal} ${prediction.name}` : prediction.signal;
      if (signalNeedsBahnhof(prediction.signal)) {
        sig.bahnhof = prediction.name;
      }
      if (prediction.alt) {
        sig.signal_1b = prediction.alt.name ? `${prediction.alt.signal} ${prediction.alt.name}` : prediction.alt.signal;
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
  if ('import' in eintrag) return false;
  if ('knoten' in eintrag) return false;
  if (!isSignaleintrag(eintrag)) return false;
  return !eintrag.signal_1 && !eintrag.signal_2 && !eintrag.signal_1b && !eintrag.signal_2b;
}

// --- Signal validation ---

const stationNames: Set<string> = new Set(Object.values(STATIONEN).map(([name]) => name));

export type RowValidation = {
  signal_1: boolean;
  signal_1b: boolean;
  signal_2: boolean;
  signal_2b: boolean;
  name_1: boolean;
  name_1b: boolean;
};

/** Find the previous Signaleintrag, skipping non-signal and Wiederholungssignal rows */
function findPrevSignal(signale: Eintrag[], rowIdx: number): Signaleintrag | null {
  for (let i = rowIdx - 1; i >= 0; i--) {
    const s = signale[i];
    if (!isSignaleintrag(s)) continue;
    if (isWiederholungssignal(s.signal_1)) continue;
    return s;
  }
  return null;
}

/** Find the next Signaleintrag, skipping non-signal and Wiederholungssignal rows */
function findNextSignal(signale: Eintrag[], rowIdx: number): Signaleintrag | null {
  for (let i = rowIdx + 1; i < signale.length; i++) {
    const s = signale[i];
    if (!isSignaleintrag(s)) continue;
    if (isWiederholungssignal(s.signal_1)) continue;
    return s;
  }
  return null;
}

/**
 * Validate a signal row against its context.
 * Returns true for each field that has an error.
 * Only non-empty fields are validated; empty fields are not errors.
 */
export function validateRow(eintrag: Signaleintrag, signale: Eintrag[], rowIdx: number): RowValidation {
  const result: RowValidation = {
    signal_1: false,
    signal_1b: false,
    signal_2: false,
    signal_2b: false,
    name_1: false,
    name_1b: false,
  };

  if (isRowEmpty(eintrag)) return result;
  if (isWiederholungssignal(eintrag.signal_1)) return result;

  const prev = findPrevSignal(signale, rowIdx);

  // --- Backward validation: check signal_1 against previous row's Vorsignal ---
  // Only applies when signal_1 is a Hauptsignal (not itself a Vorsignal)
  if (prev && eintrag.signal_1 && !isVorsignal(eintrag.signal_1)) {
    const base1 = extractSignalBase(eintrag.signal_1);
    // Find the Vorsignal in the previous row (signal_2 first, then signal_1)
    const prevVs = prev.signal_2 && isVorsignal(prev.signal_2)
      ? prev.signal_2
      : isVorsignal(prev.signal_1)
        ? prev.signal_1
        : null;

    if (prevVs && base1) {
      const prevVsBase = extractSignalBase(prevVs);
      if (prevVsBase) {
        const predicted = VORSIGNAL_TO_HAUPTSIGNAL[prevVsBase];
        if (predicted && predicted.signal !== base1) {
          result.signal_1 = true;
        }
      }
    }

    // Check signal_1b against previous row's alternate Vorsignal (skip if signal_1b is a Vorsignal)
    if (eintrag.signal_1b && !isVorsignal(eintrag.signal_1b)) {
      const base1b = extractSignalBase(eintrag.signal_1b);
      const prevVsAlt = prev.signal_2b && isVorsignal(prev.signal_2b)
        ? prev.signal_2b
        : prev.signal_1b && isVorsignal(prev.signal_1b)
          ? prev.signal_1b
          : null;

      if (prevVsAlt && base1b) {
        const prevVsAltBase = extractSignalBase(prevVsAlt);
        if (prevVsAltBase) {
          const predicted = VORSIGNAL_TO_HAUPTSIGNAL[prevVsAltBase];
          if (predicted && predicted.signal !== base1b) {
            result.signal_1b = true;
          }
        }
      }
    }
  }

  // --- Forward validation: flag Vorsignal when next Hauptsignal confirms mismatch ---
  const next = findNextSignal(signale, rowIdx);
  if (next && next.signal_1) {
    const nextBase = extractSignalBase(next.signal_1);

    // Check main Vorsignal (signal_2 first, then signal_1 if standalone)
    const vsField = eintrag.signal_2 && isVorsignal(eintrag.signal_2)
      ? 'signal_2' as const
      : isVorsignal(eintrag.signal_1)
        ? 'signal_1' as const
        : null;

    if (vsField && nextBase) {
      const vsBase = extractSignalBase(eintrag[vsField]!);
      if (vsBase) {
        const predicted = VORSIGNAL_TO_HAUPTSIGNAL[vsBase];
        if (predicted && predicted.signal !== nextBase) {
          result[vsField] = true;
        }
      }
    }

    // Check alternate Vorsignal
    const vsAltField = eintrag.signal_2b && isVorsignal(eintrag.signal_2b)
      ? 'signal_2b' as const
      : eintrag.signal_1b && isVorsignal(eintrag.signal_1b)
        ? 'signal_1b' as const
        : null;

    if (vsAltField && next.signal_1b) {
      const nextAltBase = extractSignalBase(next.signal_1b);
      const vsAltBase = extractSignalBase(eintrag[vsAltField]!);
      if (vsAltBase && nextAltBase) {
        const predicted = VORSIGNAL_TO_HAUPTSIGNAL[vsAltBase];
        if (predicted && predicted.signal !== nextAltBase) {
          result[vsAltField] = true;
        }
      }
    }
  }

  // --- Name validation: station name must match STATIONEN ---
  if (eintrag.signal_1) {
    const base1 = extractSignalBase(eintrag.signal_1);
    if (base1 && signalNeedsStationSearch(base1)) {
      const name = extractName(eintrag.signal_1).trim();
      if (name && !stationNames.has(name)) {
        result.name_1 = true;
      }
    }
  }

  if (eintrag.signal_1b) {
    const base1b = extractSignalBase(eintrag.signal_1b);
    if (base1b && signalNeedsStationSearch(base1b)) {
      const name = extractName(eintrag.signal_1b).trim();
      if (name && !stationNames.has(name)) {
        result.name_1b = true;
      }
    }
  }

  return result;
}

/**
 * Signal registry: each signal type defined once with all its properties.
 * Derived exports at the bottom preserve the existing API so consumers
 * don't need changes.
 */

type SignalKind = 'haupt' | 'vor' | 'wdh';

type SignalDef = {
  name: string;
  kind: SignalKind;
  short?: string;
  needsName?: boolean;
  needsStationSearch?: boolean;
  needsBahnhof?: boolean;
  /** Vorsignal → Hauptsignal prediction mapping */
  hauptsignal?: { signal: string; keepName: boolean };
  /** Meldung type key and substring for detectSignaltyp matching */
  meldung: { typ: string; keyword: string; text: string };
};

const REGISTRY: SignalDef[] = [
  // --- Vorsignale ---
  {
    name: 'Abschnitteinfahr-Vorsignal',
    kind: 'vor',
    hauptsignal: { signal: 'Abschnitteinfahrsignal', keepName: false },
    meldung: { typ: 'einfahrabschnitt', keyword: 'Abschnitteinfahr', text: 'Einfahrabschnitt offen/zu!' },
  },
  {
    name: 'Abschnittausfahr-Vorsignal',
    kind: 'vor',
    hauptsignal: { signal: 'Abschnittausfahrsignal', keepName: false },
    meldung: { typ: 'ausfahrabschnitt', keyword: 'Abschnittausfahr', text: 'Ausfahrabschnitt offen/zu!' },
  },
  {
    name: 'Abschnitt-Vorsignal',
    kind: 'vor',
    hauptsignal: { signal: 'Abschnittsignal', keepName: false },
    meldung: { typ: 'abschnitt', keyword: 'Abschnitt', text: 'Abschnitt offen/zu!' },
  },
  {
    name: 'Ausfahr-Vorsignal',
    kind: 'vor',
    hauptsignal: { signal: 'Ausfahrsignal', keepName: false },
    meldung: { typ: 'ausfahrt', keyword: 'Ausfahr', text: 'Ausfahrt offen/zu!' },
  },
  {
    name: 'Block-Vorsignal zu',
    kind: 'vor',
    short: 'Block-VS zu',
    needsName: true,
    hauptsignal: { signal: 'Blocksignal', keepName: true },
    meldung: { typ: 'block', keyword: 'Block', text: 'Block offen/zu!' },
  },
  {
    name: 'Einfahr-Vorsignal',
    kind: 'vor',
    short: 'EVS',
    needsName: true,
    needsStationSearch: true,
    needsBahnhof: true,
    hauptsignal: { signal: 'Einfahrsignal', keepName: true },
    meldung: { typ: 'einfahrt', keyword: 'Einfahr', text: '{bahnhof} offen/zu!' },
  },
  {
    name: 'Vorsignal zu Spurwechsel',
    kind: 'vor',
    short: 'VS zu Spw.',
    needsName: true,
    hauptsignal: { signal: 'Spurwechsel', keepName: true },
    meldung: { typ: 'spurwechsel', keyword: 'Spurwechsel', text: 'Spurwechsel offen/zu!' },
  },

  // --- Wiederholungssignal ---
  {
    name: 'Wiederholungssignal',
    kind: 'wdh',
    meldung: { typ: 'wiederholung', keyword: 'Wiederholungs', text: 'Wiederholung offen/zu!' },
  },

  // --- Hauptsignale ---
  {
    name: 'Abschnitteinfahrsignal',
    kind: 'haupt',
    meldung: { typ: 'einfahrabschnitt', keyword: 'Abschnitteinfahr', text: 'Einfahrabschnitt offen/zu!' },
  },
  {
    name: 'Abschnittausfahrsignal',
    kind: 'haupt',
    meldung: { typ: 'ausfahrabschnitt', keyword: 'Abschnittausfahr', text: 'Ausfahrabschnitt offen/zu!' },
  },
  {
    name: 'Abschnittsignal',
    kind: 'haupt',
    meldung: { typ: 'abschnitt', keyword: 'Abschnitt', text: 'Abschnitt offen/zu!' },
  },
  {
    name: 'Ausfahrsignal',
    kind: 'haupt',
    meldung: { typ: 'ausfahrt', keyword: 'Ausfahr', text: 'Ausfahrt offen/zu!' },
  },
  {
    name: 'Blocksignal',
    kind: 'haupt',
    short: 'Blocks.',
    needsName: true,
    meldung: { typ: 'block', keyword: 'Block', text: 'Block offen/zu!' },
  },
  {
    name: 'Einfahrsignal',
    kind: 'haupt',
    short: 'Einfahrs.',
    needsName: true,
    needsStationSearch: true,
    meldung: { typ: 'einfahrt', keyword: 'Einfahr', text: '{bahnhof} offen/zu!' },
  },
  {
    name: 'Spurwechsel',
    kind: 'haupt',
    short: 'Spw.',
    needsName: true,
    meldung: { typ: 'spurwechsel', keyword: 'Spurwechsel', text: 'Spurwechsel offen/zu!' },
  },
];

// --- Derived exports (preserve existing API) ---

export const HAUPTSIGNAL_ENUM = REGISTRY.filter((s) => s.kind === 'haupt').map((s) => s.name) as readonly string[];

export const VORSIGNAL_ENUM = REGISTRY.filter((s) => s.kind === 'vor').map((s) => s.name) as readonly string[];

export const SIGNAL_ENUM = [
  ...VORSIGNAL_ENUM,
  ...REGISTRY.filter((s) => s.kind === 'wdh').map((s) => s.name),
  ...HAUPTSIGNAL_ENUM,
] as readonly string[];

export const SIGNAL_SHORT: Record<string, string> = Object.fromEntries(
  REGISTRY.filter((s) => s.short).map((s) => [s.name, s.short!]),
);

export const REQUIRES_NAME: string[] = REGISTRY.filter((s) => s.needsName).map((s) => s.name);

export const REQUIRES_STATION_SEARCH: string[] = REGISTRY.filter((s) => s.needsStationSearch).map((s) => s.name);

export const REQUIRES_BAHNHOF: string[] = REGISTRY.filter((s) => s.needsBahnhof).map((s) => s.name);

export const VORSIGNAL_TO_HAUPTSIGNAL: Record<string, { signal: string; keepName: boolean }> = Object.fromEntries(
  REGISTRY.filter((s) => s.hauptsignal).map((s) => [s.name, s.hauptsignal!]),
);

/**
 * Ordered keyword→typ pairs for substring matching in detectSignaltyp.
 * Sorted by keyword length descending so longer/more-specific keywords
 * match first (e.g. 'Abschnitteinfahr' before 'Abschnitt').
 */
export const SIGNALTYPEN: [string, string][] = (() => {
  const seen = new Set<string>();
  const pairs: [string, string][] = [];
  for (const s of REGISTRY) {
    const key = s.meldung.keyword;
    if (!seen.has(key)) {
      seen.add(key);
      pairs.push([key, s.meldung.typ]);
    }
  }
  return pairs.sort((a, b) => b[0].length - a[0].length);
})();

export const MELDUNGEN: Record<string, string> = Object.fromEntries(
  REGISTRY.map((s) => [s.meldung.typ, s.meldung.text]),
);

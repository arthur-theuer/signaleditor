/**
 * Signal registry: each signal type defined once with all its properties.
 * Derived exports at the bottom preserve the existing API so consumers
 * don't need changes.
 */

type SignalKind = 'haupt' | 'vor' | 'wdh';

type SignalDef = {
  name: string;
  kind: SignalKind;
  abbrev: string;
  short?: string;
  needsName?: boolean;
  needsStationSearch?: boolean;
  needsBahnhof?: boolean;
  /** Vorsignal → Hauptsignal prediction mapping */
  hauptsignal?: { signal: string; keepName: boolean };
  /** Meldung type key and substring for erkenneSignaltyp matching */
  meldung: { typ: string; keyword: string; text: string };
};

const REGISTRY: SignalDef[] = [
  // --- Vorsignale (alphabetical for enum order) ---
  {
    name: 'Abschnitt-Vorsignal',
    kind: 'vor',
    abbrev: 'Abschnitt-VS',
    hauptsignal: { signal: 'Abschnittsignal', keepName: false },
    meldung: { typ: 'abschnitt', keyword: 'Abschnitt', text: 'Abschnitt offen/zu!' },
  },
  {
    name: 'Abschnitteinfahr-Vorsignal',
    kind: 'vor',
    abbrev: 'Abschnitteinfahr-VS',
    hauptsignal: { signal: 'Abschnitteinfahrsignal', keepName: false },
    meldung: { typ: 'einfahrabschnitt', keyword: 'Abschnitteinfahr', text: 'Einfahrabschnitt offen/zu!' },
  },
  {
    name: 'Abschnittausfahr-Vorsignal',
    kind: 'vor',
    abbrev: 'Abschnittausfahr-VS',
    hauptsignal: { signal: 'Abschnittausfahrsignal', keepName: false },
    meldung: { typ: 'ausfahrabschnitt', keyword: 'Abschnittausfahr', text: 'Ausfahrabschnitt offen/zu!' },
  },
  {
    name: 'Ausfahr-Vorsignal',
    kind: 'vor',
    abbrev: 'Ausfahr-VS',
    hauptsignal: { signal: 'Ausfahrsignal', keepName: false },
    meldung: { typ: 'ausfahrt', keyword: 'Ausfahr', text: 'Ausfahrt offen/zu!' },
  },
  {
    name: 'Block-Vorsignal zu',
    kind: 'vor',
    abbrev: 'Block-VS zu',
    needsName: true,
    hauptsignal: { signal: 'Blocksignal', keepName: true },
    meldung: { typ: 'block', keyword: 'Block', text: 'Block offen/zu!' },
  },
  {
    name: 'Einfahr-Vorsignal',
    kind: 'vor',
    abbrev: 'Einfahr-VS',
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
    abbrev: 'VS zu Spw.',
    needsName: true,
    hauptsignal: { signal: 'Spurwechsel', keepName: true },
    meldung: { typ: 'spurwechsel', keyword: 'Spurwechsel', text: 'Spurwechsel offen/zu!' },
  },

  // --- Wiederholungssignal ---
  {
    name: 'Wiederholungssignal',
    kind: 'wdh',
    abbrev: 'Wiederholungss.',
    meldung: { typ: 'wiederholung', keyword: 'Wiederholungs', text: 'Wiederholung offen/zu!' },
  },

  // --- Hauptsignale (order matches original enum) ---
  {
    name: 'Abschnittsignal',
    kind: 'haupt',
    abbrev: 'Abschnitts.',
    meldung: { typ: 'abschnitt', keyword: 'Abschnitt', text: 'Abschnitt offen/zu!' },
  },
  {
    name: 'Abschnitteinfahrsignal',
    kind: 'haupt',
    abbrev: 'Abschnitteinfahrs.',
    meldung: { typ: 'einfahrabschnitt', keyword: 'Abschnitteinfahr', text: 'Einfahrabschnitt offen/zu!' },
  },
  {
    name: 'Abschnittausfahrsignal',
    kind: 'haupt',
    abbrev: 'Abschnittausfahrs.',
    meldung: { typ: 'ausfahrabschnitt', keyword: 'Abschnittausfahr', text: 'Ausfahrabschnitt offen/zu!' },
  },
  {
    name: 'Ausfahrsignal',
    kind: 'haupt',
    abbrev: 'Ausfahrs.',
    meldung: { typ: 'ausfahrt', keyword: 'Ausfahr', text: 'Ausfahrt offen/zu!' },
  },
  {
    name: 'Blocksignal',
    kind: 'haupt',
    abbrev: 'Blocks.',
    needsName: true,
    meldung: { typ: 'block', keyword: 'Block', text: 'Block offen/zu!' },
  },
  {
    name: 'Einfahrsignal',
    kind: 'haupt',
    abbrev: 'Einfahrs.',
    needsName: true,
    needsStationSearch: true,
    meldung: { typ: 'einfahrt', keyword: 'Einfahr', text: '{bahnhof} offen/zu!' },
  },
  {
    name: 'Spurwechsel',
    kind: 'haupt',
    abbrev: 'Spw.',
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

export const SIGNAL_ABBREV: Record<string, string> = Object.fromEntries(REGISTRY.map((s) => [s.name, s.abbrev]));

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
 * Ordered keyword→typ pairs for substring matching in erkenneSignaltyp.
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

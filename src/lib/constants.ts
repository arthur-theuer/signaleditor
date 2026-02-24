export const HAUPTSIGNAL_ENUM = [
  'Abschnittsignal',
  'Abschnitteinfahrsignal',
  'Abschnittausfahrsignal',
  'Ausfahrsignal',
  'Blocksignal',
  'Einfahrsignal',
  'Spurwechsel',
] as const;

export const VORSIGNAL_ENUM = [
  'Abschnitt-Vorsignal',
  'Abschnitteinfahr-Vorsignal',
  'Abschnittausfahr-Vorsignal',
  'Ausfahr-Vorsignal',
  'Block-Vorsignal zu',
  'Einfahr-Vorsignal',
  'Vorsignal zu Spurwechsel',
] as const;

export const SIGNAL_ENUM = [
  ...VORSIGNAL_ENUM,
  'Wiederholungssignal',
  ...HAUPTSIGNAL_ENUM,
] as const;

export const SIGNAL_ABBREV: Record<string, string> = {
  'Abschnitt-Vorsignal': 'Abschn.-VS',
  'Abschnitteinfahr-Vorsignal': 'Abschn.einf.-VS',
  'Abschnittausfahr-Vorsignal': 'Abschn.ausf.-VS',
  'Ausfahr-Vorsignal': 'Ausf.-VS',
  'Block-Vorsignal zu': 'Block-VS',
  'Einfahr-Vorsignal': 'Einf.-VS',
  'Vorsignal zu Spurwechsel': 'VS Spurw.',
  'Wiederholungssignal': 'Wdh.signal',
  'Abschnittsignal': 'Abschn.sig.',
  'Abschnitteinfahrsignal': 'Abschn.einf.sig.',
  'Abschnittausfahrsignal': 'Abschn.ausf.sig.',
  'Ausfahrsignal': 'Ausf.sig.',
  'Blocksignal': 'Blocksig.',
  'Einfahrsignal': 'Einf.sig.',
  'Spurwechsel': 'Spurw.',
};

export const REQUIRES_NAME = [
  'Einfahrsignal',
  'Einfahr-Vorsignal',
  'Blocksignal',
  'Block-Vorsignal zu',
  'Spurwechsel',
  'Vorsignal zu Spurwechsel',
];

export const REQUIRES_BAHNHOF = ['Einfahr-Vorsignal'];

export const VORSIGNAL_TO_HAUPTSIGNAL: Record<string, { signal: string; keepName: boolean }> = {
  'Einfahr-Vorsignal': { signal: 'Einfahrsignal', keepName: true },
  'Abschnitteinfahr-Vorsignal': { signal: 'Abschnitteinfahrsignal', keepName: false },
  'Abschnittausfahr-Vorsignal': { signal: 'Abschnittausfahrsignal', keepName: false },
  'Abschnitt-Vorsignal': { signal: 'Abschnittsignal', keepName: false },
  'Ausfahr-Vorsignal': { signal: 'Ausfahrsignal', keepName: false },
  'Block-Vorsignal zu': { signal: 'Blocksignal', keepName: true },
  'Vorsignal zu Spurwechsel': { signal: 'Spurwechsel', keepName: true },
};

export const SIGNALTYPEN: [string, string][] = [
  ['Abschnitteinfahr', 'einfahrabschnitt'],
  ['Abschnittausfahr', 'ausfahrabschnitt'],
  ['Abschnitt', 'abschnitt'],
  ['Einfahr', 'einfahrt'],
  ['Ausfahr', 'ausfahrt'],
  ['Spurwechsel', 'spurwechsel'],
  ['Block', 'block'],
  ['Wiederholungs', 'wiederholung'],
];

export const MELDUNGEN: Record<string, string> = {
  einfahrabschnitt: 'Einfahrabschnitt offen/zu!',
  ausfahrabschnitt: 'Ausfahrabschnitt offen/zu!',
  abschnitt: 'Abschnitt offen/zu!',
  einfahrt: '{bahnhof} offen/zu!',
  ausfahrt: 'Ausfahrt offen/zu!',
  spurwechsel: 'Spurwechsel offen/zu!',
  block: 'Block offen/zu!',
  wiederholung: 'Wiederholung offen/zu!',
};

export const MELDUNG_FARBEN: Record<string, string> = {
  block: '#7b1fa2',
  spurwechsel: '#7b1fa2',
  ausfahrt: '#c62828',
  wiederholung: '#1565c0',
  standard: '#424242',
};

export const BAHNHOF_FARBEN = ['#2e7d32', '#f9a825'] as const;

export { STATIONEN } from './stationen';

// Reverse lookup: station name (lowercase) → code
import { STATIONEN as _ST } from './stationen';
export const STATION_BY_NAME: Record<string, string> = {};
export const STATION_NAMES: string[] = [];
for (const [code, name] of Object.entries(_ST)) {
  const key = name.toLowerCase();
  STATION_BY_NAME[key] = code;
  STATION_NAMES.push(key);
}

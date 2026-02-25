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
  'Abschnitt-Vorsignal': 'Abschnitt-VS',
  'Abschnitteinfahr-Vorsignal': 'Abschnitteinfahr-VS',
  'Abschnittausfahr-Vorsignal': 'Abschnittausfahr-VS',
  'Ausfahr-Vorsignal': 'Ausfahr-VS',
  'Block-Vorsignal zu': 'Block-VS zu',
  'Einfahr-Vorsignal': 'Einfahr-VS',
  'Vorsignal zu Spurwechsel': 'VS zu Spw.',
  'Wiederholungssignal': 'Wiederholungss.',
  'Abschnittsignal': 'Abschnitts.',
  'Abschnitteinfahrsignal': 'Abschnitteinfahrs.',
  'Abschnittausfahrsignal': 'Abschnittausfahrs.',
  'Ausfahrsignal': 'Ausfahrs.',
  'Blocksignal': 'Blocks.',
  'Einfahrsignal': 'Einfahrs.',
  'Spurwechsel': 'Spw.',
};

export const SIGNAL_SHORT: Record<string, string> = {
  'Einfahr-Vorsignal': 'EVS',
};

export const REQUIRES_NAME = [
  'Einfahrsignal',
  'Einfahr-Vorsignal',
  'Blocksignal',
  'Block-Vorsignal zu',
  'Spurwechsel',
  'Vorsignal zu Spurwechsel',
];

export const REQUIRES_STATION_SEARCH = ['Einfahrsignal', 'Einfahr-Vorsignal'];

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

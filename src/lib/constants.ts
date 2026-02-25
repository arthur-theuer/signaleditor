/** Default props for all lucide-svelte icons. Usage: <Icon {...ICON} /> */
export const ICON = { size: 16, strokeWidth: 1.5 } as const;

// Signal definitions — re-exported from the registry
export {
  HAUPTSIGNAL_ENUM,
  VORSIGNAL_ENUM,
  SIGNAL_ENUM,
  SIGNAL_ABBREV,
  SIGNAL_SHORT,
  REQUIRES_NAME,
  REQUIRES_STATION_SEARCH,
  REQUIRES_BAHNHOF,
  VORSIGNAL_TO_HAUPTSIGNAL,
  SIGNALTYPEN,
  MELDUNGEN,
} from './signals.config';

// Display colors — keyed by meldung type, not signal name
export const MELDUNG_FARBEN: Record<string, string> = {
  block: '#7b1fa2',
  spurwechsel: '#7b1fa2',
  ausfahrt: '#c62828',
  wiederholung: '#1565c0',
  standard: '#424242',
};

export const BAHNHOF_FARBEN = ['#2e7d32', '#f9a825'] as const;

export { STATIONEN } from './stationen';

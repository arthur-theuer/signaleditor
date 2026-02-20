export type Abzweigung = {
  seite: 'links' | 'rechts';
  strecke: string;
  von_nach: 'von' | 'nach';
  richtung: string;
};

export type Quelle = {
  datei: string;
  von?: string;
  bis?: string;
};

export type Signaleintrag = {
  id: number;
  km?: number;
  signal_1: string;
  signal_1b?: string;
  signal_2?: string;
  signal_2b?: string;
  bahnhof?: string;
};

export type Notizeintrag = {
  id: number;
  km?: number;
  notiz: string;
};

export type Knoteneintrag = {
  id: number;
  km?: number;
  knoten: string;
};

export type Abzweigungseintrag = {
  id: number;
  km?: number;
  abzweigung: Abzweigung;
};

export type Quelleneintrag = {
  id: number;
  km?: number;
  quelle: Quelle;
};

export type Eintrag =
  | Signaleintrag
  | Notizeintrag
  | Knoteneintrag
  | Abzweigungseintrag
  | Quelleneintrag;

// Type guards
export function isSignaleintrag(e: Eintrag): e is Signaleintrag {
  return 'signal_1' in e;
}

export function isNotizeintrag(e: Eintrag): e is Notizeintrag {
  return 'notiz' in e;
}

export function isKnoteneintrag(e: Eintrag): e is Knoteneintrag {
  return 'knoten' in e;
}

export function isAbzweigungseintrag(e: Eintrag): e is Abzweigungseintrag {
  return 'abzweigung' in e;
}

export function isQuelleneintrag(e: Eintrag): e is Quelleneintrag {
  return 'quelle' in e;
}

export type Strecke = {
  id: string;
  name: string;
  linie: string;
  streckenvideos: string[];
};

export type Editordaten = {
  strecke: Strecke;
  signale: Eintrag[];
};

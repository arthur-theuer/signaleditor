export type Abzweigung = {
  seite: 'links' | 'rechts';
  strecke: string;
  von_nach: 'von' | 'nach' | '';
  richtung: string;
};

export type Import = {
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

export type Importeintrag = {
  id: number;
  km?: number;
  import: Import;
};

export type Eintrag =
  | Signaleintrag
  | Notizeintrag
  | Knoteneintrag
  | Abzweigungseintrag
  | Importeintrag;

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

export function isImporteintrag(e: Eintrag): e is Importeintrag {
  return 'import' in e;
}

export type Dateityp = 'video' | 'strecke';

export type Videometa = {
  streckennummer: string;
  von: string;
  nach: string;
  name: string;
  video: string;
};

export type Streckenmeta = {
  linie: string;
  von: string;
  nach: string;
  via: string;
  name: string;
};

export type Videodaten = {
  typ: 'video';
  meta: Videometa;
  signale: Eintrag[];
};

export type Streckendaten = {
  typ: 'strecke';
  meta: Streckenmeta;
  signale: Eintrag[];
};

export type Editordaten = Videodaten | Streckendaten;

export function isVideodaten(d: Editordaten): d is Videodaten {
  return d.typ === 'video';
}

export function isStreckendaten(d: Editordaten): d is Streckendaten {
  return d.typ === 'strecke';
}

/** Derive the file ID from metadata */
export function dateiId(data: Editordaten): string {
  if (isVideodaten(data)) {
    const { streckennummer, von, nach } = data.meta;
    return [streckennummer, von, nach].filter(Boolean).join('_');
  }
  const { linie, von, nach } = data.meta;
  return [linie, von, nach].filter(Boolean).join('_');
}

export function emptyVideodaten(): Videodaten {
  return {
    typ: 'video',
    meta: { streckennummer: '', von: '', nach: '', name: '', video: '' },
    signale: [],
  };
}

export function emptyStreckendaten(): Streckendaten {
  return {
    typ: 'strecke',
    meta: { linie: '', von: '', nach: '', via: '', name: '' },
    signale: [],
  };
}

export type AbzweigungPfeil = '' | '<<' | '>>';

export type Abzweigung = {
  links: AbzweigungPfeil;
  rechts: AbzweigungPfeil;
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

export type Eintrag = Signaleintrag | Notizeintrag | Knoteneintrag | Abzweigungseintrag | Importeintrag;

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

export type Dateityp = 'strecke' | 'route';

export type StoragePrefix = 'strecken' | 'routen';

export type Streckenmeta = {
  strecke: string;
  von: string;
  nach: string;
  via: string;
  name: string;
};

export type Routenmeta = {
  linie: string;
  von: string;
  nach: string;
  via: string;
  name: string;
};

export type Streckendaten = {
  typ: 'strecke';
  meta: Streckenmeta;
  signale: Eintrag[];
};

export type Routendaten = {
  typ: 'route';
  meta: Routenmeta;
  signale: Eintrag[];
};

export type Editordaten = Streckendaten | Routendaten;

export function isStreckendaten(d: Editordaten): d is Streckendaten {
  return d.typ === 'strecke';
}

export function isRoutendaten(d: Editordaten): d is Routendaten {
  return d.typ === 'route';
}

/** Derive the file ID from metadata */
export function dateiId(data: Editordaten): string {
  const { von, nach, via } = data.meta;
  const key = isStreckendaten(data) ? data.meta.strecke.toLowerCase() : data.meta.linie;
  const base = [key, von, nach].filter(Boolean).join('_');
  const id = via ? `${base}_${via}` : base;
  return id.replace(/\s+/g, '_');
}

export function emptyStreckendaten(): Streckendaten {
  return {
    typ: 'strecke',
    meta: { strecke: '', von: '', nach: '', via: '', name: '' },
    signale: [],
  };
}

export function emptyRoutendaten(): Routendaten {
  return {
    typ: 'route',
    meta: { linie: '', von: '', nach: '', via: '', name: '' },
    signale: [],
  };
}

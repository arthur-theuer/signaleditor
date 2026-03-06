# Datenmodell

> **Terminologie-Änderung**: Was früher "Video" hiess, heisst jetzt **Strecke** (ein einzelnes
> Videosegment mit eigenen Signalen). Was früher "Strecke" hiess, heisst jetzt **Route**
> (zusammengesetzt aus Strecken-Importen + optionalen manuellen Signalen).

## Dateitypen

Zwei Dateitypen, festgelegt bei Erstellung:

- **Strecke** — ein einzelnes Videosegment mit eigenen Signalen. Gespeichert unter `strecken/`.
- **Route** — zusammengesetzt aus Strecken-Importen + optionalen manuellen Signalen. Gespeichert unter `routen/`.

## Typen

```typescript
type Dateityp = 'strecke' | 'route';

type Streckendaten = {
  typ: 'strecke';
  meta: Streckenmeta;
  signale: Eintrag[];
};

type Routendaten = {
  typ: 'route';
  meta: Routenmeta;
  signale: Eintrag[];  // hauptsächlich Importeinträge, kann manuelle Einträge enthalten
};

type Editordaten = Streckendaten | Routendaten;
```

### Streckenmeta

```typescript
type Streckenmeta = {
  strecke: string;       // z.B. "500", "112b" — Ziffern + Kleinbuchstaben a-z
  von: string;           // Stationscode, z.B. "OL"
  nach: string;          // Stationscode, z.B. "AA"
  via: string;           // z.B. "OL, LB" — Zwischenstationen, vom Benutzer eingetragen
  name: string;          // Anzeigename, z.B. "Olten → Aarau" — autogeneriert, überschreibbar
};
```

- **ID**: `${strecke}_${von}_${nach}` → `500_OL_AA`
- **Dateiname**: `strecken/500_OL_AA.yaml`
- **`name`**: Wird aus Stationsnamen von `von` und `nach` abgeleitet. Vom Benutzer überschreibbar.

### Routenmeta

```typescript
type Routenmeta = {
  linie: string;         // z.B. "s9" — Kleinbuchstaben
  von: string;           // Stationscode für Routenanfang
  nach: string;          // Stationscode für Routenende
  via: string;           // z.B. "OL, LB" — Zwischenstationen, vom Benutzer eingetragen
  name: string;          // z.B. "Uster → Zürich HB" — autogeneriert, überschreibbar
};
```

- **ID**: `${linie}_${von}_${nach}` → `s9_US_ZUE`
- **Dateiname**: `routen/s9_US_ZUE.yaml`
- **`name`**: Wird aus Stationsnamen von `von`, `via`-Stationen und `nach` abgeleitet. Vom Benutzer überschreibbar.

## Validierung

| Feld | Regel |
|------|-------|
| `strecke` | Nur Ziffern + Kleinbuchstaben a-z (`/^[0-9a-z]+$/`) |
| `von`, `nach`, `via`-Codes | Validiert gegen Stationsliste |
| `name` | `->` wird automatisch zu `→` korrigiert |
| `linie` | Kleinbuchstaben |

## YAML-Format

### Strecke

```yaml
typ: strecke
strecke: "500"
von: OL
nach: AA
name: "Olten → Aarau"
signale:
  - signal_1: Einfahrsignal A
    ...
```

### Route

```yaml
typ: route
linie: s9
von: US
nach: ZUE
via: "OL, LB"
name: "Uster → Zürich HB"
signale:
  - import: { datei: 500_OL_AA, von: OL, bis: LB }
  - signal_1: Blocksignal
    ...
```

## Backend-Speicherung

- Vercel Blob mit Präfixen `strecken/` und `routen/`
- Datei-Browser zeigt zwei Tabs: "Strecken" und "Routen"
- Dateityp wird bei Erstellung festgelegt und kann nicht geändert werden

## Modi

- **Lokaler Modus**: Dateien laden/speichern über lokales Dateisystem
- **Cloud-Modus**: Nach PIN-Anmeldung — Dateien werden auf Vercel Blob gespeichert, Auto-Save aktiv

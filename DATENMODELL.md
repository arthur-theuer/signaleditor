# Datenmodell

## Dateitypen

Zwei Dateitypen, festgelegt bei Erstellung:

- **Video** — ein einzelnes Videosegment mit eigenen Signalen. Gespeichert unter `videos/`.
- **Strecke** — zusammengesetzt aus Video-Importen + optionalen manuellen Signalen. Gespeichert unter `strecken/`.

## Typen

```typescript
type Dateityp = 'video' | 'strecke';

type Videodaten = {
  typ: 'video';
  meta: Videometa;
  signale: Eintrag[];
};

type Streckendaten = {
  typ: 'strecke';
  meta: Streckenmeta;
  signale: Eintrag[];  // hauptsächlich Importeinträge, kann manuelle Einträge enthalten
};

type Editordaten = Videodaten | Streckendaten;
```

### Videometa

```typescript
type Videometa = {
  streckennummer: string;  // z.B. "500", "112b" — Ziffern + Kleinbuchstaben a-z
  von: string;             // Stationscode, z.B. "OL"
  nach: string;            // Stationscode, z.B. "AA"
  name: string;            // Anzeigename, z.B. "Olten → Aarau" — autogeneriert, überschreibbar
  video: string;           // URL zum externen Video
};
```

- **ID**: `${streckennummer}_${von}_${nach}` → `500_OL_AA`
- **Dateiname**: `videos/500_OL_AA.yaml`
- **`name`**: Wird aus `KNOTEN[von]` und `KNOTEN[nach]` abgeleitet (z.B. "Olten → Aarau"). Vom Benutzer überschreibbar.

### Streckenmeta

```typescript
type Streckenmeta = {
  linie: string;           // z.B. "s9" — Kleinbuchstaben
  von: string;             // Stationscode für Routenanfang
  nach: string;            // Stationscode für Routenende
  via: string;             // z.B. "OL, LB" — Zwischenstationen, autogeneriert, überschreibbar
  name: string;            // z.B. "Uster → Zürich HB" — autogeneriert, überschreibbar
  // streckenvideos: zur Laufzeit aus Importeinträgen abgeleitet, nicht gespeichert
};
```

- **ID**: `${linie}_${von}_${nach}` → `s9_US_ZUE`
- **Dateiname**: `strecken/s9_US_ZUE.yaml`
- **`name`**: Wird aus `KNOTEN[von]`, `via`-Stationen und `KNOTEN[nach]` abgeleitet. Vom Benutzer überschreibbar.
- **`via`**: Wird aus Knoten-Einträgen in den Signalen autogeneriert. Vom Benutzer überschreibbar.
- **`streckenvideos`**: Nicht gespeichert. Wird zur Laufzeit aus `Importeintrag.import.datei`-Werten abgeleitet.

## Validierung

| Feld | Regel |
|------|-------|
| `streckennummer` | Nur Ziffern + Kleinbuchstaben a-z (`/^[0-9a-z]+$/`) |
| `von`, `nach`, `via`-Codes | Validiert gegen `KNOTEN`-Liste (wird auf 600+ Schweizer Stationen erweitert) |
| `name` | `->` wird automatisch zu `→` korrigiert |
| `video` | Keine Validierung, freies URL-Feld |
| `linie` | Kleinbuchstaben |

## YAML-Format

### Video

```yaml
typ: video
streckennummer: "500"
von: OL
nach: AA
name: "Olten → Aarau"
video: "https://example.com/video/500_OL_AA"
signale:
  - signal_1: Einfahrsignal A
    ...
```

### Strecke

```yaml
typ: strecke
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

- Vercel Blob mit Präfixen `videos/` und `strecken/` (ersetzt `signals/`)
- Datei-Browser zeigt zwei Tabs: "Videos" und "Strecken"
- Dateityp wird bei Erstellung festgelegt und kann nicht geändert werden

## Modi

- **Lokaler Modus**: Wie bisher — Dateien laden/speichern über lokales Dateisystem
- **Cloud-Modus**: Nach PIN-Anmeldung — Dateien werden auf Vercel Blob gespeichert, Auto-Save aktiv

import type {
  Editordaten,
  Eintrag,
  Import,
  Abzweigung,
  Dateityp,
} from './types';
import {
  isSignaleintrag,
  isNotizeintrag,
  isKnoteneintrag,
  isAbzweigungseintrag,
  isImporteintrag,
  isVideodaten,
  emptyVideodaten,
  emptyStreckendaten,
} from './types';

export function generateYAML(data: Editordaten): string {
  let yaml = `typ: ${data.typ}\n`;

  if (isVideodaten(data)) {
    const m = data.meta;
    yaml += `streckennummer: ${m.streckennummer}\n`;
    yaml += `von: ${m.von}\n`;
    yaml += `nach: ${m.nach}\n`;
    yaml += `via: ${m.via}\n`;
    yaml += `name: ${m.name}\n`;
    yaml += `video: ${m.video}\n`;
  } else {
    const m = data.meta;
    yaml += `linie: ${m.linie}\n`;
    yaml += `von: ${m.von}\n`;
    yaml += `nach: ${m.nach}\n`;
    yaml += `via: ${m.via}\n`;
    yaml += `name: ${m.name}\n`;
  }

  yaml += `\nsignale:\n`;

  data.signale.forEach((sig, idx) => {
    yaml += `  - id: ${sig.id}\n`;

    if (isNotizeintrag(sig)) {
      yaml += `    notiz: ${sig.notiz}\n`;
    } else if (isAbzweigungseintrag(sig)) {
      const abz = sig.abzweigung;
      const dirKey = abz.von_nach === 'von' ? 'von' : 'nach';
      yaml += `    abzweigung: { strecke: "${abz.strecke}", ${dirKey}: "${abz.richtung}", seite: "${abz.seite}" }\n`;
    } else if (isKnoteneintrag(sig)) {
      yaml += `    knoten: ${sig.knoten}\n`;
    } else if (isImporteintrag(sig)) {
      const q = sig.import;
      const parts = [`datei: ${q.datei}`];
      if (q.von) parts.push(`von: ${q.von}`);
      if (q.bis) parts.push(`bis: ${q.bis}`);
      yaml += `    import: { ${parts.join(', ')} }\n`;
    } else if (isSignaleintrag(sig)) {
      if (sig.signal_1) yaml += `    signal_1: ${sig.signal_1}\n`;
      if (sig.signal_1b) yaml += `    signal_1b: ${sig.signal_1b}\n`;
      if (sig.signal_2) yaml += `    signal_2: ${sig.signal_2}\n`;
      if (sig.signal_2b) yaml += `    signal_2b: ${sig.signal_2b}\n`;
      if (sig.bahnhof) yaml += `    bahnhof: ${sig.bahnhof}\n`;
    }

    if (sig.km !== undefined) yaml += `    km: ${sig.km}\n`;
    if (idx < data.signale.length - 1) yaml += '\n';
  });

  return yaml;
}

export function parseYAMLContent(content: string): Editordaten {
  const lines = content.split('\n');

  // Detect type from first non-empty, non-comment line
  let typ: Dateityp = 'video';
  const meta: Record<string, string> = {};
  let signaleStartIdx = 0;

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (trimmed === '' || trimmed.startsWith('#')) continue;
    if (trimmed === 'signale:') { signaleStartIdx = i + 1; break; }

    const match = trimmed.match(/^(\w+):\s*(.*)$/);
    if (match) {
      const [, key, value] = match;
      if (key === 'typ') typ = value === 'strecke' ? 'strecke' : 'video';
      else meta[key] = value;
    }
  }

  // Legacy format: if 'strecke:' section header found, parse old format
  if (content.includes('\nstrecke:\n') || content.startsWith('strecke:\n')) {
    return parseLegacyYAML(content);
  }

  const result: Editordaten = typ === 'video'
    ? {
        typ: 'video',
        meta: {
          streckennummer: meta['streckennummer'] || '',
          von: meta['von'] || '',
          nach: meta['nach'] || '',
          via: meta['via'] || '',
          name: meta['name'] || '',
          video: meta['video'] || '',
        },
        signale: [],
      }
    : {
        typ: 'strecke',
        meta: {
          linie: meta['linie'] || '',
          von: meta['von'] || '',
          nach: meta['nach'] || '',
          via: meta['via'] || '',
          name: meta['name'] || '',
        },
        signale: [],
      };

  let currentSignal: Record<string, any> | null = null;

  for (let i = signaleStartIdx; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (trimmed === '' || trimmed.startsWith('#')) continue;

    if (trimmed.startsWith('- id:')) {
      if (currentSignal) result.signale.push(currentSignal as Eintrag);
      currentSignal = { id: parseInt(trimmed.split(':')[1].trim()) || result.signale.length };
    } else if (currentSignal) {
      parseSignalField(trimmed, currentSignal);
    }
  }
  if (currentSignal) result.signale.push(currentSignal as Eintrag);
  return result;
}

function parseSignalField(trimmed: string, currentSignal: Record<string, any>): void {
  const importMatch = trimmed.match(/^import:\s*\{(.+)\}$/);
  const abzMatch = trimmed.match(/^abzweigung:\s*\{(.+)\}$/);

  if (importMatch) {
    const inner = importMatch[1];
    const dateiMatch = inner.match(/datei:\s*([^,}]+)/);
    const datei = dateiMatch ? dateiMatch[1].trim().replace(/"/g, '') : '';
    const imp: Import = { datei };
    const vonMatch = inner.match(/(?:^|,)\s*von:\s*([^,}]+)/);
    const bisMatch = inner.match(/(?:^|,)\s*bis:\s*([^,}]+)/);
    if (vonMatch) imp.von = vonMatch[1].trim().replace(/"/g, '');
    if (bisMatch) imp.bis = bisMatch[1].trim().replace(/"/g, '');
    currentSignal.import = imp;
  } else if (abzMatch) {
    const inner = abzMatch[1];
    const getVal = (key: string): string => {
      const m = inner.match(new RegExp(key + ':\\s*"([^"]*)"'));
      return m ? m[1] : '';
    };
    const vonVal = getVal('von');
    const nachVal = getVal('nach');
    const abzweigung: Abzweigung = {
      strecke: getVal('strecke'),
      richtung: vonVal || nachVal,
      von_nach: vonVal ? 'von' : (nachVal ? 'nach' : 'von'),
      seite: (getVal('seite') || 'links') as 'links' | 'rechts',
    };
    currentSignal.abzweigung = abzweigung;
  } else {
    const match = trimmed.match(/^(\w+):\s*(.*)$/);
    if (match) {
      const [, key, value] = match;
      if (key === 'knoten') currentSignal.knoten = value;
      else if (key === 'notiz') currentSignal.notiz = value;
      else if (key === 'signal_1') currentSignal.signal_1 = value;
      else if (key === 'signal_1b' && value) currentSignal.signal_1b = value;
      else if (key === 'signal_2') currentSignal.signal_2 = value;
      else if (key === 'signal_2b' && value) currentSignal.signal_2b = value;
      else if (key === 'bahnhof' && value) currentSignal.bahnhof = value;
      else if (key === 'km' && value) currentSignal.km = parseFloat(value);
    }
  }
}

/** Parse legacy YAML format with 'strecke:' section header */
function parseLegacyYAML(content: string): Editordaten {
  const lines = content.split('\n');
  const result = emptyStreckendaten();

  let currentSignal: Record<string, any> | null = null;
  let inStrecke = false;
  let inSignale = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed === '' || trimmed.startsWith('#')) continue;

    if (trimmed === 'strecke:') { inStrecke = true; inSignale = false; continue; }
    if (trimmed === 'signale:') { inSignale = true; inStrecke = false; continue; }

    if (inStrecke) {
      const match = trimmed.match(/^(\w+):\s*(.*)$/);
      if (match) {
        const [, key, value] = match;
        if (key === 'id') {
          // Try to extract linie, von, nach from legacy id like "s5_pf_zg"
          const parts = value.split('_');
          if (parts.length >= 3) {
            result.meta.linie = parts[0];
            result.meta.von = parts[1].toUpperCase();
            result.meta.nach = parts[parts.length - 1].toUpperCase();
          }
        }
        else if (key === 'name') result.meta.name = value;
        else if (key === 'linie') result.meta.linie = value;
      }
    }

    if (inSignale) {
      if (trimmed.startsWith('- id:')) {
        if (currentSignal) result.signale.push(currentSignal as Eintrag);
        currentSignal = { id: parseInt(trimmed.split(':')[1].trim()) || result.signale.length };
      } else if (currentSignal) {
        parseSignalField(trimmed, currentSignal);
      }
    }
  }
  if (currentSignal) result.signale.push(currentSignal as Eintrag);
  return result;
}

/** Extract embedded YAML from an HTML file's script tag */
export function extractYAMLFromHTML(html: string): string | null {
  const match = html.match(/<script type="application\/yaml" id="embedded-yaml">([\s\S]*?)<\/script>/);
  return match ? match[1].trim() : null;
}

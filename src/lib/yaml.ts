import type {
  Editordaten,
  Eintrag,
  Import,
  Abzweigung,
  AbzweigungPfeil,
  Dateityp,
} from './types';
import {
  isSignaleintrag,
  isNotizeintrag,
  isKnoteneintrag,
  isAbzweigungseintrag,
  isImporteintrag,
  isStreckendaten,
  emptyStreckendaten,
  emptyRoutendaten,
} from './types';

/** Quote a YAML string value if it contains characters that would break bare output */
function yamlStr(value: string): string {
  if (!value) return value;
  if (/[:#\[\]{}&*!|>'"%@`]/.test(value) || value !== value.trim() || /^\s*$/.test(value)) {
    return `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
  }
  return value;
}

export function generateYAML(data: Editordaten): string {
  let yaml = `typ: ${data.typ}\n`;

  if (isStreckendaten(data)) {
    const m = data.meta;
    yaml += `strecke: ${yamlStr(m.strecke)}\n`;
    yaml += `von: ${yamlStr(m.von)}\n`;
    yaml += `nach: ${yamlStr(m.nach)}\n`;
    yaml += `via: ${yamlStr(m.via)}\n`;
    yaml += `name: ${yamlStr(m.name)}\n`;
  } else {
    const m = data.meta;
    yaml += `linie: ${yamlStr(m.linie)}\n`;
    yaml += `von: ${yamlStr(m.von)}\n`;
    yaml += `nach: ${yamlStr(m.nach)}\n`;
    yaml += `via: ${yamlStr(m.via)}\n`;
    yaml += `name: ${yamlStr(m.name)}\n`;
  }

  yaml += `\nsignale:\n`;

  data.signale.forEach((sig, idx) => {
    yaml += `  - id: ${sig.id}\n`;

    if (isNotizeintrag(sig)) {
      yaml += `    notiz: ${yamlStr(sig.notiz)}\n`;
    } else if (isAbzweigungseintrag(sig)) {
      const abz = sig.abzweigung;
      const dirKey = abz.von_nach === 'von' ? 'von' : 'nach';
      const parts = [`strecke: "${abz.strecke}"`];
      if (abz.richtung) parts.push(`${dirKey}: "${abz.richtung}"`);
      if (abz.links) parts.push(`links: "${abz.links}"`);
      if (abz.rechts) parts.push(`rechts: "${abz.rechts}"`);
      yaml += `    abzweigung: { ${parts.join(', ')} }\n`;
    } else if (isKnoteneintrag(sig)) {
      yaml += `    knoten: ${yamlStr(sig.knoten)}\n`;
    } else if (isImporteintrag(sig)) {
      const q = sig.import;
      const parts = [`datei: ${q.datei}`];
      if (q.von) parts.push(`von: ${q.von}`);
      if (q.bis) parts.push(`bis: ${q.bis}`);
      yaml += `    import: { ${parts.join(', ')} }\n`;
    } else if (isSignaleintrag(sig)) {
      if (sig.signal_1) yaml += `    signal_1: ${yamlStr(sig.signal_1)}\n`;
      if (sig.signal_1b) yaml += `    signal_1b: ${yamlStr(sig.signal_1b)}\n`;
      if (sig.signal_2) yaml += `    signal_2: ${yamlStr(sig.signal_2)}\n`;
      if (sig.signal_2b) yaml += `    signal_2b: ${yamlStr(sig.signal_2b)}\n`;
      if (sig.bahnhof) yaml += `    bahnhof: ${yamlStr(sig.bahnhof)}\n`;
    }

    if (sig.km !== undefined) yaml += `    km: ${sig.km}\n`;
    if (idx < data.signale.length - 1) yaml += '\n';
  });

  return yaml;
}

/** Strip surrounding double quotes and unescape if present */
function unquoteYaml(value: string): string {
  if (value.startsWith('"') && value.endsWith('"')) {
    return value.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, '\\');
  }
  return value;
}

export function parseYAMLContent(content: string): Editordaten {
  const lines = content.split('\n');

  // Detect type from first non-empty, non-comment line
  let typ: Dateityp = 'strecke';
  const meta: Record<string, string> = {};
  let signaleStartIdx = 0;

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (trimmed === '' || trimmed.startsWith('#')) continue;
    if (trimmed === 'signale:') { signaleStartIdx = i + 1; break; }

    const match = trimmed.match(/^(\w+):\s*(.*)$/);
    if (match) {
      const [, key, value] = match;
      if (key === 'typ') typ = value === 'route' ? 'route' : 'strecke';
      else meta[key] = unquoteYaml(value);
    }
  }

  // Legacy format: if 'strecke:' section header found, parse old format
  if (content.includes('\nstrecke:\n') || content.startsWith('strecke:\n')) {
    return parseLegacyYAML(content);
  }

  const result: Editordaten = typ === 'strecke'
    ? {
        typ: 'strecke',
        meta: {
          strecke: meta['strecke'] || '',
          von: meta['von'] || '',
          nach: meta['nach'] || '',
          via: meta['via'] || '',
          name: meta['name'] || '',
        },
        signale: [],
      }
    : {
        typ: 'route',
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
    const linksVal = getVal('links') as AbzweigungPfeil;
    const rechtsVal = getVal('rechts') as AbzweigungPfeil;
    // Backward compatibility: convert old 'seite' field to new links/rechts
    const seiteVal = getVal('seite');
    let links: AbzweigungPfeil = linksVal || '';
    let rechts: AbzweigungPfeil = rechtsVal || '';
    if (seiteVal && !linksVal && !rechtsVal) {
      if (seiteVal === 'links') links = '<<';
      else if (seiteVal === 'rechts') rechts = '>>';
    }
    const abzweigung: Abzweigung = {
      strecke: getVal('strecke'),
      richtung: vonVal || nachVal,
      von_nach: vonVal ? 'von' : (nachVal ? 'nach' : ''),
      links,
      rechts,
    };
    currentSignal.abzweigung = abzweigung;
  } else {
    const match = trimmed.match(/^(\w+):\s*(.*)$/);
    if (match) {
      const [, key, rawValue] = match;
      const value = unquoteYaml(rawValue);
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
  const result = emptyRoutendaten();

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

import type {
  Editordaten,
  Eintrag,
  Quelle,
  Abzweigung,
} from './types';
import {
  isSignaleintrag,
  isNotizeintrag,
  isKnoteneintrag,
  isAbzweigungseintrag,
  isQuelleneintrag,
} from './types';

export function generateYAML(data: Editordaten): string {
  let yaml = `strecke:\n  id: ${data.strecke.id}\n  name: ${data.strecke.name}\n  linie: ${data.strecke.linie}\n  streckenvideos: [${data.strecke.streckenvideos.map(v => `"${v}"`).join(', ')}]\n\nsignale:\n`;

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
    } else if (isQuelleneintrag(sig)) {
      const q = sig.quelle;
      const parts = [`datei: ${q.datei}`];
      if (q.von) parts.push(`von: ${q.von}`);
      if (q.bis) parts.push(`bis: ${q.bis}`);
      yaml += `    quelle: { ${parts.join(', ')} }\n`;
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
  const result: Editordaten = {
    strecke: { id: '', name: '', linie: '', streckenvideos: [] },
    signale: [],
  };

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
        if (key === 'id') result.strecke.id = value;
        else if (key === 'name') result.strecke.name = value;
        else if (key === 'linie') result.strecke.linie = value;
        else if (key === 'streckenvideos') {
          const vids = value.match(/\[([^\]]*)\]/);
          if (vids) {
            result.strecke.streckenvideos = vids[1]
              .split(',')
              .map(v => v.trim().replace(/"/g, ''))
              .filter(v => v);
          }
        }
      }
    }

    if (inSignale) {
      if (trimmed.startsWith('- id:')) {
        if (currentSignal) result.signale.push(currentSignal as Eintrag);
        currentSignal = { id: parseInt(trimmed.split(':')[1].trim()) || result.signale.length };
      } else if (currentSignal) {
        const quelleMatch = trimmed.match(/^quelle:\s*\{(.+)\}$/);
        const abzMatch = trimmed.match(/^abzweigung:\s*\{(.+)\}$/);

        if (quelleMatch) {
          const inner = quelleMatch[1];
          const dateiMatch = inner.match(/datei:\s*([^,}]+)/);
          const datei = dateiMatch ? dateiMatch[1].trim().replace(/"/g, '') : '';
          const quelle: Quelle = { datei };
          const vonMatch = inner.match(/(?:^|,)\s*von:\s*([^,}]+)/);
          const bisMatch = inner.match(/(?:^|,)\s*bis:\s*([^,}]+)/);
          if (vonMatch) quelle.von = vonMatch[1].trim().replace(/"/g, '');
          if (bisMatch) quelle.bis = bisMatch[1].trim().replace(/"/g, '');
          currentSignal.quelle = quelle;
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

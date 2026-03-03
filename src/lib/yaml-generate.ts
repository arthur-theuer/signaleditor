import type { Editordaten } from './types';
import {
  isSignaleintrag,
  isNotizeintrag,
  isKnoteneintrag,
  isAbzweigungseintrag,
  isImporteintrag,
  isStreckendaten,
} from './types';

/** Quote a YAML string value if it contains characters that would break bare output */
function yamlStr(value: string): string {
  if (!value) return value;
  if (/[:#\[\]{}&*!|>'"% @`]/.test(value) || value !== value.trim() || /^\s*$/.test(value)) {
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

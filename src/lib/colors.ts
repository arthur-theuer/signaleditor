export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function parseHex(hex: string): [number, number, number] | null {
  hex = hex.replace(/^#/, '');
  if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  if (hex.length !== 6) return null;
  const n = parseInt(hex, 16);
  if (isNaN(n)) return null;
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function colorToLightBg(color: string): string {
  const rgb = parseHex(color);
  if (rgb) {
    const blend = (c: number) => Math.round(c * 0.15 + 255 * 0.85);
    return `rgb(${blend(rgb[0])}, ${blend(rgb[1])}, ${blend(rgb[2])})`;
  }
  return '#f5f5f5';
}

export function averageColors(colors: string[]): string {
  const rgbs = colors.map(parseHex).filter((c): c is [number, number, number] => c !== null);
  if (rgbs.length === 0) return '#333';
  const avg = rgbs.reduce(
    (acc, c) => [acc[0] + c[0], acc[1] + c[1], acc[2] + c[2]] as [number, number, number],
    [0, 0, 0] as [number, number, number],
  );
  return `rgb(${Math.round(avg[0] / rgbs.length)}, ${Math.round(avg[1] / rgbs.length)}, ${Math.round(avg[2] / rgbs.length)})`;
}

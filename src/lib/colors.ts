export function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

export function parseColorToRgb(color: string): [number, number, number] | null {
  const temp = document.createElement('div');
  temp.style.color = color;
  document.body.appendChild(temp);
  const computed = getComputedStyle(temp).color;
  document.body.removeChild(temp);
  const match = computed.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  return match ? [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])] : null;
}

export function colorToLightBg(color: string): string {
  const rgb = parseColorToRgb(color);
  if (rgb) {
    const blend = (c: number) => Math.round(c * 0.15 + 255 * 0.85);
    return `rgb(${blend(rgb[0])}, ${blend(rgb[1])}, ${blend(rgb[2])})`;
  }
  return '#f5f5f5';
}

export function averageColors(colors: string[]): string {
  const rgbs = colors.map(parseColorToRgb).filter((c): c is [number, number, number] => c !== null);
  if (rgbs.length === 0) return '#333';
  const avg = rgbs.reduce(
    (acc, c) => [acc[0] + c[0], acc[1] + c[1], acc[2] + c[2]] as [number, number, number],
    [0, 0, 0] as [number, number, number],
  );
  return `rgb(${Math.round(avg[0] / rgbs.length)}, ${Math.round(avg[1] / rgbs.length)}, ${Math.round(avg[2] / rgbs.length)})`;
}

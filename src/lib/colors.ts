const lightPalette = [
  '#2563eb',
  '#4f46e5',
  '#7c3aed',
  '#c026d3',
  '#db2777',
  '#dc2626',
  '#ea580c',
  '#ca8a04',
  '#15803d',
  '#0369a1',
];

const darkPalette = [
  '#60a5fa',
  '#818cf8',
  '#a78bfa',
  '#e879f9',
  '#f472b6',
  '#f87171',
  '#fb923c',
  '#fbbf24',
  '#4ade80',
  '#38bdf8',
];

function hashStringToInt(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) {
    h = (h * 33) ^ s.charCodeAt(i);
  }
  return h >>> 0;
}

export function colorForId(id: string, isDark: boolean = false): string {
  const palette = isDark ? darkPalette : lightPalette;
  return palette[hashStringToInt(id) % palette.length];
}

export function pickInitialColor(): string {
  return lightPalette[Math.floor(Math.random() * lightPalette.length)];
}

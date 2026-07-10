export type RGB = [number, number, number];

export function hexToRgb(hex: string): RGB {
  const hexPattern = /^#([0-9A-F]{2})([0-9A-F]{2})([0-9A-F]{2})$/i;
  const match = hexPattern.exec(hex);
  if (!match) {
    throw new Error(`Invalid hex string ${hex}`);
  }
  const r = parseInt(match[1], 16);
  const g = parseInt(match[2], 16);
  const b = parseInt(match[3], 16);

  return [r, g, b];
}

export function luminance(color: RGB): number {
  const RED = 0.2126;
  const GREEN = 0.7152;
  const BLUE = 0.0722;
  const GAMMA = 2.4;

  const a = color.map(v => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, GAMMA);
  });
  return a[0] * RED + a[1] * GREEN + a[2] * BLUE;
}

export function contrastRatio(luminance1: number, luminance2: number): number {
  const brightest = Math.max(luminance1, luminance2);
  const darkest = Math.min(luminance1, luminance2);
  return (brightest + 0.05) / (darkest + 0.05);
}

export const DIST_COLORS: readonly string[] = [
  "var(--color-rose)",
  "var(--color-rose)",
  "var(--color-amber)",
  "var(--color-sage)",
  "var(--color-sage)",
];

export function ratingColor(r: number): string {
  if (r >= 4) return DIST_COLORS[4];
  if (r >= 3) return DIST_COLORS[2];
  return DIST_COLORS[1];
}

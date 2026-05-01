import type { PaletteColor } from "../types";

interface Rgb {
  r: number;
  g: number;
  b: number;
}

interface Lab {
  l: number;
  a: number;
  b: number;
}

export function hexToRgb(hex: string): Rgb {
  const value = hex.replace("#", "");
  return {
    r: Number.parseInt(value.slice(0, 2), 16),
    g: Number.parseInt(value.slice(2, 4), 16),
    b: Number.parseInt(value.slice(4, 6), 16),
  };
}

function pivotRgb(channel: number) {
  const normalized = channel / 255;
  return normalized > 0.04045
    ? Math.pow((normalized + 0.055) / 1.055, 2.4)
    : normalized / 12.92;
}

function pivotXyz(value: number) {
  return value > 0.008856 ? Math.cbrt(value) : 7.787 * value + 16 / 116;
}

export function rgbToLab(rgb: Rgb): Lab {
  const r = pivotRgb(rgb.r);
  const g = pivotRgb(rgb.g);
  const b = pivotRgb(rgb.b);

  const x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047;
  const y = (r * 0.2126 + g * 0.7152 + b * 0.0722) / 1;
  const z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883;

  const fx = pivotXyz(x);
  const fy = pivotXyz(y);
  const fz = pivotXyz(z);

  return {
    l: 116 * fy - 16,
    a: 500 * (fx - fy),
    b: 200 * (fy - fz),
  };
}

function deltaE(a: Lab, b: Lab) {
  return Math.sqrt(
    Math.pow(a.l - b.l, 2) + Math.pow(a.a - b.a, 2) + Math.pow(a.b - b.b, 2),
  );
}

export function findNearestColor(rgb: Rgb, palette: PaletteColor[]): PaletteColor {
  const lab = rgbToLab(rgb);
  let best = palette[0];
  let bestScore = Number.POSITIVE_INFINITY;

  for (const color of palette) {
    const score = deltaE(lab, rgbToLab(hexToRgb(color.hex)));
    if (score < bestScore) {
      best = color;
      bestScore = score;
    }
  }

  return best;
}

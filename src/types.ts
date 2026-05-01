export type Brand = "Perler" | "Hama" | "Artkal";

export interface PaletteColor {
  id: string;
  brand: Brand;
  code: string;
  name: string;
  hex: string;
  symbol: string;
}

export interface PatternCell {
  x: number;
  y: number;
  paletteColorId: string | null;
}

export interface MaterialItem {
  paletteColorId: string;
  count: number;
}

export interface GeneratedPattern {
  width: number;
  height: number;
  brand: Brand;
  cells: PatternCell[];
  materials: MaterialItem[];
}

export interface GalleryWork {
  id: string;
  title: string;
  sourcePreview: string;
  patternPreview: string;
  brand: Brand;
  beadCount: number;
}

import type { Brand, PaletteColor } from "../types";

const symbols = "ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789@#$%&*+=?";

function color(brand: Brand, code: string, name: string, hex: string, index: number): PaletteColor {
  return {
    id: `${brand}-${code}`,
    brand,
    code,
    name,
    hex,
    symbol: symbols[index % symbols.length],
  };
}

export const palettes: Record<Brand, PaletteColor[]> = {
  Perler: [
    color("Perler", "80-19001", "White", "#f8f7ef", 0),
    color("Perler", "80-19018", "Black", "#1b1b1f", 1),
    color("Perler", "80-19017", "Gray", "#8d8d91", 2),
    color("Perler", "80-19092", "Dark Gray", "#4f5157", 3),
    color("Perler", "80-19005", "Red", "#c83436", 4),
    color("Perler", "80-15241", "Tomato", "#e24b3d", 5),
    color("Perler", "80-19004", "Orange", "#ef7a23", 6),
    color("Perler", "80-19090", "Butterscotch", "#d4932e", 7),
    color("Perler", "80-19003", "Yellow", "#f5d94d", 8),
    color("Perler", "80-19080", "Bright Green", "#73bf44", 9),
    color("Perler", "80-19011", "Light Green", "#a6d66d", 10),
    color("Perler", "80-19010", "Dark Green", "#246641", 11),
    color("Perler", "80-15218", "Teal", "#0d8792", 12),
    color("Perler", "80-19062", "Turquoise", "#31aebe", 13),
    color("Perler", "80-19009", "Light Blue", "#78b7df", 14),
    color("Perler", "80-19008", "Dark Blue", "#254b8f", 15),
    color("Perler", "80-15200", "Cobalt", "#1f63b4", 16),
    color("Perler", "80-19007", "Purple", "#7142a8", 17),
    color("Perler", "80-19054", "Pastel Lavender", "#baa1d6", 18),
    color("Perler", "80-19083", "Pink", "#f3a3bd", 19),
    color("Perler", "80-19006", "Magenta", "#c83786", 20),
    color("Perler", "80-19012", "Brown", "#6c432d", 21),
    color("Perler", "80-19021", "Light Brown", "#b0754b", 22),
    color("Perler", "80-19035", "Tan", "#d4b488", 23),
  ],
  Hama: [
    color("Hama", "01", "White", "#f7f4ea", 0),
    color("Hama", "18", "Black", "#1d1d1e", 1),
    color("Hama", "17", "Grey", "#8b8d90", 2),
    color("Hama", "70", "Dark Grey", "#51545a", 3),
    color("Hama", "05", "Red", "#cf2e37", 4),
    color("Hama", "22", "Burgundy", "#8d2634", 5),
    color("Hama", "04", "Orange", "#ef7c2d", 6),
    color("Hama", "60", "Apricot", "#f0a05f", 7),
    color("Hama", "03", "Yellow", "#f4d64e", 8),
    color("Hama", "10", "Green", "#3b9d48", 9),
    color("Hama", "11", "Light Green", "#8ac95a", 10),
    color("Hama", "28", "Dark Green", "#215c43", 11),
    color("Hama", "31", "Turquoise", "#34aeb7", 12),
    color("Hama", "09", "Light Blue", "#82bcde", 13),
    color("Hama", "08", "Blue", "#2464a7", 14),
    color("Hama", "21", "Light Brown", "#b77b48", 15),
    color("Hama", "12", "Brown", "#664331", 16),
    color("Hama", "07", "Purple", "#7044a7", 17),
    color("Hama", "45", "Pastel Purple", "#b7a1d5", 18),
    color("Hama", "06", "Pink", "#f2a1ba", 19),
    color("Hama", "33", "Cerise", "#ca3c86", 20),
    color("Hama", "02", "Cream", "#eadbb9", 21),
    color("Hama", "27", "Beige", "#d6b78e", 22),
    color("Hama", "44", "Pastel Yellow", "#f3e79c", 23),
  ],
  Artkal: [
    color("Artkal", "S01", "White", "#f8f6eb", 0),
    color("Artkal", "S18", "Black", "#1a1a1d", 1),
    color("Artkal", "S17", "Grey", "#8b8c90", 2),
    color("Artkal", "S70", "Dark Grey", "#4d5056", 3),
    color("Artkal", "S05", "Red", "#cd3036", 4),
    color("Artkal", "S75", "Tomato", "#e44c39", 5),
    color("Artkal", "S04", "Orange", "#f08125", 6),
    color("Artkal", "S61", "Gold", "#d99a2c", 7),
    color("Artkal", "S03", "Yellow", "#f5db4d", 8),
    color("Artkal", "S10", "Green", "#3fa049", 9),
    color("Artkal", "S11", "Light Green", "#9ed36a", 10),
    color("Artkal", "S28", "Dark Green", "#245f43", 11),
    color("Artkal", "S31", "Turquoise", "#2faeb9", 12),
    color("Artkal", "S09", "Light Blue", "#83bee0", 13),
    color("Artkal", "S08", "Blue", "#2662a8", 14),
    color("Artkal", "S83", "Royal Blue", "#223f88", 15),
    color("Artkal", "S07", "Purple", "#7240a5", 16),
    color("Artkal", "S45", "Lavender", "#baa4d6", 17),
    color("Artkal", "S06", "Pink", "#f2a2bc", 18),
    color("Artkal", "S33", "Magenta", "#c93a85", 19),
    color("Artkal", "S12", "Brown", "#67432f", 20),
    color("Artkal", "S21", "Light Brown", "#b57a4a", 21),
    color("Artkal", "S27", "Tan", "#d5b78c", 22),
    color("Artkal", "S02", "Cream", "#eadcb8", 23),
  ],
};

export const brands = Object.keys(palettes) as Brand[];

export function getPaletteMap(brand: Brand) {
  return new Map(palettes[brand].map((entry) => [entry.id, entry]));
}

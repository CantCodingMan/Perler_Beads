import { jsPDF } from "jspdf";
import { palettes } from "../data/palettes";
import type { Brand, GeneratedPattern, MaterialItem, PaletteColor, PatternCell } from "../types";
import { findNearestColor } from "./color";

export async function loadImage(file: File): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(file);
  const image = new Image();
  image.decoding = "async";
  image.src = url;
  await image.decode();
  return image;
}

export function generatePatternFromImage(
  image: HTMLImageElement,
  brand: Brand,
  targetWidth: number,
): GeneratedPattern {
  const width = Math.max(16, Math.min(96, Math.round(targetWidth)));
  const height = Math.max(1, Math.round((image.naturalHeight / image.naturalWidth) * width));
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d", { willReadFrequently: true });

  if (!context) {
    throw new Error("当前浏览器无法创建 Canvas。");
  }

  canvas.width = width;
  canvas.height = height;
  context.imageSmoothingEnabled = false;
  context.clearRect(0, 0, width, height);
  context.drawImage(image, 0, 0, width, height);

  const pixels = context.getImageData(0, 0, width, height).data;
  const backgroundMask = createBackgroundMask(pixels, width, height);
  const cells: PatternCell[] = [];
  const materialMap = new Map<string, number>();
  const palette = palettes[brand];

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const offset = (y * width + x) * 4;
      const alpha = pixels[offset + 3];
      if (alpha < 24 || backgroundMask[y * width + x]) {
        cells.push({ x, y, paletteColorId: null });
        continue;
      }

      const match = findNearestColor(
        {
          r: pixels[offset],
          g: pixels[offset + 1],
          b: pixels[offset + 2],
        },
        palette,
      );
      cells.push({ x, y, paletteColorId: match.id });
      materialMap.set(match.id, (materialMap.get(match.id) ?? 0) + 1);
    }
  }

  const materials: MaterialItem[] = Array.from(materialMap.entries())
    .map(([paletteColorId, count]) => ({ paletteColorId, count }))
    .sort((a, b) => b.count - a.count);

  return { width, height, brand, cells, materials };
}

interface DrawOptions {
  cellSize?: number;
  showSymbols?: boolean;
  margin?: number;
  background?: string;
}

export function drawPatternToCanvas(
  pattern: GeneratedPattern,
  paletteMap: Map<string, PaletteColor>,
  options: DrawOptions = {},
): HTMLCanvasElement {
  const cellSize = options.cellSize ?? 24;
  const margin = options.margin ?? 32;
  const showSymbols = options.showSymbols ?? true;
  const background = options.background ?? "#ffffff";
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("当前浏览器无法创建图纸 Canvas。");
  }

  canvas.width = pattern.width * cellSize + margin * 2;
  canvas.height = pattern.height * cellSize + margin * 2;
  context.fillStyle = background;
  context.fillRect(0, 0, canvas.width, canvas.height);

  for (const cell of pattern.cells) {
    const x = margin + cell.x * cellSize;
    const y = margin + cell.y * cellSize;

    if (cell.paletteColorId) {
      const color = paletteMap.get(cell.paletteColorId);
      context.fillStyle = color?.hex ?? "#ffffff";
      context.fillRect(x, y, cellSize, cellSize);

      if (showSymbols && color && cellSize >= 13) {
        context.fillStyle = readableTextColor(color.hex);
        context.font = `700 ${Math.max(9, Math.floor(cellSize * 0.44))}px Arial`;
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillText(color.symbol, x + cellSize / 2, y + cellSize / 2 + 0.5);
      }
    }

    context.strokeStyle = "rgba(17, 24, 39, 0.22)";
    context.lineWidth = 1;
    context.strokeRect(x + 0.5, y + 0.5, cellSize, cellSize);
  }

  context.strokeStyle = "#111827";
  context.lineWidth = 2;
  context.strokeRect(margin, margin, pattern.width * cellSize, pattern.height * cellSize);

  return canvas;
}

export function downloadCanvas(canvas: HTMLCanvasElement, filename: string) {
  const link = document.createElement("a");
  link.download = filename;
  link.href = canvas.toDataURL("image/png");
  link.click();
}

export function downloadPatternPng(pattern: GeneratedPattern, paletteMap: Map<string, PaletteColor>) {
  const canvas = drawPatternToCanvas(pattern, paletteMap, { cellSize: 28, margin: 36 });
  downloadCanvas(canvas, "perler-beads-pattern.png");
}

export function downloadPatternPdf(pattern: GeneratedPattern, paletteMap: Map<string, PaletteColor>) {
  const canvas = drawPatternToCanvas(pattern, paletteMap, { cellSize: 24, margin: 28 });
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const imageWidth = pageWidth - 24;
  const imageHeight = (canvas.height / canvas.width) * imageWidth;
  let y = 12;

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(16);
  pdf.text("Perler Beads Pattern", 12, y);
  y += 7;
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);
  pdf.text(`${pattern.brand} palette | ${pattern.width} x ${pattern.height} grid | ${totalBeads(pattern)} beads`, 12, y);
  y += 6;
  pdf.addImage(canvas.toDataURL("image/png"), "PNG", 12, y, imageWidth, Math.min(imageHeight, 165));
  y += Math.min(imageHeight, 165) + 8;

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(13);
  pdf.text("Material List", 12, y);
  y += 7;
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);

  for (const item of pattern.materials) {
    const color = paletteMap.get(item.paletteColorId);
    if (!color) continue;
    if (y > pageHeight - 16) {
      pdf.addPage();
      y = 14;
    }
    pdf.setFillColor(color.hex);
    pdf.rect(12, y - 4, 4, 4, "F");
    pdf.text(`${color.symbol}  ${color.code}  ${color.name}  x ${item.count}`, 20, y);
    y += 5;
  }

  pdf.save("perler-beads-pattern.pdf");
}

export function totalBeads(pattern: GeneratedPattern) {
  return pattern.materials.reduce((sum, item) => sum + item.count, 0);
}

function readableTextColor(hex: string) {
  const value = hex.replace("#", "");
  const r = Number.parseInt(value.slice(0, 2), 16);
  const g = Number.parseInt(value.slice(2, 4), 16);
  const b = Number.parseInt(value.slice(4, 6), 16);
  return r * 0.299 + g * 0.587 + b * 0.114 > 165 ? "#111827" : "#ffffff";
}

function createBackgroundMask(pixels: Uint8ClampedArray, width: number, height: number) {
  const mask = new Uint8Array(width * height);
  const visited = new Uint8Array(width * height);
  const samples = collectEdgeSamples(pixels, width, height);
  const background = averageColor(samples);
  const queue: number[] = [];

  for (let x = 0; x < width; x += 1) {
    pushIfBackground(x, 0);
    pushIfBackground(x, height - 1);
  }
  for (let y = 1; y < height - 1; y += 1) {
    pushIfBackground(0, y);
    pushIfBackground(width - 1, y);
  }

  while (queue.length > 0) {
    const current = queue.shift()!;
    const x = current % width;
    const y = Math.floor(current / width);
    pushIfBackground(x + 1, y);
    pushIfBackground(x - 1, y);
    pushIfBackground(x, y + 1);
    pushIfBackground(x, y - 1);
  }

  return mask;

  function pushIfBackground(x: number, y: number) {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    const index = y * width + x;
    if (visited[index]) return;
    visited[index] = 1;
    if (!isLikelyBackground(pixels, index * 4, background)) return;
    mask[index] = 1;
    queue.push(index);
  }
}

function collectEdgeSamples(pixels: Uint8ClampedArray, width: number, height: number) {
  const samples: Array<[number, number, number]> = [];
  for (let x = 0; x < width; x += 1) {
    addSample(x, 0);
    addSample(x, height - 1);
  }
  for (let y = 0; y < height; y += 1) {
    addSample(0, y);
    addSample(width - 1, y);
  }
  return samples;

  function addSample(x: number, y: number) {
    const offset = (y * width + x) * 4;
    if (pixels[offset + 3] < 24) return;
    samples.push([pixels[offset], pixels[offset + 1], pixels[offset + 2]]);
  }
}

function averageColor(samples: Array<[number, number, number]>) {
  if (samples.length === 0) return { r: 255, g: 255, b: 255 };
  const total = samples.reduce(
    (sum, color) => ({
      r: sum.r + color[0],
      g: sum.g + color[1],
      b: sum.b + color[2],
    }),
    { r: 0, g: 0, b: 0 },
  );
  return {
    r: total.r / samples.length,
    g: total.g / samples.length,
    b: total.b / samples.length,
  };
}

function isLikelyBackground(
  pixels: Uint8ClampedArray,
  offset: number,
  background: { r: number; g: number; b: number },
) {
  const alpha = pixels[offset + 3];
  if (alpha < 24) return true;

  const r = pixels[offset];
  const g = pixels[offset + 1];
  const b = pixels[offset + 2];
  const whiteish = r > 232 && g > 232 && b > 232 && Math.max(r, g, b) - Math.min(r, g, b) < 24;
  const lightGray = r > 220 && g > 220 && b > 220 && Math.max(r, g, b) - Math.min(r, g, b) < 16;
  const distance = Math.sqrt(
    Math.pow(r - background.r, 2) + Math.pow(g - background.g, 2) + Math.pow(b - background.b, 2),
  );

  return whiteish || lightGray || distance < 44;
}

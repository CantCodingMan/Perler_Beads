import type { Brand, GalleryWork } from "../types";
import { getPaletteMap } from "../data/palettes";
import { drawPatternToCanvas, generatePatternFromImage, totalBeads } from "./pattern";

interface GallerySource {
  title: string;
  brand: Brand;
  src: string;
  width: number;
}

const sources: GallerySource[] = [
  { title: "真实灰猫", brand: "Perler", src: "/gallery/cat-gray.jpg", width: 42 },
  { title: "白底小猫", brand: "Hama", src: "/gallery/cat-white.jpg", width: 40 },
  { title: "真实小狗", brand: "Artkal", src: "/gallery/dog-puppy.jpg", width: 40 },
  { title: "拉布拉多", brand: "Perler", src: "/gallery/dog-labrador.jpg", width: 42 },
  { title: "单棵树", brand: "Hama", src: "/gallery/tree-transparent.png", width: 38 },
  { title: "白底扶郎花", brand: "Artkal", src: "/gallery/flower-gerbera.jpg", width: 42 },
  { title: "黄色花朵", brand: "Perler", src: "/gallery/flower-yellow.jpg", width: 42 },
  { title: "灰猫小幅", brand: "Hama", src: "/gallery/cat-gray.jpg", width: 34 },
  { title: "小狗小幅", brand: "Artkal", src: "/gallery/dog-puppy.jpg", width: 34 },
  { title: "树木小幅", brand: "Perler", src: "/gallery/tree-transparent.png", width: 32 },
  { title: "花朵小幅", brand: "Hama", src: "/gallery/flower-gerbera.jpg", width: 34 },
  { title: "黄色花小幅", brand: "Artkal", src: "/gallery/flower-yellow.jpg", width: 34 },
  { title: "白猫中幅", brand: "Perler", src: "/gallery/cat-white.jpg", width: 46 },
  { title: "小狗中幅", brand: "Hama", src: "/gallery/dog-puppy.jpg", width: 46 },
  { title: "树木中幅", brand: "Artkal", src: "/gallery/tree-transparent.png", width: 44 },
  { title: "扶郎花中幅", brand: "Perler", src: "/gallery/flower-gerbera.jpg", width: 46 },
  { title: "灰猫大幅", brand: "Hama", src: "/gallery/cat-gray.jpg", width: 50 },
  { title: "拉布拉多大幅", brand: "Artkal", src: "/gallery/dog-labrador.jpg", width: 50 },
  { title: "单棵树大幅", brand: "Perler", src: "/gallery/tree-transparent.png", width: 48 },
  { title: "花朵大幅", brand: "Hama", src: "/gallery/flower-yellow.jpg", width: 48 },
];

export async function createGalleryWorks(): Promise<GalleryWork[]> {
  return Promise.all(
    sources.map(async (source, index) => {
      const image = await loadGalleryImage(source.src);
      const pattern = generatePatternFromImage(image, source.brand, source.width);
      const paletteMap = getPaletteMap(source.brand);
      const patternPreview = drawPatternToCanvas(pattern, paletteMap, {
        cellSize: source.width >= 46 ? 9 : 10,
        margin: 18,
        showSymbols: true,
        background: "#ffffff",
      }).toDataURL("image/png");

      return {
        id: `gallery-${index + 1}`,
        title: source.title,
        sourcePreview: source.src,
        patternPreview,
        brand: source.brand,
        beadCount: totalBeads(pattern),
      };
    }),
  );
}

function loadGalleryImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.decoding = "async";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`无法加载作品广场图片：${src}`));
    image.src = src;
  });
}

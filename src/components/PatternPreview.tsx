import { useEffect, useRef } from "react";
import type { GeneratedPattern, PaletteColor } from "../types";
import { drawPatternToCanvas } from "../lib/pattern";

interface PatternPreviewProps {
  pattern: GeneratedPattern;
  paletteMap: Map<string, PaletteColor>;
}

export function PatternPreview({ pattern, paletteMap }: PatternPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const cellSize = pattern.width > 72 ? 12 : pattern.width > 52 ? 15 : 19;
    const rendered = drawPatternToCanvas(pattern, paletteMap, {
      cellSize,
      margin: 18,
      showSymbols: pattern.width <= 64,
      background: "#ffffff",
    });
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    canvas.width = rendered.width;
    canvas.height = rendered.height;
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(rendered, 0, 0);
  }, [paletteMap, pattern]);

  return <canvas className="pattern-canvas" ref={canvasRef} aria-label="拼豆图纸预览" />;
}

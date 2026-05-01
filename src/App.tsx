import { useEffect, useMemo, useRef, useState } from "react";
import {
  Download,
  FileImage,
  Grid3X3,
  Home,
  ImageUp,
  Sparkles,
  Upload,
} from "lucide-react";
import { brands, getPaletteMap, palettes } from "./data/palettes";
import { createGalleryWorks } from "./lib/gallery";
import {
  downloadPatternPdf,
  downloadPatternPng,
  generatePatternFromImage,
  loadImage,
  totalBeads,
} from "./lib/pattern";
import { PatternPreview } from "./components/PatternPreview";
import type { Brand, GalleryWork, GeneratedPattern } from "./types";

type View = "home" | "editor" | "gallery";

function App() {
  const [view, setView] = useState<View>("home");
  const [brand, setBrand] = useState<Brand>("Perler");
  const [gridWidth, setGridWidth] = useState(48);
  const [sourceImage, setSourceImage] = useState<HTMLImageElement | null>(null);
  const [sourceUrl, setSourceUrl] = useState("");
  const [pattern, setPattern] = useState<GeneratedPattern | null>(null);
  const [gallery, setGallery] = useState<GalleryWork[]>([]);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const paletteMap = useMemo(() => getPaletteMap(brand), [brand]);

  useEffect(() => {
    if (!sourceImage) return;
    setPattern(generatePatternFromImage(sourceImage, brand, gridWidth));
  }, [brand, gridWidth, sourceImage]);

  useEffect(() => {
    let mounted = true;
    createGalleryWorks()
      .then((works) => {
        if (mounted) setGallery(works);
      })
      .catch(() => {
        if (mounted) setGallery([]);
      });
    return () => {
      mounted = false;
    };
  }, []);

  async function handleFile(file?: File) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("请选择 PNG、JPG、WebP 等图片文件。");
      return;
    }
    setError("");
    const image = await loadImage(file);
    setSourceImage(image);
    setSourceUrl(image.src);
    setView("editor");
    setPattern(generatePatternFromImage(image, brand, gridWidth));
  }

  return (
    <div className="app-shell">
      <aside className="rail" aria-label="主要导航">
        <button className={view === "home" ? "active" : ""} onClick={() => setView("home")} title="首页">
          <Home size={22} />
        </button>
        <button className={view === "editor" ? "active" : ""} onClick={() => setView("editor")} title="上传照片">
          <ImageUp size={22} />
        </button>
        <button className={view === "gallery" ? "active" : ""} onClick={() => setView("gallery")} title="作品广场">
          <Grid3X3 size={22} />
        </button>
      </aside>

      <div className="page">
        <header className="topbar">
          <button className="brand-button" onClick={() => setView("home")}>
            <Sparkles size={28} />
            <span>轻松拼豆</span>
          </button>
        </header>

        {view === "home" && (
          <main className="home-view">
            <section className="hero">
              <p className="eyebrow">Pixel Beads Pattern Maker</p>
              <h1>
                释放创造力，轻松设计
                <span>专属拼豆图纸</span>
              </h1>
              <p className="hero-copy">
                上传照片，自动匹配真实拼豆品牌色盘，生成带网格、色号和材料清单的可下载图纸。
              </p>
              <div className="hero-actions">
                <button className="primary-action" onClick={() => fileInputRef.current?.click()}>
                  <Upload size={20} />
                  上传照片
                </button>
                <button className="secondary-action" onClick={() => setView("gallery")}>
                  浏览作品广场
                </button>
              </div>
            </section>

            <section className="quick-panel">
              <div>
                <span>当前支持</span>
                <strong>Perler / Hama / Artkal 基础色盘</strong>
              </div>
              <div>
                <span>输出内容</span>
                <strong>PNG 图纸、PDF 图纸、材料需求清单</strong>
              </div>
              <div>
                <span>运行方式</span>
                <strong>纯浏览器本地处理</strong>
              </div>
            </section>
          </main>
        )}

        {view === "editor" && (
          <main className="workspace">
            <section className="tool-panel">
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">Editor</p>
                  <h2>上传并生成图纸</h2>
                </div>
                <button className="primary-action compact" onClick={() => fileInputRef.current?.click()}>
                  <Upload size={18} />
                  选择图片
                </button>
              </div>

              <label
                className="dropzone"
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault();
                  void handleFile(event.dataTransfer.files[0]);
                }}
              >
                <FileImage size={34} />
                <strong>{sourceImage ? "重新拖入图片或点击选择" : "拖入图片，或点击上传本地图片"}</strong>
                <span>支持透明 PNG；透明区域不会计入拼豆数量。</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(event) => void handleFile(event.target.files?.[0])}
                />
              </label>
              {error && <p className="error-text">{error}</p>}

              <div className="controls">
                <label>
                  品牌色盘
                  <select value={brand} onChange={(event) => setBrand(event.target.value as Brand)}>
                    {brands.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  图纸宽度：{gridWidth} 格
                  <input
                    type="range"
                    min="16"
                    max="96"
                    value={gridWidth}
                    onChange={(event) => setGridWidth(Number(event.target.value))}
                  />
                </label>
              </div>

              <div className="palette-strip">
                {palettes[brand].slice(0, 12).map((color) => (
                  <span key={color.id} style={{ background: color.hex }} title={`${color.code} ${color.name}`} />
                ))}
              </div>
            </section>

            <section className="preview-panel">
              {pattern ? (
                <>
                  <div className="preview-toolbar">
                    <div>
                      <p className="eyebrow">Pattern</p>
                      <h2>{pattern.width} x {pattern.height} 实体图纸</h2>
                    </div>
                    <div className="download-actions">
                      <button onClick={() => downloadPatternPng(pattern, paletteMap)}>
                        <Download size={18} />
                        PNG
                      </button>
                      <button onClick={() => downloadPatternPdf(pattern, paletteMap)}>
                        <Download size={18} />
                        PDF
                      </button>
                    </div>
                  </div>

                  <div className="preview-grid">
                    <div className="source-preview">
                      {sourceUrl && <img src={sourceUrl} alt="上传的源图片" />}
                    </div>
                    <div className="pattern-frame">
                      <PatternPreview pattern={pattern} paletteMap={paletteMap} />
                    </div>
                  </div>

                  <MaterialList pattern={pattern} />
                </>
              ) : (
                <div className="empty-state">
                  <Sparkles size={42} />
                  <h2>选择一张图片开始生成</h2>
                  <p>建议上传边缘清晰的像素图或透明 PNG，可以得到更干净的实体图纸。</p>
                </div>
              )}
            </section>
          </main>
        )}

        {view === "gallery" && (
          <main className="gallery-view">
            <div className="gallery-heading">
              <div>
                <p className="eyebrow">Gallery</p>
                <h2>作品广场</h2>
              </div>
              <button className="primary-action compact" onClick={() => fileInputRef.current?.click()}>
                <Upload size={18} />
                上传照片
              </button>
            </div>
            <div className="gallery-grid">
              {gallery.map((work) => (
                <article className="work-card" key={work.id}>
                  <div className="work-images">
                    <img className="normal-preview" src={work.sourcePreview} alt={`${work.title} 源图`} />
                    <img className="pattern-preview" src={work.patternPreview} alt={`${work.title} 图纸`} />
                  </div>
                  <div className="work-meta">
                    <strong>{work.title}</strong>
                    <span>{work.brand} · {work.beadCount} 颗</span>
                  </div>
                </article>
              ))}
            </div>
          </main>
        )}
      </div>

      <input
        ref={fileInputRef}
        className="global-file-input"
        type="file"
        accept="image/*"
        onChange={(event) => void handleFile(event.target.files?.[0])}
      />
    </div>
  );
}

function MaterialList({ pattern }: { pattern: GeneratedPattern }) {
  const paletteMap = getPaletteMap(pattern.brand);
  const total = totalBeads(pattern);
  const boardWidth = Math.ceil(pattern.width / 29);
  const boardHeight = Math.ceil(pattern.height / 29);

  return (
    <section className="materials">
      <div className="materials-summary">
        <div>
          <span>总豆数</span>
          <strong>{total}</strong>
        </div>
        <div>
          <span>颜色数</span>
          <strong>{pattern.materials.length}</strong>
        </div>
        <div>
          <span>建议底板</span>
          <strong>{boardWidth} x {boardHeight}</strong>
        </div>
      </div>

      <div className="material-table">
        <div className="table-head">
          <span>色号</span>
          <span>颜色</span>
          <span>数量</span>
        </div>
        {pattern.materials.map((item) => {
          const color = paletteMap.get(item.paletteColorId);
          if (!color) return null;
          return (
            <div className="material-row" key={item.paletteColorId}>
              <span className="code-cell">
                <i style={{ background: color.hex }} />
                {color.symbol} · {color.code}
              </span>
              <span>{color.name}</span>
              <strong>{item.count}</strong>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default App;

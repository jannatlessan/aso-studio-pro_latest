import { useState, useRef, useEffect } from 'react';
import {
  Minimize, Download, Upload, ChevronLeft, RefreshCcw, Settings2, Trash2, Loader2,
  CheckCircle2, Eye, Archive, ShieldCheck, Sparkles, FileText, AlertCircle, ExternalLink
} from 'lucide-react';
import JSZip from 'jszip';
import { useToolNavigation } from '../../hooks/useToolNavigation';
import { compressPdf, CompressMode } from '../../lib/pdfCompress';
import { renderPages, RenderedPdf } from '../../lib/pdfThumbnail';
import Footer from '../../components/Footer';
import SEO from '../../components/SEO';
import RelatedTools from '../../components/RelatedTools';

type ItemStatus = 'queued' | 'processing' | 'done' | 'error';

interface PdfItem {
  id: string;
  file: File;
  name: string;
  originalSize: number;
  originalUrl: string;
  status: ItemStatus;
  resultBlob?: Blob;
  resultUrl?: string;
  resultSize?: number;
  keptOriginal?: boolean;
  imagesRecompressed?: number;
  imagesFound?: number;
  settingsKey?: string;
  error?: string;
}

interface CompressionPreset {
  id: string;
  label: string;
  hint: string;
  quality: number;
  maxEdge: number;
}

const PRESETS: CompressionPreset[] = [
  { id: 'high', label: 'High quality', hint: 'Visually lossless', quality: 0.85, maxEdge: 2400 },
  { id: 'balanced', label: 'Balanced', hint: 'Smaller, still crisp', quality: 0.7, maxEdge: 1800 },
  { id: 'small', label: 'Small', hint: 'Great for sharing', quality: 0.55, maxEdge: 1400 },
  { id: 'smallest', label: 'Smallest', hint: 'Maximum shrink', quality: 0.4, maxEdge: 1100 },
];

const sanitizeName = (name: string) => name.replace(/[\\/:*?"<>|]/g, '-').trim() || 'document';
const formatBytes = (n: number) => (n < 1024 * 1024 ? `${(n / 1024).toFixed(1)} KB` : `${(n / 1024 / 1024).toFixed(2)} MB`);

export default function PDFCompressor() {
  const [items, setItems] = useState<PdfItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [zipping, setZipping] = useState(false);
  const [preview, setPreview] = useState<{ id: string; key: string; original?: RenderedPdf; compressed?: RenderedPdf; failed?: boolean }>({ id: '', key: '' });

  const [mode, setMode] = useState<CompressMode>('smart');
  const [jpegQuality, setJpegQuality] = useState(0.85);
  const [maxEdge, setMaxEdge] = useState(2400);
  const [presetId, setPresetId] = useState('high');

  const applyPreset = (preset: CompressionPreset) => {
    setPresetId(preset.id);
    setJpegQuality(preset.quality);
    setMaxEdge(preset.maxEdge);
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const itemsRef = useRef<PdfItem[]>([]);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useEffect(() => {
    return () => {
      itemsRef.current.forEach((i) => {
        URL.revokeObjectURL(i.originalUrl);
        if (i.resultUrl) URL.revokeObjectURL(i.resultUrl);
      });
    };
  }, []);

  // Render page-1 thumbnails for the active preview (mobile-safe; iframes don't show PDFs there).
  const activePreview = items.find((i) => i.id === previewId && i.status === 'done' && i.resultBlob);
  const previewKey = activePreview ? `${activePreview.id}:${activePreview.resultUrl}` : '';
  useEffect(() => {
    if (!activePreview) {
      setPreview({ id: '', key: '' });
      return;
    }
    let cancelled = false;
    setPreview({ id: activePreview.id, key: previewKey });
    (async () => {
      try {
        const [origBuf, compBuf] = await Promise.all([
          activePreview.file.arrayBuffer(),
          activePreview.resultBlob!.arrayBuffer()
        ]);
        const [original, compressed] = await Promise.all([
          renderPages(origBuf),
          renderPages(compBuf)
        ]);
        if (!cancelled) setPreview({ id: activePreview.id, key: previewKey, original, compressed });
      } catch {
        if (!cancelled) setPreview({ id: activePreview.id, key: previewKey, failed: true });
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [previewKey]);

  const isToolUsed = items.length > 0;

  const clearAll = () => {
    items.forEach((i) => {
      URL.revokeObjectURL(i.originalUrl);
      if (i.resultUrl) URL.revokeObjectURL(i.resultUrl);
    });
    setItems([]);
    setPreviewId(null);
    setIsProcessing(false);
  };

  const resetAll = () => {
    clearAll();
    if (fileInputRef.current) fileInputRef.current.value = '';
    setMode('smart');
    setJpegQuality(0.85);
    setMaxEdge(2400);
    setPresetId('high');
  };

  const { handleBackClick } = useToolNavigation({
    toolName: 'PDF Compressor',
    isToolUsed,
    onReset: resetAll
  });

  const addFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    const pdfs = Array.from(fileList).filter((f) => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf'));
    const added: PdfItem[] = pdfs.map((file) => ({
      id: crypto.randomUUID(),
      file,
      name: `${file.name.replace(/\.pdf$/i, '')}-compressed`,
      originalSize: file.size,
      originalUrl: URL.createObjectURL(file),
      status: 'queued'
    }));
    setItems((prev) => [...prev, ...added]);
    if (!previewId && added.length) setPreviewId(added[0].id);
  };

  const removeItem = (id: string) => {
    const target = items.find((i) => i.id === id);
    if (target) {
      URL.revokeObjectURL(target.originalUrl);
      if (target.resultUrl) URL.revokeObjectURL(target.resultUrl);
    }
    setItems((prev) => prev.filter((i) => i.id !== id));
    if (previewId === id) setPreviewId(null);
  };

  const renameItem = (id: string, name: string) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, name } : i)));
  };

  const patchItem = (id: string, patch: Partial<PdfItem>) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  };

  const processAll = async () => {
    if (isProcessing) return;
    // A file is (re)compressed when it isn't done yet, or when the current settings differ
    // from the ones that produced its existing result — so changing a setting and clicking
    // "Compress Again" actually re-runs it.
    const settingsKey = mode === 'smart' ? `smart:${jpegQuality}:${maxEdge}` : 'lossless';
    const queue = itemsRef.current.filter((i) => i.status !== 'done' || i.settingsKey !== settingsKey);
    if (!queue.length) return;
    setIsProcessing(true);

    for (const item of queue) {
      if (item.resultUrl) URL.revokeObjectURL(item.resultUrl);
      patchItem(item.id, {
        status: 'processing',
        error: undefined,
        resultBlob: undefined,
        resultUrl: undefined,
        resultSize: undefined,
        keptOriginal: undefined,
        imagesRecompressed: undefined,
        imagesFound: undefined
      });
      try {
        const buffer = await item.file.arrayBuffer();
        const result = await compressPdf(buffer, {
          mode,
          jpegQuality,
          maxEdge: maxEdge || Number.MAX_SAFE_INTEGER
        });
        const blob = new Blob([result.bytes as BlobPart], { type: 'application/pdf' });
        patchItem(item.id, {
          status: 'done',
          settingsKey,
          resultBlob: blob,
          resultUrl: URL.createObjectURL(blob),
          resultSize: blob.size,
          keptOriginal: result.keptOriginal,
          imagesRecompressed: result.imagesRecompressed,
          imagesFound: result.imagesFound
        });
      } catch (err: any) {
        console.error(err);
        const encrypted = /encrypt/i.test(String(err?.message));
        patchItem(item.id, {
          status: 'error',
          error: encrypted ? 'This PDF is password protected and cannot be compressed.' : 'This file could not be read as a valid PDF.'
        });
      }
    }
    setIsProcessing(false);
    if (!previewId) {
      const first = itemsRef.current.find((i) => i.status === 'done');
      if (first) setPreviewId(first.id);
    }
  };

  const downloadOne = (item: PdfItem) => {
    if (!item.resultUrl) return;
    const a = document.createElement('a');
    a.href = item.resultUrl;
    a.download = `${sanitizeName(item.name)}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const downloadAllAsZip = async () => {
    const done = items.filter((i) => i.status === 'done' && i.resultBlob);
    if (!done.length) return;
    setZipping(true);
    try {
      const zip = new JSZip();
      const usedNames = new Map<string, number>();
      done.forEach((item) => {
        let base = sanitizeName(item.name);
        const count = usedNames.get(base) ?? 0;
        usedNames.set(base, count + 1);
        if (count > 0) base = `${base}-${count + 1}`;
        zip.file(`${base}.pdf`, item.resultBlob!);
      });
      const content = await zip.generateAsync({ type: 'blob', compression: 'STORE' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'compressed-pdfs.zip';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 2000);
    } finally {
      setZipping(false);
    }
  };

  const previewItem = items.find((i) => i.id === previewId) ?? null;
  const doneCount = items.filter((i) => i.status === 'done').length;
  const totalOriginal = items.reduce((s, i) => s + i.originalSize, 0);
  const totalResult = items.reduce((s, i) => s + (i.status === 'done' ? i.resultSize ?? i.originalSize : 0), 0);
  const totalSavings = doneCount ? Math.max(0, Math.round((1 - totalResult / items.filter((i) => i.status === 'done').reduce((s, i) => s + i.originalSize, 0)) * 100)) : 0;

  return (
    <div className="min-h-screen bg-white text-ink selection:bg-primary/20 font-sans flex flex-col">
      <SEO
        title="Smart PDF Compressor | Shrink PDFs Offline | ShaadDev Studio"
        description="Compress PDF files in your browser without uploading them. Lossless optimization or smart image compression, preview before you download, and rename every output."
        url="https://shaaddev.studio/tools/pdf-compressor"
        keywords="pdf compressor, compress pdf, reduce pdf size, offline pdf compression, shrink pdf"
      />

      <nav className="sticky top-0 z-50 bg-white shadow-[0_1px_0_rgba(16,19,18,0.06)] px-4 sm:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button onClick={handleBackClick} className="inline-flex items-center gap-2 text-sm text-[#55605B] hover:text-primary transition-colors" title={isToolUsed ? '(Click to reset)' : undefined}>
            <ChevronLeft className="w-4 h-4" />
            {isToolUsed ? 'PDF Compressor' : 'Back to Tools'}
          </button>
          <div className="flex items-center gap-2 text-xs font-bold text-primary bg-mint px-3 py-1.5 rounded-full border border-primary/20">
            <ShieldCheck className="w-3.5 h-3.5" />
            Runs Locally
          </div>
        </div>
      </nav>

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-8 py-10 w-full space-y-10">
        <div className="space-y-3 max-w-3xl">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-ink">
            Smart PDF <span className="text-primary">Compressor.</span>
          </h1>
          <p className="text-[#55605B] text-base leading-relaxed">
            Shrink PDFs without uploading them anywhere. Choose lossless optimization to keep every pixel and character, or smart mode to re-encode embedded photos. Preview each result and rename it before you download.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: files + results */}
          <div className="lg:col-span-7 space-y-6">
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); addFiles(e.dataTransfer.files); }}
              onClick={() => fileInputRef.current?.click()}
              className="cursor-pointer rounded-3xl border-2 border-dashed border-primary/30 hover:border-primary bg-[#F6F8F7] p-10 text-center transition-all"
            >
              <div className="w-14 h-14 mx-auto rounded-2xl bg-mint border border-primary/30 flex items-center justify-center mb-4">
                <Upload className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-bold text-ink">Add PDF files</h3>
              <p className="text-sm text-[#55605B] mt-1">Drag & drop or click to browse. Multiple files supported.</p>
            </div>

            {items.length > 0 && (
              <div className="bg-white rounded-3xl border border-black/10 shadow-sm p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-black text-xs uppercase tracking-widest text-ink">Files ({items.length})</h2>
                  {doneCount > 0 && (
                    <button
                      onClick={downloadAllAsZip}
                      disabled={zipping}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-primary-dark hover:bg-[#048532] text-white disabled:opacity-60 rounded-full text-xs font-bold uppercase tracking-widest transition-colors"
                    >
                      {zipping ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Archive className="w-3.5 h-3.5" />}
                      Download All (.zip)
                    </button>
                  )}
                </div>

                {items.map((item) => {
                  const savedPct = item.resultSize !== undefined ? Math.round((1 - item.resultSize / item.originalSize) * 100) : null;
                  const isPreviewing = previewId === item.id;
                  return (
                    <div key={item.id} className={`rounded-2xl border p-4 space-y-3 transition-colors ${isPreviewing ? 'border-primary/40 bg-mint/40' : 'border-black/10 bg-white'}`}>
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-lg bg-mint border border-primary/20 flex items-center justify-center shrink-0">
                          <FileText className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0 space-y-2">
                          <div className="text-[11px] font-mono text-[#8B958F] truncate">{item.file.name} · {formatBytes(item.originalSize)}</div>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={item.name}
                              onChange={(e) => renameItem(item.id, e.target.value)}
                              aria-label="Output file name"
                              className="flex-1 min-w-0 bg-[#F6F8F7] border border-black/10 rounded-lg px-3 py-1.5 text-sm text-ink focus:outline-none focus:border-primary"
                            />
                            <span className="text-xs font-mono text-[#8B958F]">.pdf</span>
                          </div>
                        </div>
                        <button onClick={() => removeItem(item.id)} className="p-1.5 rounded-full text-[#8B958F] hover:text-red-600 hover:bg-red-50 transition-colors" aria-label="Remove file">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        {item.status === 'queued' && <span className="px-2.5 py-1 rounded-full bg-black/[0.04] text-[#55605B] font-bold uppercase tracking-wider">Queued</span>}
                        {item.status === 'processing' && <span className="px-2.5 py-1 rounded-full bg-mint text-primary font-bold uppercase tracking-wider inline-flex items-center gap-1.5"><Loader2 className="w-3 h-3 animate-spin" /> Compressing</span>}
                        {item.status === 'error' && <span className="px-2.5 py-1 rounded-full bg-red-50 text-red-600 font-bold inline-flex items-center gap-1.5"><AlertCircle className="w-3 h-3" /> {item.error}</span>}
                        {item.status === 'done' && (() => {
                          const usedSmart = item.settingsKey?.startsWith('smart');
                          const realSaving = !item.keptOriginal && (savedPct ?? 0) > 0;
                          return (
                            <>
                              <span className={`px-2.5 py-1 rounded-full font-bold inline-flex items-center gap-1.5 ${realSaving ? 'bg-mint text-primary' : 'bg-black/[0.04] text-[#55605B]'}`}>
                                <CheckCircle2 className="w-3 h-3" />
                                {realSaving ? `${formatBytes(item.resultSize!)} (−${savedPct}%)` : 'Already optimized · same size'}
                              </span>
                              {realSaving && (item.imagesRecompressed ?? 0) > 0 && (
                                <span className="px-2.5 py-1 rounded-full bg-black/[0.04] text-[#55605B] font-semibold">{item.imagesRecompressed} photo{item.imagesRecompressed === 1 ? '' : 's'} re-encoded</span>
                              )}
                              {!realSaving && usedSmart && (item.imagesFound ?? 0) > 0 && (
                                <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 font-semibold">Try Small or Smallest to shrink {item.imagesFound} photo{item.imagesFound === 1 ? '' : 's'}</span>
                              )}
                              {!realSaving && usedSmart && (item.imagesFound ?? 0) === 0 && (
                                <span className="px-2.5 py-1 rounded-full bg-black/[0.04] text-[#55605B] font-semibold">No photos to compress — this PDF is already minimal</span>
                              )}
                              {!realSaving && !usedSmart && (
                                <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 font-semibold">Switch to Smart + Small or Smallest to shrink photos</span>
                              )}
                            </>
                          );
                        })()}
                        <div className="ml-auto flex items-center gap-2">
                          {item.status === 'done' && (
                            <>
                              <button onClick={() => setPreviewId(item.id)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-black/10 bg-white hover:bg-mint text-[#55605B] hover:text-primary font-bold uppercase tracking-wider transition-colors">
                                <Eye className="w-3 h-3" /> Preview
                              </button>
                              <button onClick={() => downloadOne(item)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary-dark hover:bg-[#048532] text-white font-bold uppercase tracking-wider transition-colors">
                                <Download className="w-3 h-3" /> Download
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {previewItem && previewItem.status === 'done' && (() => {
              const matched = preview.key === `${previewItem.id}:${previewItem.resultUrl}`;
              const sides = [
                { label: `Original · ${formatBytes(previewItem.originalSize)}`, labelClass: 'text-[#55605B]', doc: matched ? preview.original : undefined, href: previewItem.originalUrl },
                { label: `Compressed · ${formatBytes(previewItem.resultSize!)}`, labelClass: 'text-primary', doc: matched ? preview.compressed : undefined, href: previewItem.resultUrl }
              ];
              return (
                <div className="bg-white rounded-3xl border border-black/10 shadow-sm p-5 space-y-3">
                  <h2 className="font-black text-xs uppercase tracking-widest text-ink">Preview · {previewItem.name}.pdf</h2>
                  <p className="text-[11px] text-[#8B958F] -mt-1">Scroll each panel to flip through the pages. Tap <span className="font-semibold">Open</span> for the full PDF.</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {sides.map((side, idx) => (
                      <div key={idx} className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <div className={`text-[11px] font-bold uppercase tracking-widest ${side.labelClass}`}>{side.label}</div>
                          <a href={side.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-[#55605B] hover:text-primary transition-colors shrink-0">
                            <ExternalLink className="w-3 h-3" /> Open
                          </a>
                        </div>
                        <div className="w-full h-[360px] sm:h-[480px] rounded-xl border border-black/10 bg-[#F6F8F7] overflow-auto overscroll-contain">
                          {matched && preview.failed ? (
                            <div className="h-full flex items-center justify-center text-xs text-[#8B958F] p-4 text-center">Preview unavailable — tap Open to view the PDF.</div>
                          ) : side.doc ? (
                            <div className="p-2 space-y-2">
                              {side.doc.pages.map((src, p) => (
                                <div key={p} className="relative">
                                  <img src={src} alt={`${side.label} page ${p + 1}`} loading="lazy" className="w-full h-auto block rounded shadow-sm" />
                                  <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/55 text-white text-[10px] font-semibold tabular-nums">{p + 1}/{side.doc!.total}</span>
                                </div>
                              ))}
                              {side.doc.truncated && (
                                <div className="text-center text-[10px] text-[#8B958F] py-2">First {side.doc.pages.length} of {side.doc.total} pages shown — tap Open for all.</div>
                              )}
                            </div>
                          ) : (
                            <div className="h-full flex flex-col items-center justify-center gap-2 text-[#8B958F]">
                              <Loader2 className="w-5 h-5 animate-spin" />
                              <span className="text-[10px]">Rendering pages…</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Right: settings */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl border border-black/10 shadow-lg shadow-black/5 p-6 space-y-6">
              <div className="flex items-center gap-2 border-b border-black/10 pb-2">
                <Settings2 className="w-4 h-4 text-primary" />
                <h2 className="font-black text-xs uppercase tracking-widest text-ink">Compression</h2>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => setMode('lossless')} className={`p-3 rounded-xl border text-left transition-all ${mode === 'lossless' ? 'bg-mint border-primary text-primary' : 'bg-white border-black/10 text-[#55605B] hover:bg-mint'}`}>
                  <div className="text-[11px] font-black uppercase tracking-widest">Lossless</div>
                  <div className="text-[11px] mt-1 leading-snug opacity-80">Restructures the file only. Zero quality change.</div>
                </button>
                <button onClick={() => setMode('smart')} className={`p-3 rounded-xl border text-left transition-all ${mode === 'smart' ? 'bg-mint border-primary text-primary' : 'bg-white border-black/10 text-[#55605B] hover:bg-mint'}`}>
                  <div className="text-[11px] font-black uppercase tracking-widest">Smart</div>
                  <div className="text-[11px] mt-1 leading-snug opacity-80">Re-encodes embedded photos for maximum savings.</div>
                </button>
              </div>

              {mode === 'smart' && (
                <div className="space-y-5 p-4 bg-[#F6F8F7] rounded-xl border border-black/[0.06]">
                  <div className="space-y-2">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-[#55605B]">Compression level</div>
                    <div className="grid grid-cols-2 gap-2">
                      {PRESETS.map((preset) => (
                        <button
                          key={preset.id}
                          onClick={() => applyPreset(preset)}
                          className={`p-2.5 rounded-lg border text-left transition-all ${presetId === preset.id ? 'bg-mint border-primary text-primary' : 'bg-white border-black/10 text-[#55605B] hover:bg-mint'}`}
                        >
                          <div className="text-[11px] font-black uppercase tracking-wider">{preset.label}</div>
                          <div className="text-[10px] mt-0.5 leading-snug opacity-80">{preset.hint}</div>
                        </button>
                      ))}
                    </div>
                    <p className="text-[10px] text-[#8B958F]">Already-compressed files need a stronger level to shrink further. Try <span className="font-semibold text-[#55605B]">Small</span> or <span className="font-semibold text-[#55605B]">Smallest</span> if High quality shows no savings.</p>
                  </div>

                  <details className="group">
                    <summary className="cursor-pointer text-[10px] font-bold uppercase tracking-widest text-[#55605B] hover:text-primary select-none">
                      Advanced {presetId === 'custom' && <span className="text-primary normal-case tracking-normal">· custom</span>}
                    </summary>
                    <div className="space-y-5 pt-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-[#55605B]">
                          <span>Photo JPEG quality</span>
                          <span className="text-primary">{Math.round(jpegQuality * 100)}%</span>
                        </div>
                        <input type="range" min="0.3" max="0.95" step="0.05" value={jpegQuality} onChange={(e) => { setJpegQuality(parseFloat(e.target.value)); setPresetId('custom'); }} className="w-full accent-primary" />
                        <p className="text-[10px] text-[#8B958F]">Higher keeps more detail. 85–90% is visually lossless for most photos.</p>
                      </div>
                      <div className="space-y-2">
                        <div className="text-[10px] font-bold uppercase tracking-widest text-[#55605B]">Max photo size</div>
                        <div className="grid grid-cols-5 gap-2">
                          {[{ v: 1100, l: '1100' }, { v: 1600, l: '1600' }, { v: 2400, l: '2400' }, { v: 3200, l: '3200' }, { v: 0, l: 'Orig' }].map((opt) => (
                            <button key={opt.v} onClick={() => { setMaxEdge(opt.v); setPresetId('custom'); }} className={`py-2 rounded-lg border text-[10px] font-bold uppercase tracking-wider transition-all ${maxEdge === opt.v ? 'bg-mint border-primary text-primary' : 'bg-white border-black/10 text-[#55605B] hover:bg-mint'}`}>
                              {opt.l}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </details>
                </div>
              )}

              <button
                onClick={processAll}
                disabled={items.length === 0 || isProcessing}
                className="w-full flex items-center justify-center gap-2 bg-primary-dark hover:bg-[#048532] text-white disabled:opacity-40 disabled:cursor-not-allowed py-4 rounded-full font-black uppercase tracking-widest text-sm shadow-lg shadow-primary/25 transition-all"
              >
                {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Minimize className="w-5 h-5" />}
                {isProcessing ? 'Compressing…' : items.some((i) => i.status === 'done') ? 'Compress Again' : 'Compress PDFs'}
              </button>

              {items.length > 0 && (
                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-black/10 text-center">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-[#8B958F]">Original total</div>
                    <div className="text-lg font-bold text-ink">{formatBytes(totalOriginal)}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-[#8B958F]">Compressed total</div>
                    <div className="text-lg font-bold text-primary">{doneCount ? `${formatBytes(totalResult)} (−${totalSavings}%)` : '—'}</div>
                  </div>
                </div>
              )}

              <button onClick={clearAll} className="w-full inline-flex items-center justify-center gap-2 py-2 rounded-full text-xs font-bold uppercase tracking-widest text-[#55605B] hover:text-primary transition-colors">
                <RefreshCcw className="w-3 h-3" /> Clear all
              </button>
            </div>

            <div className="bg-[#F6F8F7] rounded-3xl border border-black/10 p-6 space-y-3">
              <div className="flex items-center gap-2 text-primary">
                <Sparkles className="w-4 h-4" />
                <h3 className="font-black text-xs uppercase tracking-widest">How it stays high quality</h3>
              </div>
              <p className="text-sm text-[#55605B] leading-relaxed">
                Lossless mode rewrites the PDF's internal structure (object streams), so text, vectors, fonts and images stay byte-identical. Smart mode only touches JPEG photos, and only keeps a re-encoded image when it is actually smaller, so the file never gets bigger.
              </p>
            </div>
          </div>
        </div>
      </main>

      <input type="file" ref={fileInputRef} onChange={(e) => { addFiles(e.target.files); e.target.value = ''; }} accept="application/pdf" multiple className="hidden" />

      <div className="max-w-7xl mx-auto px-4 sm:px-8 w-full">
        <article className="p-6 sm:p-8 rounded-2xl bg-white border border-black/10 shadow-sm shadow-black/[0.02] mt-4 space-y-6 text-sm text-[#55605B] leading-relaxed">
          <h2 className="text-xl sm:text-2xl font-semibold text-ink">Compress PDF Files Online — Without Uploading Them</h2>
          <p>
            Oversized PDFs are a constant headache: they bounce back from email attachment limits, slow down uploads to portals, and eat storage. Most "compress PDF" websites fix that by making you hand your documents to a remote server — a real privacy problem for contracts, invoices, ID scans, and reports. Our <strong>Smart PDF Compressor</strong> works entirely inside your browser, so your files are never uploaded. You get smaller PDFs with the same crisp text and sharp images, and nothing ever leaves your device.
          </p>
          <p>
            Under the hood, the compressor goes well beyond a basic re-save. <strong>Lossless mode</strong> rebuilds the PDF's internal structure using object streams, keeping text, fonts, and vectors byte-for-byte identical. <strong>Smart mode</strong> re-encodes the embedded photos that usually dominate a PDF's size — including JPEGs tagged with ICC colour profiles and images wrapped in Flate compression that most tools skip — using the high-efficiency MozJPEG encoder, and it only keeps a re-encoded image when it actually comes out smaller, so your file never grows.
          </p>

          <h3 className="text-lg font-semibold text-ink mt-8 mb-4">How to Use</h3>
          <ol className="list-decimal pl-5 space-y-3">
            <li><strong>Add your PDFs:</strong> Drag and drop one or many PDF files into the upload zone — everything is processed locally.</li>
            <li><strong>Choose a compression level:</strong> Keep <em>High quality</em> for visually lossless results, or pick <em>Small</em> / <em>Smallest</em> when a file is already optimised and you need a bigger reduction.</li>
            <li><strong>Preview &amp; rename:</strong> Compare the original and compressed pages side by side, then give each output a clear filename.</li>
            <li><strong>Download:</strong> Save each compressed PDF individually, or grab them all at once as a ZIP.</li>
          </ol>

          <h3 className="text-lg font-semibold text-ink mt-8 mb-4">Frequently Asked Questions (FAQ)</h3>
          <div className="space-y-4">
            <div>
              <strong className="text-ink block">1. Are my PDFs uploaded anywhere?</strong>
              <p>No. All compression happens in your browser using JavaScript and WebAssembly. Your documents are never transmitted to a server, which makes this safe for confidential and sensitive files.</p>
            </div>
            <div>
              <strong className="text-ink block">2. Will compressing reduce the quality?</strong>
              <p>Lossless mode changes nothing you can see — text and images stay identical. Smart mode re-encodes photos at a quality you choose; at High quality the difference is visually imperceptible for most documents.</p>
            </div>
            <div>
              <strong className="text-ink block">3. Why did my file barely shrink?</strong>
              <p>If a PDF has already been compressed, there may be little left to remove at high quality — the tool will never make it larger. Switching to the Small or Smallest level re-encodes the photos more aggressively for a meaningful reduction.</p>
            </div>
            <div>
              <strong className="text-ink block">4. Can I compress several PDFs at once?</strong>
              <p>Yes. Add as many files as you like, compress them in one click, and download them individually or together as a single ZIP archive.</p>
            </div>
          </div>
        </article>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 w-full pb-10">
        <RelatedTools currentPath="/tools/pdf-compressor" />
      </div>
      <Footer />
    </div>
  );
}

import { useState, useRef, useEffect } from 'react';
import {
  FileOutput, Download, Upload, ChevronLeft, RefreshCcw, Settings2, Trash2, Loader2,
  CheckCircle2, Archive, ShieldCheck, FileText, Image as ImageIcon, Table2, FileType2, AlertCircle,
  Eye, ExternalLink, X
} from 'lucide-react';
import JSZip from 'jszip';
import { useToolNavigation } from '../../hooks/useToolNavigation';
import { convertToPdf, mergePdfs, detectKind, kindLabel, FileKind, OutputSize } from '../../lib/toPdf';
import { renderPages, RenderedPdf } from '../../lib/pdfThumbnail';
import Footer from '../../components/Footer';
import SEO from '../../components/SEO';
import RelatedTools from '../../components/RelatedTools';

type ItemStatus = 'queued' | 'processing' | 'done' | 'error';

interface ConvItem {
  id: string;
  file: File;
  kind: FileKind;
  name: string;
  size: number;
  status: ItemStatus;
  resultBlob?: Blob;
  resultUrl?: string;
  pages?: number;
  error?: string;
}

const sanitizeName = (name: string) => name.replace(/[\\/:*?"<>|]/g, '-').trim() || 'document';
const formatBytes = (n: number) => (n < 1024 * 1024 ? `${(n / 1024).toFixed(1)} KB` : `${(n / 1024 / 1024).toFixed(2)} MB`);
const baseName = (name: string) => name.replace(/\.[^.]+$/, '');

const KIND_ICON: Record<FileKind, typeof FileText> = {
  image: ImageIcon,
  text: FileText,
  csv: Table2,
  excel: Table2,
  docx: FileType2,
  unsupported: AlertCircle
};

export default function FileToPDF() {
  const [items, setItems] = useState<ConvItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [zipping, setZipping] = useState(false);
  const [size, setSize] = useState<OutputSize>('a4');
  const [allSheets, setAllSheets] = useState(true);
  const [combine, setCombine] = useState(false);
  const [combinedName, setCombinedName] = useState('combined');
  const [combined, setCombined] = useState<{ blob: Blob; url: string; pages: number } | null>(null);
  const [previewTarget, setPreviewTarget] = useState<{ key: string; blob: Blob; url: string; label: string } | null>(null);
  const [rendered, setRendered] = useState<{ key: string; doc?: RenderedPdf; failed?: boolean }>({ key: '' });
  const [pendingFiles, setPendingFiles] = useState<File[] | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const itemsRef = useRef<ConvItem[]>([]);

  useEffect(() => { itemsRef.current = items; }, [items]);
  useEffect(() => () => { itemsRef.current.forEach((i) => { if (i.resultUrl) URL.revokeObjectURL(i.resultUrl); }); }, []);

  // Render the previewed PDF to page images (pdf.js) — works on desktop and mobile, where
  // <iframe>/<embed> PDF previews do not.
  const previewKey = previewTarget?.key ?? '';
  useEffect(() => {
    if (!previewTarget) { setRendered({ key: '' }); return; }
    let cancelled = false;
    setRendered({ key: previewTarget.key });
    (async () => {
      try {
        const doc = await renderPages(await previewTarget.blob.arrayBuffer());
        if (!cancelled) setRendered({ key: previewTarget.key, doc });
      } catch {
        if (!cancelled) setRendered({ key: previewTarget.key, failed: true });
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [previewKey]);

  const isToolUsed = items.length > 0;

  const clearCombined = () => setCombined((prev) => { if (prev) URL.revokeObjectURL(prev.url); return null; });

  const clearAll = () => {
    items.forEach((i) => { if (i.resultUrl) URL.revokeObjectURL(i.resultUrl); });
    clearCombined();
    setPreviewTarget(null);
    setItems([]);
    setIsProcessing(false);
  };

  const resetAll = () => {
    clearAll();
    if (fileInputRef.current) fileInputRef.current.value = '';
    setSize('a4');
    setAllSheets(true);
    setCombine(false);
    setCombinedName('combined');
  };

  const { handleBackClick } = useToolNavigation({ toolName: 'File to PDF Converter', isToolUsed, onReset: resetAll });

  const addFiles = (fileList: FileList | File[] | null) => {
    if (!fileList) return;
    const added: ConvItem[] = Array.from(fileList).map((file) => ({
      id: crypto.randomUUID(),
      file,
      kind: detectKind(file),
      name: `${baseName(file.name)}`,
      size: file.size,
      status: 'queued'
    }));
    setItems((prev) => [...prev, ...added]);
    clearCombined();
  };

  // Once something has been generated, adding more files would discard those results — warn first.
  const requestAddFiles = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const arr = Array.from(fileList);
    const hasGenerations = items.some((i) => i.status === 'done') || combined !== null;
    if (hasGenerations) setPendingFiles(arr);
    else addFiles(arr);
  };

  const confirmReplace = () => {
    const files = pendingFiles;
    setPendingFiles(null);
    if (!files) return;
    clearAll();
    addFiles(files);
  };

  const removeItem = (id: string) => {
    const target = items.find((i) => i.id === id);
    if (target?.resultUrl) URL.revokeObjectURL(target.resultUrl);
    setItems((prev) => prev.filter((i) => i.id !== id));
    clearCombined();
    setPreviewTarget((prev) => (prev && prev.key === `item:${id}` ? null : prev));
  };

  const renameItem = (id: string, name: string) => setItems((prev) => prev.map((i) => (i.id === id ? { ...i, name } : i)));
  const patchItem = (id: string, patch: Partial<ConvItem>) => setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)));

  const processAll = async () => {
    if (isProcessing) return;
    const queue = itemsRef.current.filter((i) => i.kind !== 'unsupported' && (combine || i.status !== 'done'));
    if (!queue.length) return;
    setIsProcessing(true);
    clearCombined();
    setPreviewTarget(null);

    const orderedBlobs: Blob[] = [];
    for (const item of queue) {
      if (item.resultUrl) URL.revokeObjectURL(item.resultUrl);
      patchItem(item.id, { status: 'processing', error: undefined, resultBlob: undefined, resultUrl: undefined, pages: undefined });
      try {
        const result = await convertToPdf(item.file, { size, firstSheetOnly: !allSheets });
        if (combine) {
          orderedBlobs.push(result.blob);
          patchItem(item.id, { status: 'done', pages: result.pages });
        } else {
          patchItem(item.id, {
            status: 'done',
            resultBlob: result.blob,
            resultUrl: URL.createObjectURL(result.blob),
            pages: result.pages
          });
        }
      } catch (err: any) {
        console.error(err);
        patchItem(item.id, { status: 'error', error: err?.message || 'This file could not be converted.' });
      }
    }

    if (combine && orderedBlobs.length > 0) {
      try {
        const merged = await mergePdfs(orderedBlobs);
        setCombined({ blob: merged.blob, url: URL.createObjectURL(merged.blob), pages: merged.pages });
      } catch (err) {
        console.error(err);
      }
    }
    setIsProcessing(false);
  };

  const downloadCombined = () => {
    if (!combined) return;
    const a = document.createElement('a');
    a.href = combined.url;
    a.download = `${sanitizeName(combinedName)}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const downloadOne = (item: ConvItem) => {
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
      const used = new Map<string, number>();
      done.forEach((item) => {
        let base = sanitizeName(item.name);
        const count = used.get(base) ?? 0;
        used.set(base, count + 1);
        if (count > 0) base = `${base}-${count + 1}`;
        zip.file(`${base}.pdf`, item.resultBlob!);
      });
      const content = await zip.generateAsync({ type: 'blob', compression: 'STORE' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'converted-pdfs.zip';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 2000);
    } finally {
      setZipping(false);
    }
  };

  const doneCount = items.filter((i) => i.status === 'done').length;
  const convertibleCount = items.filter((i) => i.kind !== 'unsupported' && i.status !== 'done').length;
  const anyConvertible = items.some((i) => i.kind !== 'unsupported');
  const hasExcel = items.some((i) => i.kind === 'excel');
  const convertDisabled = (combine ? !anyConvertible : convertibleCount === 0) || isProcessing;
  const convertLabel = isProcessing
    ? (combine ? 'Combining…' : 'Converting…')
    : combine
      ? (combined ? 'Combine Again' : 'Combine into one PDF')
      : (items.some((i) => i.status === 'done') ? 'Convert Remaining' : 'Convert to PDF');

  return (
    <div className="min-h-screen bg-white text-ink selection:bg-primary/20 font-sans flex flex-col">
      <SEO
        title="File to PDF Converter | Images, CSV, Excel & Word to PDF | ShaadDev Studio"
        description="Convert images, CSV, Excel spreadsheets, Word documents, and text files to PDF right in your browser. Nothing is uploaded, rename every output, and download one file or all as a ZIP."
        url="https://shaaddev.studio/tools/file-to-pdf"
        keywords="file to pdf, image to pdf, csv to pdf, excel to pdf, word to pdf, jpg to pdf, png to pdf, convert to pdf online, offline pdf converter"
      />

      <nav className="sticky top-0 z-50 bg-white shadow-[0_1px_0_rgba(16,19,18,0.06)] px-4 sm:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button onClick={handleBackClick} className="inline-flex items-center gap-2 text-sm text-[#55605B] hover:text-primary transition-colors" title={isToolUsed ? '(Click to reset)' : undefined}>
            <ChevronLeft className="w-4 h-4" />
            {isToolUsed ? 'File to PDF' : 'Back to Tools'}
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
            File to <span className="text-primary">PDF Converter.</span>
          </h1>
          <p className="text-[#55605B] text-base leading-relaxed">
            Turn images, CSV files, Excel spreadsheets, Word documents, and plain text into clean PDFs — entirely in your browser. Nothing is uploaded, rename each output, and grab them one at a time or all at once.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: files */}
          <div className="lg:col-span-7 space-y-6">
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); requestAddFiles(e.dataTransfer.files); }}
              onClick={() => fileInputRef.current?.click()}
              className="cursor-pointer rounded-3xl border-2 border-dashed border-primary/30 hover:border-primary bg-[#F6F8F7] p-10 text-center transition-all"
            >
              <div className="w-14 h-14 mx-auto rounded-2xl bg-mint border border-primary/30 flex items-center justify-center mb-4">
                <Upload className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-bold text-ink">Add files to convert</h3>
              <p className="text-sm text-[#55605B] mt-1">Images, CSV, Excel, Word (.docx), TXT & more. Drag & drop or click to browse.</p>
            </div>

            {items.length > 0 && (
              <div className="bg-white rounded-3xl border border-black/10 shadow-sm p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-black text-xs uppercase tracking-widest text-ink">Files ({items.length})</h2>
                  {!combine && doneCount > 0 && (
                    <button onClick={downloadAllAsZip} disabled={zipping} className="inline-flex items-center gap-2 px-4 py-2 bg-primary-dark hover:bg-[#048532] text-white disabled:opacity-60 rounded-full text-xs font-bold uppercase tracking-widest transition-colors">
                      {zipping ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Archive className="w-3.5 h-3.5" />}
                      Download All (.zip)
                    </button>
                  )}
                </div>

                {items.map((item) => {
                  const KindIcon = KIND_ICON[item.kind];
                  const unsupported = item.kind === 'unsupported';
                  return (
                    <div key={item.id} className="rounded-2xl border border-black/10 bg-white p-4 space-y-3">
                      <div className="flex items-start gap-3">
                        <div className={`w-9 h-9 rounded-lg border flex items-center justify-center shrink-0 ${unsupported ? 'bg-red-50 border-red-200 text-red-500' : 'bg-mint border-primary/20 text-primary'}`}>
                          <KindIcon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0 space-y-2">
                          <div className="text-[11px] font-mono text-[#8B958F] truncate">{item.file.name} · {formatBytes(item.size)} · {kindLabel(item.kind)}</div>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={item.name}
                              onChange={(e) => renameItem(item.id, e.target.value)}
                              aria-label="Output file name"
                              disabled={unsupported}
                              className="flex-1 min-w-0 bg-[#F6F8F7] border border-black/10 rounded-lg px-3 py-1.5 text-sm text-ink focus:outline-none focus:border-primary disabled:opacity-50"
                            />
                            <span className="text-xs font-mono text-[#8B958F]">.pdf</span>
                          </div>
                        </div>
                        <button onClick={() => removeItem(item.id)} className="p-1.5 rounded-full text-[#8B958F] hover:text-red-600 hover:bg-red-50 transition-colors" aria-label="Remove file">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        {unsupported && <span className="px-2.5 py-1 rounded-full bg-red-50 text-red-600 font-bold inline-flex items-center gap-1.5"><AlertCircle className="w-3 h-3" /> Unsupported format</span>}
                        {!unsupported && item.status === 'queued' && <span className="px-2.5 py-1 rounded-full bg-black/[0.04] text-[#55605B] font-bold uppercase tracking-wider">Queued</span>}
                        {item.status === 'processing' && <span className="px-2.5 py-1 rounded-full bg-mint text-primary font-bold uppercase tracking-wider inline-flex items-center gap-1.5"><Loader2 className="w-3 h-3 animate-spin" /> Converting</span>}
                        {item.status === 'error' && <span className="px-2.5 py-1 rounded-full bg-red-50 text-red-600 font-bold inline-flex items-center gap-1.5"><AlertCircle className="w-3 h-3" /> {item.error}</span>}
                        {item.status === 'done' && (
                          <span className="px-2.5 py-1 rounded-full bg-mint text-primary font-bold inline-flex items-center gap-1.5">
                            <CheckCircle2 className="w-3 h-3" />
                            PDF ready{item.pages ? ` · ${item.pages} page${item.pages === 1 ? '' : 's'}` : ''}{item.resultBlob ? ` · ${formatBytes(item.resultBlob.size)}` : ''}
                          </span>
                        )}
                        {!combine && item.status === 'done' && item.resultBlob && item.resultUrl && (
                          <div className="ml-auto flex items-center gap-2">
                            <button onClick={() => setPreviewTarget({ key: `item:${item.id}`, blob: item.resultBlob!, url: item.resultUrl!, label: `${item.name}.pdf` })} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-black/10 bg-white hover:bg-mint text-[#55605B] hover:text-primary font-bold uppercase tracking-wider transition-colors">
                              <Eye className="w-3 h-3" /> Preview
                            </button>
                            <button onClick={() => downloadOne(item)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary-dark hover:bg-[#048532] text-white font-bold uppercase tracking-wider transition-colors">
                              <Download className="w-3 h-3" /> Download
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {combine && combined && (
              <div className="bg-white rounded-3xl border border-primary/30 bg-mint/30 shadow-sm p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  <h2 className="font-black text-xs uppercase tracking-widest text-ink">Combined PDF · {combined.pages} page{combined.pages === 1 ? '' : 's'} · {formatBytes(combined.blob.size)}</h2>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={combinedName}
                    onChange={(e) => setCombinedName(e.target.value)}
                    aria-label="Combined PDF name"
                    className="flex-1 min-w-0 bg-white border border-black/10 rounded-lg px-3 py-2 text-sm text-ink focus:outline-none focus:border-primary"
                  />
                  <span className="text-xs font-mono text-[#8B958F]">.pdf</span>
                  <button onClick={() => setPreviewTarget({ key: 'combined', blob: combined.blob, url: combined.url, label: `${combinedName}.pdf` })} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full border border-black/10 bg-white hover:bg-mint text-[#55605B] hover:text-primary font-bold uppercase tracking-wider text-xs transition-colors shrink-0">
                    <Eye className="w-3.5 h-3.5" /> Preview
                  </button>
                  <button onClick={downloadCombined} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary-dark hover:bg-[#048532] text-white font-bold uppercase tracking-wider text-xs transition-colors shrink-0">
                    <Download className="w-3.5 h-3.5" /> Download
                  </button>
                </div>
              </div>
            )}

            {previewTarget && (
              <div className="bg-white rounded-3xl border border-black/10 shadow-sm p-5 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="font-black text-xs uppercase tracking-widest text-ink truncate">Preview · {previewTarget.label}</h2>
                  <div className="flex items-center gap-2 shrink-0">
                    <a href={previewTarget.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-[#55605B] hover:text-primary transition-colors">
                      <ExternalLink className="w-3 h-3" /> Open
                    </a>
                    <button onClick={() => setPreviewTarget(null)} className="p-1 rounded-full text-[#8B958F] hover:text-ink hover:bg-black/[0.04] transition-colors" aria-label="Close preview">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p className="text-[11px] text-[#8B958F] -mt-1">Scroll to flip through the pages. Tap <span className="font-semibold">Open</span> for the full PDF.</p>
                <div className="w-full h-[360px] sm:h-[520px] rounded-xl border border-black/10 bg-[#F6F8F7] overflow-auto overscroll-contain">
                  {rendered.key === previewTarget.key && rendered.failed ? (
                    <div className="h-full flex items-center justify-center text-xs text-[#8B958F] p-4 text-center">Preview unavailable — tap Open to view the PDF.</div>
                  ) : rendered.key === previewTarget.key && rendered.doc ? (
                    <div className="p-2 space-y-2">
                      {rendered.doc.pages.map((src, p) => (
                        <div key={p} className="relative">
                          <img src={src} alt={`Page ${p + 1}`} loading="lazy" className="w-full h-auto block rounded shadow-sm" />
                          <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/55 text-white text-[10px] font-semibold tabular-nums">{p + 1}/{rendered.doc!.total}</span>
                        </div>
                      ))}
                      {rendered.doc.truncated && (
                        <div className="text-center text-[10px] text-[#8B958F] py-2">First {rendered.doc.pages.length} of {rendered.doc.total} pages shown — tap Open for all.</div>
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
            )}
          </div>

          {/* Right: settings */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl border border-black/10 shadow-lg shadow-black/5 p-6 space-y-6">
              <div className="flex items-center gap-2 border-b border-black/10 pb-2">
                <Settings2 className="w-4 h-4 text-primary" />
                <h2 className="font-black text-xs uppercase tracking-widest text-ink">Output</h2>
              </div>

              <div className="space-y-2">
                <div className="text-[10px] font-bold uppercase tracking-widest text-[#55605B]">Output mode</div>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => setCombine(false)} className={`p-3 rounded-xl border text-left transition-all ${!combine ? 'bg-mint border-primary text-primary' : 'bg-white border-black/10 text-[#55605B] hover:bg-mint'}`}>
                    <div className="text-[11px] font-black uppercase tracking-widest">Separate</div>
                    <div className="text-[10px] mt-1 leading-snug opacity-80">One PDF per file.</div>
                  </button>
                  <button onClick={() => setCombine(true)} className={`p-3 rounded-xl border text-left transition-all ${combine ? 'bg-mint border-primary text-primary' : 'bg-white border-black/10 text-[#55605B] hover:bg-mint'}`}>
                    <div className="text-[11px] font-black uppercase tracking-widest">Combine</div>
                    <div className="text-[10px] mt-1 leading-snug opacity-80">Merge all into one PDF.</div>
                  </button>
                </div>
                {combine && <p className="text-[10px] text-[#8B958F]">Files are merged in the order shown on the left — great for turning many images into a single PDF.</p>}
              </div>

              <div className="space-y-2">
                <div className="text-[10px] font-bold uppercase tracking-widest text-[#55605B]">Page size</div>
                <div className="grid grid-cols-2 gap-2">
                  {([{ v: 'a4', l: 'A4' }, { v: 'letter', l: 'Letter' }] as const).map((opt) => (
                    <button key={opt.v} onClick={() => setSize(opt.v)} className={`py-2.5 rounded-lg border text-xs font-bold uppercase tracking-wider transition-all ${size === opt.v ? 'bg-mint border-primary text-primary' : 'bg-white border-black/10 text-[#55605B] hover:bg-mint'}`}>
                      {opt.l}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-[#8B958F]">Images are centered and fit to the page; tables use landscape automatically.</p>
              </div>

              {hasExcel && (
                <label className="flex items-center justify-between gap-3 p-3 rounded-xl bg-[#F6F8F7] border border-black/[0.06] cursor-pointer">
                  <span className="text-xs text-[#55605B] leading-snug">Include <strong className="text-ink">all sheets</strong> from spreadsheets<br /><span className="text-[10px] text-[#8B958F]">Off = first sheet only</span></span>
                  <input type="checkbox" checked={allSheets} onChange={(e) => setAllSheets(e.target.checked)} className="w-4 h-4 accent-primary shrink-0" />
                </label>
              )}

              <button
                onClick={processAll}
                disabled={convertDisabled}
                className="w-full flex items-center justify-center gap-2 bg-primary-dark hover:bg-[#048532] text-white disabled:opacity-40 disabled:cursor-not-allowed py-4 rounded-full font-black uppercase tracking-widest text-sm shadow-lg shadow-primary/25 transition-all"
              >
                {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileOutput className="w-5 h-5" />}
                {convertLabel}
              </button>

              <button onClick={clearAll} className="w-full inline-flex items-center justify-center gap-2 py-2 rounded-full text-xs font-bold uppercase tracking-widest text-[#55605B] hover:text-primary transition-colors">
                <RefreshCcw className="w-3 h-3" /> Clear all
              </button>
            </div>

            <div className="bg-[#F6F8F7] rounded-3xl border border-black/10 p-6 space-y-3">
              <div className="flex items-center gap-2 text-primary">
                <ShieldCheck className="w-4 h-4" />
                <h3 className="font-black text-xs uppercase tracking-widest">Supported formats</h3>
              </div>
              <p className="text-sm text-[#55605B] leading-relaxed">
                <strong className="text-ink">Images</strong> (JPG, PNG, WebP, GIF, BMP), <strong className="text-ink">CSV</strong> &amp; <strong className="text-ink">Excel</strong> (.xlsx, .xls), <strong className="text-ink">Word</strong> (.docx), and <strong className="text-ink">text</strong> (.txt, .md, .json). Every file is processed on your device — nothing is ever uploaded.
              </p>
            </div>
          </div>
        </div>

        {/* SEO content */}
        <article className="p-6 sm:p-8 rounded-2xl bg-white border border-black/10 shadow-sm shadow-black/[0.02] mt-4 space-y-6 text-sm text-[#55605B] leading-relaxed">
          <h2 className="text-xl sm:text-2xl font-semibold text-ink">Convert Any File to PDF — Privately, in Your Browser</h2>
          <p>
            PDF is the universal format for sharing, printing, and archiving documents because it looks identical on every device. But getting your content <em>into</em> a PDF usually means uploading sensitive files to an unknown server or installing bulky desktop software. Our <strong>File to PDF Converter</strong> does it differently: images, spreadsheets, Word documents, and text files are converted to polished PDFs entirely inside your browser tab. Your files never leave your computer, so even confidential invoices, contracts, and personal photos stay completely private.
          </p>
          <p>
            Whether you need to turn a batch of <strong>JPG or PNG images into a PDF</strong>, convert a <strong>CSV or Excel spreadsheet into a clean printable table</strong>, or export a <strong>Word (.docx) document to PDF</strong>, the workflow is the same: drop the files in, rename each output, and download. Multiple files can be converted at once and bundled into a single ZIP.
          </p>

          <h3 className="text-lg font-semibold text-ink mt-8 mb-4">How to Use</h3>
          <ol className="list-decimal pl-5 space-y-3">
            <li><strong>Add your files:</strong> Drag and drop images, CSV, Excel, Word, or text files into the upload zone. The tool automatically detects each file's type.</li>
            <li><strong>Pick a page size:</strong> Choose A4 or Letter. Images are centered and fit to the page, and wide tables are laid out in landscape automatically.</li>
            <li><strong>Rename the output:</strong> Give each resulting PDF a clear, descriptive filename before you download it.</li>
            <li><strong>Convert &amp; download:</strong> Click convert, then download each PDF individually or grab everything at once as a ZIP.</li>
          </ol>

          <h3 className="text-lg font-semibold text-ink mt-8 mb-4">Frequently Asked Questions (FAQ)</h3>
          <div className="space-y-4">
            <div>
              <strong className="text-ink block">1. Are my files uploaded to a server?</strong>
              <p>No. The entire conversion — reading images, parsing spreadsheets, rendering Word documents — happens locally using JavaScript and WebAssembly in your browser. Your data is never transmitted anywhere, which makes this safe for confidential business and personal documents.</p>
            </div>
            <div>
              <strong className="text-ink block">2. Which file formats can I convert to PDF?</strong>
              <p>Images (JPG, PNG, WebP, GIF, BMP), CSV and tab-separated files, Excel workbooks (.xlsx, .xls), Word documents (.docx), and plain-text formats (.txt, .md, .json, and more). Each Excel sheet becomes its own page, and you can include every sheet or just the first.</p>
            </div>
            <div>
              <strong className="text-ink block">3. Can I convert several files at once?</strong>
              <p>Yes. Add as many files as you like, convert them in one click, and download them individually or all together as a single ZIP archive. Each output keeps the custom name you give it.</p>
            </div>
            <div>
              <strong className="text-ink block">4. Will my Word document look exactly the same?</strong>
              <p>Word documents are rendered faithfully for text, headings, lists, tables, and images. Very complex layouts, custom fonts, or advanced formatting may shift slightly, since the document is re-rendered rather than opened in Microsoft Word.</p>
            </div>
          </div>
        </article>

        <RelatedTools currentPath="/tools/file-to-pdf" />
      </main>

      <input type="file" ref={fileInputRef} onChange={(e) => { requestAddFiles(e.target.files); e.target.value = ''; }} multiple className="hidden" />

      {pendingFiles && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" role="dialog" aria-modal="true" onClick={() => setPendingFiles(null)}>
          <div className="w-full max-w-md bg-white rounded-3xl border border-black/10 shadow-2xl shadow-black/30 p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-ink">Start over with new files?</h3>
                <p className="text-sm text-[#55605B] leading-relaxed">
                  Uploading {pendingFiles.length} new file{pendingFiles.length === 1 ? '' : 's'} will clear your current files and all converted PDFs. This can't be undone.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-1">
              <button onClick={() => setPendingFiles(null)} className="px-4 py-2 rounded-full border border-black/10 bg-white hover:bg-[#F6F8F7] text-[#55605B] text-sm font-bold transition-colors">
                Cancel
              </button>
              <button onClick={confirmReplace} className="px-4 py-2 rounded-full bg-primary-dark hover:bg-[#048532] text-white text-sm font-bold transition-colors">
                Clear &amp; Upload
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

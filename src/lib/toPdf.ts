// Client-side "anything → PDF" converter. Everything runs in the browser; files never leave the
// device. Heavy engines (jsPDF, SheetJS, mammoth, html2canvas) are lazy-loaded per file type so the
// tool page itself stays light.
import type { jsPDF as JsPDF } from 'jspdf';

export type OutputSize = 'a4' | 'letter';
export type FileKind = 'image' | 'text' | 'csv' | 'excel' | 'docx' | 'unsupported';

export interface ConvertResult {
  blob: Blob;
  pages: number;
}

export function detectKind(file: File): FileKind {
  const name = file.name.toLowerCase();
  const type = file.type;
  if (type.startsWith('image/') || /\.(png|jpe?g|webp|gif|bmp|avif|heic)$/.test(name)) return 'image';
  if (/\.(xlsx|xlsm|xlsb|xls|ods)$/.test(name)) return 'excel';
  if (/\.(csv|tsv)$/.test(name) || type === 'text/csv') return 'csv';
  if (/\.docx$/.test(name)) return 'docx';
  if (/\.(txt|md|markdown|log|json|xml|yml|yaml|html?)$/.test(name) || type.startsWith('text/')) return 'text';
  return 'unsupported';
}

export function kindLabel(kind: FileKind): string {
  switch (kind) {
    case 'image': return 'Image';
    case 'text': return 'Text';
    case 'csv': return 'CSV';
    case 'excel': return 'Spreadsheet';
    case 'docx': return 'Word document';
    default: return 'Unsupported';
  }
}

let jsPdfCtor: typeof JsPDF | null = null;
async function getJsPDF(): Promise<typeof JsPDF> {
  if (!jsPdfCtor) jsPdfCtor = (await import('jspdf')).jsPDF;
  return jsPdfCtor;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Could not decode this image.'));
    img.src = src;
  });
}

async function imageToPdf(file: File, size: OutputSize): Promise<JsPDF> {
  const JsPDFCtor = await getJsPDF();
  const url = URL.createObjectURL(file);
  try {
    const img = await loadImage(url);
    // Re-draw through a canvas so webp/gif/bmp/avif and transparent PNGs all normalize to a
    // flattened JPEG that jsPDF can embed reliably.
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth || img.width;
    canvas.height = img.naturalHeight || img.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas not available.');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);

    const landscape = canvas.width > canvas.height;
    const doc = new JsPDFCtor({ unit: 'mm', format: size, orientation: landscape ? 'landscape' : 'portrait' });
    const pw = doc.internal.pageSize.getWidth();
    const ph = doc.internal.pageSize.getHeight();
    const margin = 10;
    const maxW = pw - margin * 2;
    const maxH = ph - margin * 2;
    const ratio = canvas.width / canvas.height;
    let dw = maxW;
    let dh = dw / ratio;
    if (dh > maxH) { dh = maxH; dw = dh * ratio; }
    doc.addImage(dataUrl, 'JPEG', (pw - dw) / 2, (ph - dh) / 2, dw, dh);
    return doc;
  } finally {
    URL.revokeObjectURL(url);
  }
}

async function textToPdf(file: File, size: OutputSize): Promise<JsPDF> {
  const JsPDFCtor = await getJsPDF();
  const text = (await file.text()).replace(/\t/g, '    ');
  const doc = new JsPDFCtor({ unit: 'mm', format: size });
  const pw = doc.internal.pageSize.getWidth();
  const ph = doc.internal.pageSize.getHeight();
  const margin = 15;
  const lineH = 5;
  doc.setFont('courier', 'normal');
  doc.setFontSize(10);
  const lines = doc.splitTextToSize(text, pw - margin * 2) as string[];
  let y = margin;
  for (const line of lines) {
    if (y + lineH > ph - margin) { doc.addPage(); y = margin; }
    doc.text(line, margin, y);
    y += lineH;
  }
  return doc;
}

interface Sheet { name: string; rows: unknown[][]; }

async function tableToPdf(sheets: Sheet[], size: OutputSize): Promise<JsPDF> {
  const JsPDFCtor = await getJsPDF();
  const autoTable = (await import('jspdf-autotable')).default;
  const doc = new JsPDFCtor({ unit: 'mm', format: size, orientation: 'landscape' });
  const multi = sheets.length > 1;
  sheets.forEach((sheet, i) => {
    if (i > 0) doc.addPage();
    let startY = 14;
    if (multi) {
      doc.setFontSize(12);
      doc.text(sheet.name || `Sheet ${i + 1}`, 14, 10);
    }
    const rows = sheet.rows;
    const head = rows.length ? [rows[0].map((c) => (c == null ? '' : String(c)))] : [];
    const body = rows.slice(1).map((r) => r.map((c) => (c == null ? '' : String(c))));
    autoTable(doc, {
      head,
      body,
      startY,
      margin: { left: 10, right: 10 },
      styles: { fontSize: 8, cellPadding: 1.5, overflow: 'linebreak' },
      headStyles: { fillColor: [6, 133, 50], textColor: 255 },
      alternateRowStyles: { fillColor: [246, 248, 247] }
    });
  });
  return doc;
}

async function spreadsheetToPdf(file: File, size: OutputSize, firstSheetOnly: boolean): Promise<JsPDF> {
  const XLSX = await import('xlsx');
  const wb = XLSX.read(new Uint8Array(await file.arrayBuffer()), { type: 'array' });
  const names = firstSheetOnly ? wb.SheetNames.slice(0, 1) : wb.SheetNames;
  const sheets: Sheet[] = names.map((name) => ({
    name,
    rows: XLSX.utils.sheet_to_json(wb.Sheets[name], { header: 1, blankrows: false }) as unknown[][]
  })).filter((s) => s.rows.length > 0);
  if (sheets.length === 0) throw new Error('This file has no readable rows.');
  return tableToPdf(sheets, size);
}

async function htmlToPdf(html: string, size: OutputSize): Promise<JsPDF> {
  const JsPDFCtor = await getJsPDF();
  const html2canvas = (await import('html2canvas')).default;
  const container = document.createElement('div');
  container.style.cssText =
    'position:fixed;left:-99999px;top:0;width:794px;padding:48px;box-sizing:border-box;background:#ffffff;color:#111111;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.55;';
  container.innerHTML = html;
  document.body.appendChild(container);
  try {
    const canvas = await html2canvas(container, { scale: 2, backgroundColor: '#ffffff', useCORS: true });
    const doc = new JsPDFCtor({ unit: 'mm', format: size });
    const pw = doc.internal.pageSize.getWidth();
    const ph = doc.internal.pageSize.getHeight();
    const pxPerMm = canvas.width / pw;
    const pageHpx = Math.floor(ph * pxPerMm);
    let rendered = 0;
    let first = true;
    while (rendered < canvas.height) {
      const sliceH = Math.min(pageHpx, canvas.height - rendered);
      const slice = document.createElement('canvas');
      slice.width = canvas.width;
      slice.height = sliceH;
      const sctx = slice.getContext('2d');
      if (!sctx) break;
      sctx.fillStyle = '#ffffff';
      sctx.fillRect(0, 0, slice.width, slice.height);
      sctx.drawImage(canvas, 0, rendered, canvas.width, sliceH, 0, 0, canvas.width, sliceH);
      if (!first) doc.addPage();
      doc.addImage(slice.toDataURL('image/jpeg', 0.92), 'JPEG', 0, 0, pw, sliceH / pxPerMm);
      rendered += sliceH;
      first = false;
    }
    return doc;
  } finally {
    document.body.removeChild(container);
  }
}

async function docxToPdf(file: File, size: OutputSize): Promise<JsPDF> {
  const mod = (await import('mammoth/mammoth.browser.js')) as unknown as {
    default?: { convertToHtml: (o: { arrayBuffer: ArrayBuffer }) => Promise<{ value: string }> };
    convertToHtml?: (o: { arrayBuffer: ArrayBuffer }) => Promise<{ value: string }>;
  };
  const mammoth = mod.default ?? mod;
  const { value: html } = await mammoth.convertToHtml!({ arrayBuffer: await file.arrayBuffer() });
  return htmlToPdf(html || '<p>(empty document)</p>', size);
}

export interface ConvertOptions {
  size: OutputSize;
  firstSheetOnly?: boolean;
}

/** Merge several already-generated PDF blobs into one, preserving order. */
export async function mergePdfs(blobs: Blob[]): Promise<ConvertResult> {
  const { PDFDocument } = await import('pdf-lib');
  const out = await PDFDocument.create();
  for (const blob of blobs) {
    const src = await PDFDocument.load(await blob.arrayBuffer());
    const copied = await out.copyPages(src, src.getPageIndices());
    copied.forEach((p) => out.addPage(p));
  }
  const bytes = await out.save();
  return { blob: new Blob([bytes as BlobPart], { type: 'application/pdf' }), pages: out.getPageCount() };
}

export async function convertToPdf(file: File, options: ConvertOptions): Promise<ConvertResult> {
  const kind = detectKind(file);
  let doc: JsPDF;
  switch (kind) {
    case 'image': doc = await imageToPdf(file, options.size); break;
    case 'text': doc = await textToPdf(file, options.size); break;
    case 'csv': doc = await spreadsheetToPdf(file, options.size, true); break;
    case 'excel': doc = await spreadsheetToPdf(file, options.size, options.firstSheetOnly ?? false); break;
    case 'docx': doc = await docxToPdf(file, options.size); break;
    default:
      throw new Error('This file type is not supported yet.');
  }
  const pages = doc.getNumberOfPages();
  return { blob: doc.output('blob'), pages };
}

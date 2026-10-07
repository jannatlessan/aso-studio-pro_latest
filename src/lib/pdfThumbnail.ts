// Renders page 1 of a PDF to an image via pdf.js. Used for the before/after preview, because
// mobile browsers (iOS Safari, Android Chrome) refuse to render PDFs inside an <iframe>.
// Everything stays local — the PDF bytes never leave the browser. pdf.js is lazy-loaded so it
// never weighs down initial page load.

type PdfjsModule = typeof import('pdfjs-dist');
let pdfjsPromise: Promise<PdfjsModule> | null = null;

async function getPdfjs(): Promise<PdfjsModule> {
  if (!pdfjsPromise) {
    pdfjsPromise = (async () => {
      const lib = await import('pdfjs-dist');
      const workerUrl = (await import('pdfjs-dist/build/pdf.worker.min.mjs?url')).default;
      lib.GlobalWorkerOptions.workerSrc = workerUrl;
      return lib;
    })();
  }
  return pdfjsPromise;
}

export async function renderFirstPage(data: ArrayBuffer, maxWidth = 800): Promise<string> {
  const lib = await getPdfjs();
  // pdf.js transfers the buffer to its worker (detaching it), so always hand it an owned copy.
  const doc = await lib.getDocument({ data: data.slice(0) }).promise;
  try {
    const page = await doc.getPage(1);
    const base = page.getViewport({ scale: 1 });
    const scale = Math.min(2, maxWidth / base.width);
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement('canvas');
    canvas.width = Math.ceil(viewport.width);
    canvas.height = Math.ceil(viewport.height);
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('no 2d context');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    await page.render({ canvasContext: ctx, viewport, background: '#ffffff' }).promise;
    return canvas.toDataURL('image/jpeg', 0.82);
  } finally {
    doc.destroy();
  }
}

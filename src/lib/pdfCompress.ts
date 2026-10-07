import {
  PDFDocument, PDFName, PDFNumber, PDFArray, PDFDict, PDFRef, PDFRawStream, decodePDFRawStream,
} from 'pdf-lib';

export type CompressMode = 'lossless' | 'smart';

export interface CompressOptions {
  mode: CompressMode;
  jpegQuality: number;
  maxEdge: number;
}

export interface CompressResult {
  bytes: Uint8Array;
  imagesRecompressed: number;
  keptOriginal: boolean;
}

const NAME = (key: string) => PDFName.of(key);

/** Resolve an image ColorSpace to the number of colour channels, or null if we can't safely re-encode it. */
function resolveChannels(doc: PDFDocument, colorSpace: unknown): number | null {
  if (!colorSpace) return null;
  const str = (colorSpace as { toString(): string }).toString();
  if (str === '/DeviceRGB') return 3;
  if (str === '/DeviceGray') return 1;
  // ICCBased is how most cameras, scanners, Acrobat and Photoshop tag photos.
  if (colorSpace instanceof PDFArray && colorSpace.get(0)?.toString() === '/ICCBased') {
    const stream = doc.context.lookup(colorSpace.get(1));
    const n = stream instanceof PDFRawStream ? stream.dict.get(NAME('N')) : undefined;
    const channels = n instanceof PDFNumber ? n.asNumber() : undefined;
    if (channels === 1) return 1;
    if (channels === 3) return 3;
    // N === 4 (CMYK) is skipped: browser canvases can't round-trip CMYK without colour shifts.
  }
  return null;
}

/** Ordered list of filter names on a stream, e.g. ['/FlateDecode', '/DCTDecode']. */
function filterNames(dict: PDFRawStream['dict']): string[] {
  const filter = dict.get(NAME('Filter'));
  if (!filter) return [];
  if (filter instanceof PDFArray) {
    const out: string[] = [];
    for (let i = 0; i < filter.size(); i++) {
      const entry = filter.get(i);
      if (entry) out.push(entry.toString());
    }
    return out;
  }
  return [filter.toString()];
}

/** Recover the embedded JPEG bytes from a stream whose final filter is DCTDecode. */
function extractJpeg(doc: PDFDocument, stream: PDFRawStream, filters: string[]): Uint8Array {
  if (filters.length <= 1) return stream.contents;
  // Apply every filter except the terminal DCTDecode (pdf-lib can't decode DCT itself).
  const ctx = doc.context;
  const preceding = filters.slice(0, -1).map((f) => NAME(f.replace(/^\//, '')));
  const dict = ctx.obj({}) as PDFDict;
  dict.set(NAME('Filter'), ctx.obj(preceding));

  const decodeParms = stream.dict.get(NAME('DecodeParms')) ?? stream.dict.get(NAME('DP'));
  if (decodeParms instanceof PDFArray) {
    const sub = ctx.obj([]) as PDFArray;
    for (let i = 0; i < preceding.length; i++) sub.push(decodeParms.get(i) ?? ctx.obj(null));
    dict.set(NAME('DecodeParms'), sub);
  } else if (decodeParms && preceding.length === 1) {
    dict.set(NAME('DecodeParms'), decodeParms);
  }

  return decodePDFRawStream(PDFRawStream.of(dict, stream.contents)).decode();
}

async function reencodeImages(doc: PDFDocument, jpegQuality: number, maxEdge: number): Promise<number> {
  const ctx = doc.context;
  let recompressed = 0;

  // Streams used as a soft/stencil mask by another image must never be re-encoded as RGB —
  // that would destroy transparency. Collect them up front and skip them.
  const maskRefs = new Set<string>();
  for (const [, obj] of ctx.enumerateIndirectObjects()) {
    if (!(obj instanceof PDFRawStream)) continue;
    for (const key of ['SMask', 'Mask'] as const) {
      const v = obj.dict.get(NAME(key));
      if (v instanceof PDFRef) maskRefs.add(v.toString());
    }
  }

  for (const [ref, obj] of ctx.enumerateIndirectObjects()) {
    if (!(obj instanceof PDFRawStream)) continue;
    if (maskRefs.has(ref.toString())) continue;

    const dict = obj.dict;
    if (dict.get(NAME('Subtype'))?.toString() !== '/Image') continue;
    // These change pixel semantics in ways a plain JPEG can't reproduce — leave them untouched.
    if (dict.get(NAME('ImageMask')) || dict.get(NAME('Mask')) || dict.get(NAME('Decode'))) continue;

    const channels = resolveChannels(doc, dict.get(NAME('ColorSpace')));
    if (channels === null) continue;

    const widthObj = dict.get(NAME('Width'));
    const heightObj = dict.get(NAME('Height'));
    if (!(widthObj instanceof PDFNumber) || !(heightObj instanceof PDFNumber)) continue;
    const srcW = widthObj.asNumber();
    const srcH = heightObj.asNumber();

    const filters = filterNames(dict);
    const terminal = filters[filters.length - 1];
    if (terminal === '/JPXDecode') continue; // JPEG 2000 — not safely re-encodable in-browser

    let sourceCanvas: HTMLCanvasElement | ImageBitmap;
    try {
      if (terminal === '/DCTDecode') {
        const jpeg = extractJpeg(doc, obj, filters);
        sourceCanvas = await createImageBitmap(new Blob([jpeg as BlobPart], { type: 'image/jpeg' }));
      } else {
        // Raw samples (FlateDecode/LZW/… or uncompressed). Needs 8 bits per component.
        if (dict.get(NAME('BitsPerComponent'))?.toString() !== '8') continue;
        const pixels = decodePDFRawStream(obj).decode();
        if (pixels.length !== srcW * srcH * channels) continue;
        const raw = document.createElement('canvas');
        raw.width = srcW;
        raw.height = srcH;
        const rawCtx = raw.getContext('2d');
        if (!rawCtx) continue;
        const rgba = rawCtx.createImageData(srcW, srcH);
        for (let i = 0, j = 0; i < srcW * srcH; i++, j += 4) {
          const k = i * channels;
          rgba.data[j] = pixels[k];
          rgba.data[j + 1] = channels === 1 ? pixels[k] : pixels[k + 1];
          rgba.data[j + 2] = channels === 1 ? pixels[k] : pixels[k + 2];
          rgba.data[j + 3] = 255;
        }
        rawCtx.putImageData(rgba, 0, 0);
        sourceCanvas = raw;
      }
    } catch {
      continue;
    }

    // Downscale to the size cap — but keep full resolution when a soft mask is present so the
    // separate mask image stays aligned to the base image's sample grid.
    const hasSoftMask = dict.get(NAME('SMask')) instanceof PDFRef;
    const scale = hasSoftMask ? 1 : Math.min(1, maxEdge / Math.max(srcW, srcH));
    const outW = Math.max(1, Math.round(srcW * scale));
    const outH = Math.max(1, Math.round(srcH * scale));

    const canvas = document.createElement('canvas');
    canvas.width = outW;
    canvas.height = outH;
    const ctx2d = canvas.getContext('2d');
    if (!ctx2d) continue;
    ctx2d.drawImage(sourceCanvas, 0, 0, outW, outH);
    if ('close' in sourceCanvas) sourceCanvas.close();

    const blob: Blob | null = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', jpegQuality));
    if (!blob) continue;
    const newBytes = new Uint8Array(await blob.arrayBuffer());
    if (newBytes.length >= obj.contents.length) continue; // never make an image larger

    dict.set(NAME('Width'), PDFNumber.of(outW));
    dict.set(NAME('Height'), PDFNumber.of(outH));
    dict.set(NAME('ColorSpace'), NAME('DeviceRGB'));
    dict.set(NAME('BitsPerComponent'), PDFNumber.of(8));
    dict.set(NAME('Filter'), NAME('DCTDecode'));
    dict.set(NAME('Length'), PDFNumber.of(newBytes.length));
    dict.delete(NAME('DecodeParms'));
    dict.delete(NAME('DP'));
    // SMask (if any) is intentionally left in place.

    ctx.assign(ref, PDFRawStream.of(dict, newBytes));
    recompressed++;
  }

  return recompressed;
}

export async function compressPdf(input: ArrayBuffer, options: CompressOptions): Promise<CompressResult> {
  const doc = await PDFDocument.load(input);
  const originalSize = input.byteLength;

  let imagesRecompressed = 0;
  if (options.mode === 'smart') {
    imagesRecompressed = await reencodeImages(doc, options.jpegQuality, options.maxEdge);
  }

  const bytes = await doc.save({ useObjectStreams: true });

  if (bytes.byteLength >= originalSize) {
    return { bytes: new Uint8Array(input), imagesRecompressed: 0, keptOriginal: true };
  }
  return { bytes, imagesRecompressed, keptOriginal: false };
}

import { PDFDocument, PDFName, PDFNumber, PDFRawStream, decodePDFRawStream } from 'pdf-lib';

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

async function reencodeJpegImages(doc: PDFDocument, jpegQuality: number, maxEdge: number): Promise<number> {
  const ctx = doc.context;
  let recompressed = 0;

  for (const [ref, obj] of ctx.enumerateIndirectObjects()) {
    if (!(obj instanceof PDFRawStream)) continue;
    const dict = obj.dict;

    if (dict.get(NAME('Subtype'))?.toString() !== '/Image') continue;
    if (dict.get(NAME('SMask')) || dict.get(NAME('Mask')) || dict.get(NAME('Decode')) || dict.get(NAME('ImageMask'))) continue;
    if (dict.get(NAME('BitsPerComponent'))?.toString() !== '8') continue;

    const filter = dict.get(NAME('Filter'))?.toString();
    if (filter !== '/DCTDecode' && filter !== '/FlateDecode' && filter !== undefined) continue;

    const colorSpace = dict.get(NAME('ColorSpace'))?.toString();
    if (colorSpace !== '/DeviceRGB' && colorSpace !== '/DeviceGray') continue;

    const widthObj = dict.get(NAME('Width'));
    const heightObj = dict.get(NAME('Height'));
    if (!(widthObj instanceof PDFNumber) || !(heightObj instanceof PDFNumber)) continue;
    const srcW = widthObj.asNumber();
    const srcH = heightObj.asNumber();

    const original = obj.contents;
    let sourceCanvas: HTMLCanvasElement | ImageBitmap;
    try {
      if (filter === '/DCTDecode') {
        sourceCanvas = await createImageBitmap(new Blob([original], { type: 'image/jpeg' }));
      } else {
        const pixels = decodePDFRawStream(obj).decode();
        const channels = colorSpace === '/DeviceGray' ? 1 : 3;
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

    const scale = Math.min(1, maxEdge / Math.max(srcW, srcH));
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
    if (newBytes.length >= original.length) continue;

    dict.set(NAME('Width'), PDFNumber.of(outW));
    dict.set(NAME('Height'), PDFNumber.of(outH));
    dict.set(NAME('ColorSpace'), NAME('DeviceRGB'));
    dict.set(NAME('BitsPerComponent'), PDFNumber.of(8));
    dict.set(NAME('Filter'), NAME('DCTDecode'));
    dict.set(NAME('Length'), PDFNumber.of(newBytes.length));
    dict.delete(NAME('DecodeParms'));

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
    imagesRecompressed = await reencodeJpegImages(doc, options.jpegQuality, options.maxEdge);
  }

  const bytes = await doc.save({ useObjectStreams: true });

  if (bytes.byteLength >= originalSize) {
    return { bytes: new Uint8Array(input), imagesRecompressed: 0, keptOriginal: true };
  }
  return { bytes, imagesRecompressed, keptOriginal: false };
}

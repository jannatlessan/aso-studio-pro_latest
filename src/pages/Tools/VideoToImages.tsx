import { useState, useRef, useEffect } from 'react';
import JSZip from 'jszip';
import {
  Images, Download, Upload, ChevronLeft, ChevronRight, RefreshCcw,
  ShieldCheck, Loader2, Settings2, SkipForward, Maximize,
  SlidersHorizontal, CheckCircle2, Sparkles, Gauge, FileBox,
  Archive, Grid3x3, XCircle, Camera, Package, X, Expand
} from 'lucide-react';
import { useToolNavigation } from '../../hooks/useToolNavigation';
import Footer from '../../components/Footer';
import SEO from '../../components/SEO';
import AdBlockDetector from '../../components/AdBlockDetector';

type ProcessState = 'idle' | 'processing' | 'done' | 'error';
type ImageFormat = 'png' | 'jpeg';
type RatePreset = 'sparse' | 'standard' | 'smooth' | 'dense' | 'custom';

const MAX_FRAMES = 300;

interface VideoMeta {
  file: File;
  url: string;
  duration: number;
  width: number;
  height: number;
}

interface FrameData {
  index: number;
  time: number;
  blob: Blob;
  url: string;
}

const sanitizeName = (name: string) => name.replace(/[^a-z0-9-_]/gi, '-') || 'frame';
const padIndex = (n: number) => String(n).padStart(4, '0');

export default function VideoToImages() {
  const [videoMeta, setVideoMeta] = useState<VideoMeta | null>(null);
  const [processState, setProcessState] = useState<ProcessState>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const [frames, setFrames] = useState<FrameData[]>([]);
  const [extractProgress, setExtractProgress] = useState({ current: 0, total: 0 });
  const [zipping, setZipping] = useState(false);
  const [zipProgress, setZipProgress] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Settings
  const [ratePreset, setRatePreset] = useState<RatePreset>('standard');
  const [fps, setFps] = useState(5);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(10);
  const [format, setFormat] = useState<ImageFormat>('jpeg');
  const [jpegQuality, setJpegQuality] = useState(0.9);
  const [outputWidth, setOutputWidth] = useState(1280);
  const [exportName, setExportName] = useState('aura-frames');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cancelRef = useRef(false);
  const framesRef = useRef<FrameData[]>([]);

  const isToolUsed = videoMeta !== null;

  useEffect(() => {
    framesRef.current = frames;
  }, [frames]);

  // Revoke every blob URL we ever created when the component unmounts
  useEffect(() => {
    return () => {
      framesRef.current.forEach(f => URL.revokeObjectURL(f.url));
      if (videoMeta) URL.revokeObjectURL(videoMeta.url);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keyboard controls for the fullscreen lightbox
  useEffect(() => {
    if (lightboxIndex === null) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxIndex(null);
      else if (e.key === 'ArrowRight') setLightboxIndex((i) => (i === null ? i : Math.min(i + 1, frames.length - 1)));
      else if (e.key === 'ArrowLeft') setLightboxIndex((i) => (i === null ? i : Math.max(i - 1, 0)));
    };
    window.addEventListener('keydown', handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [lightboxIndex, frames.length]);

  const estimatedFrames = videoMeta ? Math.max(0, Math.floor((endTime - startTime) * fps)) : 0;
  const exceedsCap = estimatedFrames > MAX_FRAMES;

  const applyPreset = (p: RatePreset) => {
    setRatePreset(p);
    if (p === 'sparse') setFps(1);
    else if (p === 'standard') setFps(5);
    else if (p === 'smooth') setFps(15);
    else if (p === 'dense') setFps(30);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    const video = document.createElement('video');
    video.src = url;
    video.muted = true;

    video.onloadedmetadata = () => {
      setVideoMeta({ file, url, duration: video.duration, width: video.videoWidth, height: video.videoHeight });
      setStartTime(0);
      setEndTime(Math.min(video.duration, 10));
      setOutputWidth(Math.min(video.videoWidth || 1280, 1920));
      setFps(5);
      setRatePreset('standard');
      setFormat('jpeg');
      setJpegQuality(0.9);

      setProcessState('idle');
      framesRef.current.forEach(f => URL.revokeObjectURL(f.url));
      setFrames([]);
      setErrorMsg('');
      const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || 'video';
      setExportName(`${baseName}-frames`);
    };

    video.onerror = () => {
      setErrorMsg('Could not read this video file. Please try a different MP4, WebM, or MOV file.');
      setProcessState('error');
    };
  };

  const waitForSeek = (video: HTMLVideoElement, time: number): Promise<void> => {
    return new Promise((resolve) => {
      let settled = false;
      const onSeeked = () => {
        if (settled) return;
        settled = true;
        cleanup();
        // Double rAF ensures the freshly decoded frame has actually painted before we read it
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
      };
      const timeoutId = window.setTimeout(() => {
        if (settled) return;
        settled = true;
        cleanup();
        resolve();
      }, 3000);
      const cleanup = () => {
        video.removeEventListener('seeked', onSeeked);
        window.clearTimeout(timeoutId);
      };
      video.addEventListener('seeked', onSeeked);
      video.currentTime = time;
    });
  };

  const extractFrames = async () => {
    if (!videoMeta || !videoRef.current || !canvasRef.current || exceedsCap || estimatedFrames < 1) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    cancelRef.current = false;
    setErrorMsg('');
    setProcessState('processing');
    setLightboxIndex(null);

    framesRef.current.forEach(f => URL.revokeObjectURL(f.url));
    setFrames([]);

    const total = Math.min(MAX_FRAMES, estimatedFrames);
    const srcW = video.videoWidth || videoMeta.width;
    const srcH = video.videoHeight || videoMeta.height;
    const targetW = Math.min(outputWidth, srcW) || srcW;
    canvas.width = Math.round(targetW);
    canvas.height = Math.round(targetW * (srcH / srcW));

    const mime = format === 'png' ? 'image/png' : 'image/jpeg';
    const collected: FrameData[] = [];
    video.pause();

    try {
      for (let i = 0; i < total; i++) {
        if (cancelRef.current) break;
        const t = Math.min(startTime + i / fps, Math.max(0, videoMeta.duration - 0.01));
        await waitForSeek(video, t);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const blob: Blob | null = await new Promise((resolve) => {
          canvas.toBlob(resolve, mime, format === 'jpeg' ? jpegQuality : undefined);
        });

        if (blob) {
          collected.push({ index: i, time: t, blob, url: URL.createObjectURL(blob) });
        }
        setExtractProgress({ current: i + 1, total });
      }

      if (cancelRef.current) {
        collected.forEach(f => URL.revokeObjectURL(f.url));
        setProcessState('idle');
        return;
      }

      setFrames(collected);
      setProcessState('done');
    } catch (err: any) {
      console.error(err);
      collected.forEach(f => URL.revokeObjectURL(f.url));
      setErrorMsg(err.message || 'Something went wrong while reading frames from this video.');
      setProcessState('error');
    }
  };

  const cancelExtraction = () => {
    cancelRef.current = true;
  };

  const downloadAllAsZip = async () => {
    if (frames.length === 0) return;
    setZipping(true);
    setZipProgress(0);
    try {
      const zip = new JSZip();
      const ext = format === 'png' ? 'png' : 'jpg';
      const safeName = sanitizeName(exportName);
      frames.forEach((f, idx) => {
        zip.file(`${safeName}-${padIndex(idx + 1)}.${ext}`, f.blob);
      });
      const content = await zip.generateAsync({ type: 'blob', compression: 'STORE' }, (meta) => {
        setZipProgress(meta.percent);
      });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${safeName}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 2000);
    } finally {
      setZipping(false);
      setZipProgress(0);
    }
  };

  const resetAll = () => {
    if (fileInputRef.current) fileInputRef.current.value = '';
    framesRef.current.forEach(f => URL.revokeObjectURL(f.url));
    if (videoMeta) URL.revokeObjectURL(videoMeta.url);
    cancelRef.current = true;
    setVideoMeta(null);
    setFrames([]);
    setProcessState('idle');
    setErrorMsg('');
    setLightboxIndex(null);
    setExtractProgress({ current: 0, total: 0 });
    setRatePreset('standard');
    setFps(5);
    setStartTime(0);
    setEndTime(10);
    setFormat('jpeg');
    setJpegQuality(0.9);
    setOutputWidth(1280);
    setExportName('aura-frames');
  };

  const { handleBackClick } = useToolNavigation({
    toolName: 'Video to Images',
    isToolUsed,
    onReset: resetAll
  });

  const ext = format === 'png' ? 'png' : 'jpg';

  return (
    <>
      <AdBlockDetector />
      <div className="min-h-screen bg-white text-ink selection:bg-primary/20 font-sans">
        <SEO
          title="AuraCut Studio | Video to Images Frame Extractor"
          description="Convert any video into a sequence of high-quality images. Extract frames at a custom rate, preview every image, and download individually or as a single ZIP archive. 100% offline browser processing."
          url="https://shaaddev.studio/tools/video-to-images"
        />

        {/* Modern Header */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/85 backdrop-blur-xl border-b border-black/[0.06]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={handleBackClick} className="p-2 hover:bg-black/[0.04] rounded-full transition-colors group" title={isToolUsed ? "(Click to reset)" : undefined}>
                <ChevronLeft className="w-5 h-5 text-[#55605B] group-hover:text-ink" />
              </button>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary-dark flex items-center justify-center border border-black/5 shadow-lg shadow-primary/20">
                  <Images className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h1 className="text-sm font-black uppercase tracking-widest text-ink">
                    {isToolUsed ? 'Video to Images' : 'Back to Tools'}
                  </h1>
                  <p className="text-[10px] text-primary font-bold tracking-widest uppercase">100% Secure Local Engine</p>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={resetAll} className="h-8 px-4 text-xs font-bold bg-black/[0.03] hover:bg-black/[0.06] border border-black/10 text-[#55605B] rounded-full transition-colors flex items-center gap-2 uppercase tracking-widest hidden sm:flex">
                <RefreshCcw className="w-3 h-3" /> Reset
              </button>
              {processState === 'done' && frames.length > 0 && (
                <button
                  onClick={downloadAllAsZip}
                  disabled={zipping}
                  className="h-8 px-5 text-xs font-bold bg-primary-dark hover:bg-[#048532] text-white disabled:opacity-60 disabled:cursor-wait rounded-full transition-all flex items-center gap-2 shadow-lg shadow-primary/25 uppercase tracking-widest"
                >
                  {zipping ? <Loader2 className="w-3 h-3 animate-spin" /> : <Archive className="w-3 h-3" />}
                  {zipping ? `Zipping ${Math.round(zipProgress)}%` : 'Download All (.zip)'}
                </button>
              )}
            </div>
          </div>
        </nav>

        <main className="pt-20 pb-24 min-h-[90vh] flex flex-col items-center justify-center p-4">

          {/* State: Idle / Setup */}
          {!videoMeta && (
            <div className="w-full max-w-2xl text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-mint border border-primary/20 text-primary text-xs font-black uppercase tracking-widest">
                <Sparkles className="w-3 h-3" /> Zero Cloud Dependency
              </div>

              <h2 className="text-5xl md:text-7xl font-black tracking-tight text-ink pb-2">
                Every Frame.<br/><span className="text-primary">One Video.</span>
              </h2>

              <p className="text-[#55605B] max-w-xl mx-auto text-lg leading-relaxed font-medium">
                Turn any video into a downloadable sequence of images. Pick your extraction rate, preview each frame, and grab a single image or the entire batch as a ZIP — all rendered natively inside your browser.
              </p>

              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const file = e.dataTransfer.files?.[0];
                  if (file && file.type.startsWith('video/')) {
                    const dt = new DataTransfer();
                    dt.items.add(file);
                    if (fileInputRef.current) {
                      fileInputRef.current.files = dt.files;
                      handleFileUpload({ target: fileInputRef.current } as any);
                    }
                  }
                }}
                onClick={() => fileInputRef.current?.click()}
                className="relative group cursor-pointer"
              >
                <div className="absolute inset-0 bg-primary/10 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500 opacity-50 group-hover:opacity-100"></div>
                <div className="relative border-2 border-dashed border-primary/30 hover:border-primary rounded-3xl p-16 bg-[#F6F8F7] transition-all flex flex-col items-center gap-6">
                  <div className="w-20 h-20 rounded-2xl bg-mint border border-primary/30 flex items-center justify-center relative overflow-hidden">
                    <Upload className="w-8 h-8 text-primary z-10" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-ink mb-2">Upload Video</h3>
                    <p className="text-sm text-[#55605B] font-medium">Drag & drop your file here, or click to browse</p>
                    <p className="text-xs text-[#8B958F] mt-2 font-mono">Supports MP4, WebM, MOV</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 text-primary text-xs font-bold uppercase tracking-widest">
                <ShieldCheck className="w-4 h-4" /> 100% Secure & Private Hardware Processing
              </div>
            </div>
          )}

          {/* State: Config / Processing / Done — video stays mounted throughout so seeking never breaks */}
          {videoMeta && (
            <div className="w-full max-w-[1400px] grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-500">
              {/* Visual Preview Window */}
              <div className="lg:col-span-8 xl:col-span-9 flex flex-col items-center justify-center p-4 sm:p-8 bg-[#F6F8F7] rounded-3xl border border-black/10 relative overflow-hidden min-h-[400px] xl:min-h-[700px]">
                <video
                  ref={videoRef}
                  src={videoMeta.url}
                  controls={processState === 'idle'}
                  muted
                  playsInline
                  className="relative z-10 w-full h-full max-w-5xl max-h-[75vh] rounded-xl border border-black/10 shadow-2xl bg-black"
                />

                {processState === 'processing' && (
                  <div className="absolute inset-0 z-20 bg-white/90 backdrop-blur-md flex flex-col items-center justify-center gap-6 p-8">
                    <div className="w-full max-w-md space-y-6 text-center">
                      <Loader2 className="w-14 h-14 text-primary animate-spin mx-auto" />
                      <div className="space-y-2">
                        <h3 className="text-lg font-bold text-ink">Extracting Frame {extractProgress.current} / {extractProgress.total}</h3>
                        <div className="w-full h-1.5 bg-black/[0.06] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary-dark transition-all duration-150"
                            style={{ width: `${extractProgress.total ? (extractProgress.current / extractProgress.total) * 100 : 0}%` }}
                          />
                        </div>
                        <p className="text-xs text-[#55605B] uppercase tracking-widest font-mono">
                          {Math.round(extractProgress.total ? (extractProgress.current / extractProgress.total) * 100 : 0)}% Complete
                        </p>
                      </div>
                      <button
                        onClick={cancelExtraction}
                        className="inline-flex items-center gap-2 px-5 py-2 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 rounded-full text-xs font-bold uppercase tracking-widest transition-colors"
                      >
                        <XCircle className="w-3 h-3" /> Cancel Extraction
                      </button>
                      <p className="text-[10px] text-amber-600 font-bold uppercase tracking-widest leading-relaxed flex items-center justify-center gap-1.5">
                        <ShieldCheck className="w-3 h-3" /> Please do not close or refresh this tab
                      </p>
                    </div>
                  </div>
                )}

                {processState === 'done' && frames.length > 0 && (
                  <div className="absolute inset-0 z-20 bg-white/95 overflow-y-auto custom-scrollbar p-4 sm:p-8">
                    <div className="flex items-center justify-between mb-4 sticky top-0 bg-white/95 backdrop-blur pb-4 z-10">
                      <div className="flex items-center gap-2">
                        <Grid3x3 className="w-4 h-4 text-primary" />
                        <h3 className="text-sm font-black uppercase tracking-widest text-ink">{frames.length} Frames Extracted</h3>
                      </div>
                      <button
                        onClick={() => setProcessState('idle')}
                        className="text-xs font-bold text-[#55605B] hover:text-ink uppercase tracking-widest transition-colors"
                      >
                        Back to Settings
                      </button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {frames.map((frame) => (
                        <button
                          key={frame.index}
                          type="button"
                          onClick={() => setLightboxIndex(frame.index)}
                          className="relative group rounded-xl overflow-hidden border border-black/10 bg-black aspect-video text-left cursor-zoom-in"
                        >
                          <img src={frame.url} alt={`Frame ${frame.index + 1}`} className="w-full h-full object-cover" loading="lazy" />
                          <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                            <span className="text-[10px] font-mono text-white/70">{frame.time.toFixed(2)}s</span>
                            <div className="flex items-center gap-1.5">
                              <span
                                onClick={(e) => { e.stopPropagation(); setLightboxIndex(frame.index); }}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest transition-colors"
                              >
                                <Expand className="w-3 h-3" /> View
                              </span>
                              <a
                                href={frame.url}
                                download={`${sanitizeName(exportName)}-${padIndex(frame.index + 1)}.${ext}`}
                                onClick={(e) => e.stopPropagation()}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-primary-dark hover:bg-[#048532] text-white rounded-lg text-[10px] font-bold uppercase tracking-widest transition-colors"
                              >
                                <Download className="w-3 h-3" /> Save
                              </a>
                            </div>
                          </div>
                          <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/70 text-[9px] font-mono text-white/60">#{frame.index + 1}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Master Settings Panel */}
              <div className="lg:col-span-4 xl:col-span-3 bg-white rounded-3xl border border-black/10 shadow-lg shadow-black/5 p-6 flex flex-col max-h-[90vh] overflow-y-auto custom-scrollbar">
                <div className="space-y-8 flex-1">

                  {/* Export Control */}
                  {processState === 'idle' && (
                    <button
                      onClick={extractFrames}
                      disabled={exceedsCap || estimatedFrames < 1}
                      className="w-full flex items-center justify-center gap-2 bg-primary-dark hover:bg-[#048532] text-white disabled:opacity-40 disabled:cursor-not-allowed py-4 rounded-xl font-black uppercase tracking-widest text-sm shadow-lg shadow-primary/25 transition-all"
                    >
                      <Camera className="w-5 h-5"/> Extract Frames
                    </button>
                  )}
                  {processState === 'idle' && (
                    <p className={`text-[10px] text-center font-bold uppercase tracking-widest -mt-4 ${exceedsCap ? 'text-red-600' : 'text-[#8B958F]'}`}>
                      {estimatedFrames < 1
                        ? 'Adjust the time range or rate to extract at least 1 frame'
                        : exceedsCap
                        ? `~${estimatedFrames} frames exceeds the ${MAX_FRAMES} cap — lower the FPS or trim the range`
                        : `Will extract ~${estimatedFrames} image${estimatedFrames === 1 ? '' : 's'}`}
                    </p>
                  )}
                  {processState === 'done' && (
                    <button
                      onClick={downloadAllAsZip}
                      disabled={zipping}
                      className="w-full flex items-center justify-center gap-2 bg-primary-dark hover:bg-[#048532] text-white disabled:opacity-60 disabled:cursor-wait py-4 rounded-xl font-black uppercase tracking-widest text-sm shadow-lg shadow-primary/25 transition-all"
                    >
                      {zipping ? <Loader2 className="w-5 h-5 animate-spin" /> : <Package className="w-5 h-5" />}
                      {zipping ? `Zipping ${Math.round(zipProgress)}%` : 'Download All as ZIP'}
                    </button>
                  )}

                  {/* Section 1: Rate Presets */}
                  {processState === 'idle' && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 border-b border-black/10 pb-2">
                        <Sparkles className="w-4 h-4 text-primary" />
                        <h2 className="font-black text-xs uppercase tracking-widest text-ink">Extraction Rate</h2>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <button onClick={() => applyPreset('sparse')} className={`flex flex-col items-center justify-center p-3 rounded-xl border text-[10px] font-bold uppercase tracking-widest gap-2 transition-all ${ratePreset === 'sparse' ? 'bg-mint border-primary text-primary' : 'bg-white border-black/10 text-[#55605B] hover:bg-mint'}`}>
                          <Settings2 className="w-4 h-4" /> Sparse (1 FPS)
                        </button>
                        <button onClick={() => applyPreset('standard')} className={`flex flex-col items-center justify-center p-3 rounded-xl border text-[10px] font-bold uppercase tracking-widest gap-2 transition-all ${ratePreset === 'standard' ? 'bg-mint border-primary text-primary' : 'bg-white border-black/10 text-[#55605B] hover:bg-mint'}`}>
                          <Grid3x3 className="w-4 h-4" /> Standard (5 FPS)
                        </button>
                        <button onClick={() => applyPreset('smooth')} className={`flex flex-col items-center justify-center p-3 rounded-xl border text-[10px] font-bold uppercase tracking-widest gap-2 transition-all ${ratePreset === 'smooth' ? 'bg-mint border-primary text-primary' : 'bg-white border-black/10 text-[#55605B] hover:bg-mint'}`}>
                          <Gauge className="w-4 h-4" /> Smooth (15 FPS)
                        </button>
                        <button onClick={() => applyPreset('dense')} className={`flex flex-col items-center justify-center p-3 rounded-xl border text-[10px] font-bold uppercase tracking-widest gap-2 transition-all ${ratePreset === 'dense' ? 'bg-mint border-primary text-primary' : 'bg-white border-black/10 text-[#55605B] hover:bg-mint'}`}>
                          <Images className="w-4 h-4" /> Dense (30 FPS)
                        </button>
                      </div>
                      <div className="space-y-2 p-4 bg-[#F6F8F7] rounded-xl border border-black/[0.06]">
                        <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-[#55605B]">
                          <span className="flex items-center gap-1"><Gauge className="w-3 h-3"/> Custom Frames / Sec</span>
                          <span className="text-primary">{fps} FPS</span>
                        </div>
                        <input type="range" min="0.2" max="30" step="0.1" value={fps} onChange={(e) => { setFps(parseFloat(e.target.value)); setRatePreset('custom'); }} className="w-full accent-primary" />
                      </div>
                    </div>
                  )}

                  {/* Section 2: Time Range */}
                  {processState === 'idle' && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 border-b border-black/10 pb-2">
                        <SkipForward className="w-4 h-4 text-primary" />
                        <h2 className="font-black text-xs uppercase tracking-widest text-ink">Time Range</h2>
                      </div>
                      <div className="space-y-4 p-4 bg-[#F6F8F7] rounded-xl border border-black/[0.06]">
                        <div className="space-y-2">
                          <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-[#55605B]">
                            <span>Start Second</span>
                            <span className="text-primary">{startTime.toFixed(1)}s</span>
                          </div>
                          <input type="range" min="0" max={Math.max(0, videoMeta.duration - 0.5)} step="0.1" value={startTime} onChange={(e) => {
                            const v = parseFloat(e.target.value);
                            setStartTime(v);
                            if (v >= endTime) setEndTime(Math.min(v + 2, videoMeta.duration));
                            if (videoRef.current) videoRef.current.currentTime = v;
                          }} className="w-full accent-primary" />
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-[#55605B]">
                            <span>End Second</span>
                            <span className="text-primary">{endTime.toFixed(1)}s</span>
                          </div>
                          <input type="range" min={Math.min(startTime + 0.1, videoMeta.duration)} max={videoMeta.duration} step="0.1" value={endTime} onChange={(e) => {
                            const v = parseFloat(e.target.value);
                            setEndTime(v);
                            if (videoRef.current) videoRef.current.currentTime = v;
                          }} className="w-full accent-primary" />
                        </div>
                        <p className="text-[10px] text-[#8B958F] text-center uppercase tracking-widest font-mono pt-2 border-t border-black/10">Length: {(endTime - startTime).toFixed(1)}s</p>
                      </div>
                    </div>
                  )}

                  {/* Export Naming */}
                  {(processState === 'idle' || processState === 'done') && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 border-b border-black/10 pb-2">
                        <FileBox className="w-4 h-4 text-primary" />
                        <h2 className="font-black text-xs uppercase tracking-widest text-ink">Export Naming</h2>
                      </div>
                      <div className="space-y-2 p-4 bg-[#F6F8F7] rounded-xl border border-black/[0.06]">
                        <div className="text-[10px] font-bold uppercase tracking-widest text-[#55605B] mb-2">Filename Prefix</div>
                        <input
                          type="text"
                          value={exportName}
                          onChange={(e) => setExportName(e.target.value.replace(/[^a-z0-9-_]/gi, '-'))}
                          className="w-full bg-white border border-black/10 rounded-lg px-3 py-2 text-sm text-ink focus:outline-none focus:border-primary transition-colors"
                          placeholder="my-video-frames"
                        />
                        <p className="text-[10px] text-[#8B958F] text-right font-mono mt-1">{sanitizeName(exportName)}-0001.{ext}</p>
                      </div>
                    </div>
                  )}

                  {/* Section 3: Encoding Specs */}
                  {processState === 'idle' && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 border-b border-black/10 pb-2">
                        <SlidersHorizontal className="w-4 h-4 text-primary" />
                        <h2 className="font-black text-xs uppercase tracking-widest text-ink">Image Specs</h2>
                      </div>
                      <div className="space-y-4 p-4 bg-[#F6F8F7] rounded-xl border border-black/[0.06]">
                        <div className="space-y-2">
                          <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-[#55605B]">
                            <span>Format</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <button onClick={() => setFormat('jpeg')} className={`py-2 rounded-lg border text-[10px] font-bold uppercase tracking-widest transition-all ${format === 'jpeg' ? 'bg-mint border-primary text-primary' : 'bg-white border-black/10 text-[#55605B] hover:bg-mint'}`}>JPEG (Smaller)</button>
                            <button onClick={() => setFormat('png')} className={`py-2 rounded-lg border text-[10px] font-bold uppercase tracking-widest transition-all ${format === 'png' ? 'bg-mint border-primary text-primary' : 'bg-white border-black/10 text-[#55605B] hover:bg-mint'}`}>PNG (Lossless)</button>
                          </div>
                        </div>
                        {format === 'jpeg' && (
                          <div className="space-y-2">
                            <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-[#55605B]">
                              <span>JPEG Quality</span>
                              <span className="text-primary">{Math.round(jpegQuality * 100)}%</span>
                            </div>
                            <input type="range" min="0.5" max="1" step="0.05" value={jpegQuality} onChange={(e) => setJpegQuality(parseFloat(e.target.value))} className="w-full accent-primary" />
                          </div>
                        )}
                        <div className="space-y-2">
                          <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-[#55605B]">
                            <span className="flex items-center gap-1"><Maximize className="w-3 h-3"/> Output Width</span>
                            <span className="text-primary">{outputWidth} PX</span>
                          </div>
                          <input type="range" min="240" max={Math.max(240, Math.min(videoMeta.width || 1920, 1920))} step="10" value={outputWidth} onChange={(e) => setOutputWidth(parseInt(e.target.value))} className="w-full accent-primary" />
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            </div>
          )}

          {/* Error Block */}
          {processState === 'error' && (
            <div className="w-full max-w-lg p-8 bg-red-50 border border-red-200 rounded-3xl text-center space-y-4 mt-8">
              <h3 className="text-xl font-bold text-red-600">Frame Extraction Failed</h3>
              <p className="text-sm text-red-700/80">{errorMsg}</p>
              <button onClick={() => setProcessState('idle')} className="px-6 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-full text-xs font-bold uppercase tracking-widest transition-colors">Adjust Settings & Retry</button>
            </div>
          )}
        </main>

        {/* Fullscreen single-frame lightbox */}
        {lightboxIndex !== null && frames[lightboxIndex] && (
          <div
            className="fixed inset-0 z-[999] bg-black/95 backdrop-blur-sm flex flex-col animate-in fade-in duration-200"
            onClick={() => setLightboxIndex(null)}
          >
            <div className="flex items-center justify-between px-4 sm:px-8 py-4 text-white shrink-0" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 rounded-full bg-white/10 text-xs font-mono font-bold">
                  {lightboxIndex + 1} / {frames.length}
                </span>
                <span className="text-xs font-mono text-white/50">{frames[lightboxIndex].time.toFixed(2)}s</span>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={frames[lightboxIndex].url}
                  download={`${sanitizeName(exportName)}-${padIndex(frames[lightboxIndex].index + 1)}.${ext}`}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary-dark hover:bg-[#048532] text-white rounded-full text-xs font-bold uppercase tracking-widest transition-colors"
                >
                  <Download className="w-3.5 h-3.5" /> Save Image
                </a>
                <button
                  onClick={() => setLightboxIndex(null)}
                  aria-label="Close fullscreen preview"
                  className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="relative flex-1 flex items-center justify-center px-4 sm:px-16 pb-6 min-h-0" onClick={(e) => e.stopPropagation()}>
              <img
                src={frames[lightboxIndex].url}
                alt={`Frame ${frames[lightboxIndex].index + 1} full preview`}
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              />

              {lightboxIndex > 0 && (
                <button
                  onClick={() => setLightboxIndex((i) => (i !== null ? i - 1 : i))}
                  aria-label="Previous frame"
                  className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 p-2.5 sm:p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}
              {lightboxIndex < frames.length - 1 && (
                <button
                  onClick={() => setLightboxIndex((i) => (i !== null ? i + 1 : i))}
                  aria-label="Next frame"
                  className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 p-2.5 sm:p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        )}

        <canvas ref={canvasRef} className="hidden"></canvas>
        <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="video/mp4,video/webm,video/quicktime,video/x-m4v" className="hidden" />

        {/* SEO Environment block */}
        <section className="bg-[#F6F8F7] border-t border-black/[0.06] py-24 px-4 relative z-10" itemScope itemType="https://schema.org/WebPage">
          <div className="max-w-6xl mx-auto space-y-24">
            <div className="text-center space-y-8 max-w-4xl mx-auto">
              <h2 className="text-4xl md:text-6xl font-black text-ink leading-tight" itemProp="headline">The Ultimate Free Video to Image Frame Extractor</h2>
              <p className="text-[#55605B] text-lg md:text-xl leading-relaxed" itemProp="description">
                Turn MP4, WebM, and QuickTime videos into a full sequence of downloadable images. Choose your exact frame rate, trim to the range you need, preview every extracted image, and export one photo or the entire batch as a ZIP archive. No uploads, no watermarks, no subscriptions — everything renders locally on your device.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white border border-black/10 shadow-sm shadow-black/[0.02] p-6 rounded-2xl space-y-4">
                <Gauge className="w-8 h-8 text-primary" />
                <h3 className="text-ink font-bold">Custom Frame Rate</h3>
                <p className="text-sm text-[#55605B]">Sample anywhere from 1 frame every few seconds up to 30 frames per second, with instant live estimates of how many images you'll get.</p>
              </div>
              <div className="bg-white border border-black/10 shadow-sm shadow-black/[0.02] p-6 rounded-2xl space-y-4">
                <Grid3x3 className="w-8 h-8 text-primary" />
                <h3 className="text-ink font-bold">Full Preview Grid</h3>
                <p className="text-sm text-[#55605B]">Every extracted frame is laid out in a scrollable gallery with its exact timestamp, so you can spot the shots you actually want.</p>
              </div>
              <div className="bg-white border border-black/10 shadow-sm shadow-black/[0.02] p-6 rounded-2xl space-y-4">
                <Archive className="w-8 h-8 text-primary" />
                <h3 className="text-ink font-bold">Single or ZIP Download</h3>
                <p className="text-sm text-[#55605B]">Save one perfect frame instantly, or bundle the entire sequence into a single ZIP file with one click.</p>
              </div>
              <div className="bg-white border border-black/10 shadow-sm shadow-black/[0.02] p-6 rounded-2xl space-y-4">
                <CheckCircle2 className="w-8 h-8 text-primary" />
                <h3 className="text-ink font-bold">Stable by Design</h3>
                <p className="text-sm text-[#55605B]">A frame cap and cancel button keep long videos from overwhelming your browser's memory, so extraction always stays responsive.</p>
              </div>
            </div>

            <div className="space-y-12 max-w-4xl mx-auto">
              <h3 className="text-3xl font-black text-ink text-center">Frequently Asked Questions</h3>
              <div className="grid gap-6" itemScope itemType="https://schema.org/FAQPage">
                <div className="bg-white border border-black/10 shadow-sm shadow-black/[0.02] p-8 rounded-2xl space-y-4" itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                  <div className="flex items-center gap-4">
                    <ShieldCheck className="w-8 h-8 text-primary shrink-0" />
                    <h4 className="text-ink font-extrabold text-xl" itemProp="name">Is my video uploaded to a server?</h4>
                  </div>
                  <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer" className="pl-12">
                    <p className="text-sm text-[#55605B] leading-relaxed" itemProp="text">No. Your video file never leaves your device. We use your browser's native video decoder and a canvas element to read and capture frames directly in memory, then package them locally with JSZip. Nothing is transmitted anywhere.</p>
                  </div>
                </div>
                <div className="bg-white border border-black/10 shadow-sm shadow-black/[0.02] p-8 rounded-2xl space-y-4" itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                  <div className="flex items-center gap-4">
                    <Images className="w-8 h-8 text-primary shrink-0" />
                    <h4 className="text-ink font-extrabold text-xl" itemProp="name">Can I really extract every single frame?</h4>
                  </div>
                  <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer" className="pl-12">
                    <p className="text-sm text-[#55605B] leading-relaxed" itemProp="text">Yes — set the custom rate slider up to 30 FPS to closely match most source footage. To keep extraction fast and your browser stable, each batch is capped at {MAX_FRAMES} frames; for longer clips, trim the time range or lower the rate and run it again in sections.</p>
                  </div>
                </div>
                <div className="bg-white border border-black/10 shadow-sm shadow-black/[0.02] p-8 rounded-2xl space-y-4" itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                  <div className="flex items-center gap-4">
                    <Archive className="w-8 h-8 text-primary shrink-0" />
                    <h4 className="text-ink font-extrabold text-xl" itemProp="name">How do I download all the images at once?</h4>
                  </div>
                  <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer" className="pl-12">
                    <p className="text-sm text-[#55605B] leading-relaxed" itemProp="text">Once extraction finishes, click "Download All as ZIP" in the results panel or the top navigation bar. Every frame is compressed into one archive with sequentially numbered filenames, ready to unzip anywhere.</p>
                  </div>
                </div>
                <div className="bg-white border border-black/10 shadow-sm shadow-black/[0.02] p-8 rounded-2xl space-y-4" itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                  <div className="flex items-center gap-4">
                    <SlidersHorizontal className="w-8 h-8 text-primary shrink-0" />
                    <h4 className="text-ink font-extrabold text-xl" itemProp="name">Should I choose PNG or JPEG output?</h4>
                  </div>
                  <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer" className="pl-12">
                    <p className="text-sm text-[#55605B] leading-relaxed" itemProp="text">JPEG is the better default for most cases — smaller files with an adjustable quality slider, ideal for large batches. Choose PNG when you need pixel-perfect, lossless frames, such as for design or archival work.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}

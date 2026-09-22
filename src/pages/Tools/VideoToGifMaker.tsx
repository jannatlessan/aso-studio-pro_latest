import { useState, useRef, useEffect } from 'react';
import { Film, Download, Upload, ChevronLeft, RefreshCcw,
  ShieldCheck, Loader2, PlaySquare, Settings2, SkipForward, Maximize,
  SlidersHorizontal, CheckCircle2, Sparkles, Image as ImageIcon, Gauge, FileBox
} from 'lucide-react';
import { useToolNavigation } from '../../hooks/useToolNavigation';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import Footer from '../../components/Footer';
import SEO from '../../components/SEO';
import AdBlockDetector from '../../components/AdBlockDetector';

type ProcessState = 'idle' | 'loading_engine' | 'processing' | 'done' | 'error';
type QualityPreset = 'social' | 'high_res' | 'cinematic' | 'custom';

let ffmpegInstance: FFmpeg | null = null;
let hasLoadedEngineThisSession = false;

interface VideoMeta {
  file: File;
  url: string;
  duration: number;
}

export default function VideoToGifMaker() {
  const [videoMeta, setVideoMeta] = useState<VideoMeta | null>(null);
  const [processState, setProcessState] = useState<ProcessState>('idle');
  const [progressText, setProgressText] = useState('');
  const [simulatedProgress, setSimulatedProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');

  const [gifUrl, setGifUrl] = useState<string | null>(null);
  const [gifSize, setGifSize] = useState<number>(0);

  // Settings
  const [preset, setPreset] = useState<QualityPreset>('social');
  const [fps, setFps] = useState(15);
  const [width, setWidth] = useState(480);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(10);
  const [speed, setSpeed] = useState(1.0);
  const [exportName, setExportName] = useState('aura-studio-gif');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Smart Navigation - will be initialized after resetAll is defined
  const isToolUsed = videoMeta !== null;

  // Smooth Loading Effect simulator
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (processState === 'loading_engine' || processState === 'processing') {
       interval = setInterval(() => {
          setSimulatedProgress(prev => {
             if (prev >= 95) return 95;
             const remaining = 95 - prev;
             const increment = Math.max(0.1, remaining * 0.02);
             return prev + increment;
          });
       }, 100);
    } else if (processState === 'done') {
       setSimulatedProgress(100);
    } else {
       setSimulatedProgress(0);
    }
    return () => clearInterval(interval);
  }, [processState]);

  // Engaging Messages Rotator Effect for Processing
  useEffect(() => {
     let interval: ReturnType<typeof setInterval>;
     const ENGAGING_MESSAGES = [
        "Analyzing video frames...",
        "Identifying color palettes...",
        "Applying pristine Lanczos scaling...",
        "Compressing temporal redundancy...",
        "Finalizing GIF envelope..."
     ];
     let msgIndex = 0;
     if (processState === 'processing') {
        setProgressText(ENGAGING_MESSAGES[0]);
        interval = setInterval(() => {
           msgIndex = (msgIndex + 1) % ENGAGING_MESSAGES.length;
           setProgressText(ENGAGING_MESSAGES[msgIndex]);
        }, 3000);
     } else if (processState === 'loading_engine') {
        setProgressText(hasLoadedEngineThisSession ? 'Waking up neural renderer...' : 'Downloading advanced processing core...');
     }
     return () => clearInterval(interval);
  }, [processState]);

  const applyPreset = (p: QualityPreset) => {
    setPreset(p);
    if (!videoMeta) return;

    // Auto clamp end time to video duration
    const duration = videoMeta.duration;
    const safeEnd = Math.min(endTime, duration);
    setEndTime(safeEnd);

    if (p === 'social') {
      setFps(12);
      setWidth(480);
      setSpeed(1.0);
    } else if (p === 'high_res') {
      setFps(15);
      setWidth(720);
      setSpeed(1.0);
    } else if (p === 'cinematic') {
      setFps(24);
      setWidth(1080);
      setSpeed(1.0);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    const video = document.createElement('video');
    video.src = url;

    video.onloadedmetadata = () => {
      setVideoMeta({ file, url, duration: video.duration });
      setStartTime(0);
      setEndTime(video.duration); // Default to full video duration

      // Preserve Original Quality (Visiblity) Default
      const w = video.videoWidth || 720;
      setWidth(Math.min(w, 1080)); // Default to exact original width (Max 1080px for RAM safety)
      setFps(15);
      setSpeed(1.0);
      setPreset('custom');

      setProcessState('idle');
      setGifUrl(null);
      setErrorMsg('');
      const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || 'video';
      setExportName(`${baseName}-aura-cut`);
    };
  };

  const loadFFmpeg = async () => {
    if (ffmpegInstance) return ffmpegInstance;
    const ffmpeg = new FFmpeg();
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';

    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    });

    ffmpegInstance = ffmpeg;
    hasLoadedEngineThisSession = true;
    return ffmpeg;
  };

  const executeConversion = async () => {
    if (!videoMeta) return;
    setProcessState('loading_engine');
    setErrorMsg('');

    try {
      const ffmpeg = await loadFFmpeg();

      setProcessState('processing');
      // Write the file to memory
      await ffmpeg.writeFile('input.mp4', await fetchFile(videoMeta.file));

      const ptsMultiplier = (1 / speed).toFixed(4);
      const vfCore = `setpts=${ptsMultiplier}*(PTS-STARTPTS),fps=${fps},scale=${width}:-1:flags=lanczos`;

      // 2-Pass Palette Generation for High Quality GIF
      // Pass 1: Extract optimal 256 color palette from the video slice
      await ffmpeg.exec([
        '-ss', startTime.toString(),
        '-to', endTime.toString(),
        '-i', 'input.mp4',
        '-vf', `${vfCore},palettegen`,
        'palette.png'
      ]);

      // Pass 2: Output GIF using the palette + ultra high-quality dithering
      await ffmpeg.exec([
        '-ss', startTime.toString(),
        '-to', endTime.toString(),
        '-i', 'input.mp4',
        '-i', 'palette.png',
        '-filter_complex', `[0:v]${vfCore}[x];[x][1:v]paletteuse=dither=sierra2_4a`,
        '-y', 'output.gif'
      ]);

      const data = await ffmpeg.readFile('output.gif');
      const blob = new Blob([data as any], { type: 'image/gif' });
      const finalUrl = URL.createObjectURL(blob);

      setGifUrl(finalUrl);
      setGifSize(blob.size);
      setProcessState('done');

      // Cleanup WASM memory
      await ffmpeg.deleteFile('input.mp4');
      await ffmpeg.deleteFile('palette.png');
      await ffmpeg.deleteFile('output.gif');

    } catch (err: any) {
      console.error(err);
      setProcessState('error');
      setErrorMsg(err.message || 'An error occurred during video processing. The file might be corrupted or too large for available RAM.');
    }
  };

  const resetAll = () => {
    if (fileInputRef.current) fileInputRef.current.value = '';
    setVideoMeta(null);
    setGifUrl(null);
    setGifSize(0);
    setProcessState('idle');
    setPreset('social');
    setSpeed(1.0);
    setErrorMsg('');
    setProgressText('');
    setSimulatedProgress(0);
    setFps(15);
    setWidth(480);
    setStartTime(0);
    setEndTime(10);
    setExportName('aura-studio-gif');
  };

  const { handleBackClick } = useToolNavigation({
    toolName: 'Video to GIF Maker',
    isToolUsed,
    onReset: resetAll
  });

  return (
    <>
      <AdBlockDetector />
      <div className="min-h-screen bg-white text-ink selection:bg-primary/20 font-sans">
      <SEO
        title="AuraCut Studio | Pro Video to GIF Maker"
        description="Convert any video MP4/MOV into an exceptionally high-quality animated GIF instantly. 100% offline edge-processing running locally in your browser."
        url="https://shaaddev.studio/tools/video-to-gif"
      />

      {/* Modern Header */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-[0_1px_0_rgba(16,19,18,0.06)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={handleBackClick} className="p-2 hover:bg-black/[0.04] rounded-full transition-colors group" title={isToolUsed ? "(Click to reset)" : undefined}>
              <ChevronLeft className="w-5 h-5 text-[#55605B] group-hover:text-ink" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary-dark flex items-center justify-center border border-black/5 shadow-lg shadow-primary/20">
                <Film className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-sm font-black uppercase tracking-widest text-ink">
                  {isToolUsed ? 'Video to GIF' : 'Back to Tools'}
                </h1>
                <p className="text-[10px] text-primary font-bold tracking-widest uppercase">100% Secure Local Engine</p>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={resetAll} className="h-8 px-4 text-xs font-bold bg-black/[0.03] hover:bg-black/[0.06] border border-black/10 text-[#55605B] rounded-full transition-colors flex items-center gap-2 uppercase tracking-widest hidden sm:flex">
              <RefreshCcw className="w-3 h-3" /> Reset
            </button>
            {processState === 'done' && gifUrl && (
              <a href={gifUrl} download={`${exportName.replace(/[^a-z0-9-_]/gi, '-') || 'aura-gif'}.gif`} className="h-8 px-5 text-xs font-bold bg-primary-dark hover:bg-[#048532] text-white rounded-full transition-all flex items-center gap-2 shadow-lg shadow-primary/25 uppercase tracking-widest">
                <Download className="w-3 h-3" /> Download HD GIF
              </a>
            )}
          </div>
        </div>
      </nav>

      <main className="pt-20 pb-24 min-h-[90vh] flex flex-col items-center justify-center p-4">

        {/* State: Idle / Setup */}
        {processState === 'idle' && !videoMeta && (
          <div className="w-full max-w-2xl text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-mint border border-primary/20 text-primary text-xs font-black uppercase tracking-widest">
              <Sparkles className="w-3 h-3" /> Zero Cloud Dependency
            </div>

            <h2 className="text-5xl md:text-7xl font-black tracking-tight text-ink pb-2">
              Cinema Grade GIFs.<br/><span className="text-primary">Completely Offline.</span>
            </h2>

            <p className="text-[#55605B] max-w-xl mx-auto text-lg leading-relaxed font-medium">
              Transform your raw video files into lossless, dithering-optimized GIFs natively inside your browser CPU using compiled FFmpeg scripts.
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
                  <h3 className="text-xl font-bold text-ink mb-2">Upload Raw Video</h3>
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

        {/* State: Loading & Processing */}
        {(processState === 'loading_engine' || processState === 'processing') && (
          <div className="w-full max-w-md p-10 bg-white border border-black/10 rounded-3xl shadow-xl shadow-black/5 space-y-8 animate-in zoom-in-95 duration-500 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-black/[0.06]">
               <div className="h-full bg-primary-dark transition-all duration-300" style={{ width: `${Math.round(simulatedProgress)}%` }}></div>
            </div>

            <Loader2 className="w-16 h-16 text-primary animate-spin mx-auto" />

            <div className="space-y-4">
              <h3 className="text-xl font-bold text-ink">{progressText}</h3>
              <p className="text-xs text-[#55605B] uppercase tracking-widest font-mono">{Math.round(simulatedProgress)}% Complete</p>
            </div>

            <div className="pt-4 border-t border-black/10">
              <p className="text-[10px] text-amber-600 font-bold uppercase tracking-widest leading-relaxed flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-3 h-3" /> Please do not close or refresh this tab
              </p>
            </div>
          </div>
        )}

        {/* State: Config Setup / Done */}
        {videoMeta && (processState === 'idle' || processState === 'done') && (
          <div className="w-full max-w-[1400px] grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-500">
            {/* Visual Preview Window */}
            <div className="lg:col-span-8 xl:col-span-9 flex flex-col items-center justify-center p-4 sm:p-8 bg-[#F6F8F7] rounded-3xl border border-black/10 relative overflow-hidden min-h-[400px] xl:min-h-[700px]">
               {processState === 'idle' ? (
                 <video
                   ref={videoRef}
                   src={videoMeta.url}
                   controls
                   className="relative z-10 w-full h-full max-w-5xl max-h-[75vh] rounded-xl border border-black/10 shadow-2xl bg-black"
                 />
               ) : (
                 <div className="relative w-full h-full max-w-5xl max-h-[75vh] flex items-center justify-center">
                    <img src={gifUrl!} alt="Generated GIF" className="max-w-full max-h-full rounded-xl border border-black/10 shadow-2xl bg-black" />
                    <div className="absolute top-4 left-4 bg-black/80 backdrop-blur px-3 py-1.5 rounded-lg border border-white/10 text-xs font-mono font-bold text-primary-light">
                       {(gifSize / 1024 / 1024).toFixed(2)} MB
                    </div>
                 </div>
               )}
            </div>

            {/* Master Settings Panel */}
            <div className="lg:col-span-4 xl:col-span-3 bg-white rounded-3xl border border-black/10 shadow-lg shadow-black/5 p-6 flex flex-col max-h-[90vh] overflow-y-auto custom-scrollbar">
              <div className="space-y-8 flex-1">

                {/* Export Control */}
                {processState === 'idle' && (
                  <button onClick={executeConversion} className="w-full flex items-center justify-center gap-2 bg-primary-dark hover:bg-[#048532] text-white py-4 rounded-full font-black uppercase tracking-widest text-sm shadow-lg shadow-primary/25 transition-all">
                    <PlaySquare className="w-5 h-5"/> Generate GIF
                  </button>
                )}

                {/* Section 1: Pre-Calculated Defaults */}
                {processState === 'idle' && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 border-b border-black/10 pb-2">
                      <Sparkles className="w-4 h-4 text-primary" />
                      <h2 className="font-black text-xs uppercase tracking-widest text-ink">Smart Presets</h2>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                       <button onClick={() => applyPreset('social')} className={`flex flex-col items-center justify-center p-3 rounded-xl border text-[10px] font-bold uppercase tracking-widest gap-2 transition-all ${preset === 'social' ? 'bg-mint border-primary text-primary' : 'bg-white border-black/10 text-[#55605B] hover:bg-mint'}`}>
                          <Settings2 className="w-4 h-4" /> Social Basic
                       </button>
                       <button onClick={() => applyPreset('high_res')} className={`flex flex-col items-center justify-center p-3 rounded-xl border text-[10px] font-bold uppercase tracking-widest gap-2 transition-all ${preset === 'high_res' ? 'bg-mint border-primary text-primary' : 'bg-white border-black/10 text-[#55605B] hover:bg-mint'}`}>
                          <ImageIcon className="w-4 h-4" /> High Def
                       </button>
                       <button onClick={() => applyPreset('cinematic')} className={`col-span-2 flex flex-col items-center justify-center p-3 rounded-xl border text-[10px] font-bold uppercase tracking-widest gap-2 transition-all ${preset === 'cinematic' ? 'bg-mint border-primary text-primary' : 'bg-white border-black/10 text-[#55605B] hover:bg-mint'}`}>
                          <Film className="w-4 h-4" /> Cinematic Pro (24fps / 1080p)
                       </button>
                    </div>
                  </div>
                )}

                {/* Section 2: Time Editor */}
                {processState === 'idle' && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 border-b border-black/10 pb-2">
                      <SkipForward className="w-4 h-4 text-primary" />
                      <h2 className="font-black text-xs uppercase tracking-widest text-ink">Time Envelope</h2>
                    </div>
                    <div className="space-y-4 p-4 bg-[#F6F8F7] rounded-xl border border-black/[0.06]">
                      <div className="space-y-2">
                         <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-[#55605B]">
                            <span>Start Second</span>
                            <span className="text-primary">{startTime.toFixed(1)}s</span>
                         </div>
                         <input type="range" min="0" max={Math.max(0, videoMeta?.duration - 1 || 0)} step="0.1" value={startTime} onChange={(e) => {
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
                         <input type="range" min={Math.min(startTime + 0.1, videoMeta?.duration || 0)} max={videoMeta?.duration || 0} step="0.1" value={endTime} onChange={(e) => {
                            const v = parseFloat(e.target.value);
                            setEndTime(v);
                            setPreset('custom');
                            if (videoRef.current) videoRef.current.currentTime = v;
                         }} className="w-full accent-primary" />
                      </div>
                      <p className="text-[10px] text-[#8B958F] text-center uppercase tracking-widest font-mono pt-2 border-t border-black/10">Length: {(endTime - startTime).toFixed(1)}s</p>
                    </div>
                  </div>
                )}

                {/* Export Details */}
                {(processState === 'idle' || processState === 'done') && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 border-b border-black/10 pb-2">
                       <FileBox className="w-4 h-4 text-primary" />
                       <h2 className="font-black text-xs uppercase tracking-widest text-ink">Export Naming</h2>
                    </div>
                    <div className="space-y-2 p-4 bg-[#F6F8F7] rounded-xl border border-black/[0.06]">
                       <div className="text-[10px] font-bold uppercase tracking-widest text-[#55605B] mb-2">Output Filename</div>
                       <input
                         type="text"
                         value={exportName}
                         onChange={(e) => setExportName(e.target.value.replace(/[^a-z0-9-_]/gi, '-'))}
                         className="w-full bg-white border border-black/10 rounded-lg px-3 py-2 text-sm text-ink focus:outline-none focus:border-primary transition-colors"
                         placeholder="my-awesome-gif"
                       />
                       <p className="text-[10px] text-[#8B958F] text-right font-mono mt-1">.gif</p>
                    </div>
                  </div>
                )}

                {/* Section 3: Raw Spec Engineering */}
                {processState === 'idle' && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 border-b border-black/10 pb-2">
                      <SlidersHorizontal className="w-4 h-4 text-primary" />
                      <h2 className="font-black text-xs uppercase tracking-widest text-ink">Encoding Specs</h2>
                    </div>
                    <div className="space-y-4 p-4 bg-[#F6F8F7] rounded-xl border border-black/[0.06]">
                      <div className="space-y-2">
                         <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-[#55605B]">
                            <span className="flex items-center gap-1"><PlaySquare className="w-3 h-3"/> Playback Speed</span>
                            <span className="text-primary">{speed.toFixed(1)}x</span>
                         </div>
                         <input type="range" min="0.2" max="3.0" step="0.1" value={speed} onChange={(e) => { setSpeed(parseFloat(e.target.value)); setPreset('custom'); }} className="w-full accent-primary" />
                      </div>
                      <div className="space-y-2">
                         <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-[#55605B]">
                            <span className="flex items-center gap-1"><Gauge className="w-3 h-3"/> Frames Per Sec</span>
                            <span className="text-primary">{fps} FPS</span>
                         </div>
                         <input type="range" min="5" max="30" step="1" value={fps} onChange={(e) => { setFps(parseInt(e.target.value)); setPreset('custom'); }} className="w-full accent-primary" />
                      </div>
                      <div className="space-y-2">
                         <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-[#55605B]">
                            <span className="flex items-center gap-1"><Maximize className="w-3 h-3"/> Engine Width</span>
                            <span className="text-primary">{width} PX</span>
                         </div>
                         <input type="range" min="240" max="1080" step="10" value={width} onChange={(e) => { setWidth(parseInt(e.target.value)); setPreset('custom'); }} className="w-full accent-primary" />
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
              <h3 className="text-xl font-bold text-red-600">Encoding Failed</h3>
              <p className="text-sm text-red-700/80">{errorMsg}</p>
              <button onClick={() => setProcessState('idle')} className="px-6 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-full text-xs font-bold uppercase tracking-widest transition-colors">Adjust Timings & Retry</button>
           </div>
        )}
      </main>

      <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="video/mp4,video/webm,video/quicktime,video/x-m4v" className="hidden" />

      {/* SEO Environment block */}
      <section className="bg-[#F6F8F7] border-t border-black/[0.06] py-24 px-4 relative z-10" itemScope itemType="https://schema.org/WebPage">
        <div className="max-w-6xl mx-auto space-y-24">
          <div className="text-center space-y-8 max-w-4xl mx-auto">
             <h2 className="text-4xl md:text-6xl font-black text-ink leading-tight" itemProp="headline">The Ultimate Free Video to GIF Converter</h2>
             <p className="text-[#55605B] text-lg md:text-xl leading-relaxed" itemProp="description">
               Transform MP4, WebM, and QuickTime videos into extremely high-definition animated GIFs instantly. No file size limits, no server uploads, watermarks, and absolutely zero subscriptions. AuraCut Studio executes elite FFmpeg WebAssembly binaries directly on your local edge node for peerless data privacy and encoding speed. Perfect for social media managers, Discord emotes, and Reddit memes.
             </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
             <div className="bg-white border border-black/10 p-6 rounded-2xl space-y-4 shadow-sm shadow-black/[0.02]">
                <Film className="w-8 h-8 text-primary" />
                <h3 className="text-ink font-bold">Universal Format Support</h3>
                <p className="text-sm text-[#55605B]">Convert .mp4, .mov, or .webm directly into animated .gif files without worrying about container incompatibilities.</p>
             </div>
             <div className="bg-white border border-black/10 p-6 rounded-2xl space-y-4 shadow-sm shadow-black/[0.02]">
                <Maximize className="w-8 h-8 text-primary" />
                <h3 className="text-ink font-bold">Lossless Compression</h3>
                <p className="text-sm text-[#55605B]">Our native engine automatically extracts the original video's resolution (up to 1080p HD) to maintain absolute crispness.</p>
             </div>
             <div className="bg-white border border-black/10 p-6 rounded-2xl space-y-4 shadow-sm shadow-black/[0.02]">
                <SkipForward className="w-8 h-8 text-primary" />
                <h3 className="text-ink font-bold">Precision Frame Trimming</h3>
                <p className="text-sm text-[#55605B]">Isolate exact milliseconds of your video using our precise time-envelope editor before rendering the final slice.</p>
             </div>
             <div className="bg-white border border-black/10 p-6 rounded-2xl space-y-4 shadow-sm shadow-black/[0.02]">
                <CheckCircle2 className="w-8 h-8 text-primary" />
                <h3 className="text-ink font-bold">No Watermarks</h3>
                <p className="text-sm text-[#55605B]">Exported GIFs are completely unbranded and yours to keep forever with custom file names dynamically generated.</p>
             </div>
          </div>

          <div className="space-y-12 max-w-4xl mx-auto">
            <h3 className="text-3xl font-black text-ink text-center">Frequently Asked Questions</h3>
            <div className="grid gap-6" itemScope itemType="https://schema.org/FAQPage">
               <div className="bg-white border border-black/10 p-8 rounded-2xl space-y-4 shadow-sm shadow-black/[0.02]" itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                  <div className="flex items-center gap-4">
                     <ShieldCheck className="w-8 h-8 text-primary shrink-0" />
                     <h4 className="text-ink font-extrabold text-xl" itemProp="name">Is this Video to GIF converter actually private and secure?</h4>
                  </div>
                  <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer" className="pl-12">
                    <p className="text-sm text-[#55605B] leading-relaxed" itemProp="text">Yes, 100%. Our architecture is fundamentally different from commercial competitors. Every single megabyte of your video never leaves your device. We boot an isolated instance of the legendary FFmpeg terminal engine locally inside your browser's V8 execution context to compile the GIF entirely offline in your RAM.</p>
                  </div>
               </div>
               <div className="bg-white border border-black/10 p-8 rounded-2xl space-y-4 shadow-sm shadow-black/[0.02]" itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                  <div className="flex items-center gap-4">
                     <Sparkles className="w-8 h-8 text-primary shrink-0" />
                     <h4 className="text-ink font-extrabold text-xl" itemProp="name">How do you achieve Cinematic output quality without pixelation?</h4>
                  </div>
                  <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer" className="pl-12">
                    <p className="text-sm text-[#55605B] leading-relaxed" itemProp="text">Standard converters generate terrible color banding because they map raw frames directly to standard 256-color bit depths. We utilize a computational Two-Pass logic threshold. Phase One explicitly sweeps your video slice to manufacture an optimal global palette mapping. Phase Two leverages Sierra2-4A temporal dithering applied against that precise histogram to simulate millions of colors.</p>
                  </div>
               </div>
               <div className="bg-white border border-black/10 p-8 rounded-2xl space-y-4 shadow-sm shadow-black/[0.02]" itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                  <div className="flex items-center gap-4">
                     <SlidersHorizontal className="w-8 h-8 text-primary shrink-0" />
                     <h4 className="text-ink font-extrabold text-xl" itemProp="name">Can I edit FPS (framerate) and apply slow motion to my GIF?</h4>
                  </div>
                  <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer" className="pl-12">
                    <p className="text-sm text-[#55605B] leading-relaxed" itemProp="text">Absolutely. AuraCut GIF Studio exposes a hyper-granular physics interface. You can set geometric resolutions anywhere from 240p to 1080p width limits. We even implemented a dedicated playback speed manipulation slider, allowing you to synthesize sub-frame hyper-lapses (3.0x speed) or extreme cinematic slow-mo (0.2x speed) sequences flawlessly.</p>
                  </div>
               </div>
               <div className="bg-white border border-black/10 p-8 rounded-2xl space-y-4 shadow-sm shadow-black/[0.02]" itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                  <div className="flex items-center gap-4">
                     <Film className="w-8 h-8 text-primary shrink-0" />
                     <h4 className="text-ink font-extrabold text-xl" itemProp="name">Is there a maximum file size limit for video uploads?</h4>
                  </div>
                  <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer" className="pl-12">
                    <p className="text-sm text-[#55605B] leading-relaxed" itemProp="text">Since the processing happens entirely on your local machine rather than our servers, there are no artificial file size limits. However, processing massive 4K video files or hours of footage may require significant RAM and CPU power from your device. We recommend trimming long videos and keeping the output width under 1080px for the fastest generation times.</p>
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

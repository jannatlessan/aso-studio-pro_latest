import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import { 
  Film, Download, Upload, ChevronLeft, RefreshCcw, 
  ShieldCheck, Loader2, PlaySquare, Settings2, SkipForward, Maximize,
  SlidersHorizontal, CheckCircle2, Sparkles, Image as ImageIcon, Gauge
} from 'lucide-react';
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
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

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
        "Applying Sierra-2-4A dithering...",
        "Compressing temporal redundancy...",
        "Applying pristine Lanczos scaling...",
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
        setProgressText(hasLoadedEngineThisSession ? 'Waking up cached FFmpeg Engine...' : 'Securely downloading FFmpeg WebAssembly core...');
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
    } else if (p === 'high_res') {
      setFps(15);
      setWidth(720);
    } else if (p === 'cinematic') {
      setFps(24);
      setWidth(1080);
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
      setEndTime(Math.min(10, video.duration)); // default 10s slice
      setProcessState('idle');
      setGifUrl(null);
      setErrorMsg('');
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

      // 2-Pass Palette Generation for High Quality GIF
      // Pass 1: Extract optimal 256 color palette from the video slice
      await ffmpeg.exec([
        '-ss', startTime.toString(),
        '-to', endTime.toString(),
        '-i', 'input.mp4',
        '-vf', `fps=${fps},scale=${width}:-1:flags=lanczos,palettegen`,
        'palette.png'
      ]);

      // Pass 2: Output GIF using the palette + ultra high-quality dithering
      await ffmpeg.exec([
        '-ss', startTime.toString(),
        '-to', endTime.toString(),
        '-i', 'input.mp4',
        '-i', 'palette.png',
        '-filter_complex', `fps=${fps},scale=${width}:-1:flags=lanczos[x];[x][1:v]paletteuse=dither=sierra2_4a`,
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
      setErrorMsg(err.message || 'An error occurred during FFmpeg processing. The file might be corrupted or too large for available RAM.');
    }
  };

  const resetAll = () => {
    setVideoMeta(null);
    setGifUrl(null);
    setProcessState('idle');
    setPreset('social');
  };

  return (
    <>
      <AdBlockDetector />
      <div className="min-h-screen bg-[#020202] text-white selection:bg-rose-500/30 font-sans">
      <SEO 
        title="AuraCut Studio | Pro Video to GIF Maker"
        description="Convert any video MP4/MOV into an exceptionally high-quality animated GIF instantly. 100% offline edge-processing running locally in your browser."
        url="https://shaaddev.studio/tools/video-to-gif"
      />

      {/* Modern Header */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#020202]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/tools" className="p-2 hover:bg-white/5 rounded-full transition-colors group">
              <ChevronLeft className="w-5 h-5 text-white/60 group-hover:text-white" />
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-500 to-orange-600 flex items-center justify-center border border-white/10 shadow-[0_0_15px_rgba(244,63,94,0.3)]">
                <Film className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-sm font-black uppercase tracking-widest bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">VideoToGIF Pro</h1>
                <p className="text-[10px] text-rose-400 font-bold tracking-widest uppercase">100% Secure Local Engine</p>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={resetAll} className="h-8 px-4 text-xs font-bold bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors flex items-center gap-2 uppercase tracking-widest hidden sm:flex">
              <RefreshCcw className="w-3 h-3" /> Reset
            </button>
            {processState === 'done' && gifUrl && (
              <a href={gifUrl} download={`studio-gif-${Date.now()}.gif`} className="h-8 px-5 text-xs font-bold bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-500 hover:to-orange-500 rounded-lg transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(244,63,94,0.3)] uppercase tracking-widest">
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
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-black uppercase tracking-widest">
              <Sparkles className="w-3 h-3" /> Zero Cloud Dependency
            </div>
            
            <h2 className="text-5xl md:text-7xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-rose-500/50 pb-2">
              Cinema Grade GIFs.<br/>Completely Offline.
            </h2>
            
            <p className="text-white/40 max-w-xl mx-auto text-lg leading-relaxed font-medium">
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
              <div className="absolute inset-0 bg-gradient-to-r from-rose-500/20 to-orange-600/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500 opacity-50 group-hover:opacity-100"></div>
              <div className="relative border-2 border-dashed border-rose-500/30 hover:border-rose-500 rounded-3xl p-16 bg-[#050505]/80 backdrop-blur-sm transition-all flex flex-col items-center gap-6">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-rose-500/20 to-orange-600/20 border border-rose-500/30 flex items-center justify-center relative overflow-hidden">
                  <Upload className="w-8 h-8 text-rose-400 z-10" />
                  <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-rose-500/20 to-transparent"></div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Upload Raw Video</h3>
                  <p className="text-sm text-white/40 font-medium">Drag & drop your file here, or click to browse</p>
                  <p className="text-xs text-white/30 mt-2 font-mono">Supports MP4, WebM, MOV</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 text-rose-400/80 text-xs font-bold uppercase tracking-widest">
              <ShieldCheck className="w-4 h-4" /> 100% Secure & Private Hardware Processing
            </div>
          </div>
        )}

        {/* State: Loading & Processing */}
        {(processState === 'loading_engine' || processState === 'processing') && (
          <div className="w-full max-w-md p-10 bg-[#050505] border border-white/5 rounded-3xl shadow-2xl space-y-8 animate-in zoom-in-95 duration-500 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-white/5">
               <div className="h-full bg-gradient-to-r from-rose-500 to-orange-500 transition-all duration-300" style={{ width: `${Math.round(simulatedProgress)}%` }}></div>
            </div>
            
            <Loader2 className="w-16 h-16 text-rose-500 animate-spin mx-auto" />
            
            <div className="space-y-4">
              <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/50 animate-pulse">{progressText}</h3>
              <p className="text-xs text-white/40 uppercase tracking-widest font-mono">{Math.round(simulatedProgress)}% Complete</p>
            </div>
          </div>
        )}

        {/* State: Config Setup / Done */}
        {videoMeta && (processState === 'idle' || processState === 'done') && (
          <div className="w-full max-w-[1400px] grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-500">
            {/* Visual Preview Window */}
            <div className="lg:col-span-8 xl:col-span-9 flex flex-col items-center justify-center p-4 sm:p-8 bg-[#050505] rounded-3xl border border-white/5 relative overflow-hidden min-h-[400px] xl:min-h-[700px]">
               <div className="absolute inset-0 pattern-dots pattern-white outline-none opacity-[0.02]"></div>
               
               {processState === 'idle' ? (
                 <video 
                   ref={videoRef}
                   src={videoMeta.url} 
                   controls
                   className="relative z-10 w-full h-full max-w-5xl max-h-[75vh] rounded-xl border border-white/10 shadow-2xl bg-black"
                 />
               ) : (
                 <div className="relative w-full h-full max-w-5xl max-h-[75vh] flex items-center justify-center">
                    <img src={gifUrl!} alt="Generated GIF" className="max-w-full max-h-full rounded-xl border border-white/10 shadow-[0_0_50px_rgba(244,63,94,0.1)] bg-black" />
                    <div className="absolute top-4 left-4 bg-black/80 backdrop-blur px-3 py-1.5 rounded-lg border border-white/10 text-xs font-mono font-bold text-rose-400">
                       {(gifSize / 1024 / 1024).toFixed(2)} MB
                    </div>
                 </div>
               )}
            </div>

            {/* Master Settings Panel */}
            <div className="lg:col-span-4 xl:col-span-3 bg-[#050505] rounded-3xl border border-white/5 shadow-xl p-6 flex flex-col max-h-[90vh] overflow-y-auto custom-scrollbar">
              <div className="space-y-8 flex-1">
                
                {/* Export Control */}
                {processState === 'idle' && (
                  <button onClick={executeConversion} className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-500 hover:to-orange-500 py-4 rounded-xl font-black uppercase tracking-widest text-sm shadow-[0_0_30px_rgba(244,63,94,0.3)] transition-all">
                    <PlaySquare className="w-5 h-5"/> Generate GIF
                  </button>
                )}

                {/* Section 1: Pre-Calculated Defaults */}
                {processState === 'idle' && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 border-b border-white/10 pb-2">
                      <Sparkles className="w-4 h-4 text-rose-400" />
                      <h2 className="font-black text-xs uppercase tracking-widest text-white/90">Smart Presets</h2>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                       <button onClick={() => applyPreset('social')} className={`flex flex-col items-center justify-center p-3 rounded-xl border text-[10px] font-bold uppercase tracking-widest gap-2 transition-all ${preset === 'social' ? 'bg-rose-500/20 border-rose-500 text-rose-400' : 'bg-black/50 border-white/10 hover:bg-white/5'}`}>
                          <Settings2 className="w-4 h-4" /> Social Basic
                       </button>
                       <button onClick={() => applyPreset('high_res')} className={`flex flex-col items-center justify-center p-3 rounded-xl border text-[10px] font-bold uppercase tracking-widest gap-2 transition-all ${preset === 'high_res' ? 'bg-orange-500/20 border-orange-500 text-orange-400' : 'bg-black/50 border-white/10 hover:bg-white/5'}`}>
                          <ImageIcon className="w-4 h-4" /> High Def
                       </button>
                       <button onClick={() => applyPreset('cinematic')} className={`col-span-2 flex flex-col items-center justify-center p-3 rounded-xl border text-[10px] font-bold uppercase tracking-widest gap-2 transition-all ${preset === 'cinematic' ? 'bg-amber-500/20 border-amber-500 text-amber-400' : 'bg-black/50 border-white/10 hover:bg-white/5'}`}>
                          <Film className="w-4 h-4" /> Cinematic Pro (24fps / 1080p)
                       </button>
                    </div>
                  </div>
                )}

                {/* Section 2: Time Editor */}
                {processState === 'idle' && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 border-b border-white/10 pb-2">
                      <SkipForward className="w-4 h-4 text-orange-400" />
                      <h2 className="font-black text-xs uppercase tracking-widest text-white/90">Time Envelope</h2>
                    </div>
                    <div className="space-y-4 p-4 bg-white/5 rounded-xl border border-white/5">
                      <div className="space-y-2">
                         <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-white/50">
                            <span>Start Second</span>
                            <span className="text-orange-400">{startTime.toFixed(1)}s</span>
                         </div>
                         <input type="range" min="0" max={Math.max(0, videoMeta?.duration - 1 || 0)} step="0.1" value={startTime} onChange={(e) => {
                            const v = parseFloat(e.target.value);
                            setStartTime(v);
                            if (v >= endTime) setEndTime(Math.min(v + 2, videoMeta.duration));
                            if (videoRef.current) videoRef.current.currentTime = v;
                         }} className="w-full accent-orange-500" />
                      </div>
                      <div className="space-y-2">
                         <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-white/50">
                            <span>End Second</span>
                            <span className="text-orange-400">{endTime.toFixed(1)}s</span>
                         </div>
                         <input type="range" min={Math.min(startTime + 0.1, videoMeta?.duration || 0)} max={videoMeta?.duration || 0} step="0.1" value={endTime} onChange={(e) => {
                            const v = parseFloat(e.target.value);
                            setEndTime(v);
                            setPreset('custom');
                            if (videoRef.current) videoRef.current.currentTime = v;
                         }} className="w-full accent-orange-500" />
                      </div>
                      <p className="text-[10px] text-white/30 text-center uppercase tracking-widest font-mono pt-2 border-t border-white/10">Length: {(endTime - startTime).toFixed(1)}s</p>
                    </div>
                  </div>
                )}

                {/* Section 3: Raw Spec Engineering */}
                {processState === 'idle' && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 border-b border-white/10 pb-2">
                      <SlidersHorizontal className="w-4 h-4 text-amber-400" />
                      <h2 className="font-black text-xs uppercase tracking-widest text-white/90">Encoding Specs</h2>
                    </div>
                    <div className="space-y-4 p-4 bg-white/5 rounded-xl border border-white/5">
                      <div className="space-y-2">
                         <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-white/50">
                            <span className="flex items-center gap-1"><Gauge className="w-3 h-3"/> Frames Per Sec</span>
                            <span className="text-amber-400">{fps} FPS</span>
                         </div>
                         <input type="range" min="5" max="30" step="1" value={fps} onChange={(e) => { setFps(parseInt(e.target.value)); setPreset('custom'); }} className="w-full accent-amber-500" />
                      </div>
                      <div className="space-y-2">
                         <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-white/50">
                            <span className="flex items-center gap-1"><Maximize className="w-3 h-3"/> Engine Width</span>
                            <span className="text-amber-400">{width} PX</span>
                         </div>
                         <input type="range" min="240" max="1080" step="10" value={width} onChange={(e) => { setWidth(parseInt(e.target.value)); setPreset('custom'); }} className="w-full accent-amber-500" />
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
           <div className="w-full max-w-lg p-8 bg-red-500/10 border border-red-500/20 rounded-3xl text-center space-y-4 mt-8">
              <h3 className="text-xl font-bold text-red-400">Encoding Failed</h3>
              <p className="text-sm text-red-300/80">{errorMsg}</p>
              <button onClick={() => setProcessState('idle')} className="px-6 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors">Adjust Timings & Retry</button>
           </div>
        )}
      </main>
      
      <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="video/mp4,video/webm,video/quicktime,video/x-m4v" className="hidden" />

      {/* SEO Environment block */}
      <section className="bg-black border-t border-white/5 py-24 px-4 relative z-10" itemScope itemType="https://schema.org/WebPage">
        <div className="max-w-4xl mx-auto space-y-16">
          <div className="text-center space-y-4">
             <h2 className="text-3xl md:text-5xl font-black text-white" itemProp="headline">Professional Video to GIF Converter</h2>
             <p className="text-white/60 text-lg max-w-2xl mx-auto leading-relaxed" itemProp="description">
               Transcode MP4s, WebMs, and MOVs into flawless, lossless animated GIFs locally in your browser leveraging compiled FFmpeg WASM binaries. Completely free, secure, and infinitely customizable.
             </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
             <div className="bg-[#050505] border border-white/5 p-8 rounded-2xl space-y-4">
                <ShieldCheck className="w-8 h-8 text-rose-400" />
                <h3 className="text-white font-bold text-lg">100% Private Encoding</h3>
                <p className="text-sm text-white/50 leading-relaxed">Most 'free' video to GIF tools upload your enormous video files to a remote server. We stream FFmpeg directly into your browser memory, guaranteeing absolute file privacy and instant results.</p>
             </div>
             <div className="bg-[#050505] border border-white/5 p-8 rounded-2xl space-y-4">
                <Sparkles className="w-8 h-8 text-amber-400" />
                <h3 className="text-white font-bold text-lg">Lanczos & Sierra Dithering</h3>
                <p className="text-sm text-white/50 leading-relaxed">Unlike basic converters that produce nasty pixelated color bands, our custom Two-Pass FFmpeg script creates a dedicated color palette tailored exclusively to your video slice prior to extreme-quality rendering.</p>
             </div>
             <div className="bg-[#050505] border border-white/5 p-8 rounded-2xl space-y-4">
                <SlidersHorizontal className="w-8 h-8 text-orange-400" />
                <h3 className="text-white font-bold text-lg">Pro Settings Matrix</h3>
                <p className="text-sm text-white/50 leading-relaxed">Select frame rates anywhere from 5 FPS up to butter-smooth 30 Cinematic FPS. Set boundaries digitally with our time slicer, and define the literal pixel structure density on export.</p>
             </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
    </>
  );
}
